import { ChevronRight } from 'lucide-react';

interface InspirationCardProps {
  title: string;
  description: string;
  category: string;
  image: string;
}

const InspirationCard = ({ title, description, category, image }: InspirationCardProps) => {
  return (
    <div className="group relative overflow-hidden">
      <div className="aspect-[4/3] relative">
        <img
          src={image}
          alt={title}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/30 to-transparent" />
      </div>
      
      <div className="absolute bottom-0 left-0 p-6 text-white">
        <span className="text-xs uppercase tracking-widest mb-2 inline-block">{category}</span>
        <h3 className="text-xl md:text-2xl font-serif mb-2">{title}</h3>
        <p className="text-sm md:text-base opacity-90 mb-4">{description}</p>
        
        <a 
          href="#"
          className="inline-flex items-center text-sm font-medium border-b border-transparent hover:border-white pb-1 transition-all"
        >
          Leer más
          <ChevronRight className="w-4 h-4 ml-1" />
        </a>
      </div>
    </div>
  );
};

export default InspirationCard;