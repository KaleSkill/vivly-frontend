import React from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'
import { Facebook, Instagram, Twitter, Mail, Phone, MapPin, Heart } from 'lucide-react'
import logo from '@/assets/logo.PNG'

const Footer = () => {
  return (
    <footer className="bg-background border-t">
      <div className="container mx-auto px-4">
        {/* Logo Section - Centered */}
        <div className="py-8 text-center">
          <div className="flex items-center justify-center gap-3 mb-4">
            <img 
              src={logo} 
              alt="Vibly Logo" 
              className="w-12 h-12 object-contain"
            />
            <span className="text-3xl font-bold text-primary">Vibly</span>
          </div>
          <p className="text-muted-foreground text-sm leading-relaxed max-w-md mx-auto">
            Your premium destination for fashion and lifestyle. Discover quality products that define your style.
          </p>
          <div className="flex justify-center gap-2 mt-4">
            <Button variant="outline" size="sm" className="h-8 w-8 p-0">
              <Facebook className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="sm" className="h-8 w-8 p-0">
              <Instagram className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="sm" className="h-8 w-8 p-0">
              <Twitter className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <Separator />

        {/* Main Footer Content */}
        <div className="py-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Quick Links */}
            <div className="space-y-4">
              <h4 className="font-semibold text-sm">Quick Links</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="/" className="hover:text-foreground transition-colors">Home</a></li>
                <li><a href="/products" className="hover:text-foreground transition-colors">All Products</a></li>
                <li><a href="/products?gender=men" className="hover:text-foreground transition-colors">Men's Collection</a></li>
                <li><a href="/products?gender=women" className="hover:text-foreground transition-colors">Women's Collection</a></li>
                <li><a href="/products?gender=unisex" className="hover:text-foreground transition-colors">Unisex</a></li>
                <li><a href="/products?isOnSale=true" className="hover:text-foreground transition-colors">Sale Items</a></li>
              </ul>
            </div>

            {/* Customer Service */}
            <div className="space-y-4">
              <h4 className="font-semibold text-sm">Customer Service</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="/contact" className="hover:text-foreground transition-colors">Contact Us</a></li>
                <li><a href="/shipping" className="hover:text-foreground transition-colors">Shipping Info</a></li>
                <li><a href="/refund" className="hover:text-foreground transition-colors">Returns & Exchanges</a></li>
                <li><a href="/sizes" className="hover:text-foreground transition-colors">Size Guide</a></li>
                <li><a href="/faq" className="hover:text-foreground transition-colors">FAQ</a></li>
              </ul>
            </div>

            {/* Stay Updated */}
            <div className="space-y-4">
              <h4 className="font-semibold text-sm">Stay Updated</h4>
              <p className="text-sm text-muted-foreground">
                Subscribe to get updates on new arrivals and exclusive offers.
              </p>
              <div className="space-y-2">
                <div className="flex gap-2">
                  <Input 
                    placeholder="Enter your email" 
                    className="text-sm"
                    type="email"
                  />
                  <Button size="sm" className="px-4">
                    Subscribe
                  </Button>
                </div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Phone className="h-3 w-3" />
                  <span>75430 49556</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Mail className="h-3 w-3" />
                  <span>vibly85@gmail.com</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <MapPin className="h-3 w-3" />
                  <span>India</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <Separator />

        {/* Footer Bottom */}
        <div className="py-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span>&copy; 2024 Vibly. All rights reserved.</span>
            </div>
            
            <div className="flex items-center gap-6 text-sm text-muted-foreground">
              <a href="/privacy-policy" className="hover:text-foreground transition-colors">Privacy Policy</a>
              <a href="/terms-and-conditions" className="hover:text-foreground transition-colors">Terms & Conditions</a>
              <a href="/refund" className="hover:text-foreground transition-colors">Refund</a>
              <a href="/shipping" className="hover:text-foreground transition-colors">Shipping Policy</a>
            </div>

            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <span>Made with</span>
              <Heart className="h-4 w-4 text-red-500 fill-current" />
              <span>for fashion lovers</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer
