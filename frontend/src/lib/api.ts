// api.ts
import axios from 'axios'

// Create an Axios instance with the base URL
const api = axios.create({
  baseURL: 'http://localhost:8080', // ⚠️ Update this to your production URL when deploying
})

// Add a request interceptor to attach token to every request
api.interceptors.request.use((config) => {
  // Ensure we're in a browser environment before accessing localStorage
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null

  // If a token is present, attach it to the Authorization header
  if (token && config.headers) {
  config.headers['Authorization'] = `Bearer ${token}`
}


  return config
})

export default api
