import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ArrowRight } from 'lucide-react'
import { userApi } from '@/api/api'
import { ProductCard, ProductSkeleton } from '@/pages/user/components/product'

const BestSellers = () => {
  const navigate = useNavigate()
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)

  // Fetch trending products
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true)
        console.log('Fetching best sellers...')
        const response = await userApi.products.getTrendingProducts()
        console.log('Products response:', response.data)
        setProducts(response.data.data?.products || [])
      } catch (error) {
        console.error('Error fetching products:', error)
        setProducts([])
      } finally {
        setLoading(false)
      }
    }

    fetchProducts()
  }, [])


  return (
    <section className="py-20 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <Badge className="mb-4 bg-black text-white">
            Trending Now
          </Badge>
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-black">Best Sellers</h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Discover our most loved products that customers can't get enough of
          </p>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {[1, 2, 3, 4].map((i) => (
              <ProductSkeleton key={i} />
            ))}
          </div>
        ) : products.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {products.map((product, index) => (
              <ProductCard
                key={product._id}
                product={product}
                index={index}
                showColors={true}
                showWishlist={true}
                animationDelay={0.1}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-500">No products available</p>
          </div>
        )}

        {/* See All Button - Show only on desktop when more than 4 products */}
        {products.length > 4 && (
          <div className="hidden lg:flex justify-center mt-8">
            <Button 
              variant="outline" 
              size="lg"
              onClick={() => navigate('/products')}
              className="gap-2 bg-white border-gray-300 text-gray-700 hover:bg-gray-50"
            >
              See All Products
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>
    </section>
  )
}

export default BestSellers
