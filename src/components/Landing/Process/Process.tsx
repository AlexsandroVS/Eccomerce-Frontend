const Process = () => {
  const steps = [
    {
      id: 1,
      title: "Selección de Materiales",
      description: "Madera sostenible de bosques certificados y materiales premium"
    },
    {
      id: 2,
      title: "Diseño y Planificación",
      description: "Bocetos detallados y planos técnicos para cada pieza"
    },
    {
      id: 3,
      title: "Fabricación Manual",
      description: "Técnicas artesanales combinadas con precisión moderna"
    },
    {
      id: 4,
      title: "Control de Calidad",
      description: "Inspección rigurosa antes de entregar cada pieza"
    }
  ];

  return (
    <section id="process" className="py-24 bg-cream">
      <div className="container mx-auto px-6">
        <div className="text-center mb-20">
          <h2 className="text-4xl md:text-5xl font-display mb-6">
            <span className="text-accent">//</span> Proceso Artesanal
          </h2>
          <p className="max-w-2xl mx-auto text-stone text-lg">
            Cada pieza es creada con atención meticulosa a los detalles y técnicas tradicionales
          </p>
        </div>

        <div className="grid md:grid-cols-4 gap-8">
          {steps.map((step) => (
            <div key={step.id} className="text-center relative">
              <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-white border-2 border-accent flex items-center justify-center text-accent text-3xl font-display">
                {step.id}
              </div>
              <h3 className="text-xl font-display mb-3">{step.title}</h3>
              <p className="text-stone">
                {step.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Process;