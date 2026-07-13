import axios from 'axios';

const api = axios.create({
  baseURL: 'https://dummyjson.com',
  timeout: 10000,
});

export const productServices = {
  // Fetch all products (limit to 100 or 150 to get a solid list)
  getAllProducts: async () => {
    const response = await api.get('/products?limit=150');
    return response.data.products;
  },

  // Fetch product by ID
  getProductById: async (id) => {
    const response = await api.get(`/products/${id}`);
    return response.data;
  },

  // Fetch categories
  getCategories: async () => {
    const response = await api.get('/products/category-list');
    return response.data; // Array of categories
  }
};
