import React, { useState } from 'react';
import type { ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Navbar from '../Navbar/Navbar';
import CartSidebar from '../Cart/CartSidebar';
import SearchModal from '../Search/SearchModal';

interface CustomerLayoutProps {
  children: ReactNode;
}

const CustomerLayout: React.FC<CustomerLayoutProps> = ({ children }) => {
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar 
        onCartClick={() => setIsCartOpen(true)}
        onSearchClick={() => setIsSearchOpen(true)}
      />
      
      {/* Contenido principal con padding para el navbar fijo */}
      <main className="pt-16">
        {children}
      </main>

      {/* Sidebar del carrito */}
      <AnimatePresence>
        {isCartOpen && (
          <CartSidebar onClose={() => setIsCartOpen(false)} />
        )}
      </AnimatePresence>

      {/* Modal de búsqueda */}
      <AnimatePresence>
        {isSearchOpen && (
          <SearchModal onClose={() => setIsSearchOpen(false)} />
        )}
      </AnimatePresence>
    </div>
  );
};

export default CustomerLayout; 