import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

interface CartProps {
  isOpen: boolean;
  onClose: () => void;
}

const Cart = ({ isOpen, onClose }: CartProps) => {
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
                <h3 className="text-xl font-display">Tu Carrito</h3>
                <button 
                  onClick={onClose}
                  className="text-gray-400 hover:text-charcoal transition-colors"
                >
                  <X className="text-xl" />
                </button>
              </div>
              
              <div className="flex-grow overflow-y-auto p-6">
                <p className="text-gray-500 py-8 text-center">Tu carrito está vacío</p>
              </div>
              
              <div className="border-t border-gray-200 p-6">
                <div className="flex justify-between mb-6">
                  <span className="font-medium">Total</span>
                  <span className="font-display">€0.00</span>
                </div>
                <button className="w-full bg-charcoal hover:bg-black text-white py-3 px-6 rounded-none transition-colors duration-300">
                  Proceder al pago
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default Cart;