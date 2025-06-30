import { useRef, useEffect } from 'react';
import { motion, useScroll, useTransform, useSpring, useInView } from 'framer-motion';
import { useSpring as useReactSpring, animated } from '@react-spring/web';
import { useGesture } from 'react-use-gesture';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ChevronDown, ArrowRight } from 'lucide-react';

// Registrar el plugin ScrollTrigger de GSAP
gsap.registerPlugin(ScrollTrigger);

const Hero = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const isInView = useInView(containerRef, { amount: 0.3, once: false });
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"]
  });

  // Animaciones con GSAP para efectos más avanzados
  useEffect(() => {
    if (containerRef.current) {
      // Efecto de parallax para el video
      gsap.to(videoRef.current, {
        yPercent: 30,
        ease: "none",
        scrollTrigger: {
          trigger: containerRef.current,
          start: "top top",
          end: "bottom top",
          scrub: true
        }
      });

      // Efecto de brillo en el texto
      gsap.to(".hero-text", {
        textShadow: "0 0 20px rgba(255,255,255,0.5)",
        duration: 2,
        repeat: -1,
        yoyo: true,
        ease: "power1.inOut"
      });
    }
  }, []);

  // Animaciones con React Spring para efectos más suaves
  const [{ scale: springScale, rotateX, rotateY }, api] = useReactSpring(() => ({
    scale: 1,
    rotateX: 0,
    rotateY: 0,
    config: { mass: 5, tension: 350, friction: 40 }
  }));

  // Gestos interactivos
  const bind = useGesture({
    onMove: ({ movement: [mx, my], first, memo }) => {
      if (first) {
        memo = [springScale.get(), rotateX.get(), rotateY.get()];
      }
      const [s, rx, ry] = memo;
      api.start({
        scale: s + 0.1,
        rotateX: rx + (my * 0.1),
        rotateY: ry + (mx * 0.1),
        immediate: false
      });
      return memo;
    },
    onHover: ({ hovering }) => {
      api.start({
        scale: hovering ? 1.05 : 1,
        rotateX: hovering ? 5 : 0,
        rotateY: hovering ? 5 : 0,
        immediate: false
      });
    }
  });

  // Transformaciones basadas en scroll
  const y = useTransform(scrollYProgress, [0, 1], [0, 100]);
  const springY = useSpring(y, { stiffness: 100, damping: 30 });

  return (
    <motion.div
      ref={containerRef}
      className="relative h-screen overflow-hidden"
      initial={{ opacity: 0 }}
      animate={isInView ? { opacity: 1 } : { opacity: 0 }}
      transition={{ duration: 1 }}
    >
      {/* Video Background con efectos mejorados */}
      <div className="absolute inset-0">
        <motion.video
          ref={videoRef}
        autoPlay 
        muted 
        loop 
        playsInline 
          className="w-full h-full object-cover"
          style={{
            filter: 'brightness(0.8) contrast(1.1) saturate(1.2)',
            mixBlendMode: 'multiply',
            transform: `translateY(${springY.get()}px)`
          }}
      >
        <source src="/assets/media/hero3.mp4" type="video/mp4" />
        </motion.video>
      
        {/* Overlays mejorados */}
        <motion.div
          className="absolute inset-0 bg-gradient-to-t from-charcoal/95 via-charcoal/50 to-transparent"
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : { opacity: 0 }}
          transition={{ duration: 1.5 }}
        />
        
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-accent/20 to-transparent mix-blend-overlay"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={isInView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.8 }}
          transition={{ duration: 2, ease: "easeOut" }}
        />

        <motion.div
          className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-charcoal/80"
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : { opacity: 0 }}
          transition={{ duration: 1.5 }}
        />
      
        {/* Elementos de fondo animados */}
        <motion.div
          className="absolute inset-0"
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : { opacity: 0 }}
          transition={{ duration: 2 }}
        >
          {[...Array(20)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-1 h-1 bg-white/20 rounded-full"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
              }}
              animate={{
                scale: [1, 1.5, 1],
                opacity: [0.2, 0.4, 0.2],
              }}
              transition={{
                duration: 2 + Math.random() * 2,
                repeat: Infinity,
                delay: Math.random() * 2,
              }}
            />
          ))}
        </motion.div>
      </div>

      {/* Contenido principal con efectos mejorados */}
      <animated.div
        {...bind()}
        className="relative h-full flex flex-col items-center justify-center text-white px-6"
        style={{
          transform: `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(${springScale})`,
        }}
      >
        <motion.div 
          className="max-w-4xl mx-auto text-center"
          initial={{ opacity: 0, y: 50 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
          transition={{ duration: 1, delay: 0.5 }}
        >
          <motion.h1
            className="hero-text text-5xl md:text-7xl font-display mb-6 leading-tight"
            initial={{ opacity: 0, y: 30 }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
            transition={{ duration: 1, delay: 0.7 }}
        >
          <motion.span 
              className="text-white inline-block"
              initial={{ opacity: 0, x: -20 }}
              animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: -20 }}
              transition={{ delay: 0.5, duration: 0.8 }}
              style={{ textShadow: '0 2px 4px rgba(0,0,0,0.3)' }}
          >
              Diseño
          </motion.span>
            <br />
            <motion.span 
              className="text-accent inline-block"
              initial={{ opacity: 0, x: -20 }}
              animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: -20 }}
              transition={{ delay: 0.6, duration: 0.8 }}
              style={{ textShadow: '0 2px 4px rgba(0,0,0,0.5)' }}
            >
              Consciente
            </motion.span>
          </motion.h1>
          
          <motion.p 
            className="text-xl md:text-2xl mb-12 text-white/90 max-w-2xl mx-auto"
            initial={{ opacity: 0, y: 30 }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
            transition={{ duration: 1, delay: 0.9 }}
            style={{ textShadow: '0 1px 2px rgba(0,0,0,0.3)' }}
          >
            Mobiliario contemporáneo diseñado para la vida moderna. 
            Donde la estética encuentra la funcionalidad.
          </motion.p>
          
          <motion.div 
            className="flex flex-col sm:flex-row gap-4 justify-center"
            initial={{ opacity: 0, y: 30 }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
            transition={{ duration: 1, delay: 1.1 }}
          >
            <motion.a
              href="/products"
              className="inline-flex items-center justify-center px-8 py-4 bg-accent text-white font-medium rounded-none hover:bg-white text-white hover:text-accent transition-colors duration-300 shadow-lg hover:shadow-accent/30 border-2 border-accent hover:border-white group relative overflow-hidden"
              whileHover={{ scale: 1.05, boxShadow: "0 0 30px rgba(var(--accent-rgb), 0.3)" }}
              whileTap={{ scale: 0.95 }}
            >
              <span className="relative z-10 flex items-center">
                Explorar Catálogo
                <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </span>
              <motion.div
                className="absolute inset-0 bg-white"
                initial={{ x: '-100%' }}
                whileHover={{ x: 0 }}
                transition={{ duration: 0.3 }}
              />
            </motion.a>

            <motion.a
              href="/contact"
              className="inline-flex items-center justify-center px-8 py-4 bg-white/10 hover:bg-white/20 text-white border-2 border-white hover:border-accent font-medium rounded-none transition-colors duration-300 backdrop-blur-sm"
              whileHover={{ scale: 1.05, boxShadow: "0 0 20px rgba(255,255,255,0.2)" }}
              whileTap={{ scale: 0.95 }}
            >
              Nuestro Proceso
              <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </motion.a>
          </motion.div>
        </motion.div>

        {/* Indicador de scroll mejorado */}
        <motion.div
          className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 1, delay: 1.3 }}
        >
          <motion.div
            className="flex flex-col items-center"
            animate={{
              y: [0, 10, 0],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          >
            <span className="text-sm text-white/80 mb-2 tracking-widest">Descubre más</span>
            <ChevronDown className="w-6 h-6 text-white" />
          </motion.div>
        </motion.div>
      </animated.div>

      {/* Efecto de partículas en el fondo */}
      <div className="absolute inset-0 pointer-events-none">
        <svg className="w-full h-full">
          <filter id="goo">
            <feGaussianBlur in="SourceGraphic" stdDeviation="10" result="blur" />
            <feColorMatrix
              in="blur"
              mode="matrix"
              values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 18 -7"
              result="goo"
            />
          </filter>
          <g filter="url(#goo)">
            {[...Array(5)].map((_, i) => (
              <motion.circle
                key={i}
                className="fill-accent/20"
                cx={`${20 + i * 15}%`}
                cy="50%"
                r="20"
                animate={{
                  y: [0, -100, 0],
                  scale: [1, 1.2, 1],
                }}
                transition={{
                  duration: 3 + i,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              />
            ))}
          </g>
        </svg>
      </div>
      </motion.div>
  );
};

export default Hero;