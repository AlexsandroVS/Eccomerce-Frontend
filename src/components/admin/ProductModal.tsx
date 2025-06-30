import React, { useEffect } from 'react';
import { X } from 'lucide-react';
import ProductForm from './ProductForm';

interface ProductFormData {
  name: string;
  description: string;
  price: number;
  category_id: string;
  status: 'draft' | 'published' | 'archived';
  images: Array<{ id: string; url: string; file: File }>;
  variants: Array<{
    id: string;
    name: string;
    price_adjustment: number;
    stock: number;
    sku: string;
    images: Array<{ id: string; url: string; file: File }>;
  }>;
  stock: number;
  sku: string;
  brand: string;
  tags: string[];
}

interface ProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: ProductFormData) => void;
  initialData?: Partial<ProductFormData>;
}

const ProductModal: React.FC<ProductModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  initialData
}) => {
  // Manejar el cierre con la tecla Escape
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      // Prevenir el scroll del body cuando el modal está abierto
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  // Manejar el clic fuera del modal
  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 overflow-y-auto"
      onClick={handleBackdropClick}
    >
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        {/* Overlay */}
        <div 
          className="fixed inset-0 transition-opacity" 
          aria-hidden="true"
        >
          <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
        </div>

        {/* Centering trick */}
        <span 
          className="hidden sm:inline-block sm:align-middle sm:h-screen" 
          aria-hidden="true"
        >
          &#8203;
        </span>

        {/* Modal panel */}
        <div 
          className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-4xl sm:w-full max-h-[90vh] overflow-y-auto"
          onClick={e => e.stopPropagation()} // Prevenir que el clic en el modal cierre el modal
        >
          <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-900">
                {initialData ? 'Editar producto' : 'Nuevo producto'}
              </h3>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-accent/50 rounded-full p-1"
                aria-label="Cerrar modal"
              >
                <X size={24} />
              </button>
            </div>
            <div className="mt-2">
              <ProductForm
                initialData={{...initialData, email: initialData?.email || 'admin@gmail.com'}}
                onSubmit={(data) => {
                  onSubmit(data);
                  onClose(); // Cerrar el modal después de enviar
                }}
                onCancel={onClose}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductModal; 