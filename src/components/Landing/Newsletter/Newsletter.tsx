import { Send } from 'lucide-react';

const Newsletter = () => {
  return (
    <section id="contact" className="py-16 bg-charcoal text-white">
      <div className="container mx-auto px-6 text-center">
        <h2 className="text-3xl font-serif mb-4">Únete a nuestra comunidad</h2>
        <p className="max-w-2xl mx-auto text-white/80 mb-8">
          Recibe inspiración, novedades y ofertas exclusivas directamente en tu correo
        </p>
        
        <form className="max-w-md mx-auto flex">
          <input 
            type="email" 
            placeholder="Tu correo electrónico" 
            className="flex-grow px-4 py-3 text-charcoal bg-white focus:outline-none rounded-l" 
          />
          <button 
            type="submit" 
            className="bg-sand hover:bg-white text-charcoal px-6 py-3 font-medium transition-colors flex items-center rounded-r"
          >
            Suscribirse <Send className="ml-2 w-4 h-4" />
          </button>
        </form>
      </div>
    </section>
  );
};

export default Newsletter;