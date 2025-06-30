import type { Product } from '../types/product.types';

export const products: Product[] = [
  // Sofás
  {
    id: '1',
    name: 'Sofá Chesterfield Moderno',
    description: 'Elegante sofá Chesterfield con diseño moderno, tapizado en cuero sintético de alta calidad. Perfecto para salas contemporáneas.',
    price: 1299.99,
    discount_price: 999.99,
    stock: 15,
    rating: 4.8,
    reviews: 124,
    category: 'living',
    images: [
      'https://images.unsplash.com/photo-1555041469-a586c61ea9bc',
      'https://images.unsplash.com/photo-1493663284031-b7e3aefcae8e',
      'https://images.unsplash.com/photo-1567016432779-094069958ea5',
      'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=500'
    ],
    features: [
      'Estructura de madera sólida',
      'Tapizado en cuero sintético premium',
      'Almohadones extraíbles',
      'Patas de madera maciza',
      'Respaldo alto ergonómico'
    ],
    specifications: {
      dimensions: '220 x 90 x 85 cm',
      material: 'Madera, Cuero Sintético, Espuma',
      color: 'Gris Antracita',
      weight: '85 kg'
    },
    is_featured: true,
    is_new: false,
    created_at: '2024-01-15T10:00:00Z',
    updated_at: '2024-03-10T15:30:00Z'
  },
  {
    id: '2',
    name: 'Sofá Modular L-Shape',
    description: 'Sofá modular en forma de L con diseño contemporáneo y máxima comodidad.',
    price: 1899.99,
    discount_price: null,
    category: 'sofas',
    images: [
      '/images/products/sofa-modular-1.jpg',
      '/images/products/sofa-modular-2.jpg',
      '/images/products/sofa-modular-3.jpg'
    ],
    features: [
      'Diseño modular personalizable',
      'Tapizado en tela resistente',
      'Almohadones de alta densidad',
      'Estructura de acero reforzado'
    ],
    specifications: {
      dimensions: '280 x 180 x 85 cm',
      material: 'Tela, Acero, Espuma HD',
      color: 'Gris antracita',
      weight: '120 kg'
    },
    stock: 8,
    rating: 4.6,
    reviews: 89,
    is_featured: true,
    is_new: true,
    created_at: '2024-02-20T14:30:00Z',
    updated_at: '2024-03-15T09:15:00Z'
  },

  // Mesas
  {
    id: '3',
    name: 'Mesa de Centro Mármol',
    description: 'Mesa de centro contemporánea con base de metal y superficie de mármol. Ideal para complementar cualquier estilo de decoración.',
    price: 799.99,
    discount_price: 599.99,
    category: 'living',
    images: [
      'https://images.unsplash.com/photo-1532372320572-cda25653a26f',
      'https://images.unsplash.com/photo-1538688525198-9b88f6f53126',
      'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace',
      'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?w=500'
    ],
    features: [
      'Superficie de mármol natural',
      'Base de metal cromado',
      'Diseño minimalista',
      'Fácil de limpiar',
      'Resistente a manchas'
    ],
    specifications: {
      dimensions: '120 x 60 x 45 cm',
      material: 'Mármol, Metal',
      color: 'Mármol Blanco con Vetas Grises',
      weight: '45 kg'
    },
    stock: 8,
    rating: 4.6,
    reviews: 89,
    is_featured: true,
    is_new: false,
    created_at: '2024-01-10T09:00:00Z',
    updated_at: '2024-03-12T11:20:00Z'
  },
  {
    id: '4',
    name: 'Mesa de Comedor Extensible',
    description: 'Mesa de comedor con sistema de extensión, perfecta para espacios versátiles.',
    price: 1499.99,
    discount_price: null,
    category: 'mesas',
    images: [
      '/images/products/mesa-comedor-1.jpg',
      '/images/products/mesa-comedor-2.jpg',
      '/images/products/mesa-comedor-3.jpg'
    ],
    features: [
      'Sistema de extensión suave',
      'Madera de roble natural',
      'Patas de acero inoxidable',
      'Capacidad para 6-10 personas'
    ],
    specifications: {
      dimensions: '180 x 90 x 75 cm (extendida: 240 x 90 x 75 cm)',
      material: 'Roble, Acero inoxidable',
      color: 'Roble natural',
      weight: '85 kg'
    },
    stock: 6,
    rating: 4.7,
    reviews: 92,
    is_featured: false,
    is_new: true,
    created_at: '2024-02-15T11:30:00Z',
    updated_at: '2024-03-14T16:45:00Z'
  },

  // Sillas
  {
    id: '5',
    name: 'Silla Eames Replica',
    description: 'Replica de la icónica silla Eames, combinando elegancia y comodidad.',
    price: 399.99,
    discount_price: 299.99,
    category: 'sillas',
    images: [
      '/images/products/silla-eames-1.jpg',
      '/images/products/silla-eames-2.jpg',
      '/images/products/silla-eames-3.jpg'
    ],
    features: [
      'Diseño ergonómico',
      'Cáscara de polipropileno',
      'Base de aluminio',
      'Acabado premium'
    ],
    specifications: {
      dimensions: '83 x 51 x 51 cm',
      material: 'Polipropileno, Aluminio',
      color: 'Negro',
      weight: '8 kg'
    },
    stock: 25,
    rating: 4.8,
    reviews: 203,
    is_featured: true,
    is_new: false,
    created_at: '2024-01-05T08:00:00Z',
    updated_at: '2024-03-11T10:30:00Z'
  },
  {
    id: '6',
    name: 'Silla de Oficina Ergonómica',
    description: 'Silla de oficina ergonómica con soporte lumbar ajustable y reposacabezas. Diseñada para largas horas de trabajo.',
    price: 299.99,
    discount_price: null,
    category: 'office',
    images: [
      'https://images.unsplash.com/photo-1505843490538-5133c6c7d0e1',
      'https://images.unsplash.com/photo-1503602642458-232111445657',
      'https://images.unsplash.com/photo-1580480055273-228ff5388ef8',
      'https://images.unsplash.com/photo-1580480055273-228ff5388ef8?w=500'
    ],
    features: [
      'Soporte lumbar ajustable',
      'Reposacabezas reclinable',
      'Brazos ajustables',
      'Asiento con espuma viscoelástica',
      'Ruedas suaves para todo tipo de pisos'
    ],
    specifications: {
      dimensions: '65 x 65 x 110 cm',
      material: 'Malla, Metal, Espuma',
      color: 'Negro con Acentos Grises',
      weight: '18 kg'
    },
    stock: 25,
    rating: 4.9,
    reviews: 215,
    is_featured: true,
    is_new: false,
    created_at: '2024-02-10T13:45:00Z',
    updated_at: '2024-03-13T14:20:00Z'
  },

  // Lámparas
  {
    id: '7',
    name: 'Lámpara de Pie LED',
    description: 'Lámpara de pie moderna con tecnología LED, múltiples niveles de intensidad y temperatura de color ajustable.',
    price: 149.99,
    discount_price: 119.99,
    category: 'lighting',
    images: [
      'https://images.unsplash.com/photo-1507473885765-e6ed057f782c',
      'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=500',
      'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=500',
      'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=500'
    ],
    features: [
      'Tecnología LED de bajo consumo',
      '5 niveles de intensidad',
      'Temperatura de color ajustable',
      'Control táctil',
      'Base estable'
    ],
    specifications: {
      dimensions: '160 x 30 x 30 cm',
      material: 'Metal, Vidrio',
      color: 'Negro Mate',
      weight: '4.5 kg'
    },
    stock: 30,
    rating: 4.7,
    reviews: 156,
    is_featured: true,
    is_new: false,
    created_at: '2024-02-25T15:20:00Z',
    updated_at: '2024-03-16T11:45:00Z'
  },
  {
    id: '8',
    name: 'Lámpara de Mesa Moderna',
    description: 'Lámpara de mesa con diseño contemporáneo y luz LED de temperatura ajustable.',
    price: 179.99,
    discount_price: null,
    category: 'lamparas',
    images: [
      '/images/products/lampara-mesa-1.jpg',
      '/images/products/lampara-mesa-2.jpg',
      '/images/products/lampara-mesa-3.jpg'
    ],
    features: [
      'Temperatura de color ajustable',
      'Base de cerámica',
      'Pantalla de tela',
      'Control táctil'
    ],
    specifications: {
      dimensions: '45 x 25 x 25 cm',
      material: 'Cerámica, Tela, LED',
      color: 'Blanco y dorado',
      weight: '2.5 kg'
    },
    stock: 30,
    rating: 4.5,
    reviews: 112,
    is_featured: false,
    is_new: true,
    created_at: '2024-02-25T15:20:00Z',
    updated_at: '2024-03-16T11:45:00Z'
  },
  {
    id: '9',
    name: 'Cama King Size con Almacenamiento',
    description: 'Cama king size con sistema de almacenamiento integrado, cabecera acolchada y diseño moderno.',
    price: 899.99,
    discount_price: 749.99,
    category: 'bedroom',
    images: [
      'https://images.unsplash.com/photo-1505693314120-0d443867891c',
      'https://images.unsplash.com/photo-1505693314120-0d443867891c?w=500',
      'https://images.unsplash.com/photo-1505693314120-0d443867891c?w=500',
      'https://images.unsplash.com/photo-1505693314120-0d443867891c?w=500'
    ],
    features: [
      'Sistema de almacenamiento integrado',
      'Cabecera acolchada',
      'Estructura de madera sólida',
      'Fácil montaje',
      'Espacio para colchón king size'
    ],
    specifications: {
      dimensions: '210 x 180 x 45 cm',
      material: 'Madera, Tela',
      color: 'Gris Claro',
      weight: '120 kg'
    },
    stock: 12,
    rating: 4.8,
    reviews: 178,
    is_featured: true,
    is_new: false,
    created_at: '2024-02-25T15:20:00Z',
    updated_at: '2024-03-16T11:45:00Z'
  },
  {
    id: '10',
    name: 'Escritorio Moderno',
    description: 'Escritorio moderno con diseño minimalista, perfecto para espacios de trabajo o estudio.',
    price: 349.99,
    discount_price: null,
    category: 'office',
    images: [
      'https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd',
      'https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?w=500',
      'https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?w=500',
      'https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?w=500'
    ],
    features: [
      'Diseño minimalista',
      'Estructura de metal resistente',
      'Superficie de madera laminada',
      'Cable management integrado',
      'Fácil montaje'
    ],
    specifications: {
      dimensions: '140 x 60 x 75 cm',
      material: 'Metal, Madera Laminada',
      color: 'Blanco con Acentos Negros',
      weight: '35 kg'
    },
    stock: 20,
    rating: 4.5,
    reviews: 92,
    is_featured: true,
    is_new: false,
    created_at: '2024-02-25T15:20:00Z',
    updated_at: '2024-03-16T11:45:00Z'
  }
]; 