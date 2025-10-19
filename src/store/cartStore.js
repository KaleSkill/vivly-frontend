// import { create } from 'zustand'
// import { persist } from 'zustand/middleware'
// import { userApi } from '../api/api'
// import { toast } from 'sonner'

// export const useCartStore = create(
//   persist(
//     (set, get) => ({
//       // State
//       items: [],
//       isOpen: false,
//       totalItems: 0,
//       totalPrice: 0,

//       // Actions
//       addToCart: async (product, colorId, size, quantity = 1) => {
//         try {
//           // Check authentication
//           const token = localStorage.getItem('token')
//           if (!token) {
//             toast.error('Please login to add products to cart')
//             return
//           }
          
//           // Check if item already exists in cart
//           const existingItem = get().items.find(
//             item => 
//               item.productId === product._id && 
//               item.colorId === colorId && 
//               item.size === size
//           )

//           if (existingItem) {
//             // Update quantity if item exists
//             await userApi.cart.updateQuantity(existingItem.productId, colorId, size, existingItem.quantity + quantity)
//             set(state => ({
//               items: state.items.map(item =>
//                 item.productId === product._id && item.colorId === colorId && item.size === size
//                   ? { ...item, quantity: item.quantity + quantity }
//                   : item
//               )
//             }))
//             toast.success(`Quantity updated! Now ${existingItem.quantity + quantity} in cart`)
//           } else {
//             // Add new item
//             await userApi.cart.addToCart({
//               productId: product._id,
//               colorId: colorId,
//               size: size,
//               quantity: quantity
//             })

//             const newItem = {
//               _id: Date.now().toString(), // Temporary ID for local state
//               productId: product._id,
//               name: product.name,
//               price: product.isOnSale && product.salePrice?.discountedPrice
//                 ? parseFloat(product.salePrice.discountedPrice)
//                 : parseFloat(product.nonSalePrice?.discountedPrice || product.nonSalePrice?.price || 0),
//               originalPrice: product.isOnSale && product.nonSalePrice
//                 ? parseFloat(product.nonSalePrice.discountedPrice || product.nonSalePrice.price || 0)
//                 : null,
//               image: product.variants?.find(v => v.color?._id === colorId)?.images?.[0]?.secure_url || 
//                      product.variants?.[0]?.images?.[0]?.secure_url || 
//                      "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=100&h=100&fit=crop",
//               colorId: colorId,
//               colorName: product.variants?.find(v => v.color?._id === colorId)?.color?.name || 'Unknown',
//               size: size,
//               quantity: quantity,
//               isOnSale: product.isOnSale
//             }

//             set(state => ({
//               items: [...state.items, newItem]
//             }))
//             toast.success('Product added to cart!')
//           }

//           // Open cart and refresh totals
//           get().openCart()
//           get().calculateTotals()
          
//         } catch (error) {
//           console.error('Error adding to cart:', error)
//           const errorMessage = error.response?.data?.message || 'Failed to add product to cart'
//           toast.error(errorMessage)
//         }
//       },

//       removeFromCart: async (productId, colorId, size) => {
//         try {
//           // Check authentication
//           const token = localStorage.getItem('token')
//           if (!token) {
//             toast.error('Please login to manage cart')
//             return
//           }
          
//           await userApi.cart.removeFromCart(productId, colorId, size)
          
//           set(state => ({
//             items: state.items.filter(item => 
//               !(item.productId === productId && item.colorId === colorId && item.size === size)
//             )
//           }))
          
//           toast.success('Item removed from cart!')
//           get().calculateTotals()
//         } catch (error) {
//           console.error('Error removing item:', error)
//           toast.error('Failed to remove item')
//         }
//       },

//       updateQuantity: async (productId, colorId, size, newQuantity) => {
//         if (newQuantity < 1) return
        
//         try {
//           await userApi.cart.updateQuantity(productId, colorId, size, newQuantity)
          
//           set(state => ({
//             items: state.items.map(item =>
//               item.productId === productId && item.colorId === colorId && item.size === size
//                 ? { ...item, quantity: newQuantity }
//                 : item
//             )
//           }))
          
//           toast.success('Cart updated!')
//           get().calculateTotals()
//         } catch (error) {
//           console.error('Error updating quantity:', error)
//           toast.error('Failed to update cart')
//         }
//       },

//       fetchCartItems: async () => {
//         try {
//           const response = await userApi.cart.getCartItems()
//           const cartData = response.data.data || []
          
