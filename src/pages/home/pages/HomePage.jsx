import React from 'react'
import VivlyNavigation from '@/components/ui/vivly-navigation'
import ModernHomePage from '../components/ModernHomePage'
import Footer from '../components/Footer'

const HomePage = () => {
  return (
    <div className="min-h-screen bg-background">
      <VivlyNavigation />
      
      {/* Modern Homepage with Dark/Light Mode Support */}
      <ModernHomePage />
      
      {/* Footer */}
      <Footer />
    </div>
  )
}

export default HomePage