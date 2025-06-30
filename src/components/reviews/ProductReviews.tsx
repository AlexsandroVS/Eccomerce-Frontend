import React, { useState } from 'react';
import { Star, ThumbsUp, Image as ImageIcon, CheckCircle } from 'lucide-react';
import type { Review, ReviewStats, ReviewFormData } from '../../types/review.types';
import { reviews, reviewStats } from '../../data/reviews';

interface ProductReviewsProps {
  productId: string;
}

const ProductReviews: React.FC<ProductReviewsProps> = ({ productId }) => {
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [reviewForm, setReviewForm] = useState<ReviewFormData>({
    rating: 0,
    title: '',
    comment: '',
  });
  const [selectedImages, setSelectedImages] = useState<File[]>([]);

  const handleRatingChange = (rating: number) => {
    setReviewForm(prev => ({ ...prev, rating }));
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setReviewForm(prev => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newImages = Array.from(e.target.files);
      setSelectedImages(prev => [...prev, ...newImages]);
    }
  };

  const handleSubmitReview = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Implementar lógica real de envío de reseña
    console.log('Enviando reseña:', { ...reviewForm, images: selectedImages });
    setShowReviewForm(false);
    setReviewForm({ rating: 0, title: '', comment: '' });
    setSelectedImages([]);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="mt-12">
      {/* Resumen de Reseñas */}
      <div className="bg-white rounded-lg p-6 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Calificación Promedio */}
          <div className="flex items-center space-x-4">
            <div className="text-4xl font-bold text-accent">
              {reviewStats.average_rating.toFixed(1)}
            </div>
            <div>
              <div className="flex items-center">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    size={20}
                    className={`${
                      i < Math.floor(reviewStats.average_rating)
                        ? 'text-yellow-400 fill-current'
                        : 'text-gray-300'
                    }`}
                  />
                ))}
              </div>
              <p className="text-sm text-gray-500 mt-1">
                Basado en {reviewStats.total_reviews} reseñas
              </p>
            </div>
          </div>

          {/* Distribución de Calificaciones */}
          <div className="space-y-2">
            {[5, 4, 3, 2, 1].map((rating) => (
              <div key={rating} className="flex items-center">
                <span className="text-sm text-gray-600 w-8">{rating} estrellas</span>
                <div className="flex-1 h-2 bg-gray-200 rounded-full mx-2">
                  <div
                    className="h-full bg-accent rounded-full"
                    style={{
                      width: `${(reviewStats.rating_distribution[rating] / reviewStats.total_reviews) * 100}%`
                    }}
                  />
                </div>
                <span className="text-sm text-gray-600 w-12">
                  {reviewStats.rating_distribution[rating]}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Estadísticas Adicionales */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-6 pt-6 border-t">
          <div className="flex items-center space-x-2">
            <CheckCircle size={20} className="text-green-500" />
            <span className="text-sm text-gray-600">
              {reviewStats.verified_purchases} compras verificadas
            </span>
          </div>
          <div className="flex items-center space-x-2">
            <ImageIcon size={20} className="text-blue-500" />
            <span className="text-sm text-gray-600">
              {reviewStats.with_images} reseñas con fotos
            </span>
          </div>
          <div className="flex items-center space-x-2">
            <ThumbsUp size={20} className="text-accent" />
            <span className="text-sm text-gray-600">
              {reviewStats.with_comments} reseñas con comentarios
            </span>
          </div>
        </div>
      </div>

      {/* Botón para Escribir Reseña */}
      <button
        onClick={() => setShowReviewForm(true)}
        className="w-full md:w-auto px-6 py-3 bg-accent text-white rounded-lg hover:bg-accent/90 transition-colors mb-8"
      >
        Escribir una reseña
      </button>

      {/* Formulario de Reseña */}
      {showReviewForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-semibold mb-4">Escribir una reseña</h3>
            <form onSubmit={handleSubmitReview} className="space-y-4">
              {/* Calificación */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Calificación
                </label>
                <div className="flex space-x-2">
                  {[1, 2, 3, 4, 5].map((rating) => (
                    <button
                      key={rating}
                      type="button"
                      onClick={() => handleRatingChange(rating)}
                      className="p-2 hover:scale-110 transition-transform"
                    >
                      <Star
                        size={24}
                        className={`${
                          rating <= reviewForm.rating
                            ? 'text-yellow-400 fill-current'
                            : 'text-gray-300'
                        }`}
                      />
                    </button>
                  ))}
                </div>
              </div>

              {/* Título */}
              <div>
                <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                  Título
                </label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  value={reviewForm.title}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent"
                  required
                />
              </div>

              {/* Comentario */}
              <div>
                <label htmlFor="comment" className="block text-sm font-medium text-gray-700 mb-2">
                  Comentario
                </label>
                <textarea
                  id="comment"
                  name="comment"
                  value={reviewForm.comment}
                  onChange={handleInputChange}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent"
                  required
                />
              </div>

              {/* Imágenes */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Fotos (opcional)
                </label>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleImageChange}
                  className="w-full"
                />
                {selectedImages.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-2">
                    {selectedImages.map((file, index) => (
                      <div key={index} className="relative">
                        <img
                          src={URL.createObjectURL(file)}
                          alt={`Preview ${index + 1}`}
                          className="w-20 h-20 object-cover rounded-lg"
                        />
                        <button
                          type="button"
                          onClick={() => setSelectedImages(prev => prev.filter((_, i) => i !== index))}
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Botones */}
              <div className="flex justify-end space-x-4 mt-6">
                <button
                  type="button"
                  onClick={() => setShowReviewForm(false)}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-accent text-white rounded-lg hover:bg-accent/90"
                >
                  Publicar reseña
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Lista de Reseñas */}
      <div className="space-y-6">
        {reviews.map((review) => (
          <div key={review.id} className="bg-white rounded-lg p-6">
            {/* Encabezado de la Reseña */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center space-x-4">
                <img
                  src={review.user_avatar}
                  alt={review.user_name}
                  className="w-12 h-12 rounded-full"
                />
                <div>
                  <h4 className="font-medium text-gray-900">{review.user_name}</h4>
                  <div className="flex items-center space-x-2">
                    <div className="flex">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          size={16}
                          className={`${
                            i < review.rating
                              ? 'text-yellow-400 fill-current'
                              : 'text-gray-300'
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-sm text-gray-500">
                      {formatDate(review.created_at)}
                    </span>
                  </div>
                </div>
              </div>
              {review.is_verified_purchase && (
                <span className="flex items-center text-sm text-green-600">
                  <CheckCircle size={16} className="mr-1" />
                  Compra verificada
                </span>
              )}
            </div>

            {/* Contenido de la Reseña */}
            <h5 className="font-medium text-gray-900 mb-2">{review.title}</h5>
            <p className="text-gray-600 mb-4">{review.comment}</p>

            {/* Imágenes de la Reseña */}
            {review.images && review.images.length > 0 && (
              <div className="flex space-x-2 mb-4">
                {review.images.map((image, index) => (
                  <img
                    key={index}
                    src={image}
                    alt={`Review image ${index + 1}`}
                    className="w-24 h-24 object-cover rounded-lg"
                  />
                ))}
              </div>
            )}

            {/* Acciones de la Reseña */}
            <div className="flex items-center justify-between pt-4 border-t">
              <div className="flex items-center space-x-4">
                <button className="flex items-center space-x-1 text-gray-500 hover:text-accent">
                  <ThumbsUp size={16} />
                  <span>Útil ({review.helpful_votes})</span>
                </button>
                <button className="text-gray-500 hover:text-accent">
                  Responder
                </button>
              </div>
              <button className="text-gray-500 hover:text-accent">
                Reportar
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProductReviews; 