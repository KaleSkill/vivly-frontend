import { create } from 'zustand'
import { persist } from 'zustand/middleware'

const useProductStore = create(
  persist(
    (set, get) => ({
      // Product data
      products: [],
      currentProduct: null,
      loading: false,
      error: null,

      // Filters and search
      filters: {
        search: '',
        category: 'all',
        gender: 'all',
        status: 'all',
        sortBy: 'createdAt',
        sortOrder: 'desc'
      },
      searchTerm: '',

      // Pagination
      pagination: {
        page: 1,
        limit: 10,
        total: 0,
        totalPages: 0
      },

      // Form state for editing
      editFormData: null,
      hasUnsavedChanges: false,
      isEditing: false,

      // Actions
      setProducts: (products) => set({ products }),
      
      setCurrentProduct: (product) => set({ currentProduct: product }),
      
      setLoading: (loading) => set({ loading }),
      
      setError: (error) => set({ error }),
      
      setFilters: (filters) => set({ filters }),
      
      setSearchTerm: (searchTerm) => set({ searchTerm }),
      
      setPagination: (pagination) => set({ pagination }),
      
      // Form editing actions
      setEditFormData: (formData) => set({ 
        editFormData: formData,
        hasUnsavedChanges: false, 
        isEditing: true
      }),
      
      updateEditFormData: (field, value) => {
        const currentData = get().editFormData
        if (!currentData) return
        
        let newData
        if (field.includes('.')) {
          const [parent, child] = field.split('.')
          newData = {
            ...currentData,
            [parent]: {
              ...currentData[parent],
              [child]: value
            }
          }
        } else {
          newData = {
            ...currentData,
            [field]: value
          }
        }
        
        set({ 
          editFormData: newData,
          hasUnsavedChanges: true // Only mark as changed when user actually modifies
        })
      },
      
      clearUnsavedChanges: () => set({ 
        hasUnsavedChanges: false,
        isEditing: false
      }),
      
      resetEditForm: () => set({ 
        editFormData: null,
        hasUnsavedChanges: false,
        isEditing: false
      }),


      // Utility functions
      getProductById: (id) => {
        const products = get().products
        return products.find(product => product._id === id)
      },
      
      updateProductInList: (updatedProduct) => {
        const products = get().products
        const updatedProducts = products.map(product => 
          product._id === updatedProduct._id ? updatedProduct : product
        )
        set({ products: updatedProducts })
      },
      
      removeProductFromList: (productId) => {
        const products = get().products
        const filteredProducts = products.filter(product => product._id !== productId)
        set({ products: filteredProducts })
      }
    }),
    {
      name: 'product-store',
      partialize: (state) => ({
        filters: state.filters,
        searchTerm: state.searchTerm,
        pagination: state.pagination
      })
    }
  )
)

export default useProductStore
