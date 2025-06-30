import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
    Save,
    ArrowLeft,
    Image,
    X,
    Plus,
    AlertCircle,
    Package,
    DollarSign,
    FileText,
    Tag,
    Upload,
    Trash2,
    Star,
    StarOff,
    RefreshCw,
    Folder,
    Settings} from 'lucide-react';
import { useCategories } from '../../hooks/useCategories';
import { useProducts } from '../../hooks/useProducts';
import { useAttributes } from '../../hooks/useAttributes';
import type { ProductCreateData, ProductUpdateData, ProductType } from '../../types/product.types';

// Tipos para el formulario
interface FormData {
    name: string;
    sku: string;
    slug: string;
    description: string;
    type: ProductType;
    base_price: string;
    stock: string;
    attributes: Record<string, string>;
    categories: number[];
    images: File[]; // Añadido para manejar imágenes en el formulario
    primaryImageIndex: number; // Índice de la imagen primaria
}

interface Toast {
    message: string;
    type: 'success' | 'error' | 'info';
    id: number;
}

interface ValidationError {
    field: string;
    message: string;
}

// Componente de notificación
const ToastNotification = ({ toast, onClose }: { toast: Toast; onClose: (id: number) => void }) => (
    <div className={`fixed top-4 right-4 z-50 p-4 rounded-lg shadow-xl max-w-md animate-in slide-in-from-top-2 ${toast.type === 'success'
        ? 'bg-green-50 border border-green-200'
        : toast.type === 'error'
            ? 'bg-red-50 border border-red-200'
            : 'bg-blue-50 border border-blue-200'
        }`}>
        <div className="flex items-center gap-3">
            {toast.type === 'success' ? (
                <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-white text-sm font-bold">✓</span>
                </div>
            ) : toast.type === 'error' ? (
                <AlertCircle className="text-red-500 flex-shrink-0" size={20} />
            ) : (
                <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-white text-sm font-bold">i</span>
                </div>
            )}
            <p className={`text-sm flex-1 ${toast.type === 'success'
                ? 'text-green-700'
                : toast.type === 'error'
                    ? 'text-red-700'
                    : 'text-blue-700'
                }`}>
                {toast.message}
            </p>
            <button
                onClick={() => onClose(toast.id)}
                className={`ml-2 text-xl leading-none hover:opacity-70 transition-opacity ${toast.type === 'success'
                    ? 'text-green-500'
                    : toast.type === 'error'
                        ? 'text-red-500'
                        : 'text-blue-500'
                    }`}
            >
                ×
            </button>
        </div>
    </div>
);

// Componente para gestión de imágenes mejorado
const ImageManager = ({
    images,
    onImagesChange,
    uploadedImages = [],
    onImageDeleted,
    onPrimaryChanged,
    onPrimaryImageIndexChanged}: {
    images: File[];
    onImagesChange: (images: File[]) => void;
    uploadedImages?: any[];
    onImageUploaded?: (image: any) => void;
    onImageDeleted?: (imageId: string) => void;
    onPrimaryChanged?: (imageId: string) => void;
    onPrimaryImageIndexChanged?: (index: number) => void;
    productId?: string;
}) => {
    const [previews, setPreviews] = useState<string[]>([]);
    const [primaryImageIndex, setPrimaryImageIndex] = useState<number>(-1);

    // Generar previews de las imágenes seleccionadas
    useEffect(() => {
        const newPreviews = images.map(file => URL.createObjectURL(file));
        setPreviews(newPreviews);

        // Si es la primera imagen y no hay imagen primaria, marcarla como primaria
        if (images.length === 1 && primaryImageIndex === -1 && uploadedImages.length === 0) {
            setPrimaryImageIndex(0);
            onPrimaryImageIndexChanged?.(0);
        }

        return () => {
            newPreviews.forEach(url => URL.revokeObjectURL(url));
        };
    }, [images, primaryImageIndex, uploadedImages.length, onPrimaryImageIndexChanged]);

    const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(event.target.files || []);
        if (files.length > 0) {
            onImagesChange([...images, ...files]);
        }
        // Reset input
        event.target.value = '';
    };

    const removeImage = (index: number) => {
        const newImages = images.filter((_, i) => i !== index);
        onImagesChange(newImages);
        
        // Ajustar índice de imagen primaria
        if (primaryImageIndex === index) {
            setPrimaryImageIndex(-1);
            onPrimaryImageIndexChanged?.(-1);
        } else if (primaryImageIndex > index) {
            const newIndex = primaryImageIndex - 1;
            setPrimaryImageIndex(newIndex);
            onPrimaryImageIndexChanged?.(newIndex);
        }
    };

    const setPrimaryImage = (index: number) => {
        setPrimaryImageIndex(index);
        onPrimaryImageIndexChanged?.(index);
    };

    const hasPrimaryImage = uploadedImages.some(img => img.is_primary) || primaryImageIndex !== -1;

    return (
        <div className="bg-white p-4 sm:p-6 rounded-lg shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Image size={20} />
                Imágenes del Producto
            </h3>

            {/* Upload area */}
            <div className="mb-6">
                <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors">
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        <Upload className="w-8 h-8 mb-2 text-gray-400" />
                        <p className="mb-2 text-sm text-gray-500 text-center px-2">
                            <span className="font-semibold">Click para subir</span> o arrastra imágenes
                        </p>
                        <p className="text-xs text-gray-500">PNG, JPG, WEBP (MAX. 5MB c/u)</p>
                    </div>
                    <input
                        type="file"
                        className="hidden"
                        accept="image/*"
                        multiple
                        onChange={handleFileUpload}
                    />
                </label>
            </div>

            {/* Imágenes pendientes de subir */}
            {images.length > 0 && (
                <div className="mb-6">
                    <h4 className="text-sm font-medium text-gray-700 mb-3">Imágenes a subir ({images.length})</h4>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                        {images.map((_file, index) => (
                            <div key={index} className="relative group">
                                <div className="aspect-square bg-gray-200 rounded-lg overflow-hidden">
                                    <img
                                        src={previews[index]}
                                        alt={`Preview ${index + 1}`}
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                                
                                {/* Botón de imagen primaria */}
                                <button
                                    onClick={() => setPrimaryImage(index)}
                                    className={`absolute top-2 left-2 p-1 rounded-full transition-colors ${
                                        primaryImageIndex === index 
                                            ? 'bg-yellow-500 text-white' 
                                            : 'bg-white/80 text-gray-600 hover:bg-yellow-500 hover:text-white'
                                    }`}
                                    title={primaryImageIndex === index ? 'Imagen principal' : 'Marcar como principal'}
                                    disabled={hasPrimaryImage && primaryImageIndex !== index}
                                >
                                    {primaryImageIndex === index ? <Star size={14} /> : <StarOff size={14} />}
                                </button>
                                
                                {/* Botón de eliminar */}
                                <button
                                    onClick={() => removeImage(index)}
                                    className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors opacity-0 group-hover:opacity-100"
                                    title="Eliminar imagen"
                                >
                                    <X size={12} />
                                </button>
                                
                                {/* Badge de imagen primaria */}
                                {primaryImageIndex === index && (
                                    <div className="absolute bottom-2 left-2">
                                        <span className="bg-yellow-500 text-white text-xs px-2 py-1 rounded-full flex items-center gap-1">
                                            <Star size={10} />
                                            Principal
                                        </span>
                                    </div>
                                )}
                                
                                {/* Badge de nuevo */}
                                <div className="absolute bottom-2 right-2">
                                    <span className="bg-blue-500 text-white text-xs px-2 py-1 rounded">
                                        Nuevo
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Imágenes ya subidas (solo en modo edición) */}
            {uploadedImages.length > 0 && (
                <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-3">Imágenes actuales ({uploadedImages.length})</h4>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                        {uploadedImages.map((image) => (
                            <div key={image.id} className="relative group">
                                <div className="aspect-square bg-gray-200 rounded-lg overflow-hidden">
                                    <img
                                        src={image.url}
                                        alt={image.alt_text || 'Product image'}
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all duration-200 rounded-lg flex items-center justify-center gap-2">
                                    <button
                                        onClick={() => onPrimaryChanged?.(image.id)}
                                        className={`p-2 rounded-full transition-all duration-200 opacity-0 group-hover:opacity-100 ${image.is_primary
                                            ? 'bg-yellow-500 text-white'
                                            : 'bg-white text-gray-700 hover:bg-yellow-500 hover:text-white'
                                            }`}
                                        title={image.is_primary ? 'Imagen principal' : 'Marcar como principal'}
                                    >
                                        {image.is_primary ? <Star size={16} /> : <StarOff size={16} />}
                                    </button>
                                    <button
                                        onClick={() => onImageDeleted?.(image.id)}
                                        className="p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-all duration-200 opacity-0 group-hover:opacity-100"
                                        title="Eliminar imagen"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                                {image.is_primary && (
                                    <div className="absolute top-2 left-2">
                                        <span className="bg-yellow-500 text-white text-xs px-2 py-1 rounded-full flex items-center gap-1">
                                            <Star size={12} />
                                            Principal
                                        </span>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {images.length === 0 && uploadedImages.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                    <Image className="mx-auto h-12 w-12 text-gray-300 mb-2" />
                    <p className="text-sm">No hay imágenes seleccionadas</p>
                    <p className="text-xs mt-1">Puedes subir múltiples imágenes a la vez</p>
                </div>
            )}
        </div>
    );
};

// Componente principal
const ProductFormPage = () => {
    const navigate = useNavigate();
    const { id: productId } = useParams<{ id: string }>();
    const isEdit = Boolean(productId);

    // Hooks
    const {
        creating,
        updating,
        createProduct,
        updateProduct,
        getProductById,
        uploadImage,
        deleteImage
    } = useProducts();

    const {
        categories,
        loading: loadingCategories,
        fetchCategories
    } = useCategories();

    const {
        predefinedAttributes,
        allAttributes,
        addPredefinedAttribute,
        addCustomAttribute,
        removeAttribute,
        loadExistingAttributes,
        getAttributesForBackend
    } = useAttributes();

    // Estado local
    const [formData, setFormData] = useState<FormData>({
        name: '',
        sku: '',
        slug: '',
        description: '',
        type: 'SIMPLE', // Por defecto SIMPLE
        base_price: '',
        stock: '',
        attributes: {},
        categories: [],
        images: [], // Añadido para manejar imágenes
        primaryImageIndex: -1 // Índice de la imagen primaria
    });

    const [uploadedImages, setUploadedImages] = useState<any[]>([]);
    const [newAttribute, setNewAttribute] = useState({ name: '', value: '' });
    const [errors, setErrors] = useState<ValidationError[]>([]);
    const [toasts, setToasts] = useState<Toast[]>([]);
    const [isDirty, setIsDirty] = useState(false);

    // Cargar datos del producto si estamos en modo edición
    useEffect(() => {
        if (isEdit && productId) {
            const product = getProductById(productId);
            if (product) {
                // Convertir atributos de array a objeto
                const attributesObject: Record<string, string> = {};
                if (product.attributes && Array.isArray(product.attributes)) {
                    product.attributes.forEach(attr => {
                        attributesObject[attr.name] = attr.value;
                    });
                }

                setFormData({
                    name: product.name || '',
                    sku: product.sku || '',
                    slug: product.slug || '',
                    description: product.description || '',
                    type: product.type || 'SIMPLE',
                    base_price: product.base_price?.toString() || '',
                    stock: product.stock?.toString() || '',
                    attributes: attributesObject,
                    categories: product.categories?.map(c => c.id) || [],
                    images: [],
                    primaryImageIndex: product.images?.findIndex(img => img.is_primary) || -1
                });
                setUploadedImages(product.images || []);
                loadExistingAttributes(attributesObject);
            }
        }
    }, [isEdit, productId, getProductById, loadExistingAttributes]);

    // Cargar categorías
    useEffect(() => {
        fetchCategories();
    }, [fetchCategories]);

    // Generar slug automáticamente
    useEffect(() => {
        if (formData.name) {
            const slug = formData.name
                .toLowerCase()
                .replace(/[^a-z0-9]+/g, '-')
                .replace(/(^-|-$)/g, '');
            setFormData(prev => ({ ...prev, slug }));
        }
    }, [formData.name]);

    // Marcar como modificado cuando cambie el formulario
    useEffect(() => {
        setIsDirty(true);
    }, [formData]);

    // Funciones de notificación
    const addToast = (message: string, type: Toast['type']) => {
        const id = Date.now();
        setToasts(prev => [...prev, { message, type, id }]);
        setTimeout(() => removeToast(id), 5000);
    };

    const removeToast = (id: number) => {
        setToasts(prev => prev.filter(t => t.id !== id));
    };

    // Validación del formulario
    const validateForm = (): boolean => {
        const newErrors: ValidationError[] = [];

        if (!formData.name.trim()) {
            newErrors.push({ field: 'name', message: 'El nombre es requerido' });
        }

        if (!formData.sku.trim()) {
            newErrors.push({ field: 'sku', message: 'El SKU es requerido' });
        }

        if (!formData.base_price || parseFloat(formData.base_price) <= 0) {
            newErrors.push({ field: 'base_price', message: 'El precio debe ser mayor a 0' });
        }

        if (formData.categories.length === 0) {
            newErrors.push({ field: 'categories', message: 'Debe seleccionar al menos una categoría' });
        }

        setErrors(newErrors);
        return newErrors.length === 0;
    };

    // Manejar cambios en los campos del formulario
    const handleInputChange = (field: keyof FormData, value: any) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        setIsDirty(true);
    };

    // Agregar atributo personalizado
    const addAttribute = () => {
        if (newAttribute.name && newAttribute.value) {
            addCustomAttribute(newAttribute.name, newAttribute.value);
            setNewAttribute({ name: '', value: '' });
            setIsDirty(true);
        }
    };

    // Remover atributo (wrapper para el hook)
    const removeAttributeFromForm = (name: string, value: string) => {
        removeAttribute(name, value);
        setIsDirty(true);
    };

    // Generar SKU automático
    const generateSKU = () => {
        if (formData.name) {
            const newSKU = formData.name
                .toUpperCase()
                .replace(/[^A-Z0-9]/g, '')
                .substring(0, 8) + '-' + Math.random().toString(36).substring(2, 6).toUpperCase();
            handleInputChange('sku', newSKU);
        }
    };

    // Subir imágenes
    const uploadImages = async (productId: string) => {
        try {
            for (let i = 0; i < formData.images.length; i++) {
                const image = formData.images[i];
                await uploadImage({
                    product_id: productId,
                    file: image,
                    is_primary: i === formData.primaryImageIndex
                });
            }
            return true;
        } catch (error) {
            console.error('Error uploading images:', error);
            addToast('Error al subir las imágenes', 'error');
            return false;
        }
    };

    // Manejar envío del formulario
    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();

        if (!validateForm()) {
            addToast('Por favor, corrige los errores en el formulario', 'error');
            return;
        }

        try {
            // Preparar datos para el backend
            const productData = {
                name: formData.name,
                sku: formData.sku,
                slug: formData.slug,
                description: formData.description,
                type: formData.type,
                base_price: parseFloat(formData.base_price),
                stock: parseFloat(formData.stock),
                attributes: getAttributesForBackend(), // Usar el hook para obtener atributos
                categories: formData.categories // Cambiar a categories para coincidir con el tipo
            };

            if (isEdit && productId) {
                await updateProduct(productId, productData as ProductUpdateData);
                addToast('Producto actualizado exitosamente', 'success');
            } else {
                const newProduct = await createProduct(productData as ProductCreateData);
                if (newProduct) {
                    addToast('Producto creado exitosamente', 'success');
                    
                    // Subir imágenes si hay
                    if (formData.images.length > 0) {
                        await uploadImages(newProduct.id);
                    }
                }
            }

            navigate('/admin/products');
        } catch (error) {
            addToast('Error al guardar el producto', 'error');
        }
    };

    // Obtener error de campo específico
    const getFieldError = (field: string): string | undefined => {
        return errors.find(error => error.field === field)?.message;
    };

    // Manejar imágenes subidas
    const handleImageDeleted = async (imageId: string) => {
        if (!productId) return;

        try {
            await deleteImage(productId, imageId);
            setUploadedImages(prev => prev.filter(img => img.id !== imageId));
            addToast('Imagen eliminada', 'success');
        } catch (error) {
            addToast('Error al eliminar la imagen', 'error');
        }
    };

    const handlePrimaryChanged = (imageId: string) => {
        setUploadedImages(prev =>
            prev.map(img => ({
                ...img,
                is_primary: img.id === imageId
            }))
        );
        addToast('Imagen principal actualizada', 'success');
    };

    // Navegar a gestión de variantes (solo en modo edición)
    const handleManageVariants = () => {
        if (productId) {
            navigate(`/admin/products/${productId}/variants`);
        }
    };

    const isLoading = creating || updating;

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Toasts */}
            {toasts.map(toast => (
                <ToastNotification key={toast.id} toast={toast} onClose={removeToast} />
            ))}

            {/* Header */}
            <div className="bg-white border-b border-gray-200 px-4 sm:px-6 lg:px-8">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between py-4 gap-4">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => navigate('/admin/products')}
                            className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-colors"
                        >
                            <ArrowLeft size={20} />
                        </button>
                        <div>
                            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
                                {isEdit ? 'Editar Producto' : 'Crear Producto'}
                            </h1>
                            <p className="text-gray-600 mt-1 text-sm sm:text-base">
                                {isEdit ? 'Modifica la información del producto' : 'Completa la información para crear un nuevo producto'}
                            </p>
                        </div>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-3">
                        {isEdit && (
                            <button
                                onClick={handleManageVariants}
                                className="px-4 sm:px-6 py-2 sm:py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-semibold transition-colors shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
                            >
                                <Settings size={20} />
                                Gestionar Variantes
                            </button>
                        )}
                        <button
                            type="button"
                            onClick={() => navigate('/admin/products')}
                            className="px-4 sm:px-6 py-2 sm:py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-center"
                        >
                            Cancelar
                        </button>
                        <button
                            form="product-form"
                            type="submit"
                            disabled={isLoading}
                            className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-lg font-semibold transition-colors shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
                        >
                            {isLoading ? (
                                <RefreshCw size={20} className="animate-spin" />
                            ) : (
                                <Save size={20} />
                            )}
                            {isLoading ? 'Guardando...' : isEdit ? 'Actualizar' : 'Crear Producto'}
                        </button>
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="px-4 sm:px-6 lg:px-8 py-6">
                <form id="product-form" onSubmit={handleSubmit} className="max-w-7xl mx-auto">
                    <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
                        {/* Columna principal */}
                        <div className="xl:col-span-3 space-y-6">
                            {/* Información básica */}
                            <div className="bg-white p-4 sm:p-6 rounded-lg shadow-sm">
                                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                    <Package size={20} />
                                    Información Básica
                                </h3>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="md:col-span-2">
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Nombre del Producto *
                                        </label>
                                        <input
                                            type="text"
                                            value={formData.name}
                                            onChange={(e) => handleInputChange('name', e.target.value)}
                                            className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${getFieldError('name') ? 'border-red-500' : 'border-gray-300'
                                                }`}
                                            placeholder="Ingresa el nombre del producto"
                                        />
                                        {getFieldError('name') && (
                                            <p className="mt-1 text-sm text-red-600">{getFieldError('name')}</p>
                                        )}
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            SKU *
                                        </label>
                                        <div className="flex gap-2">
                                            <input
                                                type="text"
                                                value={formData.sku}
                                                onChange={(e) => handleInputChange('sku', e.target.value.toUpperCase())}
                                                className={`flex-1 px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${getFieldError('sku') ? 'border-red-500' : 'border-gray-300'
                                                    }`}
                                                placeholder="SKU-PRODUCTO"
                                            />
                                            <button
                                                type="button"
                                                onClick={generateSKU}
                                                className="px-3 sm:px-4 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm whitespace-nowrap"
                                                title="Generar SKU automático"
                                            >
                                                Auto
                                            </button>
                                        </div>
                                        {getFieldError('sku') && (
                                            <p className="mt-1 text-sm text-red-600">{getFieldError('sku')}</p>
                                        )}
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Slug
                                        </label>
                                        <input
                                            type="text"
                                            value={formData.slug}
                                            onChange={(e) => handleInputChange('slug', e.target.value)}
                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            placeholder="slug-del-producto"
                                        />
                                        <p className="mt-1 text-xs text-gray-500">
                                            Se genera automáticamente del nombre
                                        </p>
                                    </div>

                                    <div className="md:col-span-2">
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Descripción
                                        </label>
                                        <textarea
                                            value={formData.description}
                                            onChange={(e) => handleInputChange('description', e.target.value)}
                                            rows={4}
                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            placeholder="Describe las características y beneficios del producto..."
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Precio y tipo */}
                            <div className="bg-white p-4 sm:p-6 rounded-lg shadow-sm">
                                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                    <DollarSign size={20} />
                                    Precio Base
                                </h3>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {/* Campo de precio base */}
                                    <div className="col-span-6 sm:col-span-3">
                                        <label htmlFor="base_price" className="block text-sm font-medium text-gray-700 mb-1">
                                            Precio Base
                                        </label>
                                        <div className="relative rounded-md shadow-sm">
                                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                <DollarSign size={16} className="text-gray-400" />
                                            </div>
                                            <input
                                                type="number"
                                                name="base_price"
                                                id="base_price"
                                                min="0"
                                                step="0.01"
                                                value={formData.base_price}
                                                onChange={(e) => handleInputChange('base_price', e.target.value)}
                                                className={`block w-full pl-10 pr-12 sm:text-sm rounded-md ${getFieldError('base_price')
                                                    ? 'border-red-300 text-red-900 placeholder-red-300 focus:ring-red-500 focus:border-red-500'
                                                    : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
                                                    }`}
                                                placeholder="0.00"
                                            />
                                            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                                                <span className="text-gray-500 sm:text-sm">USD</span>
                                            </div>
                                        </div>
                                        {getFieldError('base_price') && (
                                            <p className="mt-2 text-sm text-red-600">{getFieldError('base_price')}</p>
                                        )}
                                    </div>

                                    {/* Campo de stock */}
                                    <div className="col-span-6 sm:col-span-3">
                                        <label htmlFor="stock" className="block text-sm font-medium text-gray-700 mb-1">
                                            Stock
                                        </label>
                                        <div className="relative rounded-md shadow-sm">
                                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                <Package size={16} className="text-gray-400" />
                                            </div>
                                            <input
                                                type="number"
                                                name="stock"
                                                id="stock"
                                                min="0"
                                                value={formData.stock}
                                                onChange={(e) => handleInputChange('stock', e.target.value)}
                                                className={`block w-full pl-10 sm:text-sm rounded-md ${getFieldError('stock')
                                                    ? 'border-red-300 text-red-900 placeholder-red-300 focus:ring-red-500 focus:border-red-500'
                                                    : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
                                                    }`}
                                                placeholder="Cantidad disponible"
                                            />
                                        </div>
                                        {getFieldError('stock') && (
                                            <p className="mt-2 text-sm text-red-600">{getFieldError('stock')}</p>
                                        )}
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Tipo de Producto
                                        </label>
                                        <div className="px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg">
                                            <span className="text-sm text-gray-700 font-medium">Producto Simple</span>
                                            <p className="text-xs text-gray-500 mt-1">Los productos simples son la opción por defecto</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Atributos */}
                            <div className="bg-white p-4 sm:p-6 rounded-lg shadow-sm">
                                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                    <Tag size={20} />
                                    Atributos del Producto
                                </h3>

                                {/* Atributos predefinidos principales */}
                                <div className="mb-6">
                                    <h4 className="text-sm font-medium text-gray-700 mb-3">Atributos Principales</h4>
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                        {predefinedAttributes.slice(0, 6).map((attribute) => (
                                            <div key={attribute.id} className="border border-gray-200 rounded-lg p-3">
                                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                                    {attribute.name}
                                                </label>
                                                <select
                                                    onChange={(e) => {
                                                        if (e.target.value) {
                                                            addPredefinedAttribute(attribute.id, e.target.value);
                                                        }
                                                    }}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                                                >
                                                    <option value="">Seleccionar {attribute.name}</option>
                                                    {attribute.values.map((value) => (
                                                        <option key={value} value={value}>
                                                            {value}
                                                        </option>
                                                    ))}
                                                </select>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Agregar atributo personalizado */}
                                <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                                    <h4 className="text-sm font-medium text-gray-700 mb-3">Agregar Atributo Personalizado</h4>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                                        <input
                                            type="text"
                                            placeholder="Nombre del atributo"
                                            value={newAttribute.name}
                                            onChange={(e) => setNewAttribute(prev => ({ ...prev, name: e.target.value }))}
                                            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        />
                                        <input
                                            type="text"
                                            placeholder="Valor del atributo"
                                            value={newAttribute.value}
                                            onChange={(e) => setNewAttribute(prev => ({ ...prev, value: e.target.value }))}
                                            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        />
                                        <button
                                            type="button"
                                            onClick={addAttribute}
                                            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
                                        >
                                            <Plus size={16} />
                                            Agregar
                                        </button>
                                    </div>
                                </div>

                                {/* Lista de atributos seleccionados */}
                                {allAttributes.length > 0 ? (
                                    <div className="space-y-2">
                                        <h4 className="text-sm font-medium text-gray-700">Atributos del producto ({allAttributes.length})</h4>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                            {allAttributes.map((attr, index) => (
                                                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                                    <div className="flex-1">
                                                        <span className="font-medium text-gray-900">{attr.name}:</span>
                                                        <span className="text-gray-600 ml-2">{attr.value}</span>
                                                    </div>
                                                    <button
                                                        type="button"
                                                        onClick={() => removeAttributeFromForm(attr.name, attr.value)}
                                                        className="text-red-500 hover:text-red-700 p-1"
                                                    >
                                                        <X size={16} />
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ) : (
                                    <div className="text-center py-6 text-gray-500">
                                        <Tag className="mx-auto h-8 w-8 text-gray-300 mb-2" />
                                        <p className="text-sm">No hay atributos agregados</p>
                                        <p className="text-xs mt-1">Agrega atributos principales o personalizados</p>
                                    </div>
                                )}
                            </div>

                            {/* Gestión de imágenes */}
                            <ImageManager
                                images={formData.images}
                                onImagesChange={(images) => handleInputChange('images', images)}
                                uploadedImages={uploadedImages}
                                onImageDeleted={handleImageDeleted}
                                onPrimaryChanged={handlePrimaryChanged}
                                onPrimaryImageIndexChanged={(index) => handleInputChange('primaryImageIndex', index)}
                                productId={productId}
                            />
                        </div>

                        {/* Sidebar - Categorías y acciones */}
                        <div className="xl:col-span-1 space-y-6">
                            {/* Categorías */}
                            <div className="bg-white p-4 sm:p-6 rounded-lg shadow-sm">
                                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                    <Folder size={20} />
                                    Categorías *
                                </h3>

                                {loadingCategories ? (
                                    <div className="flex items-center justify-center py-8">
                                        <RefreshCw size={20} className="animate-spin text-gray-400" />
                                        <span className="ml-2 text-gray-500">Cargando categorías...</span>
                                    </div>
                                ) : categories.length > 0 ? (
                                    <div className="space-y-2 max-h-64 overflow-y-auto">
                                        {categories.map(category => (
                                            <label key={category.id} className="flex items-center space-x-3 p-2 hover:bg-gray-50 rounded-lg cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    checked={formData.categories.includes(category.id)}
                                                    onChange={(e) => {
                                                        const newCategories = e.target.checked
                                                            ? [...formData.categories, category.id]
                                                            : formData.categories.filter(id => id !== category.id);
                                                        handleInputChange('categories', newCategories);
                                                    }}
                                                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                                />
                                                <span className="text-sm text-gray-700 flex-1">{category.name}</span>
                                            </label>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-6 text-gray-500">
                                        <Folder className="mx-auto h-8 w-8 text-gray-300 mb-2" />
                                        <p className="text-sm">No hay categorías disponibles</p>
                                    </div>
                                )}

                                {getFieldError('categories') && (
                                    <p className="mt-2 text-sm text-red-600">{getFieldError('categories')}</p>
                                )}

                                <div className="mt-4 pt-4 border-t border-gray-200">
                                    <p className="text-xs text-gray-500">
                                        Seleccionadas: {formData.categories.length}
                                    </p>
                                </div>
                            </div>

                            {/* Estado del formulario */}
                            <div className="bg-white p-4 sm:p-6 rounded-lg shadow-sm">
                                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                    <FileText size={20} />
                                    Estado
                                </h3>

                                <div className="space-y-3">
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="text-gray-600">Cambios sin guardar:</span>
                                        <span className={`font-medium ${isDirty ? 'text-orange-600' : 'text-green-600'}`}>
                                            {isDirty ? 'Sí' : 'No'}
                                        </span>
                                    </div>

                                    <div className="flex items-center justify-between text-sm">
                                        <span className="text-gray-600">Imágenes nuevas:</span>
                                        <span className="font-medium text-blue-600">
                                            {formData.images.length}
                                        </span>
                                    </div>

                                    <div className="flex items-center justify-between text-sm">
                                        <span className="text-gray-600">Imágenes actuales:</span>
                                        <span className="font-medium text-gray-900">
                                            {uploadedImages.length}
                                        </span>
                                    </div>

                                    {isEdit && (
                                        <div className="flex items-center justify-between text-sm">
                                            <span className="text-gray-600">Modo:</span>
                                            <span className="font-medium text-purple-600">Edición</span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Acciones rápidas para móvil */}
                            <div className="xl:hidden bg-white p-4 rounded-lg shadow-sm">
                                <div className="flex flex-col gap-3">
                                    <button
                                        form="product-form"
                                        type="submit"
                                        disabled={isLoading}
                                        className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-6 py-3 rounded-lg font-semibold transition-colors shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
                                    >
                                        {isLoading ? (
                                            <RefreshCw size={20} className="animate-spin" />
                                        ) : (
                                            <Save size={20} />
                                        )}
                                        {isLoading ? 'Guardando...' : isEdit ? 'Actualizar' : 'Crear Producto'}
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => navigate('/admin/products')}
                                        className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-center"
                                    >
                                        Cancelar
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ProductFormPage;