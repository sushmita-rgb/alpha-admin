import { create } from 'zustand';

export const useAuthStore = create((set) => {
  // Load initial state from LocalStorage
  const storedUser = localStorage.getItem('alpha_user');
  const storedToken = localStorage.getItem('alpha_token');
  
  let user = null;
  if (storedUser) {
    try {
      user = JSON.parse(storedUser);
    } catch (e) {
      console.error("Failed to parse user from local storage", e);
    }
  }

  return {
    user,
    token: storedToken || null,
    isAuthenticated: !!storedToken,
    isLoading: false,
    error: null,

    login: async (email, password) => {
      set({ isLoading: true, error: null });
      
      // Simulate network request
      await new Promise((resolve) => setTimeout(resolve, 800));

      if (email === 'admin@alpha.com' && password === '123456') {
        const adminUser = {
          email: 'admin@alpha.com',
          name: 'Sarah Jenkins',
          role: 'admin',
          avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
        };
        localStorage.setItem('alpha_user', JSON.stringify(adminUser));
        localStorage.setItem('alpha_token', 'mock-jwt-token-admin');
        set({
          user: adminUser,
          token: 'mock-jwt-token-admin',
          isAuthenticated: true,
          isLoading: false,
        });
        return true;
      } else if (email === 'user@alpha.com' && password === '123456') {
        const standardUser = {
          email: 'user@alpha.com',
          name: 'Alex Rivera',
          role: 'user',
          avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
        };
        localStorage.setItem('alpha_user', JSON.stringify(standardUser));
        localStorage.setItem('alpha_token', 'mock-jwt-token-user');
        set({
          user: standardUser,
          token: 'mock-jwt-token-user',
          isAuthenticated: true,
          isLoading: false,
        });
        return true;
      } else {
        set({
          error: 'Invalid email or password',
          isLoading: false,
        });
        return false;
      }
    },

    logout: () => {
      localStorage.removeItem('alpha_user');
      localStorage.removeItem('alpha_token');
      set({
        user: null,
        token: null,
        isAuthenticated: false,
        error: null,
      });
    },

    updateUser: (updatedFields) => {
      set((state) => {
        const nextUser = { ...state.user, ...updatedFields };
        localStorage.setItem('alpha_user', JSON.stringify(nextUser));
        return { user: nextUser };
      });
    },

    clearError: () => set({ error: null }),
  };
});
