import { useState } from 'react';
import Header from '../components/Landing/Header/Header';
import Hero from '../components/Landing/Hero/Hero';
import Collections from '../components/Landing/Collection/Collections';
import Products from '../components/Landing/Products/Products';
import Process from '../components/Landing/Process/Process';
import Inspiration from '../components/Landing/Inspiration/Inspiration';
import Newsletter from '../components/Landing/Newsletter/Newsletter';
import Footer from '../components/Landing/Footer/Footer';
import Chatbot from '../components/Landing/Chatbot/Chatbot';
import Cart from '../components/Landing/Cart/Cart';

const HomePage = () => {
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isChatbotOpen, setIsChatbotOpen] = useState(false);

  return (
    <div className="font-sans text-charcoal bg-cream antialiased">
      <Header 
        onCartClick={() => setIsCartOpen(true)} 
        onChatbotClick={() => setIsChatbotOpen(true)} 
      />
      
      <main>
        <Hero />
        <Collections />
        <Products />
        <Process />
        <Inspiration />
        <Newsletter />
      </main>
      
      <Footer />
      
      <Chatbot 
        isOpen={isChatbotOpen} 
        onClose={() => setIsChatbotOpen(false)} 
      />
      
      <Cart 
        isOpen={isCartOpen} 
        onClose={() => setIsCartOpen(false)} 
      />
    </div>
  );
};

export default HomePage;