import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { productServices } from '../../services/api';
import { useUiStore } from '../../store/uiStore';
import { formatCurrency } from '../../utils/helpers';
import { 
  ArrowLeft, 
  Star, 
  Package, 
  Truck, 
  ShieldCheck, 
  Tag,
  BadgeAlert,
  Percent,
  CheckCircle
} from 'lucide-react';
import { motion } from 'framer-motion';

export default function ProductDetails() {
  const { id } = useParams();
  const { addToast } = useUiStore();
  const navigate = useNavigate();
  const [selectedImage, setSelectedImage] = useState('');

  const { 
    data: product, 
    isLoading, 
    isError, 
    error 
  } = useQuery({
    queryKey: ['product', id],
    queryFn: () => productServices.getProductById(id),
    enabled: !!id,
  });

  useEffect(() => {
    if (product && product.images && product.images.length > 0) {
      setSelectedImage(product.images[0]);
    } else if (product && product.thumbnail) {
      setSelectedImage(product.thumbnail);
    }
  }, [product]);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-6 w-20 bg-slate-250 dark:bg-slate-800 rounded animate-pulse" />
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-6 h-80 bg-slate-200 dark:bg-slate-800 rounded-xl animate-pulse" />
          <div className="lg:col-span-6 space-y-4">
            <div className="h-8 w-2/3 bg-slate-250 dark:bg-slate-800 rounded animate-pulse" />
            <div className="h-4 w-1/4 bg-slate-250 dark:bg-slate-800 rounded animate-pulse" />
            <div className="h-20 bg-slate-250 dark:bg-slate-800 rounded animate-pulse" />
          </div>
        </div>
      </div>
    );
  }

  if (isError || !product) {
    return (
      <div className="text-center py-10 space-y-4 max-w-sm mx-auto">
        <div className="w-12 h-12 bg-rose-50 dark:bg-rose-950/20 text-rose-500 rounded-lg flex items-center justify-center mx-auto border border-rose-100">
          <BadgeAlert className="w-6 h-6" />
        </div>
        <h3 className="font-bold text-sm text-notion-text dark:text-notion-dark-text">Unable to load product details</h3>
        <p className="text-xs text-notion-muted leading-relaxed">
          {error?.message || 'The product you are trying to view could not be found or fetched.'}
        </p>
        <Link 
          to="/products"
          className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-notion-accent hover:bg-brand-600 text-white text-xs font-semibold shadow"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Catalog</span>
        </Link>
      </div>
    );
  }

  const originalPrice = product.price / (1 - (product.discountPercentage || 0) / 100);
  const stockLevel = product.stock;
  const isOutOfStock = stockLevel === 0;

  return (
    <div className="space-y-6 pb-10">
      <div>
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-notion-muted hover:text-notion-text dark:text-notion-dark-muted dark:hover:text-notion-dark-text transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Catalog</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 bg-white dark:bg-notion-dark-card border border-notion-border dark:border-notion-dark-border p-6 rounded-xl shadow-sm">
        
        {/* LEFT GALLERY PANEL */}
        <div className="lg:col-span-6 space-y-4">
          <div className="aspect-[4/3] rounded-xl bg-notion-hover dark:bg-notion-dark-bg border border-notion-border dark:border-notion-dark-border/40 overflow-hidden flex items-center justify-center p-5 relative">
            {product.discountPercentage > 0 && (
              <span className="absolute top-3 left-3 inline-flex items-center gap-0.5 bg-rose-600 text-white font-bold text-[9px] px-2 py-0.5 rounded border border-rose-500 uppercase tracking-wider">
                <Percent className="w-3 h-3" />
                <span>{product.discountPercentage}% Off</span>
              </span>
            )}
            
            <motion.img 
              key={selectedImage}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              src={selectedImage || product.thumbnail} 
              alt={product.title} 
              className="max-h-full max-w-full object-contain"
            />
          </div>

          {product.images && product.images.length > 1 && (
            <div className="flex gap-2.5 overflow-x-auto pb-1">
              {product.images.map((img, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedImage(img)}
                  className={`relative flex-shrink-0 w-16 h-14 rounded-lg overflow-hidden border bg-white dark:bg-notion-dark-bg p-1.5 cursor-pointer transition-all ${
                    selectedImage === img 
                      ? 'border-notion-accent' 
                      : 'border-notion-border dark:border-notion-dark-border hover:border-slate-300 dark:hover:border-slate-700'
                  }`}
                >
                  <img src={img} alt="thumbnail" className="w-full h-full object-contain" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* RIGHT METADATA PANEL */}
        <div className="lg:col-span-6 flex flex-col justify-between space-y-5">
          <div className="space-y-3.5">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-notion-selected dark:bg-notion-dark-selected text-notion-accent capitalize">
                {product.category}
              </span>
              {product.brand && (
                <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-notion-hover dark:bg-notion-dark-hover text-notion-muted">
                  {product.brand}
                </span>
              )}
            </div>

            <div>
              <h2 className="text-xl font-bold text-notion-text dark:text-white leading-snug">
                {product.title}
              </h2>
              <div className="flex items-center gap-1.5 mt-1.5">
                <div className="flex items-center gap-0.5">
                  {[...Array(5)].map((_, i) => (
                    <Star 
                      key={i} 
                      className={`w-3 h-3 ${
                        i < Math.floor(product.rating) 
                          ? 'text-amber-500 fill-amber-500' 
                          : 'text-slate-300 dark:text-slate-700'
                      }`} 
                    />
                  ))}
                </div>
                <span className="text-[10px] font-bold text-notion-muted dark:text-notion-dark-muted">
                  {product.rating.toFixed(2)} Score
                </span>
              </div>
            </div>

            {/* Pricing Section */}
            <div className="py-3.5 border-y border-notion-border dark:border-notion-dark-border flex items-baseline gap-2.5">
              <span className="text-2xl font-extrabold text-notion-text dark:text-white">
                {formatCurrency(product.price)}
              </span>
              {product.discountPercentage > 0 && (
                <span className="text-xs font-semibold text-notion-muted line-through">
                  {formatCurrency(originalPrice)}
                </span>
              )}
            </div>

            <div className="space-y-1">
              <h4 className="text-[9px] font-bold text-notion-muted uppercase tracking-wider">Description</h4>
              <p className="text-xs text-notion-text dark:text-slate-300 leading-relaxed">
                {product.description}
              </p>
            </div>

            {/* Spec Cards */}
            <div className="grid grid-cols-2 gap-3 pt-1.5">
              <div className="p-3 bg-notion-hover dark:bg-notion-dark-bg border border-notion-border dark:border-notion-dark-border/40 rounded-lg space-y-1">
                <span className="text-[9px] font-bold text-notion-muted uppercase tracking-wider flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-notion-accent" />
                  Warranty
                </span>
                <span className="text-xs font-semibold block text-notion-text dark:text-slate-300">
                  {product.warrantyInformation || 'N/A'}
                </span>
              </div>

              <div className="p-3 bg-notion-hover dark:bg-notion-dark-bg border border-notion-border dark:border-notion-dark-border/40 rounded-lg space-y-1">
                <span className="text-[9px] font-bold text-notion-muted uppercase tracking-wider flex items-center gap-1">
                  <Truck className="w-3.5 h-3.5 text-emerald-600" />
                  Shipping
                </span>
                <span className="text-xs font-semibold block text-notion-text dark:text-slate-300">
                  {product.shippingInformation || 'Standard'}
                </span>
              </div>
            </div>
          </div>

          {/* Availability Block */}
          <div className="space-y-3.5 border-t border-notion-border dark:border-notion-dark-border/80 pt-4">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[9px] font-bold text-notion-muted uppercase tracking-wider block">Availability</span>
                <span className={`inline-flex items-center gap-1 text-xs font-bold mt-0.5 ${
                  isOutOfStock ? 'text-rose-600' : stockLevel < 10 ? 'text-amber-600' : 'text-emerald-600'
                }`}>
                  {isOutOfStock ? (
                    'Out of Stock'
                  ) : (
                    <>
                      <CheckCircle className="w-3.5 h-3.5" />
                      <span>{stockLevel} Units</span>
                    </>
                  )}
                </span>
              </div>

              {product.sku && (
                <div className="text-right">
                  <span className="text-[9px] font-bold text-notion-muted uppercase tracking-wider block">SKU Code</span>
                  <span className="text-xs font-semibold text-notion-text dark:text-slate-300 mt-0.5 block">{product.sku}</span>
                </div>
              )}
            </div>

            {product.tags && product.tags.length > 0 && (
              <div className="flex items-center gap-1.5 flex-wrap pt-1.5">
                <Tag className="w-3 h-3 text-notion-muted" />
                {product.tags.map(tag => (
                  <span key={tag} className="text-[9px] font-bold text-notion-muted bg-notion-hover dark:bg-notion-dark-hover px-1.5 py-0.5 rounded">
                    #{tag}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
