import React from 'react'
import NavComp from '@/components/origin/navcomp'
import ModernHomePage from '../components/ModernHomePage'
import Footer from '../components/Footer'

const HomePage = () => {
  return (
    <div className="min-h-screen bg-background">
      <NavComp />
      
      {/* Modern Homepage with Dark/Light Mode Support */}
      <ModernHomePage />
      
      {/* Footer */}
      <Footer />
    </div>
  )
}

export default HomePage