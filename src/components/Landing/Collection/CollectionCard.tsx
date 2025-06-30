import { motion } from 'framer-motion';
import { ShoppingBag } from 'lucide-react';

interface CollectionCardProps {
  id: number;
  title: string;
  description: string;
  tag: string;
  price: number;
  image: string;
  badge?: string;
}

const CollectionCard = ({ title, description, tag, price, image, badge }: CollectionCardProps) => {
  return (
    <motion.article 
      whileHover={{ scale: 1.02 }}
      className="group relative overflow-hidden aspect-[3/4] rounded-lg bg-white shadow-lg"
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6, ease: [0.6, -0.05, 0.01, 0.99] }}
    >
      {/* Image Container */}
      <div className="absolute inset-0 z-0">
        <motion.img 
        src={image} 
        alt={title} 
          className="w-full h-full object-cover"
          whileHover={{ scale: 1.1 }}
          transition={{ duration: 0.7, ease: "easeOut" }}
        />
        <motion.div 
          className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"
          initial={false}
          animate={{ opacity: 0 }}
          whileHover={{ opacity: 1 }}
        />
      </div>
      
      {/* Content */}
      <div className="absolute inset-0 z-10 flex flex-col justify-end p-8">
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="transform translate-y-10 group-hover:translate-y-0 transition-transform duration-500"
        >
          <motion.span 
            className="inline-block text-accent text-sm uppercase tracking-widest mb-2"
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            {tag}
          </motion.span>
          
          <motion.h3 
            className="text-2xl font-display text-white mb-3"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            {title}
          </motion.h3>
          
          <motion.p 
            className="text-white/80 mb-5 text-sm"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.5 }}
          >
            {description}
          </motion.p>
          
          <motion.div 
            className="flex items-center justify-between"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.6 }}
          >
            <span className="text-white font-medium">${price.toLocaleString()}</span>
            
            <motion.button 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="inline-flex items-center text-white text-sm font-medium border-b border-transparent hover:border-accent transition-all group/button"
            >
              <span className="flex items-center">
          Añadir al carrito
                <ShoppingBag className="w-4 h-4 ml-2 group-hover/button:translate-x-1 transition-transform" />
              </span>
            </motion.button>
          </motion.div>
        </motion.div>
      </div>
      
      {/* Badge */}
      {badge && (
        <motion.div 
          className={`absolute top-6 ${badge === 'Nuevo' ? 'right-6 bg-charcoal text-white' : 'left-6 bg-accent text-charcoal'} px-3 py-1 text-xs uppercase tracking-widest transform -rotate-3 z-20`}
          initial={{ opacity: 0, scale: 0.8, rotate: -3 }}
          whileInView={{ opacity: 1, scale: 1, rotate: -3 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.7 }}
          whileHover={{ scale: 1.1, rotate: 0 }}
        >
          {badge}
        </motion.div>
      )}

      {/* Hover Effect Overlay */}
      <motion.div 
        className="absolute inset-0 bg-accent/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
        initial={false}
        animate={{ opacity: 0 }}
        whileHover={{ opacity: 1 }}
      />
    </motion.article>
  );
};

export default CollectionCard;