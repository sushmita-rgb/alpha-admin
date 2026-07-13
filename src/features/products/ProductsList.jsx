import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { productServices } from '../../services/api';
import { useProductStore } from '../../store/productStore';
import { useAuthStore } from '../../store/authStore';
import { useUiStore } from '../../store/uiStore';
import { useDebounce } from '../../hooks/useDebounce';
import { formatCurrency, exportToCSV } from '../../utils/helpers';
import { 
  useReactTable, 
  getCoreRowModel, 
  flexRender 
} from '@tanstack/react-table';
import { 
  Search, 
  SlidersHorizontal, 
  Download, 
  Eye, 
  RefreshCw, 
  Star, 
  ChevronLeft,
  ChevronRight,
  Settings,
  HelpCircle,
  Sliders,
  CheckCircle2,
  X
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function ProductsList() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { user } = useAuthStore();
  const { addToast } = useUiStore();
  
  const { 
    hiddenProductIds, 
    togglePublished, 
    isProductPublished,
    columnOrder, 
    setColumnOrder,
    columnVisibility,
    toggleColumnVisibility,
    resetColumnPrefs,
    pollingEnabled,
    togglePolling
  } = useProductStore();

  const searchQuery = searchParams.get('search') || '';
  const selectedCategory = searchParams.get('category') || '';
  const minRating = Number(searchParams.get('rating')) || 0;
  const sortKey = searchParams.get('sort') || '';
  const pageIndex = Number(searchParams.get('page')) || 1;

  const [searchInput, setSearchInput] = useState(searchQuery);
  const debouncedSearch = useDebounce(searchInput, 400);

  useEffect(() => {
    const params = new URLSearchParams(searchParams);
    if (debouncedSearch) {
      params.set('search', debouncedSearch);
    } else {
      params.delete('search');
    }
    params.set('page', '1');
    setSearchParams(params);
  }, [debouncedSearch]);

  useEffect(() => {
    setSearchInput(searchQuery);
  }, [searchQuery]);

  const [columnPanelOpen, setColumnPanelOpen] = useState(false);

  const { 
    data: allProducts = [], 
    isLoading, 
    isError, 
    error,
    refetch,
    isFetching
  } = useQuery({
    queryKey: ['products'],
    queryFn: productServices.getAllProducts,
    refetchInterval: pollingEnabled ? 10000 : false,
  });

  const { data: categories = [] } = useQuery({
    queryKey: ['categories'],
    queryFn: productServices.getCategories,
  });

  const filteredProducts = useMemo(() => {
    let result = [...allProducts];

    if (user?.role !== 'admin') {
      result = result.filter(p => !hiddenProductIds.includes(p.id));
    }

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(p => 
        p.title.toLowerCase().includes(q) || 
        p.brand?.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q)
      );
    }

    if (selectedCategory) {
      result = result.filter(p => p.category === selectedCategory);
    }

    if (minRating > 0) {
      result = result.filter(p => p.rating >= minRating);
    }

    if (sortKey) {
      switch (sortKey) {
        case 'price-asc':
          result.sort((a, b) => a.price - b.price);
          break;
        case 'price-desc':
          result.sort((a, b) => b.price - a.price);
          break;
        case 'rating-asc':
          result.sort((a, b) => a.rating - b.rating);
          break;
        case 'rating-desc':
          result.sort((a, b) => b.rating - a.rating);
          break;
        case 'name-asc':
          result.sort((a, b) => a.title.localeCompare(b.title));
          break;
        case 'name-desc':
          result.sort((a, b) => b.title.localeCompare(a.title));
          break;
        default:
          break;
      }
    }

    return result;
  }, [allProducts, searchQuery, selectedCategory, minRating, sortKey, user, hiddenProductIds]);

  const itemsPerPage = 8;
  const pageCount = Math.ceil(filteredProducts.length / itemsPerPage);
  
  const paginatedProducts = useMemo(() => {
    const start = (pageIndex - 1) * itemsPerPage;
    return filteredProducts.slice(start, start + itemsPerPage);
  }, [filteredProducts, pageIndex, itemsPerPage]);

  const updateFilter = useCallback((key, value) => {
    const params = new URLSearchParams(searchParams);
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    params.set('page', '1');
    setSearchParams(params);
  }, [searchParams, setSearchParams]);

  const clearAllFilters = useCallback(() => {
    setSearchParams(new URLSearchParams());
    setSearchInput('');
    addToast('Filters reset to default', 'info');
  }, [setSearchParams, addToast]);

  const handleCSVExport = () => {
    const csvData = filteredProducts.map(p => ({
      id: p.id,
      title: p.title,
      brand: p.brand || 'N/A',
      category: p.category,
      price: p.price,
      stock: p.stock,
      rating: p.rating,
      published: !hiddenProductIds.includes(p.id) ? 'Published' : 'Hidden',
    }));

    const headers = [
      { label: 'Product ID', key: 'id' },
      { label: 'Product Title', key: 'title' },
      { label: 'Brand', key: 'brand' },
      { label: 'Category', key: 'category' },
      { label: 'Price ($)', key: 'price' },
      { label: 'Stock Level', key: 'stock' },
      { label: 'Rating', key: 'rating' },
      { label: 'Published Status', key: 'published' }
    ];

    exportToCSV(csvData, headers, `alpha_admin_products_${Date.now()}.csv`);
    addToast('CSV exported successfully', 'success');
  };

  const handleDragStart = (e, columnId) => {
    e.dataTransfer.setData('text/plain', columnId);
  };

  const handleDrop = (e, targetColumnId) => {
    const sourceColumnId = e.dataTransfer.getData('text/plain');
    if (sourceColumnId === targetColumnId) return;

    const newOrder = [...columnOrder];
    const sourceIndex = newOrder.indexOf(sourceColumnId);
    const targetIndex = newOrder.indexOf(targetColumnId);

    newOrder.splice(sourceIndex, 1);
    newOrder.splice(targetIndex, 0, sourceColumnId);
    setColumnOrder(newOrder);
    addToast('Columns reordered', 'success');
  };

  const tableColumns = useMemo(() => {
    return [
      {
        id: 'image',
        header: 'Image',
        cell: (info) => (
          <img 
            src={info.row.original.thumbnail} 
            alt={info.row.original.title} 
            className="w-8 h-8 rounded object-cover bg-notion-hover dark:bg-notion-dark-hover border border-notion-border dark:border-notion-dark-border/40"
          />
        )
      },
      {
        id: 'name',
        header: 'Product Name',
        cell: (info) => (
          <div className="max-w-[200px]">
            <span className="font-bold text-notion-text dark:text-notion-dark-text block truncate leading-tight">
              {info.row.original.title}
            </span>
            <span className="text-[10px] text-notion-muted dark:text-notion-dark-muted block truncate mt-0.5">
              SKU: {info.row.original.sku || 'N/A'}
            </span>
          </div>
        )
      },
      {
        id: 'brand',
        header: 'Brand',
        cell: (info) => <span className="text-notion-muted dark:text-notion-dark-muted font-semibold truncate max-w-[100px] block">{info.row.original.brand || 'N/A'}</span>
      },
      {
        id: 'category',
        header: 'Category',
        cell: (info) => (
          <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold bg-notion-hover dark:bg-notion-dark-hover text-notion-muted dark:text-notion-dark-muted border border-notion-border dark:border-notion-dark-border/30 capitalize">
            {info.row.original.category}
          </span>
        )
      },
      {
        id: 'price',
        header: 'Price',
        cell: (info) => (
          <div className="font-bold text-notion-text dark:text-notion-dark-text">
            {formatCurrency(info.row.original.price)}
          </div>
        )
      },
      {
        id: 'stock',
        header: 'Stock',
        cell: (info) => {
          const stock = info.row.original.stock;
          let stockColor = 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/20 dark:text-emerald-450 border-emerald-200/20';
          let label = 'In Stock';
          if (stock === 0) {
            stockColor = 'bg-rose-50 text-rose-700 dark:bg-rose-950/20 dark:text-rose-450 border-rose-250/20';
            label = 'Out of Stock';
          } else if (stock < 10) {
            stockColor = 'bg-amber-50 text-amber-700 dark:bg-amber-950/20 dark:text-amber-450 border-amber-250/20';
            label = 'Low Stock';
          }
          return (
            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold border ${stockColor}`}>
              <span className="w-1 h-1 rounded-full bg-current" />
              <span>{stock} {label}</span>
            </span>
          );
        }
      },
      {
        id: 'rating',
        header: 'Rating',
        cell: (info) => (
          <div className="flex items-center gap-1">
            <Star className="w-3 h-3 text-amber-500 fill-amber-500" />
            <span className="text-[11px] font-bold text-notion-text dark:text-notion-dark-text">{info.row.original.rating.toFixed(1)}</span>
          </div>
        )
      },
      {
        id: 'published',
        header: 'Status',
        cell: (info) => {
          const pId = info.row.original.id;
          const isPublished = isProductPublished(pId);
          const isAdmin = user?.role === 'admin';

          if (isAdmin) {
            return (
              <button 
                onClick={() => {
                  togglePublished(pId);
                  addToast(`Toggled ${!isPublished ? 'Published' : 'Hidden'}`, 'success');
                }}
                className={`relative inline-flex h-4.5 w-8.5 items-center rounded-full transition-colors focus:outline-none cursor-pointer ${
                  isPublished ? 'bg-notion-accent' : 'bg-slate-300 dark:bg-slate-700'
                }`}
              >
                <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${
                  isPublished ? 'translate-x-4.5' : 'translate-x-0.5'
                }`} />
              </button>
            );
          }

          return (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 dark:bg-emerald-950/25 text-emerald-600 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-900/20">
              Published
            </span>
          );
        }
      },
      {
        id: 'actions',
        header: 'Actions',
        cell: (info) => (
          <Link
            to={`/products/${info.row.original.id}`}
            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md border border-notion-border dark:border-notion-dark-border bg-white dark:bg-notion-dark-card hover:bg-notion-hover dark:hover:bg-notion-dark-hover text-[11px] font-semibold text-notion-accent dark:text-notion-dark-accent transition-colors shadow-sm"
          >
            <Eye className="w-3.5 h-3.5" />
            <span>Details</span>
          </Link>
        )
      }
    ];
  }, [hiddenProductIds, togglePublished, user, addToast]);

  const table = useReactTable({
    data: paginatedProducts,
    columns: tableColumns,
    state: {
      columnOrder,
      columnVisibility,
    },
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div className="space-y-6 pb-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-notion-text dark:text-notion-dark-text">
            Products Catalog
          </h1>
          <p className="text-xs text-notion-muted dark:text-notion-dark-muted mt-1">
            Manage your store inventory, status visibility, and explore items list
          </p>
        </div>

        {/* Action Panel */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Polling */}
          <button
            onClick={() => {
              togglePolling();
              addToast(pollingEnabled ? 'Live updates paused' : 'Live updates enabled', 'info');
            }}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${
              pollingEnabled 
                ? 'bg-notion-selected dark:bg-notion-dark-selected text-notion-accent dark:text-notion-dark-accent border-notion-accent/20' 
                : 'bg-white dark:bg-notion-dark-card text-notion-muted border-notion-border dark:border-notion-dark-border'
            }`}
          >
            <span className={`w-1.5 h-1.5 rounded-full ${pollingEnabled ? 'bg-notion-accent animate-pulse' : 'bg-slate-450'}`} />
            <span>{pollingEnabled ? 'Live' : 'Paused'}</span>
          </button>

          {/* Refetch Trigger */}
          <button
            onClick={() => {
              refetch();
              addToast('Inventory refreshed', 'success');
            }}
            disabled={isFetching}
            className="p-1.5 rounded-lg bg-white dark:bg-notion-dark-card border border-notion-border dark:border-notion-dark-border text-notion-muted hover:bg-notion-hover dark:hover:bg-notion-dark-hover transition-colors disabled:opacity-50 cursor-pointer"
            title="Refresh database"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isFetching ? 'animate-spin' : ''}`} />
          </button>

          {/* Columns Visibility Selector */}
          <div className="relative">
            <button
              onClick={() => setColumnPanelOpen(!columnPanelOpen)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white dark:bg-notion-dark-card border border-notion-border dark:border-notion-dark-border text-xs font-semibold text-notion-text dark:text-notion-dark-text hover:bg-notion-hover dark:hover:bg-notion-dark-hover transition-colors cursor-pointer"
            >
              <Settings className="w-3.5 h-3.5 text-notion-muted" />
              <span>Columns</span>
            </button>

            <AnimatePresence>
              {columnPanelOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setColumnPanelOpen(false)} />
                  <motion.div
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 5 }}
                    className="absolute right-0 mt-1.5 w-48 rounded-lg bg-white dark:bg-notion-dark-card border border-notion-border dark:border-notion-dark-border shadow-lg overflow-hidden z-50 p-2.5 space-y-2"
                  >
                    <div className="flex items-center justify-between border-b border-notion-border dark:border-notion-dark-border pb-1">
                      <span className="text-[9px] font-bold text-notion-muted uppercase tracking-wider">Columns</span>
                      <button onClick={resetColumnPrefs} className="text-[9px] text-notion-accent font-bold hover:underline">Reset</button>
                    </div>
                    <div className="space-y-1 max-h-44 overflow-y-auto">
                      {tableColumns.map(col => (
                        <label key={col.id} className="flex items-center gap-2 px-2 py-1 rounded text-xs text-notion-text dark:text-notion-dark-text font-semibold hover:bg-notion-hover dark:hover:bg-notion-dark-hover cursor-pointer">
                          <input
                            type="checkbox"
                            checked={columnVisibility[col.id]}
                            onChange={() => toggleColumnVisibility(col.id)}
                            className="rounded border-slate-300 text-notion-accent focus:ring-notion-accent/25"
                          />
                          <span className="capitalize">{col.id}</span>
                        </label>
                      ))}
                    </div>
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>

          {/* CSV Download */}
          <button
            onClick={handleCSVExport}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-notion-accent hover:bg-brand-600 text-white text-xs font-semibold transition-colors cursor-pointer shadow-sm"
          >
            <Download className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Export CSV</span>
          </button>
        </div>
      </div>

      {/* ================= FILTER TOOLBAR ================= */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-white dark:bg-notion-dark-card border border-notion-border dark:border-notion-dark-border p-3.5 rounded-xl shadow-sm">
        {/* Search */}
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-notion-muted" />
          <input
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search catalog..."
            className="w-full pl-9 pr-7 py-1.5 rounded-lg border border-notion-border dark:border-notion-dark-border bg-transparent text-xs text-notion-text dark:text-notion-dark-text focus:outline-none focus:border-notion-accent transition-colors placeholder-notion-muted/50"
          />
          {searchInput && (
            <button 
              onClick={() => { setSearchInput(''); updateFilter('search', ''); }}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-notion-muted hover:text-notion-text"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Filters Controls */}
        <div className="flex items-center gap-2 flex-wrap md:flex-nowrap">
          <select
            value={selectedCategory}
            onChange={(e) => updateFilter('category', e.target.value)}
            className="px-2.5 py-1.5 rounded-lg border border-notion-border dark:border-notion-dark-border bg-white dark:bg-notion-dark-card text-xs font-semibold text-notion-text dark:text-notion-dark-text focus:outline-none cursor-pointer"
          >
            <option value="">All Categories</option>
            {categories.map((cat) => (
              <option key={cat} value={cat} className="capitalize">
                {cat.replace(/-/g, ' ')}
              </option>
            ))}
          </select>

          <select
            value={minRating}
            onChange={(e) => updateFilter('rating', e.target.value)}
            className="px-2.5 py-1.5 rounded-lg border border-notion-border dark:border-notion-dark-border bg-white dark:bg-notion-dark-card text-xs font-semibold text-notion-text dark:text-notion-dark-text focus:outline-none cursor-pointer"
          >
            <option value="0">Any Rating</option>
            <option value="4">4.0 ★ & Above</option>
            <option value="4.5">4.5 ★ & Above</option>
            <option value="4.8">4.8 ★ & Above</option>
          </select>

          <select
            value={sortKey}
            onChange={(e) => updateFilter('sort', e.target.value)}
            className="px-2.5 py-1.5 rounded-lg border border-notion-border dark:border-notion-dark-border bg-white dark:bg-notion-dark-card text-xs font-semibold text-notion-text dark:text-notion-dark-text focus:outline-none cursor-pointer"
          >
            <option value="">Sort By</option>
            <option value="price-asc">Price: Low to High</option>
            <option value="price-desc">Price: High to Low</option>
            <option value="rating-desc">Rating: High to Low</option>
            <option value="rating-asc">Rating: Low to High</option>
            <option value="name-asc">Name: A to Z</option>
            <option value="name-desc">Name: Z to A</option>
          </select>

          {/* Reset Filters */}
          {(searchQuery || selectedCategory || minRating || sortKey) && (
            <button
              onClick={clearAllFilters}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-rose-200 dark:border-rose-950 hover:bg-rose-50 dark:hover:bg-rose-950/20 text-xs font-bold text-rose-600 dark:text-rose-455 transition-colors cursor-pointer"
            >
              Reset
            </button>
          )}
        </div>
      </div>

      {/* Loading & Content */}
      {isLoading ? (
        <div className="bg-white dark:bg-notion-dark-card border border-notion-border dark:border-notion-dark-border rounded-xl p-5 shadow-sm space-y-4">
          <div className="h-6 w-1/4 bg-slate-200 dark:bg-slate-800 rounded animate-pulse" />
          <div className="space-y-3 pt-2">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="flex gap-4 items-center">
                <div className="h-8 w-8 bg-slate-200 dark:bg-slate-800 rounded animate-pulse" />
                <div className="flex-1 h-5 bg-slate-200 dark:bg-slate-800 rounded animate-pulse" />
                <div className="h-5 w-14 bg-slate-200 dark:bg-slate-800 rounded animate-pulse" />
              </div>
            ))}
          </div>
        </div>
      ) : isError ? (
        <div className="bg-white dark:bg-notion-dark-card border border-notion-border dark:border-notion-dark-border p-8 rounded-xl text-center space-y-3 max-w-md mx-auto shadow-sm">
          <Sliders className="w-10 h-10 text-rose-600 mx-auto" />
          <h3 className="font-bold text-sm text-notion-text dark:text-notion-dark-text">Failed to load catalog inventory</h3>
          <p className="text-xs text-notion-muted dark:text-notion-dark-muted leading-relaxed">
            {error?.message || 'We encountered an error fetching catalog. Please try again.'}
          </p>
          <button 
            onClick={() => refetch()}
            className="px-4 py-2 rounded-lg bg-rose-600 hover:bg-rose-750 text-white text-xs font-semibold shadow transition-colors cursor-pointer"
          >
            Retry Loading
          </button>
        </div>
      ) : filteredProducts.length === 0 ? (
        <div className="bg-white dark:bg-notion-dark-card border border-notion-border dark:border-notion-dark-border p-12 rounded-xl text-center space-y-4 max-w-md mx-auto shadow-sm">
          <SlidersHorizontal className="w-10 h-10 text-notion-muted mx-auto" />
          <h3 className="font-bold text-sm text-notion-text dark:text-notion-dark-text">No products found matching filters</h3>
          <p className="text-xs text-notion-muted dark:text-notion-dark-muted leading-relaxed">
            Your query filters return 0 results. Try resetting filters.
          </p>
          <button 
            onClick={clearAllFilters}
            className="px-4 py-2 rounded-lg bg-notion-accent hover:bg-brand-600 text-white text-xs font-semibold shadow transition-all cursor-pointer"
          >
            Clear Filters
          </button>
        </div>
      ) : (
        <>
          {/* ================= TABLE LIST VIEW ================= */}
          <div className="hidden lg:block bg-white dark:bg-notion-dark-card border border-notion-border dark:border-notion-dark-border rounded-xl shadow-sm overflow-hidden">
            <div className="overflow-x-auto max-h-[520px]">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="select-none">
                    {table.getHeaderGroups()[0].headers.map((header) => (
                      <th
                        key={header.id}
                        draggable
                        onDragStart={(e) => handleDragStart(e, header.id)}
                        onDragOver={(e) => e.preventDefault()}
                        onDrop={(e) => handleDrop(e, header.id)}
                        className="py-3 px-5 text-[9px] font-bold uppercase tracking-wider text-notion-muted dark:text-notion-dark-muted cursor-grab active:cursor-grabbing hover:bg-notion-hover dark:hover:bg-notion-dark-hover transition-colors sticky top-0 bg-notion-hover/90 dark:bg-notion-dark-card/90 backdrop-blur-sm z-10 border-b border-notion-border dark:border-notion-dark-border"
                      >
                        <div className="flex items-center gap-1.5">
                          {flexRender(header.column.columnDef.header, header.getContext())}
                          <HelpCircle className="w-3 h-3 text-notion-muted/50" />
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {table.getRowModel().rows.map((row) => (
                    <tr 
                      key={row.id}
                      className="border-b border-notion-border/40 dark:border-notion-dark-border/40 last:border-0 hover:bg-notion-hover/40 dark:hover:bg-notion-dark-hover/30 transition-colors"
                    >
                      {row.getVisibleCells().map((cell) => (
                        <td key={cell.id} className="py-3.5 px-5 text-xs text-notion-text dark:text-notion-dark-text align-middle">
                          {flexRender(cell.column.columnDef.cell, cell.getContext())}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* ================= PRODUCT CARDS GRID (MOBILE/TABLET) ================= */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:hidden">
            {paginatedProducts.map((p) => {
              const isPublished = isProductPublished(p.id);
              const isAdmin = user?.role === 'admin';
              
              return (
                <div 
                  key={p.id}
                  className="bg-white dark:bg-notion-dark-card border border-notion-border dark:border-notion-dark-border p-4.5 rounded-xl shadow-sm space-y-4 flex flex-col justify-between"
                >
                  <div className="flex gap-3">
                    <img 
                      src={p.thumbnail} 
                      alt={p.title} 
                      className="w-14 h-14 rounded object-cover bg-notion-hover dark:bg-notion-dark-hover border border-notion-border/50"
                    />
                    <div className="flex-1 min-w-0">
                      <span className="text-[9px] text-notion-muted uppercase block font-bold mb-0.5">{p.category}</span>
                      <h4 className="font-bold text-xs text-notion-text dark:text-white truncate leading-snug">{p.title}</h4>
                      <span className="text-xs text-notion-muted block mt-0.5">{p.brand || 'N/A'}</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 border-y border-notion-border/40 dark:border-notion-dark-border/40 py-2.5 text-xs">
                    <div>
                      <span className="text-notion-muted text-[9px] block">Price</span>
                      <span className="font-bold text-notion-text dark:text-white text-xs">{formatCurrency(p.price)}</span>
                    </div>
                    <div>
                      <span className="text-notion-muted text-[9px] block">Rating</span>
                      <div className="flex items-center gap-0.5 mt-0.5">
                        <Star className="w-3 h-3 text-amber-500 fill-amber-500" />
                        <span className="font-bold text-notion-text dark:text-notion-dark-text">{p.rating.toFixed(1)}</span>
                      </div>
                    </div>
                    <div className="mt-2">
                      <span className="text-notion-muted text-[9px] block">Stock</span>
                      <span className="font-bold text-notion-text dark:text-slate-405">{p.stock} units</span>
                    </div>
                    <div className="mt-2">
                      <span className="text-notion-muted text-[9px] block">Status</span>
                      {isAdmin ? (
                        <button
                          onClick={() => {
                            togglePublished(p.id);
                            addToast(`Toggled ${!isPublished ? 'Published' : 'Hidden'}`, 'success');
                          }}
                          className={`relative inline-flex h-4 w-7.5 items-center rounded-full transition-colors focus:outline-none cursor-pointer mt-0.5 ${
                            isPublished ? 'bg-notion-accent' : 'bg-slate-300 dark:bg-slate-700'
                          }`}
                        >
                          <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${
                            isPublished ? 'translate-x-3.5' : 'translate-x-0.5'
                          }`} />
                        </button>
                      ) : (
                        <span className="inline-block mt-0.5 text-[9px] font-bold text-emerald-600 dark:text-emerald-400">Published</span>
                      )}
                    </div>
                  </div>

                  <div className="pt-1 flex justify-end">
                    <Link
                      to={`/products/${p.id}`}
                      className="inline-flex items-center justify-center gap-1.5 w-full py-2 rounded-lg border border-notion-border dark:border-notion-dark-border text-xs font-semibold text-notion-accent hover:bg-notion-hover dark:hover:bg-notion-dark-hover transition-colors shadow-sm"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      View Details
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>

          {/* ================= PAGINATION CONTROL ================= */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pt-4 border-t border-notion-border dark:border-notion-dark-border/60">
            <span className="text-[11px] text-notion-muted dark:text-notion-dark-muted text-center sm:text-left">
              Showing page <strong className="text-notion-text dark:text-notion-dark-text">{pageIndex}</strong> of <strong className="text-notion-text dark:text-notion-dark-text">{pageCount || 1}</strong> ({filteredProducts.length} items)
            </span>

            <div className="flex items-center justify-center gap-1.5">
              <button
                disabled={pageIndex <= 1}
                onClick={() => updateFilter('page', pageIndex - 1)}
                className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-notion-border dark:border-notion-dark-border text-xs font-semibold text-notion-muted hover:bg-notion-hover dark:hover:bg-notion-dark-hover disabled:opacity-40 transition-colors cursor-pointer"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
                <span>Prev</span>
              </button>

              <button
                disabled={pageIndex >= pageCount}
                onClick={() => updateFilter('page', pageIndex + 1)}
                className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-notion-border dark:border-notion-dark-border text-xs font-semibold text-notion-muted hover:bg-notion-hover dark:hover:bg-notion-dark-hover disabled:opacity-40 transition-colors cursor-pointer"
              >
                <span>Next</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