//           // Transform backend data to match our store structure
//           const transformedItems = cartData.map(item => ({
//             _id: item.productId,
//             productId: item.productId,
//             name: item.name,
//             price: parseFloat(item.discountedPrice || item.price) || 0,
//             originalPrice: item.price && item.discountedPrice ? parseFloat(item.price) : null,
//             image: item.image?.secure_url || "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=100&h=100&fit=crop",
//             colorId: item.selectedVariant?.colorId,
//             colorName: item.selectedVariant?.colorName || 'Unknown',
//             size: item.selectedVariant?.size,
//             quantity: item.selectedVariant?.quantity || 1,
//             isOnSale: item.discountedPrice && item.price && item.discountedPrice < item.price
//           }))
          
//           set({ items: transformedItems })
//           get().calculateTotals()
//         } catch (error) {
//           console.error('Error fetching cart items:', error)
//           set({ items: [] })
//         }
//       },

//       calculateTotals: () => {
//         const { items } = get()
//         const totalItems = items.reduce((total, item) => total + item.quantity, 0)
//         const totalPrice = items.reduce((total, item) => total + (item.price * item.quantity), 0)
        
//         set({ totalItems, totalPrice })
        
//         return { totalItems, totalPrice }
//       },

//       openCart: () => set({ isOpen: true }),
//       closeCart: () => set({ isOpen: false }),
//       toggleCart: () => set(state => ({ isOpen: !state.isOpen })),

//       clearCart: () => set({ items: [], totalItems: 0, totalPrice: 0 }),

//       // Check if product is already in cart
//       isProductInCart: (productId, colorId, size) => {
//         return get().items.some(
//           item => 
//             item.productId === productId && 
//             item.colorId === colorId && 
//             item.size === size
//         )
//       },

//       // Get cart item for specific product variant
//       getCartItem: (productId, colorId, size) => {
//         return get().items.find(
//           item => 
//             item.productId === productId && 
//             item.colorId === colorId && 
//             item.size === size
//         )
//       },

//       // Format price helper
//       formatPrice: (price) => {
//         return new Intl.NumberFormat('en-IN', {
//           style: 'currency',
//           currency: 'INR',
//           maximumFractionDigits: 0
//         }).format(price)
//       }
//     }),
//     {
//       name: 'cart-storage',
//       partialize: (state) => ({ 
//         items: state.items,
//         totalItems: state.totalItems,
//         totalPrice: state.totalPrice
//       }),
//     }
//   )
// )



import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { userApi } from '../api/api'
import { toast } from 'sonner'

