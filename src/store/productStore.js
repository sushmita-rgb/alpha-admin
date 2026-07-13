import { create } from 'zustand';

const DEFAULT_COLUMNS = ['image', 'name', 'brand', 'category', 'price', 'stock', 'rating', 'published', 'actions'];

export const useProductStore = create((set, get) => {
  // Load custom values from localStorage
  const savedHidden = localStorage.getItem('alpha_hidden_product_ids');
  const savedOrder = localStorage.getItem('alpha_column_order');
  const savedVisibility = localStorage.getItem('alpha_column_visibility');

  let initialHidden = [];
  if (savedHidden) {
    try { initialHidden = JSON.parse(savedHidden); } catch (e) { console.error(e); }
  }

  let initialOrder = DEFAULT_COLUMNS;
  if (savedOrder) {
    try { initialOrder = JSON.parse(savedOrder); } catch (e) { console.error(e); }
  }

  let initialVisibility = {
    image: true,
    name: true,
    brand: true,
    category: true,
    price: true,
    stock: true,
    rating: true,
    published: true,
    actions: true,
  };
  if (savedVisibility) {
    try { initialVisibility = JSON.parse(savedVisibility); } catch (e) { console.error(e); }
  }

  return {
    hiddenProductIds: initialHidden, // Stores IDs of products that are "Hidden" (published = false)
    columnOrder: initialOrder,
    columnVisibility: initialVisibility,
    pollingEnabled: true,

    // Toggles the local published state
    togglePublished: (productId) => {
      set((state) => {
        const isCurrentlyHidden = state.hiddenProductIds.includes(productId);
        let nextHidden;
        if (isCurrentlyHidden) {
          nextHidden = state.hiddenProductIds.filter(id => id !== productId);
        } else {
          nextHidden = [...state.hiddenProductIds, productId];
        }
        
        localStorage.setItem('alpha_hidden_product_ids', JSON.stringify(nextHidden));
        return { hiddenProductIds: nextHidden };
      });
    },

    // Checks if a product is published
    isProductPublished: (productId) => {
      return !get().hiddenProductIds.includes(productId);
    },

    // Column Management Actions
    setColumnOrder: (newOrder) => {
      localStorage.setItem('alpha_column_order', JSON.stringify(newOrder));
      set({ columnOrder: newOrder });
    },

    setColumnVisibility: (newVisibility) => {
      localStorage.setItem('alpha_column_visibility', JSON.stringify(newVisibility));
      set({ columnVisibility: newVisibility });
    },

    toggleColumnVisibility: (columnId) => {
      set((state) => {
        const nextVisibility = {
          ...state.columnVisibility,
          [columnId]: !state.columnVisibility[columnId],
        };
        localStorage.setItem('alpha_column_visibility', JSON.stringify(nextVisibility));
        return { columnVisibility: nextVisibility };
      });
    },

    resetColumnPrefs: () => {
      localStorage.removeItem('alpha_column_order');
      localStorage.removeItem('alpha_column_visibility');
      set({
        columnOrder: DEFAULT_COLUMNS,
        columnVisibility: {
          image: true,
          name: true,
          brand: true,
          category: true,
          price: true,
          stock: true,
          rating: true,
          published: true,
          actions: true,
        }
      });
    },

    // Polling Actions
    togglePolling: () => set((state) => ({ pollingEnabled: !state.pollingEnabled })),
    setPollingEnabled: (enabled) => set({ pollingEnabled: enabled }),
  };
});
