import axios from 'axios'

const BASE =
  import.meta.env.VITE_API_URL ||
  'http://127.0.0.1:8000/api'

const api = axios.create({
  baseURL: BASE,
  headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
})

api.interceptors.request.use(cfg => {
  const token = localStorage.getItem('token')
  if (token) cfg.headers.Authorization = `Bearer ${token}`
  return cfg
})

api.interceptors.response.use(
  r => r,
  err => {
    if (err.response?.status === 401) {
      console.log("401 Unauthorized");
      localStorage.removeItem('token');
      localStorage.removeItem('user');

      // window.location.href = '/login'
    }

    return Promise.reject(err);
  }
);

export const authAPI = {
  login: d => api.post('/login', d),
  register: d => api.post('/register', d),
}

export const productAPI = {
  getAll: p => api.get('/products', { params: p }),
  getOne: id => api.get(`/products/${id}`),
  // Do NOT set Content-Type manually for FormData — axios/the browser
  // must generate it (including the required "boundary") automatically.
  // We explicitly unset the instance's default 'application/json'
  // Content-Type here so it doesn't override FormData's auto-detected
  // multipart header. Setting it incorrectly breaks multipart parsing on
  // the Laravel side, so $request->all() and $request->file('image') come
  // back empty and the image never gets uploaded/changed.
  create: d => api.post('/products', d, { headers: { 'Content-Type': undefined } }),
  update: (id, d) => api.post(`/products/${id}?_method=PUT`, d, { headers: { 'Content-Type': undefined } }),
  delete: id => api.delete(`/products/${id}`),
}

export const categoryAPI = {
  getAll: () => api.get('/categories'),
  getOne: id => api.get(`/categories/${id}`),
  create: d => api.post('/categories', d),
  update: (id, d) => api.put(`/categories/${id}`, d),
  delete: id => api.delete(`/categories/${id}`),
}

export const cartAPI = {
  get: () => api.get('/cart'),
  add: d => api.post('/cart', d),
  update: (id, d) => api.put(`/cart/${id}`, d),
  remove: id => api.delete(`/cart/${id}`),
}

export const orderAPI = {
  create: d => api.post('/orders', d),
  getAll: () => api.get('/orders'),
  getMine: () => api.get('/my-orders'),
  getOne: id => api.get(`/orders/${id}`),
  updateStatus: (id, d) => api.put(`/orders/${id}/status`, d),
  delete: id => api.delete(`/orders/${id}`),
}

export const checkoutAPI = {
  checkout: d => api.post('/checkout', d),
}

export const addressAPI = {
  getAll: () => api.get('/addresses'),
  getOne: id => api.get(`/addresses/${id}`),
  create: d => api.post('/addresses', d),
  update: (id, d) => api.put(`/addresses/${id}`, d),
  delete: id => api.delete(`/addresses/${id}`),
}

export const paymentAPI = {
  getAll: () => api.get('/payments'),
  getOne: id => api.get(`/payments/${id}`),
}

export const wishlistAPI = {
  get: () => api.get('/wishlist'),
  add: d => api.post('/wishlist', d),
  remove: id => api.delete(`/wishlist/${id}`),
}

export const userAPI = {
  getAll: () => api.get('/users'),
  update: (id, d) => api.put(`/users/${id}`, d),
  delete: id => api.delete(`/users/${id}`),
}

export const adminAPI = {
  dashboard: () => api.get('/admin/dashboard'),
}

export default api