export const useCartStore = create(
  persist(
    (set, get) => ({
      // State
      items: [],
      isOpen: false,
      totalItems: 0,
      totalPrice: 0,

      // Actions
      addToCart: async (product, colorId, size, quantity = 1) => {
        try {
          // Check authentication
          const token = localStorage.getItem('token')
          if (!token) {
            toast.error('Please login to add products to cart')
            return
          }
          
          // Check if item already exists in cart
          const existingItem = get().items.find(
            item => 
              item.productId === product._id && 
              item.colorId === colorId && 
              item.size === size
          )

          if (existingItem) {
            // Update quantity if item exists
            await userApi.cart.updateQuantity(existingItem.productId, colorId, size, existingItem.quantity + quantity)
            set(state => ({
              items: state.items.map(item =>
                item.productId === product._id && item.colorId === colorId && item.size === size
                  ? { ...item, quantity: item.quantity + quantity }
                  : item
              )
            }))
            toast.success(`Quantity updated! Now ${existingItem.quantity + quantity} in cart`)
          } else {
            // Add new item
            await userApi.cart.addToCart({
              productId: product._id,
              colorId: colorId,
              size: size,
              quantity: quantity
            })

            const newItem = {
              _id: Date.now().toString(), // Temporary ID for local state
              productId: product._id,
              name: product.name,
              price: product.isOnSale && product.salePrice?.discountedPrice
                ? parseFloat(product.salePrice.discountedPrice)
                : parseFloat(product.nonSalePrice?.discountedPrice || product.nonSalePrice?.price || 0),
              originalPrice: product.isOnSale && product.nonSalePrice
                ? parseFloat(product.nonSalePrice.discountedPrice || product.nonSalePrice.price || 0)
                : null,
              image: product.variants?.find(v => v.color?._id === colorId)?.images?.[0]?.secure_url || 
                     product.variants?.[0]?.images?.[0]?.secure_url || 
                     "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=100&h=100&fit=crop",
              colorId: colorId,
              colorName: product.variants?.find(v => v.color?._id === colorId)?.color?.name || 'Unknown',
              size: size,
              quantity: quantity,
              isOnSale: product.isOnSale
            }

            set(state => ({
              items: [...state.items, newItem]
            }))
            toast.success('Product added to cart!')
          }

          // Open cart and refresh totals
          get().openCart()
          get().calculateTotals()
          
        } catch (error) {
          console.error('Error adding to cart:', error)
          const errorMessage = error.response?.data?.message || 'Failed to add product to cart'
          toast.error(errorMessage)
        }
      },

      removeFromCart: async (productId, colorId, size) => {
        try {
          // Check authentication
          const token = localStorage.getItem('token')
          if (!token) {
            toast.error('Please login to manage cart')
            return
          }
          
          await userApi.cart.removeFromCart(productId, colorId, size)
          
          set(state => ({
            items: state.items.filter(item => 
              !(item.productId === productId && item.colorId === colorId && item.size === size)
            )
          }))
          
          toast.success('Item removed from cart!')
          get().calculateTotals()
        } catch (error) {
          console.error('Error removing item:', error)
          toast.error('Failed to remove item')
        }
      },

      updateQuantity: async (productId, colorId, size, newQuantity) => {
        if (newQuantity < 1) return
        
        try {
          await userApi.cart.updateQuantity(productId, colorId, size, newQuantity)
          
          set(state => ({
            items: state.items.map(item =>
              item.productId === productId && item.colorId === colorId && item.size === size
                ? { ...item, quantity: newQuantity }
                : item
            )
          }))
          
          toast.success('Cart updated!')
          get().calculateTotals()
        } catch (error) {
          console.error('Error updating quantity:', error)
          toast.error('Failed to update cart')
        }
      },

      fetchCartItems: async () => {
        try {
          const response = await userApi.cart.getCartItems()
          const cartData = response.data.data || []
          
          // Transform backend data to match our store structure
          const transformedItems = cartData.map(item => ({
            _id: item.productId,
            productId: item.productId,
            name: item.name,
            price: parseFloat(item.discountedPrice || item.price) || 0,
            originalPrice: item.price && item.discountedPrice ? parseFloat(item.price) : null,
            image: item.image?.secure_url || "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=100&h=100&fit=crop",
            colorId: item.selectedVariant?.colorId,
            colorName: item.selectedVariant?.colorName || 'Unknown',
            size: item.selectedVariant?.size,
            quantity: item.selectedVariant?.quantity || 1,
            isOnSale: item.discountedPrice && item.price && item.discountedPrice < item.price
          }))
          
          set({ items: transformedItems })
          get().calculateTotals()
        } catch (error) {
          console.error('Error fetching cart items:', error)
          set({ items: [] })
        }
      },

      calculateTotals: () => {
        const { items } = get()
        const totalItems = items.reduce((total, item) => total + item.quantity, 0)
        const totalPrice = items.reduce((total, item) => total + item.price * item.quantity, 0)
        
        set({ totalItems, totalPrice })
        
        return { totalItems, totalPrice }
      },

      openCart: () => set({ isOpen: true }),
      closeCart: () => set({ isOpen: false }),
      toggleCart: () => set(state => ({ isOpen: !state.isOpen })),

      clearCart: () => set({ items: [], totalItems: 0, totalPrice: 0 }),

      // Check if product is already in cart
      isProductInCart: (productId, colorId, size) => {
        return get().items.some(
          item => 
            item.productId === productId && 
            item.colorId === colorId && 
            item.size === size
        )
      },

      // Get cart item for specific product variant
      getCartItem: (productId, colorId, size) => {
        return get().items.find(
          item => 
            item.productId === productId && 
            item.colorId === colorId && 
            item.size === size
        )
      },

      // Format price helper
      formatPrice: (price) => {
        return new Intl.NumberFormat('en-IN', {
          style: 'currency',
          currency: 'INR',
          maximumFractionDigits: 0
        }).format(price)
      }
    }),
    {
      name: 'cart-storage',
      partialize: (state) => ({ 
        items: state.items,
        totalItems: state.totalItems,
        totalPrice: state.totalPrice
      }),
    }
  )
)