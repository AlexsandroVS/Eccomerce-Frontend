import { motion, AnimatePresence } from 'framer-motion';
import { X, Send } from 'lucide-react';

interface ChatbotProps {
  isOpen: boolean;
  onClose: () => void;
}

const Chatbot = ({ isOpen, onClose }: ChatbotProps) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          transition={{ duration: 0.3 }}
          className="fixed bottom-24 right-8 w-80 bg-white rounded-lg shadow-xl overflow-hidden z-50"
        >
          <div className="bg-charcoal text-white px-4 py-3 flex justify-between items-center">
            <h4 className="font-medium">¿Necesitas ayuda?</h4>
            <button 
              onClick={onClose}
              className="text-white hover:text-sand transition-colors"
            >
              <X className="text-xl" />
            </button>
          </div>
          <div className="h-60 overflow-y-auto p-4">
            <div className="bg-cream rounded-lg p-3 mb-3 max-w-[80%]">
              <p className="text-sm">¡Hola! Soy tu asistente de NOVA LIVING. ¿En qué puedo ayudarte hoy?</p>
            </div>
          </div>
          <div className="border-t border-gray-200 p-3 flex">
            <input 
              type="text" 
              placeholder="Escribe tu mensaje..." 
              className="flex-grow px-3 py-2 border border-gray-300 rounded-l focus:outline-none focus:ring-1 focus:ring-sand text-sm" 
            />
            <button className="bg-sand text-charcoal px-4 py-2 rounded-r">
              <Send className="w-4 h-4" />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default Chatbot;