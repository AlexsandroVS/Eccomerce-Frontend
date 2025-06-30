export interface Review {
  id: string;
  product_id: string;
  user_id: string;
  user_name: string;
  user_avatar?: string;
  rating: number;
  title: string;
  comment: string;
  created_at: string;
  updated_at: string;
  likes: number;
  is_verified_purchase: boolean;
  helpful_votes: number;
  images?: string[];
}

export interface ReviewStats {
  average_rating: number;
  total_reviews: number;
  rating_distribution: {
    [key: number]: number; // 1-5 stars
  };
  verified_purchases: number;
  with_images: number;
  with_comments: number;
}

export interface ReviewFormData {
  rating: number;
  title: string;
  comment: string;
  images?: File[];
} 