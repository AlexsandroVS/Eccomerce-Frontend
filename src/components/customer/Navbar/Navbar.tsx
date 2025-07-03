import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, ShoppingBag, Search, User, LogOut, ChevronDown } from 'lucide-react';
import { useAuth } from '../../../contexts/AuthContext';

interface NavbarProps {
  onCartClick: () => void;
  onSearchClick: () => void;
}

const Navbar = ({ onCartClick, onSearchClick }: NavbarProps) => {
  const { user, isAuthenticated, logout } = useAuth();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const location = useLocation();

  // Efecto para detectar scroll
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Cerrar menús al cambiar de ruta
  useEffect(() => {
    setIsMobileMenuOpen(false);
    setIsUserMenuOpen(false);
  }, [location]);

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    }
  };

  const menuVariants = {
    hidden: { opacity: 0, y: -10 },
    visible: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -10 }
  };

  const renderUserMenu = () => (
    <AnimatePresence>
      {isUserMenuOpen && (
        <motion.div
          className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-xl py-2 z-50"
          initial="hidden"
          animate="visible"
          exit="exit"
          variants={menuVariants}
        >
          {isAuthenticated ? (
            <>
              <div className="px-4 py-2 border-b border-gray-100">
                <p className="text-sm font-medium text-gray-900">{user?.full_name}</p>
                <p className="text-xs text-gray-500">{user?.email}</p>
                <div className="mt-1">
                  {user?.roles?.map((roleObj) => (
                    <span
                      key={roleObj.role}
                      className="inline-block px-2 py-1 text-xs font-medium bg-accent/10 text-accent rounded-full mr-1"
                    >
                      {roleObj.role}
                    </span>
                  ))}
                </div>
              </div>
              
              {user?.roles.some(roleObj => roleObj.role === 'ADMIN') && (
                <Link
                  to="/admin/dashboard"
                  className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                  onClick={() => setIsUserMenuOpen(false)}
                >
                  Panel Admin
                </Link>
              )}
              <Link
                to="/profile"
                className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                onClick={() => setIsUserMenuOpen(false)}
              >
                Mi Perfil
              </Link>
              <Link
                to="/orders"
                className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                onClick={() => setIsUserMenuOpen(false)}
              >
                Mis Pedidos
              </Link>
              <button
                onClick={() => {
                  setIsUserMenuOpen(false);
                  handleLogout();
                }}
                className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-50 transition-colors flex items-center"
              >
                <LogOut size={16} className="mr-2" />
                Cerrar Sesión
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                onClick={() => setIsUserMenuOpen(false)}
              >
                Iniciar Sesión
              </Link>
              <Link
                to="/register"
                className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                onClick={() => setIsUserMenuOpen(false)}
              >
                Registrarse
              </Link>
            </>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );

  return (
    <motion.nav 
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className={`fixed w-full z-50 transition-all duration-500 ${
        isScrolled ? 'bg-white shadow-sm' : 'bg-white'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center">
            <motion.span 
              className="text-2xl font-display tracking-tight"
              whileHover={{ scale: 1.05 }}
              transition={{ type: "spring", stiffness: 400, damping: 10 }}
            >
              <span className="text-accent">NOVA</span>
              <span className="text-charcoal">LIVING</span>
            </motion.span>
          </Link>

          {/* Navegación principal */}
          <div className="hidden md:flex items-center space-x-8">
            <Link
              to="/products"
              className="text-sm uppercase tracking-widest text-charcoal hover:text-accent transition-colors"
            >
              Catálogo
            </Link>
            <button
              className="text-sm uppercase tracking-widest text-gray-400 cursor-not-allowed"
              disabled
              title="Próximamente"
            >
              Colecciones
            </button>
            <button
              className="text-sm uppercase tracking-widest text-gray-400 cursor-not-allowed"
              disabled
              title="Próximamente"
            >
              Contacto
            </button>
            <button
              className="text-sm uppercase tracking-widest text-gray-400 cursor-not-allowed"
              disabled
              title="Próximamente"
            >
              Nosotros
            </button>
          </div>

          {/* Acciones */}
          <div className="flex items-center space-x-4">
            

            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              onClick={onCartClick}
              className="relative text-charcoal hover:text-accent transition-colors"
            >
              <ShoppingBag size={20} />
              <motion.span 
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute -top-2 -right-2 bg-accent text-white text-xs rounded-full w-5 h-5 flex items-center justify-center"
              >
                0
              </motion.span>
            </motion.button>

            <div className="relative">
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                className="flex items-center space-x-2 text-charcoal hover:text-accent transition-colors"
              >
                <User size={20} />
                <ChevronDown 
                  size={16} 
                  className={`transition-transform duration-200 ${isUserMenuOpen ? 'rotate-180' : ''}`}
                />
              </motion.button>
              {renderUserMenu()}
            </div>

            {/* Botón menú móvil */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 text-charcoal hover:text-accent transition-colors"
            >
              {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Menú móvil */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-white border-t border-gray-100"
          >
            <div className="px-4 py-3 space-y-3">
              <Link
                to="/products"
                className="block text-sm uppercase tracking-widest text-charcoal hover:text-accent transition-colors"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Catálogo
              </Link>
              <button
                className="block w-full text-left text-sm uppercase tracking-widest text-gray-400 cursor-not-allowed"
                disabled
                title="Próximamente"
              >
                Colecciones
              </button>
              <button
                className="block w-full text-left text-sm uppercase tracking-widest text-gray-400 cursor-not-allowed"
                disabled
                title="Próximamente"
              >
                Contacto
              </button>
              <button
                className="block w-full text-left text-sm uppercase tracking-widest text-gray-400 cursor-not-allowed"
                disabled
                title="Próximamente"
              >
                Nosotros
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
};

export default Navbar; 