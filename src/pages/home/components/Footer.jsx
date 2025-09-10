import React from 'react'
import { Button } from '@/components/ui/button'

const Footer = () => {
  return (
    <footer className="bg-muted/30 py-12">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-lg font-semibold mb-4">Fashion Store</h3>
            <p className="text-muted-foreground mb-4">
              Your one-stop destination for premium fashion and lifestyle products.
            </p>
            <div className="flex gap-2">
              <Button variant="outline" size="sm">Facebook</Button>
              <Button variant="outline" size="sm">Instagram</Button>
              <Button variant="outline" size="sm">Twitter</Button>
            </div>
          </div>
          
          <div>
            <h4 className="font-semibold mb-4">Shop</h4>
            <ul className="space-y-2 text-muted-foreground">
              <li><a href="/products?gender=men" className="hover:text-foreground transition-colors">Men's Clothing</a></li>
              <li><a href="/products?gender=women" className="hover:text-foreground transition-colors">Women's Clothing</a></li>
              <li><a href="/products?gender=unisex" className="hover:text-foreground transition-colors">Unisex</a></li>
              <li><a href="/products" className="hover:text-foreground transition-colors">All Products</a></li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold mb-4">Support</h4>
            <ul className="space-y-2 text-muted-foreground">
              <li><a href="/contact" className="hover:text-foreground transition-colors">Contact Us</a></li>
              <li><a href="/shipping" className="hover:text-foreground transition-colors">Shipping Info</a></li>
              <li><a href="/returns" className="hover:text-foreground transition-colors">Returns</a></li>
              <li><a href="/size-guide" className="hover:text-foreground transition-colors">Size Guide</a></li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold mb-4">Company</h4>
            <ul className="space-y-2 text-muted-foreground">
              <li><a href="/about" className="hover:text-foreground transition-colors">About Us</a></li>
              <li><a href="/careers" className="hover:text-foreground transition-colors">Careers</a></li>
              <li><a href="/privacy" className="hover:text-foreground transition-colors">Privacy Policy</a></li>
              <li><a href="/terms" className="hover:text-foreground transition-colors">Terms of Service</a></li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-border mt-8 pt-8 text-center text-muted-foreground">
          <p>&copy; 2024 Fashion Store. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}

export default Footer
