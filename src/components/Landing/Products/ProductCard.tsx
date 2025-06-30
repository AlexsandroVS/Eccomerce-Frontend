import { motion } from 'framer-motion';
import { ShoppingBag, Heart } from 'lucide-react';
import { Link } from 'react-router-dom';

interface ProductCardProps {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  badge?: 'Nuevo' | 'Popular' | 'Exclusivo' | string; // Tipos específicos para los badges
}

const ProductCard = ({ id, name, description, price, image, badge }: ProductCardProps) => {
  return (
    <motion.div 
      className="group relative bg-white"
      whileHover={{ y: -5 }}
      transition={{ duration: 0.3 }}
    >
      {/* Badge */}
        {badge && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
          className="absolute top-4 left-4 z-10"
        >
          <span className="inline-block bg-blue-500 text-white px-3 py-1 text-sm font-medium">
            {badge}
          </span>
        </motion.div>
      )}

      {/* Image Container */}
      <div className="relative overflow-hidden aspect-[4/5]">
        <Link to={`/products/${id}`}>
          <motion.img
            src={image}
            alt={name}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
            whileHover={{ scale: 1.1 }}
            transition={{ duration: 0.7 }}
            onError={(e) => {
              e.currentTarget.src = '/placeholder-product.jpg';
            }}
          />
        </Link>
        
        {/* Gradient Overlay */}
        <motion.div
          className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/0 to-black/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
          initial={false}
          animate={{ opacity: 0 }}
          whileHover={{ opacity: 1 }}
        />

        {/* Quick Actions */}
        <motion.div 
          className="absolute bottom-0 left-0 right-0 p-4 flex justify-between items-center translate-y-full group-hover:translate-y-0 transition-transform duration-500"
          initial={false}
          whileHover={{ y: 0 }}
        >
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className="bg-white text-gray-800 p-3 rounded-full hover:bg-blue-500 hover:text-white transition-colors duration-300"
          >
            <ShoppingBag className="w-5 h-5" />
          </motion.button>
          
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className="bg-white text-gray-800 p-3 rounded-full hover:bg-red-500 hover:text-white transition-colors duration-300"
          >
            <Heart className="w-5 h-5" />
          </motion.button>
        </motion.div>
      </div>

      {/* Content */}
      <div className="p-6">
        <Link to={`/products/${id}`}>
          <motion.h3 
            className="text-xl font-semibold mb-2 group-hover:text-blue-600 transition-colors duration-300"
            initial={false}
            whileHover={{ x: 5 }}
            transition={{ duration: 0.3 }}
          >
            {name}
          </motion.h3>
        </Link>
        
        <motion.p 
          className="text-gray-600 mb-4 line-clamp-2"
          initial={false}
          whileHover={{ x: 5 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          {description}
        </motion.p>
        
        <motion.div 
          className="flex justify-between items-center"
          initial={false}
          whileHover={{ x: 5 }}
          transition={{ duration: 0.3, delay: 0.2 }}
        >
          <span className="text-2xl font-semibold text-blue-600">S/ {price.toLocaleString('es-PE', { minimumFractionDigits: 2 })}</span>
          <Link to={`/products/${id}`}>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="text-blue-600 hover:text-blue-800 transition-colors duration-300"
            >
              Ver detalles
            </motion.button>
          </Link>
        </motion.div>
      </div>
      
      {/* Hover Border Effect */}
      <motion.div
        className="absolute inset-0 border-2 border-transparent group-hover:border-blue-500 transition-colors duration-500"
        initial={false}
        whileHover={{ scale: 1.02 }}
        transition={{ duration: 0.3 }}
      />
    </motion.div>
  );
};

export default ProductCard;