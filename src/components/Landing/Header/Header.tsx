import { useState, useEffect } from 'react';
import { Menu, ShoppingBag, Search, X, User, LogOut, ChevronDown } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../../contexts/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';

interface HeaderProps {
  onCartClick: () => void;
  onChatbotClick?: () => void;
}

const Header = ({ onCartClick, onChatbotClick }: HeaderProps) => {
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useAuth();
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Cerrar menús al hacer click fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('.user-menu-trigger') && !target.closest('.user-menu-dropdown')) {
        setUserMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/');
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    }
  };

  const menuVariants = {
    hidden: { opacity: 0, y: -10 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: {
        duration: 0.2,
        ease: "easeOut"
      }
    },
    exit: { 
      opacity: 0, 
      y: -10,
      transition: {
        duration: 0.15,
        ease: "easeIn"
      }
    }
  };

  const renderUserMenu = () => (
    <AnimatePresence>
      {userMenuOpen && (
        <motion.div
          className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-xl py-2 z-50 user-menu-dropdown"
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
                <div className="mt-1 flex flex-wrap gap-1">
                  {user?.roles?.map((roleObj, index) => (
                    <span
                      key={`${roleObj.role}-${index}`}
                      className="inline-block px-2 py-1 text-xs font-medium bg-accent/10 text-accent rounded-full"
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
                  onClick={() => setUserMenuOpen(false)}
                >
                  Panel Admin
                </Link>
              )}
              <Link
                to="/profile"
                className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                onClick={() => setUserMenuOpen(false)}
              >
                Mi Perfil
              </Link>
              <Link
                to="/orders"
                className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                onClick={() => setUserMenuOpen(false)}
              >
                Mis Pedidos
              </Link>
              <button
                onClick={() => {
                  setUserMenuOpen(false);
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
                onClick={() => setUserMenuOpen(false)}
              >
                Iniciar Sesión
              </Link>
              <Link
                to="/register"
                className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                onClick={() => setUserMenuOpen(false)}
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
    <motion.header 
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className={`fixed w-full z-50 transition-all duration-500 ${
        scrolled ? 'bg-white/95 backdrop-blur-md shadow-sm' : 'bg-transparent'
      }`}
    >
      <div className="container mx-auto px-6 py-4 flex justify-between items-center">
        <Link to="/" className="text-2xl font-display tracking-tight flex items-center">
          <motion.span 
            className="text-accent"
            whileHover={{ scale: 1.05 }}
            transition={{ type: "spring", stiffness: 400, damping: 10 }}
          >
            NOVA
          </motion.span> 
          <span className={scrolled ? 'text-charcoal' : 'text-white'}>LIVING</span>
        </Link>
        
        <nav className="hidden md:flex items-center space-x-8">
          <Link
            to="/"
            className={`text-sm uppercase tracking-widest hover:text-accent transition-colors ${
              scrolled ? 'text-charcoal' : 'text-white'
            }`}
          >
            Inicio
          </Link>
          <Link
            to="/products"
            className={`text-sm uppercase tracking-widest hover:text-accent transition-colors ${
              scrolled ? 'text-charcoal' : 'text-white'
            }`}
          >
            Catálogo
          </Link>
          
        </nav>
        
        <div className="flex items-center space-x-6">
          <motion.button 
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={onChatbotClick}
            className={scrolled ? 'text-charcoal hover:text-accent' : 'text-white hover:text-accent'}
          >
            <Search size={20} />
          </motion.button>
          
          <motion.button 
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={onCartClick}
            className={`relative ${scrolled ? 'text-charcoal hover:text-accent' : 'text-white hover:text-accent'}`}
          >
            <ShoppingBag size={20} />
            <motion.span 
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="absolute -top-2 -right-2 bg-accent text-charcoal text-xs rounded-full w-5 h-5 flex items-center justify-center"
            >
              0
            </motion.span>
          </motion.button>

          <div className="relative">
            <motion.button 
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setUserMenuOpen(!userMenuOpen)}
              className={`flex items-center space-x-2 user-menu-trigger ${
                scrolled ? 'text-charcoal hover:text-accent' : 'text-white hover:text-accent'
              }`}
            >
              <User size={20} />
              <ChevronDown 
                size={16} 
                className={`transition-transform duration-200 ${userMenuOpen ? 'rotate-180' : ''}`}
              />
            </motion.button>
            {renderUserMenu()}
          </div>

          <motion.button 
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            className="lg:hidden text-white hover:text-accent"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </motion.button>
        </div>
      </div>
      
      {/* Mobile menu */}
      <AnimatePresence>
      {mobileMenuOpen && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="lg:hidden bg-white text-charcoal overflow-hidden"
          >
            <nav className="container mx-auto px-6 py-4 space-y-4">
              <Link
                to="/"
                className="block text-sm uppercase tracking-widest hover:text-accent transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                Inicio
              </Link>
              <Link
                to="/products"
                className="block text-sm uppercase tracking-widest hover:text-accent transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                Catálogo
              </Link>
              <Link
                to="/products"
                className="block text-sm uppercase tracking-widest hover:text-accent transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                Productos
              </Link>
              {isAuthenticated ? (
                <>
                  <Link
                    to="/profile"
                    className="text-sm uppercase tracking-widest hover:text-accent transition-colors"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Mi Perfil
                  </Link>
                  <Link
                    to="/orders"
                    className="text-sm uppercase tracking-widest hover:text-accent transition-colors"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Mis Pedidos
                  </Link>
                  <button
                    onClick={() => {
                      setMobileMenuOpen(false);
                      handleLogout();
                    }}
                    className="text-sm uppercase tracking-widest text-red-600 hover:text-red-700 text-left transition-colors"
                  >
                    Cerrar Sesión
                  </button>
                </>
              ) : (
                <>
                  <Link
                    to="/login"
                    className="text-sm uppercase tracking-widest hover:text-accent transition-colors"
                    onClick={() => setMobileMenuOpen(false)}
                  >
              Iniciar Sesión
                  </Link>
                  <Link
                    to="/register"
                    className="text-sm uppercase tracking-widest hover:text-accent transition-colors"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Registrarse
                  </Link>
                </>
              )}
          </nav>
          </motion.div>
      )}
      </AnimatePresence>
    </motion.header>
  );
};

export default Header;