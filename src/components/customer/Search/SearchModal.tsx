import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Search as SearchIcon, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useDebounce } from '../../../hooks/useDebounce';
import { Product } from '../../../types/product.types';

interface SearchModalProps {
  onClose: () => void;
}

const SearchModal = ({ onClose }: SearchModalProps) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<Product[]>([]);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();
  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  // Focus input on mount
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  // Handle search
  useEffect(() => {
    const searchProducts = async () => {
      if (!debouncedSearchTerm.trim()) {
        setResults([]);
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        // TODO: Implementar búsqueda real con API
        const response = await fetch(`/api/products/search?q=${encodeURIComponent(debouncedSearchTerm)}`);
        if (!response.ok) throw new Error('Error en la búsqueda');
        const data = await response.json();
        setResults(data.products);
      } catch (err) {
        setError('Error al buscar productos. Por favor, intenta de nuevo.');
        setResults([]);
      } finally {
        setIsLoading(false);
      }
    };

    searchProducts();
  }, [debouncedSearchTerm]);

  const handleProductClick = (productId: string) => {
    navigate(`/productos/${productId}`);
    onClose();
  };

  return (
    <>
      {/* Overlay */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 z-40"
        onClick={onClose}
      />

      {/* Modal */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className="fixed top-0 left-0 right-0 bg-white shadow-lg z-50 max-w-3xl mx-auto mt-20 rounded-lg"
      >
        <div className="p-4">
          {/* Header */}
          <div className="flex items-center space-x-4 mb-4">
            <div className="flex-1 relative">
              <SearchIcon
                size={20}
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
              />
              <input
                ref={inputRef}
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Buscar productos..."
                className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent"
              />
              {isLoading && (
                <Loader2
                  size={20}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 animate-spin"
                />
              )}
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X size={24} />
            </button>
          </div>

          {/* Results */}
          <div className="max-h-[60vh] overflow-y-auto">
            {error ? (
              <div className="text-red-500 text-center py-4">{error}</div>
            ) : results.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {results.map((product) => (
                  <motion.button
                    key={product.id}
                    onClick={() => handleProductClick(product.id)}
                    className="flex items-center space-x-4 p-4 hover:bg-gray-50 rounded-lg transition-colors text-left"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <img
                      src={product.images[0]}
                      alt={product.name}
                      className="w-16 h-16 object-cover rounded"
                    />
                    <div>
                      <h3 className="font-medium">{product.name}</h3>
                      <p className="text-sm text-gray-500 line-clamp-2">
                        {product.description}
                      </p>
                      <p className="font-medium text-accent mt-1">
                        ${product.price.toFixed(2)}
                      </p>
                    </div>
                  </motion.button>
                ))}
              </div>
            ) : searchTerm ? (
              <div className="text-center py-8 text-gray-500">
                No se encontraron productos
              </div>
            ) : null}
          </div>
        </div>
      </motion.div>
    </>
  );
};

export default SearchModal; 