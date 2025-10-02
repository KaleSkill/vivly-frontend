import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useDebounce } from '@/hooks/useDebounce'
import { useAuthStore } from '@/store/authstore'
import { userApi } from '@/api/api'
import { motion } from 'framer-motion'
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from '@/components/ui/navigation-menu'
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
import { CartIcon } from './cart-button'
import { 
  User, 
  Settings, 
  LogOut, 
  Shield, 
  ShoppingCart, 
  Package, 
  MapPin, 
  RotateCcw, 
  Search,
  Sparkles
} from 'lucide-react'
import logo from '@/assets/logo.PNG'


const VivlyNavigation = () => {
  const { authUser, loginWithGoogle, logout } = useAuthStore()
  const [searchQuery, setSearchQuery] = useState('')
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()
  

  console.log("authUser",authUser)
  // Debounce search query
  const debouncedSearchQuery = useDebounce(searchQuery, 500)

  const handleSignIn = () => {
    loginWithGoogle()
  }

  const handleLogout = () => {
    logout()
  }

  const handleSearch = (e) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchQuery.trim())}`)
      setSearchQuery('')
    }
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

  // Auto-search when debounced query changes
  useEffect(() => {
    if (debouncedSearchQuery.trim()) {
      navigate(`/products?search=${encodeURIComponent(debouncedSearchQuery.trim())}`)
    }
  }, [debouncedSearchQuery, navigate])

  // Fetch categories on component mount
  useEffect(() => {
    fetchCategories()
  }, [])

  // Organize categories by gender
  const organizeCategories = () => {
    const organized = {
      men: { title: "Men's Fashion", href: "/products?gender=men", subcategories: [] },
      women: { title: "Women's Fashion", href: "/products?gender=women", subcategories: [] },
      unisex: { title: "Unisex", href: "/products?gender=unisex", subcategories: [] }
    }

    categories.forEach(category => {
      const categoryName = category.name?.toLowerCase() || ''
      const categorySlug = category.slug || categoryName
      
      // Determine which main category this belongs to
      if (categoryName.includes('men') || categoryName.includes('male')) {
        organized.men.subcategories.push({
          name: category.name,
          href: `/products?gender=men&category=${categorySlug}`
        })
      } else if (categoryName.includes('women') || categoryName.includes('female') || categoryName.includes('dress')) {
        organized.women.subcategories.push({
          name: category.name,
          href: `/products?gender=women&category=${categorySlug}`
        })
      } else if (categoryName.includes('unisex') || categoryName.includes('unisex')) {
        organized.unisex.subcategories.push({
          name: category.name,
          href: `/products?gender=unisex&category=${categorySlug}`
        })
      } else {
        // Default to unisex for uncategorized items
        organized.unisex.subcategories.push({
          name: category.name,
          href: `/products?gender=unisex&category=${categorySlug}`
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
          <div className="flex items-center gap-2">
            <img 
              src={logo} 
              alt="Vivly Logo" 
              className="w-8 h-8 object-contain"
            />
            <span className="text-xl font-bold text-white">Vivly</span>
          </div>

          {/* Main Navigation Menu */}
          <NavigationMenu className="hidden md:flex">
            <NavigationMenuList>
              {/* Home */}
              <NavigationMenuItem>
                <NavigationMenuLink 
                  href="/" 
                  className="group inline-flex h-9 w-max items-center justify-center px-4 py-2 text-sm font-medium text-white transition-all duration-300 hover:text-green-400 hover:scale-105 focus:outline-none disabled:pointer-events-none disabled:opacity-50 data-[active]:text-green-400 data-[state=open]:text-green-400"
                >
                  Home
                </NavigationMenuLink>
              </NavigationMenuItem>

              {/* Dynamic Categories */}
              {Object.entries(organizedCategories).map(([key, category]) => {
                if (category.subcategories.length === 0) return null
                return (
                  <NavigationMenuItem key={key}>
                    <NavigationMenuTrigger className="h-9 text-white hover:text-green-400 hover:scale-105 transition-all duration-300 border-none bg-transparent">
                      {key.charAt(0).toUpperCase() + key.slice(1)}
                    </NavigationMenuTrigger>
                    <NavigationMenuContent>
                      <div className="grid gap-3 p-6 w-[400px] bg-background border border-border rounded-lg shadow-lg">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="font-semibold text-lg text-foreground">{category.title}</span>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          {category.subcategories.map((item) => (
                            <NavigationMenuLink
                              key={item.name}
                              href={item.href}
                              className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-green-500/10 hover:text-green-400 focus:bg-green-500/10 focus:text-green-400"
                            >
                              <div className="text-sm font-medium leading-none text-foreground">{item.name}</div>
                            </NavigationMenuLink>
                          ))}
                        </div>
                      </div>
                    </NavigationMenuContent>
                  </NavigationMenuItem>
                )
              })}

            
            </NavigationMenuList>
          </NavigationMenu>
        </div>

        {/* Center - Search Bar */}
        <div className="hidden md:flex flex-1 max-w-lg mx-6">
          <form onSubmit={handleSearch} className="w-full">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                type="text"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 w-full h-10 bg-white/10 border-none text-white placeholder-gray-300 focus:bg-white/20 focus:outline-none transition-all duration-300 rounded-lg"
              />
            </div>
          </form>
        </div>

        {/* Right side - User actions */}
        <div className="flex items-center gap-2">
          <ModeToggle />
          <CartIcon />
          
          {authUser ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Button variant="ghost" className="relative h-10 w-auto rounded-full px-2 gap-2 text-white hover:text-green-600 hover:bg-transparent border-none">
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
                className="text-sm text-white hover:text-green-400 hover:bg-transparent border-none"
                onClick={handleSignIn}
              >
                Sign In
              </Button>
              <Button 
                size="sm" 
                className="text-sm bg-green-600 hover:bg-green-700 text-white border-none"
                onClick={handleSignIn}
              >
                Get Started
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  )
}

export default VivlyNavigation
