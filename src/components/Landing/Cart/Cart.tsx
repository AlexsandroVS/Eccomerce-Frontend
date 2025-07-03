import { motion, AnimatePresence } from 'framer-motion';
import { X, ShoppingBag } from 'lucide-react';
import { useCart } from '../../../contexts/CartContext';
import { getImageUrl } from '../../../utils/image.utils';

interface CartProps {
  isOpen: boolean;
  onClose: () => void;
}

const Cart = ({ isOpen, onClose }: CartProps) => {
  const { items: cartItems, removeFromCart, total, itemCount } = useCart();

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 z-40"
            onClick={onClose}
          />
          
          <motion.div 
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'tween' }}
            className="fixed top-0 right-0 w-full md:w-96 h-full bg-white shadow-xl z-50"
          >
            <div className="h-full flex flex-col">
              <div className="border-b border-gray-200 p-6 flex justify-between items-center">
                <div className="flex items-center space-x-2">
                  <ShoppingBag className="text-xl text-charcoal" />
                  <h3 className="text-xl font-display">Tu Carrito</h3>
                  {itemCount > 0 && (
                    <span className="bg-charcoal text-white text-xs px-2 py-1 rounded-full">
                      {itemCount}
                    </span>
                  )}
                </div>
                <button 
                  onClick={onClose}
                  className="text-gray-400 hover:text-charcoal transition-colors"
                >
                  <X className="text-xl" />
                </button>
              </div>
              
              <div className="flex-grow overflow-y-auto p-6">
                {cartItems.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-gray-500">
                    <ShoppingBag size={48} className="mb-4 text-gray-300" />
                    <p className="text-lg font-medium mb-2">Tu carrito está vacío</p>
                    <p className="text-sm text-center">Añade productos para comenzar a comprar</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {cartItems.map((item) => (
                      <div
                        key={item.id}
                        className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg"
                      >
                        <img
                          src={getImageUrl(item.image || '')}
                          alt={item.name}
                          className="w-16 h-16 object-cover rounded"
                          onError={(e) => {
                            e.currentTarget.src = '/placeholder-product.jpg';
                          }}
                        />
                        <div className="flex-1">
                          <h4 className="font-medium text-sm">{item.name}</h4>
                          <p className="text-xs text-gray-500">
                            Cantidad: {item.quantity}
                          </p>
                          <p className="font-medium text-charcoal text-sm">
                            ${item.price.toFixed(2)}
                          </p>
                        </div>
                        <button
                          onClick={() => removeFromCart(item.id)}
                          className="p-1 text-red-500 hover:bg-red-50 rounded-full transition-colors"
                        >
                          <X size={16} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              
              {cartItems.length > 0 && (
                <div className="border-t border-gray-200 p-6">
                  <div className="flex justify-between mb-6">
                    <span className="font-medium">Total</span>
                    <span className="font-display">${total.toFixed(2)}</span>
                  </div>
                  <button className="w-full bg-charcoal hover:bg-black text-white py-3 px-6 rounded-none transition-colors duration-300">
                    Proceder al pago
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default Cart;