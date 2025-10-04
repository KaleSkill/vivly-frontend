import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/store/authstore'
import { useCartStore } from '@/store/cartStore'
import { userApi } from '@/api/api'
import { motion, AnimatePresence } from 'framer-motion'
import SearchComponent from './SearchComponent'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { ModeToggle } from './mode-toggle'
import { CartButton, CartIcon } from './cart-button'
import { CartSheet } from './cart-sheet-new'
import { 
  User, 
  Settings, 
  LogOut, 
  Shield, 
  ShoppingCart, 
  ShoppingBag,
  Package, 
  MapPin, 
  Sparkles,
  RotateCcw,
  ChevronDown,
  Search
} from 'lucide-react'
import logo from '@/assets/logo.PNG' // edit this


const ViblyNavigation = () => {
  const { authUser, loginWithGoogle, logout } = useAuthStore()
  const { totalItems, openCart, fetchCartItems } = useCartStore()
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeDropdown, setActiveDropdown] = useState(null)
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false)
  const navigate = useNavigate()
  

  console.log("authUser",authUser)

  const handleSignIn = () => {
    loginWithGoogle()
  }

  const handleLogout = () => {
    logout()
  }

  // Fetch categories from API
  const fetchCategories = async () => {
    try {
      setLoading(true)
      const response = await userApi.categories.getCategories()
      setCategories(response.data.data || [])
    } catch (error) {
      console.error('Error fetching categories:', error)
      setCategories([])
    } finally {
      setLoading(false)
    }
  }

  // Fetch categories on component mount
  useEffect(() => {
    fetchCategories()
  }, [])

  // Fetch cart items when user is authenticated
  useEffect(() => {
    if (authUser) {
      fetchCartItems()
    }
  }, [authUser, fetchCartItems])

  // Organize categories by gender
  const organizeCategories = () => {
    const organized = {
      men: { title: "Men's Fashion", href: "/products?gender=men", subcategories: [] },
      women: { title: "Women's Fashion", href: "/products?gender=women", subcategories: [] },
      unisex: { title: "Unisex", href: "/products?gender=unisex", subcategories: [] }
    }

    categories.forEach(category => {
      const categoryName = category.name?.toLowerCase() || ''
      // Use category name as slug, convert to lowercase and replace spaces with hyphens
      const categorySlug = categoryName.replace(/\s+/g, '-')
      
      // Determine which main category this belongs to
      if (categoryName.includes('men') || categoryName.includes('male')) {
        organized.men.subcategories.push({
          name: category.name,
          href: `/products?category=${categorySlug}`
        })
      } else if (categoryName.includes('women') || categoryName.includes('female') || categoryName.includes('dress')) {
        organized.women.subcategories.push({
          name: category.name,
          href: `/products?category=${categorySlug}`
        })
      } else {
        // Default to unisex for all other items (shirt, tshirt, etc.)
        organized.unisex.subcategories.push({
          name: category.name,
          href: `/products?category=${categorySlug}`
        })
      }
    })

    return organized
  }

  const getUserInitials = (user) => {
    if (!user) return "U"
    const firstName = user.data?.firstname|| ""
    return firstName.charAt(0).toUpperCase() || "U"
  }

  const organizedCategories = organizeCategories()

  return (
    <header className="sticky top-0 z-50 bg-[#002F11] backdrop-blur-sm">
      <div className="flex h-16 items-center justify-between gap-4 bg-[#002F11] px-4 md:px-6">
        {/* Left side - Logo and Navigation */}
        <div className="flex items-center gap-6">
          {/* Logo */}
          <div className="flex items-center justify-center cursor-pointer" onClick={() => window.location.href = '/'}>
            <img 
              src={logo} 
              alt="Vibly Logo" 
              className="w-12 h-12 object-contain"
            />
          </div>

          {/* Custom Navigation Menu */}
          <nav className="hidden md:flex items-center space-x-8">
            {/* Home */}
            <a 
              href="/" 
              className="text-white hover:text-green-400 transition-all duration-300 hover:scale-105 font-medium"
            >
              Home
            </a>

            {/* Dynamic Categories */}
            {Object.entries(organizedCategories).map(([key, category]) => {
              if (category.subcategories.length === 0) return null
              return (
                <div key={key} className="relative group">
                  <button
                    className="flex items-center space-x-1 text-white hover:text-green-400 transition-all duration-300 hover:scale-105 font-medium"
                    onMouseEnter={() => setActiveDropdown(key)}
                    onMouseLeave={() => setActiveDropdown(null)}
                  >
                    <span>{key.charAt(0).toUpperCase() + key.slice(1)}</span>
                    <ChevronDown className="h-4 w-4" />
                  </button>
                  
                  {/* Dropdown Menu */}
                  <AnimatePresence>
                    {activeDropdown === key && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        transition={{ duration: 0.2 }}
                        className="absolute top-full left-0 mt-2 w-64 bg-background border border-border rounded-lg shadow-xl z-50"
                        onMouseEnter={() => setActiveDropdown(key)}
                        onMouseLeave={() => setActiveDropdown(null)}
                      >
                        <div className="p-4">
                          <div className="space-y-2">
                            {category.subcategories.map((item) => (
                              <a
                                key={item.name}
                                href={item.href}
                                className="block px-3 py-2 rounded-md hover:bg-accent hover:text-accent-foreground transition-colors duration-200 text-foreground"
                              >
                                <span className="text-sm font-medium">{item.name}</span>
                              </a>
                            ))}
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )
            })}
          </nav>
        </div>

        {/* Center - Search Bar */}
        <div className="hidden md:flex flex-1 max-w-lg mx-6">
          <SearchComponent 
            placeholder="Search products..."
            className="w-full"
          />
        </div>

        {/* Right side - User actions */}
        <div className="flex items-center gap-2">
          <ModeToggle />
          
          {/* Mobile Search Icon */}
          <Button 
            variant="ghost" 
            size="sm" 
            className="md:hidden text-white hover:text-green-400 hover:bg-transparent border-none hover:border-none focus:border-none outline-none p-2"
            onClick={() => setIsMobileSearchOpen(!isMobileSearchOpen)}
          >
            <Search className="h-5 w-5" />
            <span className="sr-only">Search Products</span>
          </Button>
          
          {/* Cart Icon */}
          <div className="relative">
            <Button 
              variant="ghost" 
              size="sm" 
              className="relative text-white hover:text-green-400 hover:bg-transparent border-none hover:border-none focus:border-none outline-none p-2"
              onClick={openCart}
            >
              <ShoppingCart className="h-5 w-5" />
              <span className="sr-only">Shopping Cart</span>
            </Button>
            {totalItems > 0 && (
              <Badge 
                variant="destructive" 
                className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs bg-red-500 hover:bg-red-600"
              >
                {totalItems > 99 ? '99+' : totalItems}
              </Badge>
            )}
          </div>
          
        
          
          <CartSheet />
          
          {authUser ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Button variant="ghost" className="relative h-10 w-auto rounded-full px-2 gap-2 text-white hover:text-green-600 hover:bg-transparent border-none hover:border-none focus:border-none outline-none">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={authUser.data.profile} alt={authUser.data.firstname} />
                      <AvatarFallback className="bg-green-600 text-white text-sm font-medium">
                        {getUserInitials(authUser)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="hidden sm:block text-left">
                      <p className="text-sm font-medium leading-none">
                        {authUser.data.firstname}
                      </p>
        
                    </div>
                  </Button>
                </motion.div>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-64" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-2">
                    <div className="flex items-center space-x-2">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={authUser.data.profile} alt={authUser.data.firstname} />
                        <AvatarFallback className="bg-green-600 text-white">
                          {getUserInitials(authUser)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex flex-col">
                        <p className="text-sm font-medium leading-none">
                          {authUser.data.firstname}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {authUser.data.email}
                        </p>
                      </div>
                    </div>
                    <Badge variant={authUser.data.role === 'Admin' ? 'default' : 'secondary'} className="w-fit bg-green-100 text-green-800 border-none">
                      {authUser.data.role === 'Admin' ? (
                        <>
                          <Shield className="h-3 w-3 mr-1" />
                          Admin
                        </>
                      ) : (
                        <>
                          <User className="h-3 w-3 mr-1" />
                          User
                        </>
                      )}
                    </Badge>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => window.location.href = '/user/profile'}>
                  <User className="mr-2 h-4 w-4" />
                  <span>Profile</span>
                </DropdownMenuItem>
                {authUser.role !== 'Admin' && (
                  <>
                    <DropdownMenuItem onClick={() => window.location.href = '/user/cart'}>
                      <ShoppingCart className="mr-2 h-4 w-4" />
                      <span>My Cart</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => window.location.href = '/user/orders'}>
                      <Package className="mr-2 h-4 w-4" />
                      <span>My Orders</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => window.location.href = '/user/addresses'}>
                      <MapPin className="mr-2 h-4 w-4" />
                      <span>Addresses</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => window.location.href = '/user/refunds'}>
                      <RotateCcw className="mr-2 h-4 w-4" />
                      <span>Refunds</span>
                    </DropdownMenuItem>
                  </>
                )}
                {authUser.data.role === 'Admin' && (
                  <DropdownMenuItem onClick={() => window.location.href = '/admin'}>
                    <Shield className="mr-2 h-4 w-4" />
                    <span>Admin Dashboard</span>
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                      <LogOut className="mr-2 h-4 w-4" />
                      <span>Log out</span>
                    </DropdownMenuItem>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                      <AlertDialogDescription>
                        You will be logged out of your account. You can sign back in anytime.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction 
                        onClick={handleLogout}
                        className="bg-red-600 hover:bg-red-700"
                      >
                        Log out
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <>
              <Button 
                variant="ghost" 
                size="sm" 
                className="text-sm text-white hover:text-green-400 hover:bg-transparent border-none hover:border-none focus:border-none outline-none"
                onClick={handleSignIn}
              >
                Sign In
              </Button>
              <Button 
                size="sm" 
                className="text-sm bg-green-600 hover:bg-green-700 text-white border-none hover:border-none focus:border-none outline-none"
                onClick={handleSignIn}
              >
                Get Started
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Mobile Search Bar */}
      {isMobileSearchOpen && (
        <div className="md:hidden px-4 py-2 border-t border-green-800">
          <SearchComponent 
            placeholder="Search products..."
            className="w-full"
          />
        </div>
      )}
    </header>
  )
}

export default ViblyNavigation
