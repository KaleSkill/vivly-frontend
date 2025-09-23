import React, { useEffect } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuthStore } from './store/authstore'

// Import page components from their respective folders
import HomePage from './pages/home/pages/HomePage'
import AuthCallback from './pages/auth/pages/AuthCallback'
import AdminLayout from './pages/admin/layout/AdminLayout'
import UserLayout from './pages/user/layout/UserLayout'
import AdminDashboard from './pages/admin/pages/AdminDashboard'
import BannerManagement from './pages/admin/components/banner-management/BannerManagement'
import ColorManagement from './pages/admin/components/ColorManagement'
import CategoryManagement from './pages/admin/components/CategoryManagement'
import UserManagement from './pages/admin/components/UserManagement'
import ProductManagement from './pages/admin/components/ProductManagement'
import { ProductCreateForm } from './pages/admin/components/product-management'
import ProductPreview from './pages/admin/components/ProductPreview'
import { ProductEditForm } from './pages/admin/components/product-management'
import { VariantEditForm, VariantManagement, VariantAddForm } from './pages/admin/components/product-management'
import SaleManagement from './pages/admin/components/SaleManagement'
import SaleCreateStepper from './pages/admin/components/SaleCreateStepper'
import PaymentManagement from './pages/admin/pages/PaymentManagement'
import { OrderManagement } from './pages/admin/components/OrderManagement'
import { OrderDetailsPage } from './pages/admin/pages/OrderDetailsPage'
import ShipRocketConfig from './pages/admin/pages/ShipRocketConfig'
import ShipRocketManagement from './pages/admin/pages/ShipRocketManagement'
import ShipRocketDelivery from './pages/admin/pages/ShipRocketDelivery'
import UserDashboard from './pages/user/pages/account/UserDashboard'
import ProductsPage from './pages/user/pages/shopping/ProductsPage'
import ProductDetailPage from './pages/user/pages/shopping/ProductDetailPage'
import ProductReviewsPage from './pages/user/pages/shopping/ProductReviewsPage'
import CheckoutPage from './pages/user/pages/orders/CheckoutPage'
import PaymentSuccess from './pages/user/pages/orders/PaymentSuccess'
import MyCartPage from './pages/user/pages/orders/MyCartPage'
import MyOrdersPage from './pages/user/pages/orders/MyOrdersPage'
import UserOrderDetailsPage from './pages/user/pages/orders/OrderDetailsPage'
import UserSettingsPage from './pages/user/pages/account/UserSettingsPage'
import AddressPage from './pages/user/pages/account/AddressPage'
import RefundsPage from './pages/user/pages/orders/RefundsPage'
import ProfilePage from './pages/user/pages/account/ProfilePage'
import TrackOrderPage from './pages/user/pages/orders/TrackOrderPage'
import CashfreeTest from './pages/test/CashfreeTest'

const App = () => {
  const { checkAuth, isLoading, authUser } = useAuthStore()

  useEffect(() => {
    checkAuth()
  }, [checkAuth])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  // Role-based redirect logic
  const getRoleBasedRedirect = () => {
    if (!authUser) return null
    
    switch (authUser.role) {
      case 'Admin':
        return <Navigate to="/admin" replace />
      case 'User':
        return <Navigate to="/dashboard" replace />
      default:
        return <Navigate to="/" replace />
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<HomePage />} />
        <Route path="/auth/callback" element={<AuthCallback />} />
        <Route path="/login/success" element={<AuthCallback />} />
        
        {/* Admin routes */}
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<AdminDashboard />} />
          <Route path="users" element={<UserManagement />} />
          <Route path="products" element={<ProductManagement />} />
        <Route path="products/create" element={<ProductCreateForm />} />
          <Route path="products/edit/:id" element={<ProductEditForm />} />
                <Route path="products/:id/variants" element={<VariantManagement />} />
                <Route path="products/:id/variants/add" element={<VariantAddForm />} />
                <Route path="products/:id/variants/edit/:variantId" element={<VariantEditForm />} />
          <Route path="products/preview/:id" element={<ProductPreview />} />
          <Route path="sales" element={<SaleManagement />} />
          <Route path="sales/create" element={<SaleCreateStepper />} />
          <Route path="banners" element={<BannerManagement />} />
          <Route path="colors" element={<ColorManagement />} />
          <Route path="categories" element={<CategoryManagement />} />
          <Route path="orders" element={<OrderManagement />} />
          <Route path="orders/:orderId" element={<OrderDetailsPage />} />
          <Route path="payments" element={<PaymentManagement />} />
          <Route path="refunds" element={<div className="p-6"><h1 className="text-2xl font-bold">Refunds Management</h1></div>} />
          <Route path="shiprocket-config" element={<ShipRocketConfig />} />
          <Route path="shiprocket" element={<ShipRocketManagement />} />
          <Route path="shiprocket-delivery" element={<ShipRocketDelivery />} />
          <Route path="analytics" element={<div className="p-6"><h1 className="text-2xl font-bold">Analytics</h1></div>} />
          <Route path="settings" element={<div className="p-6"><h1 className="text-2xl font-bold">Settings</h1></div>} />
        </Route>
        
        {/* User routes */}
        <Route path="/dashboard" element={<UserDashboard />} />
        <Route path="/products" element={<ProductsPage />} />
        <Route path="/products/:id" element={<ProductDetailPage />} />
        <Route path="/products/:id/reviews" element={<ProductReviewsPage />} />
        <Route path="/checkout" element={<CheckoutPage />} />
        <Route path="/payment/success" element={<PaymentSuccess />} />
        <Route path="/test/cashfree" element={<CashfreeTest />} />
        
        {/* User layout routes */}
        <Route path="/user" element={<UserLayout />}>
          <Route path="profile" element={<ProfilePage />} />
          <Route path="cart" element={<MyCartPage />} />
          <Route path="orders" element={<MyOrdersPage />} />
          <Route path="orders/:orderId" element={<UserOrderDetailsPage />} />
          <Route path="track-order" element={<TrackOrderPage />} />
          <Route path="addresses" element={<AddressPage />} />
          <Route path="refunds" element={<RefundsPage />} />
          <Route path="settings" element={<UserSettingsPage />} />
        </Route>
        
        {/* Role-based redirect for authenticated users */}
        {authUser && (
          <Route path="*" element={getRoleBasedRedirect()} />
        )}

        {/* Catch all route for non-authenticated users */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  )
}

export default App