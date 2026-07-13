import React, { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { productServices } from '../../services/api';
import { useProductStore } from '../../store/productStore';
import { useThemeStore } from '../../store/themeStore';
import { formatCurrency, formatNumber } from '../../utils/helpers';
import { 
  Package, 
  Star, 
  Layers, 
  DollarSign, 
  TrendingUp, 
  TrendingDown,
  CheckCircle2, 
  Award,
  AlertTriangle,
  ArrowUpRight,
  Activity,
  RefreshCcw
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  Tooltip
} from 'recharts';
import { Link } from 'react-router-dom';

export default function Dashboard() {
  const { hiddenProductIds } = useProductStore();
  const { theme } = useThemeStore();

  const { data: products = [], isLoading, refetch, isFetching } = useQuery({
    queryKey: ['products'],
    queryFn: productServices.getAllProducts,
  });

  const stats = useMemo(() => {
    if (!products.length) return { count: 0, avgRating: 0, publishedCount: 0, totalValue: 0 };
    
    const count = products.length;
    const publishedCount = products.filter(p => !hiddenProductIds.includes(p.id)).length;
    
    let ratingSum = 0;
    let totalValue = 0;

    products.forEach(p => {
      ratingSum += p.rating;
      totalValue += p.price * p.stock;
    });

    return {
      count,
      avgRating: (ratingSum / count).toFixed(2),
      publishedCount,
      totalValue,
    };
  }, [products, hiddenProductIds]);

  const topRated = useMemo(() => {
    return [...products]
      .sort((a, b) => b.rating - a.rating)
      .slice(0, 4);
  }, [products]);

  const lowStockAlerts = useMemo(() => {
    return products.filter(p => p.stock < 8).slice(0, 4);
  }, [products]);

  const ratingDistributionData = useMemo(() => {
    const brackets = {
      '1.0-3.0': 0,
      '3.0-4.0': 0,
      '4.0-4.5': 0,
      '4.5-4.8': 0,
      '4.8-5.0': 0,
    };

    products.forEach(p => {
      if (p.rating >= 4.8) brackets['4.8-5.0']++;
      else if (p.rating >= 4.5) brackets['4.5-4.8']++;
      else if (p.rating >= 4.0) brackets['4.0-4.5']++;
      else if (p.rating >= 3.0) brackets['3.0-4.0']++;
      else brackets['1.0-3.0']++;
    });

    return Object.keys(brackets).map(key => ({
      bracket: key,
      count: brackets[key],
    }));
  }, [products]);

  const latestActivity = [
    { id: 1, type: 'status', user: 'Sarah Jenkins', action: 'changed status of', target: 'Essence Mascara Lash', detail: 'Published → Hidden', time: '5m ago' },
    { id: 2, type: 'sync', user: 'System Worker', action: 'auto-synchronized database inventory', target: 'dummyjson.com API', detail: '150 items synced', time: '12m ago' },
    { id: 3, type: 'stock', user: 'Sarah Jenkins', action: 'updated stock count for', target: 'Eyeshadow Palette with Mirror', detail: 'Set count to 88 units', time: '1h ago' },
    { id: 4, type: 'export', user: 'Sarah Jenkins', action: 'downloaded active CSV export', target: 'filtered_products.csv', detail: '128 rows downloaded', time: '3h ago' },
  ];

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 animate-pulse">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-32 bg-slate-200 dark:bg-slate-800 rounded-xl" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-pulse">
          <div className="h-80 bg-slate-200 dark:bg-slate-800 rounded-xl lg:col-span-2" />
          <div className="h-80 bg-slate-200 dark:bg-slate-800 rounded-xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-10">
      
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-notion-text dark:text-notion-dark-text">
            Dashboard Overview
          </h1>
          <p className="text-xs text-notion-muted dark:text-notion-dark-muted mt-1">
            Real-time insight on your product inventory, publishing statuses, and rating scores
          </p>
        </div>
        <div>
          <button 
            onClick={() => refetch()}
            disabled={isFetching}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-notion-border dark:border-notion-dark-border bg-white dark:bg-notion-dark-card text-xs font-semibold text-notion-text dark:text-notion-dark-text hover:bg-notion-hover dark:hover:bg-notion-dark-hover transition-colors cursor-pointer"
          >
            <RefreshCcw className={`w-3.5 h-3.5 ${isFetching ? 'animate-spin' : ''}`} />
            <span>Sync</span>
          </button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Total Products */}
        <div className="bg-white dark:bg-notion-dark-card border border-notion-border dark:border-notion-dark-border p-5 rounded-xl shadow-sm hover:border-slate-300 dark:hover:border-slate-700 transition-all flex flex-col justify-between h-32">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-notion-muted dark:text-notion-dark-muted uppercase tracking-wider">Total Products</span>
            <Package className="w-4 h-4 text-notion-accent dark:text-notion-dark-accent" />
          </div>
          <div className="space-y-0.5 mt-2">
            <h3 className="text-2xl font-bold text-notion-text dark:text-notion-dark-text leading-none">{stats.count}</h3>
            <div className="flex items-center justify-between text-[10px] text-notion-muted dark:text-notion-dark-muted pt-1.5">
              <span className="text-notion-accent dark:text-notion-dark-accent font-bold flex items-center gap-0.5">
                <TrendingUp className="w-3 h-3" />
                <span>+12.4% MoM</span>
              </span>
              <span>100% Capacity</span>
            </div>
            <div className="w-full bg-notion-hover dark:bg-notion-dark-hover h-1 rounded-full overflow-hidden mt-1.5">
              <div className="bg-notion-accent dark:bg-notion-dark-accent h-full w-[85%]" />
            </div>
          </div>
        </div>

        {/* Published Items */}
        <div className="bg-white dark:bg-notion-dark-card border border-notion-border dark:border-notion-dark-border p-5 rounded-xl shadow-sm hover:border-slate-300 dark:hover:border-slate-700 transition-all flex flex-col justify-between h-32">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-notion-muted dark:text-notion-dark-muted uppercase tracking-wider">Published Items</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="space-y-0.5 mt-2">
            <h3 className="text-2xl font-bold text-notion-text dark:text-notion-dark-text leading-none">{stats.publishedCount}</h3>
            <div className="flex items-center justify-between text-[10px] text-notion-muted dark:text-notion-dark-muted pt-1.5">
              <span className="text-emerald-600 font-bold flex items-center gap-0.5">
                <TrendingUp className="w-3 h-3" />
                <span>Active</span>
              </span>
              <span>{Math.round((stats.publishedCount / stats.count) * 100)}%</span>
            </div>
            <div className="w-full bg-notion-hover dark:bg-notion-dark-hover h-1 rounded-full overflow-hidden mt-1.5">
              <div className="bg-emerald-500 h-full" style={{ width: `${(stats.publishedCount / stats.count) * 100}%` }} />
            </div>
          </div>
        </div>

        {/* Avg Rating */}
        <div className="bg-white dark:bg-notion-dark-card border border-notion-border dark:border-notion-dark-border p-5 rounded-xl shadow-sm hover:border-slate-300 dark:hover:border-slate-700 transition-all flex flex-col justify-between h-32">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-notion-muted dark:text-notion-dark-muted uppercase tracking-wider">Average Rating</span>
            <Star className="w-4 h-4 fill-amber-500 text-amber-500" />
          </div>
          <div className="space-y-0.5 mt-2">
            <h3 className="text-2xl font-bold text-notion-text dark:text-notion-dark-text leading-none">{stats.avgRating}</h3>
            <div className="flex items-center justify-between text-[10px] text-notion-muted dark:text-notion-dark-muted pt-1.5">
              <span className="text-amber-600 dark:text-amber-500 font-bold flex items-center gap-0.5">
                <Award className="w-3 h-3" />
                <span>High Quality</span>
              </span>
              <span>Score: {Math.round((stats.avgRating / 5) * 100)}%</span>
            </div>
            <div className="w-full bg-notion-hover dark:bg-notion-dark-hover h-1 rounded-full overflow-hidden mt-1.5">
              <div className="bg-amber-550 h-full" style={{ width: `${(stats.avgRating / 5) * 100}%` }} />
            </div>
          </div>
        </div>

        {/* Inventory Value */}
        <div className="bg-white dark:bg-notion-dark-card border border-notion-border dark:border-notion-dark-border p-5 rounded-xl shadow-sm hover:border-slate-300 dark:hover:border-slate-700 transition-all flex flex-col justify-between h-32">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-notion-muted dark:text-notion-dark-muted uppercase tracking-wider">Inventory Value</span>
            <DollarSign className="w-4 h-4 text-rose-600" />
          </div>
          <div className="space-y-0.5 mt-2">
            <h3 className="text-2xl font-bold text-notion-text dark:text-notion-dark-text leading-none">{formatCurrency(stats.totalValue)}</h3>
            <div className="flex items-center justify-between text-[10px] text-notion-muted dark:text-notion-dark-muted pt-1.5">
              <span className="text-rose-600 dark:text-rose-500 font-bold flex items-center gap-0.5">
                <TrendingDown className="w-3 h-3" />
                <span>-2.1% MoM</span>
              </span>
              <span>Asset Valuation</span>
            </div>
            <div className="w-full bg-notion-hover dark:bg-notion-dark-hover h-1 rounded-full overflow-hidden mt-1.5">
              <div className="bg-rose-500 h-full w-[75%]" />
            </div>
          </div>
        </div>

      </div>

      {/* Charts & Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Rating Area chart */}
        <div className="bg-white dark:bg-notion-dark-card border border-notion-border dark:border-notion-dark-border p-5 rounded-xl shadow-sm lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-xs font-bold text-notion-text dark:text-notion-dark-text uppercase tracking-wider">Customer Rating Distribution</h4>
              <span className="text-[10px] text-notion-muted dark:text-notion-dark-muted block">Catalog counts mapped by rating ranges</span>
            </div>
          </div>
          
          <div className="h-60">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={ratingDistributionData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={theme === 'dark' ? '#4DA3FF' : '#2383E2'} stopOpacity={0.15}/>
                    <stop offset="95%" stopColor={theme === 'dark' ? '#4DA3FF' : '#2383E2'} stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="bracket" tick={{ fontSize: 10 }} stroke="#888888" />
                <YAxis tick={{ fontSize: 10 }} stroke="#888888" />
                <Tooltip 
                  contentStyle={{ backgroundColor: theme === 'dark' ? '#202020' : '#FFFFFF', borderRadius: '6px', border: '1px solid #E9E9E7', color: 'currentColor', fontSize: '10px' }}
                />
                <Area type="monotone" dataKey="count" name="Product Count" stroke={theme === 'dark' ? '#4DA3FF' : '#2383E2'} strokeWidth={2} fillOpacity={1} fill="url(#colorCount)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Latest Activity Feed */}
        <div className="bg-white dark:bg-notion-dark-card border border-notion-border dark:border-notion-dark-border p-5 rounded-xl shadow-sm space-y-4">
          <div className="border-b border-notion-border dark:border-notion-dark-border pb-3">
            <h4 className="text-xs font-bold text-notion-text dark:text-notion-dark-text uppercase tracking-wider flex items-center gap-1.5">
              <Activity className="w-4 h-4 text-notion-accent dark:text-notion-dark-accent" />
              <span>Latest Activity</span>
            </h4>
          </div>

          <div className="space-y-4 max-h-56 overflow-y-auto pr-1">
            {latestActivity.map(act => (
              <div key={act.id} className="flex items-start gap-2.5 text-xs leading-relaxed border-b border-notion-border/40 dark:border-notion-dark-border/40 pb-3 last:border-0 last:pb-0">
                <div className="w-5.5 h-5.5 rounded bg-notion-hover dark:bg-notion-dark-hover flex items-center justify-center font-bold text-[10px] text-notion-muted select-none">
                  {act.user.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-notion-text dark:text-notion-dark-text font-bold">
                    {act.user} <span className="text-notion-muted dark:text-notion-dark-muted font-normal">{act.action}</span> <span className="text-notion-accent dark:text-notion-dark-accent font-semibold">{act.target}</span>
                  </p>
                  <span className="text-[9px] text-notion-muted dark:text-notion-dark-muted block font-medium mt-0.5">{act.detail}</span>
                </div>
                <span className="text-[9px] text-notion-muted whitespace-nowrap">{act.time}</span>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Performance Leaders & Stock Alarms */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Performance Leaders */}
        <div className="bg-white dark:bg-notion-dark-card border border-notion-border dark:border-notion-dark-border p-5 rounded-xl shadow-sm lg:col-span-8 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-xs font-bold text-notion-text dark:text-notion-dark-text uppercase tracking-wider">Performance Leaders</h4>
              <span className="text-[10px] text-notion-muted dark:text-notion-dark-muted">High performing catalog inventory</span>
            </div>
            <Link to="/products" className="inline-flex items-center gap-0.5 text-xs font-bold text-notion-accent dark:text-notion-dark-accent hover:underline">
              <span>View catalog</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
            {topRated.map(p => (
              <Link 
                key={p.id}
                to={`/products/${p.id}`}
                className="group p-3 bg-notion-hover dark:bg-notion-dark-hover border border-notion-border dark:border-notion-dark-border/40 rounded-xl hover:border-slate-300 dark:hover:border-slate-700 transition-all flex flex-col justify-between h-auto min-h-[165px]"
              >
                <div className="space-y-1.5">
                  <div className="h-20 w-full rounded overflow-hidden bg-white dark:bg-notion-dark-card flex items-center justify-center p-1 border border-notion-border dark:border-notion-dark-border/30">
                    <img src={p.thumbnail} alt={p.title} className="max-h-full max-w-full object-contain" />
                  </div>
                  <h5 className="font-bold text-[11px] text-notion-text dark:text-notion-dark-text truncate group-hover:text-notion-accent transition-colors">{p.title}</h5>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-notion-border/40 dark:border-notion-dark-border/40 mt-2 text-[10px]">
                  <span className="font-bold text-notion-text dark:text-notion-dark-text">{formatCurrency(p.price)}</span>
                  <div className="flex items-center gap-0.5">
                    <Star className="w-3 h-3 text-amber-500 fill-amber-500" />
                    <span className="font-bold text-notion-muted dark:text-notion-dark-muted">{p.rating.toFixed(1)}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Stock Alarms */}
        <div className="bg-white dark:bg-notion-dark-card border border-notion-border dark:border-notion-dark-border p-5 rounded-xl shadow-sm lg:col-span-4 space-y-4">
          <div className="flex items-center justify-between border-b border-notion-border dark:border-notion-dark-border pb-3">
            <div>
              <h4 className="text-xs font-bold text-notion-text dark:text-notion-dark-text uppercase tracking-wider">Inventory Alarms</h4>
              <span className="text-[10px] text-notion-muted dark:text-notion-dark-muted">Stock limits warnings</span>
            </div>
            <AlertTriangle className="w-4 h-4 text-amber-500" />
          </div>

          <div className="space-y-3">
            {lowStockAlerts.map(p => (
              <div key={p.id} className="flex items-center gap-3 border-b border-notion-border/30 dark:border-notion-dark-border/30 last:border-0 pb-3 last:pb-0">
                <img src={p.thumbnail} alt={p.title} className="w-8 h-8 rounded object-cover bg-white dark:bg-notion-dark-card border border-notion-border/40" />
                <div className="flex-1 min-w-0">
                  <span className="text-xs font-bold text-notion-text dark:text-notion-dark-text block truncate">{p.title}</span>
                  <span className="text-[10px] text-notion-muted dark:text-notion-dark-muted block mt-0.5">Stock count: {p.stock} units</span>
                </div>
                <div>
                  <span className="text-[9px] font-bold text-rose-600 bg-rose-50 dark:bg-rose-950/20 px-2 py-0.5 rounded border border-rose-100 dark:border-rose-900/30">
                    Low stock
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

    </div>
  );
}
