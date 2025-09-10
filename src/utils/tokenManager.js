import { authApi } from '../api/api'

class TokenManager {
  constructor() {
    this.isRefreshing = false
    this.failedQueue = []
  }

  // Process the queue of failed requests
  processQueue(error, token = null) {
    this.failedQueue.forEach(({ resolve, reject }) => {
      if (error) {
        reject(error)
      } else {
        resolve(token)
      }
    })
    
    this.failedQueue = []
  }

  // Add request to queue while token is being refreshed
  addToQueue(resolve, reject) {
    this.failedQueue.push({ resolve, reject })
  }

  // Refresh token and handle queue
  async refreshToken() {
    if (this.isRefreshing) {
      return new Promise((resolve, reject) => {
        this.addToQueue(resolve, reject)
      })
    }

    this.isRefreshing = true

    try {
      const response = await authApi.refreshToken()
      
      if (response.data?.data?.accessToken) {
        const newToken = response.data.data.accessToken
        localStorage.setItem('token', newToken)
        
        this.processQueue(null, newToken)
        return newToken
      } else {
        throw new Error('No access token received')
      }
    } catch (error) {
      this.processQueue(error, null)
      
      // Clear tokens and redirect to login
      localStorage.removeItem('token')
      window.location.href = '/'
      
      throw error
    } finally {
      this.isRefreshing = false
    }
  }

  // Check if token is expired (basic check)
  isTokenExpired(token) {
    if (!token) return true
    
    try {
      const payload = JSON.parse(atob(token.split('.')[1]))
      const currentTime = Date.now() / 1000
      
      return payload.exp < currentTime
    } catch (error) {
      return true
    }
  }

  // Get current token
  getCurrentToken() {
    return localStorage.getItem('token')
  }

  // Set token
  setToken(token) {
    localStorage.setItem('token', token)
  }

  // Clear token
  clearToken() {
    localStorage.removeItem('token')
  }
}

// Export singleton instance
export const tokenManager = new TokenManager()
export default tokenManager
