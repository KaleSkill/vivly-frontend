import React from 'react'
import NavComp from '@/components/origin/navcomp'

const UserDashboard = () => {
  return (
    <div className="min-h-screen bg-background">
      <NavComp />
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold mb-8">User Dashboard</h1>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-card p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">My Orders</h2>
            <p className="text-muted-foreground">View your order history</p>
          </div>
          <div className="bg-card p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">Wishlist</h2>
            <p className="text-muted-foreground">Your saved items</p>
          </div>
          <div className="bg-card p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">Profile</h2>
            <p className="text-muted-foreground">Manage your profile</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserDashboard;
