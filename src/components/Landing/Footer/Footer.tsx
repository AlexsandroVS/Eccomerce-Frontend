import { Home, Instagram, Facebook, Send } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-charcoal text-white pt-16 pb-8">
      <div className="container mx-auto px-6">
        <div className="grid md:grid-cols-4 gap-8 mb-12">
          {/* Column 1 */}
          <div>
            <h3 className="text-xl font-serif mb-4 flex items-center">
              <Home className="text-sand text-2xl mr-2" /> NOVA LIVING
            </h3>
            <p className="text-white/80 mb-4">
              Diseño escandinavo contemporáneo para una vida consciente y con propósito.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-white/70 hover:text-sand transition-colors">
                <Instagram className="text-xl" />
              </a>
              <a href="#" className="text-white/70 hover:text-sand transition-colors">
                <Facebook className="text-xl" />
              </a>
            </div>
          </div>
          
          {/* Column 2 */}
          <div>
            <h4 className="text-lg font-medium mb-4">Tienda</h4>
            <ul className="space-y-2">
              <li><a href="#" className="text-white/70 hover:text-sand transition-colors">Todos los productos</a></li>
              <li><a href="#" className="text-white/70 hover:text-sand transition-colors">Nuevas llegadas</a></li>
              <li><a href="#" className="text-white/70 hover:text-sand transition-colors">Ofertas</a></li>
              <li><a href="#" className="text-white/70 hover:text-sand transition-colors">Colecciones</a></li>
            </ul>
          </div>
          
          {/* Column 3 */}
          <div>
            <h4 className="text-lg font-medium mb-4">Servicio</h4>
            <ul className="space-y-2">
              <li><a href="#" className="text-white/70 hover:text-sand transition-colors">Envíos y devoluciones</a></li>
              <li><a href="#" className="text-white/70 hover:text-sand transition-colors">Preguntas frecuentes</a></li>
              <li><a href="#" className="text-white/70 hover:text-sand transition-colors">Guía de tamaños</a></li>
              <li><a href="#" className="text-white/70 hover:text-sand transition-colors">Diseño personalizado</a></li>
            </ul>
          </div>
          
          {/* Column 4 */}
          <div>
            <h4 className="text-lg font-medium mb-4">Contacto</h4>
            <address className="not-italic text-white/70">
              <p className="mb-2 flex items-center">
                <Send className="mr-2 w-4 h-4" /> Calle Diseño 123, 08025 Barcelona
              </p>
              <p className="mb-2 flex items-center">
                <Send className="mr-2 w-4 h-4" /> hola@novaliving.com
              </p>
              <p className="flex items-center">
                <Send className="mr-2 w-4 h-4" /> +34 123 456 789
              </p>
            </address>
          </div>
        </div>
        
        <div className="pt-8 border-t border-white/10">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-white/70 mb-4 md:mb-0">© 2023 NOVA LIVING. Todos los derechos reservados.</p>
            <div className="flex space-x-6">
              <a href="#" className="text-white/70 hover:text-sand transition-colors text-sm">Política de privacidad</a>
              <a href="#" className="text-white/70 hover:text-sand transition-colors text-sm">Términos y condiciones</a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;