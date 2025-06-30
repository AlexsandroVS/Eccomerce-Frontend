import InspirationCard from './InspirationCard';

const Inspiration = () => {
  const posts = [
    {
      id: 1,
      title: "Minimalismo Acogedor",
      description: "Cómo lograr calidez en espacios minimalistas con texturas naturales y tonos neutros.",
      category: "GUÍA DE DISEÑO",
      image: "https://images.unsplash.com/photo-1600121848594-d8644e57abab?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80"
    },
    {
      id: 2,
      title: "El Arte de Comer",
      description: "Diseño de comedores que fomentan la conexión y las largas conversaciones.",
      category: "TENDENCIAS",
      image: "https://images.unsplash.com/photo-1600210492493-0946911123ea?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80"
    }
  ];

  return (
    <section id="inspiration" className="py-20 bg-white">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-serif mb-4">Inspiración para tu Hogar</h2>
          <p className="max-w-2xl mx-auto text-stone">Descubre cómo integrar el diseño nórdico en diferentes espacios</p>
        </div>
        
        <div className="grid md:grid-cols-2 gap-8">
          {posts.map((post) => (
            <InspirationCard key={post.id} {...post} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default Inspiration;