import { create } from "zustand";
import { persist } from "zustand/middleware";
import { toast } from "sonner";
import { authApi } from "../api/api";
import { tokenManager } from "../utils/tokenManager";

export const useAuthStore = create(
  persist(
    (set, get) => ({
      authUser: null,
      isLoading: false,

      // Action to set user data after successful authentication
      setAuthUser: (user) => {
        set({ authUser: user });
      },

      // Action to update user data
      updateUser: (updatedUser) => {
        set({ authUser: updatedUser });
      },
      
      // Action to handle the OAuth callback
      handleAuthCallback: async (token) => {
        try {
          // Store the token
          if (token) {
            localStorage.setItem('token', token);
          }
          
          // Wait a moment for cookies to be set
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          // Get user profile
          const response = await authApi.getCurrentUser();
          if (response.data) {
            const user = response.data;
            
            set({ 
              authUser: user,
              isLoading: false
            });
            
            // Redirect based on user role using current domain
            const currentDomain = window.location.origin;
            if (user.role === 'Admin') {
              window.location.href = `${currentDomain}/admin`;
            } else {
              window.location.href = `${currentDomain}/user/profile`;
            }
            
            return user;
          } else {
            throw new Error('Failed to get user profile');
          }
        } catch (error) {
          console.error('Auth callback error:', error);
          localStorage.removeItem('token');
          set({ authUser: null, isLoading: false });
          throw error;
        }
      },

      // Action to log the user out
      logout: async () => {
        try {
          await authApi.logout();
        } catch (error) {
          console.log("logout error", error);
        }
        tokenManager.clearToken();
        set({ authUser: null, isLoading: false });
        toast.success("Logout successful");
      },
      
      // Action to check authentication status on initial load
      checkAuth: async () => {
        set({ isLoading: true });
        try {
          const response = await authApi.checkAuth();
          if (response.data) {
            const user = response.data;
            
            set({ 
              authUser: user,
              isLoading: false
            });
          } else {
            set({ authUser: null, isLoading: false });
          }
        } catch (error) {
          console.error('Auth check failed:', error);
          
          // If token is expired, try to refresh
          if (error.response?.status === 403) {
            try {
              const newToken = await get().refreshAccessToken();
              if (newToken) {
                // Retry auth check with new token
                const retryResponse = await authApi.checkAuth();
                if (retryResponse.data) {
                  set({ 
                    authUser: retryResponse.data,
                    isLoading: false
                  });
                  return;
                }
              }
            } catch (refreshError) {
              console.error('Token refresh failed during auth check:', refreshError);
            }
          }
          
          set({ authUser: null, isLoading: false });
        }
      },

      loginWithGoogle: () => {
        authApi.loginWithGoogle();
      },

      // Method to refresh user data
      refreshUserData: async () => {
        try {
          const response = await authApi.getCurrentUser();
          if (response.data) {
            const user = response.data;
            console.log("users data", user)
            
            set({ 
              authUser: user
            });
            
            return user;
          }
        } catch (error) {
          console.error('Failed to refresh user data:', error);
        }
        return null;
      },

      // Method to refresh access token
      refreshAccessToken: async () => {
        try {
          const newToken = await tokenManager.refreshToken();
          return newToken;
        } catch (error) {
          console.error('Failed to refresh access token:', error);
          // If refresh fails, logout user
          set({ authUser: null, isLoading: false });
          toast.error('Session expired. Please login again.');
        }
        return null;
      },

      // Method to handle token expiration
      handleTokenExpiration: async () => {
        try {
          const newToken = await get().refreshAccessToken();
          if (newToken) {
            // Retry the failed request
            return true;
          }
        } catch (error) {
          console.error('Token refresh failed:', error);
        }
        return false;
      },
    }),
    {
      name: "auth-storage",
      storage: {
        getItem: (name) => {
          const str = localStorage.getItem(name);
          if (!str) return null;
          const { state } = JSON.parse(str);
          return {
            state: {
              ...state,
              isLoading: true,
            },
          };
        },
        setItem: (name, newValue) => {
          const { state, version } = newValue;
          const str = JSON.stringify({
            state: {
              ...state,
            },
            version,
          });
          localStorage.setItem(name, str);
        },
        removeItem: (name) => localStorage.removeItem(name),
      },
      partialize: (state) => ({ 
        authUser: state.authUser
      }),
    }
  )
);
