import type { Review, ReviewStats } from '../types/review.types';

export const reviewStats: ReviewStats = {
  average_rating: 4.5,
  total_reviews: 128,
  rating_distribution: {
    5: 85,
    4: 25,
    3: 10,
    2: 5,
    1: 3
  },
  verified_purchases: 98,
  with_images: 45,
  with_comments: 120
};

export const reviews: Review[] = [
  {
    id: '1',
    product_id: '1',
    user_id: 'user1',
    user_name: 'María González',
    user_avatar: 'https://i.pravatar.cc/150?img=1',
    rating: 5,
    title: 'Excelente calidad y diseño',
    comment: 'El sofá superó todas mis expectativas. Es muy cómodo y el diseño es moderno y elegante. La calidad de los materiales es excelente y el ensamblaje fue perfecto. Definitivamente lo recomiendo.',
    created_at: '2024-03-15T10:30:00Z',
    updated_at: '2024-03-15T10:30:00Z',
    likes: 12,
    is_verified_purchase: true,
    helpful_votes: 8,
    images: [
      'https://images.unsplash.com/photo-1555041469-a586c61ea9bc',
      'https://images.unsplash.com/photo-1567016432779-094069958ea5'
    ]
  },
  {
    id: '2',
    product_id: '1',
    user_id: 'user2',
    user_name: 'Carlos Rodríguez',
    user_avatar: 'https://i.pravatar.cc/150?img=2',
    rating: 4,
    title: 'Buen producto con pequeños detalles',
    comment: 'El sofá es muy cómodo y se ve exactamente como en las fotos. La única razón por la que no le doy 5 estrellas es porque tardó un poco más de lo esperado en llegar, pero valió la pena la espera.',
    created_at: '2024-03-10T15:45:00Z',
    updated_at: '2024-03-10T15:45:00Z',
    likes: 5,
    is_verified_purchase: true,
    helpful_votes: 3
  },
  {
    id: '3',
    product_id: '1',
    user_id: 'user3',
    user_name: 'Ana Martínez',
    user_avatar: 'https://i.pravatar.cc/150?img=3',
    rating: 5,
    title: 'Perfecto para mi sala',
    comment: 'Me encantó el sofá desde que lo vi en la tienda. Es exactamente lo que estaba buscando: moderno, cómodo y de buena calidad. El servicio de entrega fue impecable.',
    created_at: '2024-03-05T09:15:00Z',
    updated_at: '2024-03-05T09:15:00Z',
    likes: 8,
    is_verified_purchase: true,
    helpful_votes: 6,
    images: [
      'https://images.unsplash.com/photo-1493663284031-b7e3aefcae8e'
    ]
  },
  {
    id: '4',
    product_id: '1',
    user_id: 'user4',
    user_name: 'Juan Pérez',
    user_avatar: 'https://i.pravatar.cc/150?img=4',
    rating: 3,
    title: 'Regular, podría mejorar',
    comment: 'El sofá es cómodo pero el color es un poco diferente al que se muestra en las fotos. La calidad es buena pero el precio me parece un poco alto para lo que ofrece.',
    created_at: '2024-03-01T14:20:00Z',
    updated_at: '2024-03-01T14:20:00Z',
    likes: 2,
    is_verified_purchase: true,
    helpful_votes: 1
  },
  {
    id: '5',
    product_id: '1',
    user_id: 'user5',
    user_name: 'Laura Sánchez',
    user_avatar: 'https://i.pravatar.cc/150?img=5',
    rating: 5,
    title: 'Increíble relación calidad-precio',
    comment: 'Por el precio que tiene, este sofá es una excelente compra. Es muy cómodo, se ve elegante y la calidad de los materiales es muy buena. El proceso de compra y entrega fue muy sencillo.',
    created_at: '2024-02-28T11:10:00Z',
    updated_at: '2024-02-28T11:10:00Z',
    likes: 15,
    is_verified_purchase: true,
    helpful_votes: 12,
    images: [
      'https://images.unsplash.com/photo-1524758631624-e2822e304c36',
      'https://images.unsplash.com/photo-1538688525198-9b88f6f53126'
    ]
  }
]; 