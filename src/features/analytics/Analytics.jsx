import React, { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { productServices } from '../../services/api';
import { useThemeStore } from '../../store/themeStore';
import { formatCurrency } from '../../utils/helpers';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell,
  LineChart,
  Line,
  CartesianGrid
} from 'recharts';
import { 
  PieChart as PieIcon, 
  BarChart3, 
  DollarSign, 
  TrendingUp, 
  Boxes, 
  Sparkles
} from 'lucide-react';

export default function Analytics() {
  const { theme } = useThemeStore();
  const { data: products = [], isLoading } = useQuery({
    queryKey: ['products'],
    queryFn: productServices.getAllProducts,
  });

  const categoryStats = useMemo(() => {
    const categoriesMap = {};

    products.forEach(p => {
      if (!categoriesMap[p.category]) {
        categoriesMap[p.category] = {
          category: p.category,
          productCount: 0,
          totalStock: 0,
          totalValue: 0,
          ratingSum: 0,
        };
      }

      const cat = categoriesMap[p.category];
      cat.productCount++;
      cat.totalStock += p.stock;
      cat.totalValue += p.price * p.stock;
      cat.ratingSum += p.rating;
    });

    return Object.values(categoriesMap).map(cat => ({
      ...cat,
      avgRating: Number((cat.ratingSum / cat.productCount).toFixed(2)),
    }));
  }, [products]);

  const productsPerCategoryData = useMemo(() => {
    return categoryStats
      .map(cat => ({
        name: cat.category.charAt(0).toUpperCase() + cat.category.slice(1).replace(/-/g, ' '),
        value: cat.productCount,
      }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 8);
  }, [categoryStats]);

  const categoryValueData = useMemo(() => {
    return categoryStats
      .map(cat => ({
        name: cat.category.charAt(0).toUpperCase() + cat.category.slice(1).replace(/-/g, ' '),
        value: Math.round(cat.totalValue),
      }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 5);
  }, [categoryStats]);

  const avgRatingData = useMemo(() => {
    return categoryStats
      .map(cat => ({
        name: cat.category.charAt(0).toUpperCase() + cat.category.slice(1).replace(/-/g, ' ').substring(0, 10),
        rating: cat.avgRating,
      }))
      .sort((a, b) => b.rating - a.rating)
      .slice(0, 8);
  }, [categoryStats]);

  // Notion-inspired colors (Accent blue, gray tones, dark configurations)
  const COLORS = theme === 'dark'
    ? ['#4DA3FF', '#4ade80', '#fb7185', '#fcd34d', '#a78bfa', '#2dd4bf', '#a1a1aa', '#f43f5e']
    : ['#2383E2', '#16A34A', '#DC2626', '#D97706', '#8B5CF6', '#0D9488', '#71717A', '#E11D48'];

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-pulse">
          <div className="h-80 bg-slate-200 dark:bg-slate-800 rounded-xl" />
          <div className="h-80 bg-slate-200 dark:bg-slate-800 rounded-xl" />
        </div>
        <div className="h-80 bg-slate-200 dark:bg-slate-800 rounded-xl animate-pulse" />
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-10">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-notion-text dark:text-notion-dark-text font-sans">
          Analytics Dashboard
        </h1>
        <p className="text-xs text-notion-muted dark:text-notion-dark-muted mt-1">
          Detailed metrics showing category distributions, inventory valuations, and performance scores
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-notion-dark-card border border-notion-border dark:border-notion-dark-border p-5 rounded-xl shadow-sm flex items-center gap-3.5">
          <div className="w-9 h-9 rounded bg-notion-hover dark:bg-notion-dark-hover text-notion-accent dark:text-notion-dark-accent flex items-center justify-center border border-notion-border dark:border-notion-dark-border/40">
            <Boxes className="w-4.5 h-4.5" />
          </div>
          <div>
            <span className="text-[9px] font-bold text-notion-muted dark:text-notion-dark-muted uppercase tracking-wider block">Diverse Categories</span>
            <span className="text-lg font-bold text-notion-text dark:text-white mt-0.5 block">{categoryStats.length}</span>
          </div>
        </div>

        <div className="bg-white dark:bg-notion-dark-card border border-notion-border dark:border-notion-dark-border p-5 rounded-xl shadow-sm flex items-center gap-3.5">
          <div className="w-9 h-9 rounded bg-notion-hover dark:bg-notion-dark-hover text-emerald-600 flex items-center justify-center border border-notion-border dark:border-notion-dark-border/40">
            <DollarSign className="w-4.5 h-4.5" />
          </div>
          <div>
            <span className="text-[9px] font-bold text-notion-muted dark:text-notion-dark-muted uppercase tracking-wider block">Average Item Price</span>
            <span className="text-lg font-bold text-notion-text dark:text-white mt-0.5 block">
              {formatCurrency(products.reduce((acc, curr) => acc + curr.price, 0) / products.length)}
            </span>
          </div>
        </div>

        <div className="bg-white dark:bg-notion-dark-card border border-notion-border dark:border-notion-dark-border p-5 rounded-xl shadow-sm flex items-center gap-3.5">
          <div className="w-9 h-9 rounded bg-notion-hover dark:bg-notion-dark-hover text-indigo-500 flex items-center justify-center border border-notion-border dark:border-notion-dark-border/40">
            <Sparkles className="w-4.5 h-4.5" />
          </div>
          <div>
            <span className="text-[9px] font-bold text-notion-muted dark:text-notion-dark-muted uppercase tracking-wider block">Best Rated Category</span>
            <span className="text-xs font-bold text-notion-text dark:text-white mt-1 block capitalize truncate max-w-[150px]">
              {categoryStats.sort((a, b) => b.avgRating - a.avgRating)[0]?.category.replace(/-/g, ' ')}
            </span>
          </div>
        </div>
      </div>

      {/* Graphs */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Products Count per category */}
        <div className="bg-white dark:bg-notion-dark-card border border-notion-border dark:border-notion-dark-border p-5 rounded-xl shadow-sm space-y-4">
          <div>
            <h4 className="text-xs font-bold text-notion-text dark:text-notion-dark-text uppercase tracking-wider flex items-center gap-1.5">
              <BarChart3 className="w-4 h-4 text-notion-accent" />
              <span>Products Count Per Category</span>
            </h4>
            <span className="text-[10px] text-notion-muted dark:text-notion-dark-muted block">Total units count mapped by product categories</span>
          </div>
          <div className="h-60">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={productsPerCategoryData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                <XAxis dataKey="name" tick={{ fontSize: 9 }} stroke="#888888" />
                <YAxis tick={{ fontSize: 9 }} stroke="#888888" />
                <Tooltip 
                  contentStyle={{ backgroundColor: theme === 'dark' ? '#202020' : '#FFFFFF', borderRadius: '6px', border: '1px solid #E9E9E7', color: 'currentColor', fontSize: '10px' }}
                />
                <Bar dataKey="value" name="Products" fill={theme === 'dark' ? '#4DA3FF' : '#2383E2'} radius={[2, 2, 0, 0]}>
                  {productsPerCategoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Category Value distribution */}
        <div className="bg-white dark:bg-notion-dark-card border border-notion-border dark:border-notion-dark-border p-5 rounded-xl shadow-sm space-y-4">
          <div>
            <h4 className="text-xs font-bold text-notion-text dark:text-notion-dark-text uppercase tracking-wider flex items-center gap-1.5">
              <PieIcon className="w-4 h-4 text-emerald-600" />
              <span>Inventory Valuation Share</span>
            </h4>
            <span className="text-[10px] text-notion-muted dark:text-notion-dark-muted block">Valuation share ($) of top 5 categories</span>
          </div>
          <div className="h-60 flex flex-col sm:flex-row items-center justify-center">
            <div className="w-full sm:w-1/2 h-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryValueData}
                    cx="50%"
                    cy="50%"
                    innerRadius={45}
                    outerRadius={75}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {categoryValueData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(value) => formatCurrency(value)}
                    contentStyle={{ backgroundColor: theme === 'dark' ? '#202020' : '#FFFFFF', borderRadius: '6px', border: '1px solid #E9E9E7', color: 'currentColor', fontSize: '10px' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            
            <div className="w-full sm:w-1/2 space-y-2 px-4">
              {categoryValueData.map((entry, index) => (
                <div key={entry.name} className="flex items-center justify-between text-[11px]">
                  <div className="flex items-center gap-1.5">
                    <div className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                    <span className="text-notion-muted dark:text-notion-dark-muted font-semibold truncate max-w-[100px]">{entry.name}</span>
                  </div>
                  <span className="font-bold text-notion-text dark:text-white">{formatCurrency(entry.value)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>

      {/* Average rating line chart */}
      <div className="bg-white dark:bg-notion-dark-card border border-notion-border dark:border-notion-dark-border p-5 rounded-xl shadow-sm space-y-4">
        <div>
          <h4 className="text-xs font-bold text-notion-text dark:text-notion-dark-text uppercase tracking-wider flex items-center gap-1.5">
            <TrendingUp className="w-4 h-4 text-indigo-500" />
            <span>Average Rating Per Category</span>
          </h4>
          <span className="text-[10px] text-notion-muted dark:text-notion-dark-muted block">Comparison of performance scores by category</span>
        </div>
        <div className="h-60">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={avgRatingData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={theme === 'dark' ? '#333' : '#e9e9e7'} />
              <XAxis dataKey="name" tick={{ fontSize: 9 }} stroke="#888888" />
              <YAxis domain={[3.5, 5.0]} tick={{ fontSize: 9 }} stroke="#888888" />
              <Tooltip 
                contentStyle={{ backgroundColor: theme === 'dark' ? '#202020' : '#FFFFFF', borderRadius: '6px', border: '1px solid #E9E9E7', color: 'currentColor', fontSize: '10px' }}
              />
              <Line type="monotone" dataKey="rating" name="Avg Rating" stroke={theme === 'dark' ? '#4DA3FF' : '#2383E2'} strokeWidth={2.5} dot={{ fill: theme === 'dark' ? '#4DA3FF' : '#2383E2', strokeWidth: 1.5, r: 3.5 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

    </div>
  );
}
