import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
    ArrowLeft,
    Plus,
    Edit,
    Trash2,
    Save,
    X,
    AlertCircle,
    RefreshCw,
    Package,
    DollarSign,
    Hash,
    Image,
    Upload,
    Star,
    StarOff,
    Settings,
    Eye,
    EyeOff
} from 'lucide-react';
import { useProducts } from '../../hooks/useProducts';
import type { ProductVariantCreateData, ProductVariantUpdateData } from '../../types/product.types';

interface Toast {
    message: string;
    type: 'success' | 'error' | 'info';
    id: number;
}

interface VariantFormData {
    sku_suffix: string;
    stock: string;
    price: string;
    min_stock: string;
    attributes: Record<string, string>;
    images: File[];
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

// Modal para crear/editar variante
const VariantModal = ({
    isOpen,
    onClose,
    onSubmit,
    variant,
    productName,
    productBasePrice,
    isLoading
}: {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: VariantFormData) => void;
    variant?: any;
    productName: string;
    productBasePrice?: number;
    isLoading: boolean;
}) => {
    const [formData, setFormData] = useState<VariantFormData>({
        sku_suffix: '',
        stock: '',
        price: '',
        min_stock: '5',
        attributes: {},
        images: []
    });

    const [newAttribute, setNewAttribute] = useState({ name: '', value: '' });
    const [errors, setErrors] = useState<Record<string, string>>({});

    // Cargar datos de la variante si es edición
    useEffect(() => {
        if (variant) {
            setFormData({
                sku_suffix: variant.sku_suffix || '',
                stock: variant.stock?.toString() || '',
                price: variant.price?.toString() || '',
                min_stock: variant.min_stock?.toString() || '5',
                attributes: variant.attributes || {},
                images: []
            });
        } else {
            setFormData({
                sku_suffix: '',
                stock: '',
                price: productBasePrice?.toString() || '',
                min_stock: '5',
                attributes: {},
                images: []
            });
        }
        setErrors({});
    }, [variant, isOpen, productBasePrice]);

    // Generar SKU automáticamente basado en atributos
    const generateSKU = () => {
        if (Object.keys(formData.attributes).length === 0) {
            const timestamp = Date.now().toString().slice(-6);
            setFormData(prev => ({ ...prev, sku_suffix: `VAR-${timestamp}` }));
        } else {
            const attributeSuffix = Object.values(formData.attributes).join('-').toUpperCase();
            const timestamp = Date.now().toString().slice(-4);
            setFormData(prev => ({ ...prev, sku_suffix: `${attributeSuffix}-${timestamp}` }));
        }
    };

    const validateForm = (): boolean => {
        const newErrors: Record<string, string> = {};

        if (!formData.sku_suffix.trim()) {
            newErrors.sku_suffix = 'El sufijo SKU es requerido';
        }

        if (!formData.stock.trim()) {
            newErrors.stock = 'El stock es requerido';
        } else if (parseInt(formData.stock) < 0) {
            newErrors.stock = 'El stock debe ser mayor o igual a 0';
        }

        if (!formData.price.trim()) {
            newErrors.price = 'El precio es requerido';
        } else if (parseFloat(formData.price) < 0) {
            newErrors.price = 'El precio debe ser mayor o igual a 0';
        }

        if (parseInt(formData.min_stock) < 0) {
            newErrors.min_stock = 'El stock mínimo debe ser mayor o igual a 0';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (validateForm()) {
            onSubmit(formData);
        }
    };

    const addAttribute = () => {
        if (!newAttribute.name.trim() || !newAttribute.value.trim()) {
            return;
        }

        setFormData(prev => ({
            ...prev,
            attributes: {
                ...prev.attributes,
                [newAttribute.name]: newAttribute.value
            }
        }));

        setNewAttribute({ name: '', value: '' });
    };

    const removeAttribute = (name: string) => {
        setFormData(prev => {
            const newAttributes = { ...prev.attributes };
            delete newAttributes[name];
            return { ...prev, attributes: newAttributes };
        });
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                <div className="p-6 border-b border-gray-200">
                    <div className="flex items-center justify-between">
                        <h2 className="text-xl font-semibold text-gray-900">
                            {variant ? 'Editar Variante' : 'Crear Nueva Variante'}
                        </h2>
                        <button
                            onClick={onClose}
                            className="text-gray-400 hover:text-gray-600"
                        >
                            <X size={24} />
                        </button>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">
                        Producto: {productName}
                    </p>
                    {productBasePrice !== undefined && (
                        <p className="text-sm text-blue-600 mt-1">
                            Precio base del producto: S/ {productBasePrice.toFixed(2)}
                        </p>
                    )}
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    {/* Información básica */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Sufijo SKU *
                            </label>
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    value={formData.sku_suffix}
                                    onChange={(e) => setFormData(prev => ({ ...prev, sku_suffix: e.target.value.toUpperCase() }))}
                                    className={`flex-1 px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.sku_suffix ? 'border-red-500' : 'border-gray-300'}`}
                                    placeholder="COLOR-TALLA"
                                />
                                <button
                                    type="button"
                                    onClick={generateSKU}
                                    className="px-3 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm whitespace-nowrap"
                                    title="Generar SKU automático"
                                >
                                    Auto
                                </button>
                            </div>
                            {errors.sku_suffix && (
                                <p className="mt-1 text-sm text-red-600">{errors.sku_suffix}</p>
                            )}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Stock *
                            </label>
                            <input
                                type="number"
                                min="0"
                                value={formData.stock}
                                onChange={(e) => setFormData(prev => ({ ...prev, stock: e.target.value }))}
                                className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.stock ? 'border-red-500' : 'border-gray-300'}`}
                                placeholder="0"
                            />
                            {errors.stock && (
                                <p className="mt-1 text-sm text-red-600">{errors.stock}</p>
                            )}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Precio *
                            </label>
                            <div className="relative">
                                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                                    S/
                                </span>
                                <input
                                    type="number"
                                    step="0.01"
                                    min="0"
                                    value={formData.price}
                                    onChange={(e) => setFormData(prev => ({ ...prev, price: e.target.value }))}
                                    className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.price ? 'border-red-500' : 'border-gray-300'}`}
                                    placeholder={productBasePrice?.toString() || "0.00"}
                                />
                            </div>
                            {errors.price && (
                                <p className="mt-1 text-sm text-red-600">{errors.price}</p>
                            )}
                            {productBasePrice !== undefined && !variant && (
                                <p className="mt-1 text-xs text-gray-500">
                                    Precio base: S/ {productBasePrice.toFixed(2)} - Puedes modificarlo
                                </p>
                            )}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Stock Mínimo
                            </label>
                            <input
                                type="number"
                                min="0"
                                value={formData.min_stock}
                                onChange={(e) => setFormData(prev => ({ ...prev, min_stock: e.target.value }))}
                                className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.min_stock ? 'border-red-500' : 'border-gray-300'}`}
                                placeholder="5"
                            />
                            {errors.min_stock && (
                                <p className="mt-1 text-sm text-red-600">{errors.min_stock}</p>
                            )}
                        </div>
                    </div>

                    {/* Atributos */}
                    <div>
                        <h3 className="text-lg font-medium text-gray-900 mb-4">Atributos de la Variante</h3>
                        
                        {/* Agregar nuevo atributo */}
                        <div className="mb-4 p-4 bg-gray-50 rounded-lg">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <input
                                    type="text"
                                    placeholder="Nombre del atributo (ej: Color)"
                                    value={newAttribute.name}
                                    onChange={(e) => setNewAttribute(prev => ({ ...prev, name: e.target.value }))}
                                    className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        placeholder="Valor (ej: Rojo)"
                                        value={newAttribute.value}
                                        onChange={(e) => setNewAttribute(prev => ({ ...prev, value: e.target.value }))}
                                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                    <button
                                        type="button"
                                        onClick={addAttribute}
                                        className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                                    >
                                        <Plus size={16} />
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Lista de atributos */}
                        {Object.keys(formData.attributes).length > 0 ? (
                            <div className="space-y-2">
                                {Object.entries(formData.attributes).map(([name, value]) => (
                                    <div key={name} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                        <div className="flex-1">
                                            <span className="font-medium text-gray-900">{name}:</span>
                                            <span className="text-gray-600 ml-2">{value}</span>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => removeAttribute(name)}
                                            className="text-red-500 hover:text-red-700 p-1"
                                        >
                                            <X size={16} />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-6 text-gray-500">
                                <Package className="mx-auto h-8 w-8 text-gray-300 mb-2" />
                                <p className="text-sm">No hay atributos agregados</p>
                                <p className="text-xs mt-1">Ej: Color, Talla, Material, etc.</p>
                            </div>
                        )}
                    </div>

                    {/* Botones */}
                    <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-6 py-2 rounded-lg font-semibold transition-colors flex items-center gap-2"
                        >
                            {isLoading ? (
                                <RefreshCw size={16} className="animate-spin" />
                            ) : (
                                <Save size={16} />
                            )}
                            {isLoading ? 'Guardando...' : variant ? 'Actualizar' : 'Crear Variante'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

// Componente principal
const ProductVariantsPage = () => {
    const navigate = useNavigate();
    const { productId } = useParams<{ productId: string }>();

    const {
        products,
        variants,
        loading,
        creating,
        updating,
        deleting,
        getProductById,
        getProductVariants,
        createProductVariant,
        updateProductVariant,
        deleteProductVariant
    } = useProducts();

    const [toasts, setToasts] = useState<Toast[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingVariant, setEditingVariant] = useState<any>(null);

    const product = productId ? getProductById(productId) : null;

    // Cargar variantes del producto
    useEffect(() => {
        if (productId) {
            getProductVariants(productId);
        }
    }, [productId, getProductVariants]);

    // Funciones para toasts
    const addToast = (message: string, type: Toast['type']) => {
        const id = Date.now();
        setToasts(prev => [...prev, { message, type, id }]);
        setTimeout(() => removeToast(id), 5000);
    };

    const removeToast = (id: number) => {
        setToasts(prev => prev.filter(toast => toast.id !== id));
    };

    // Manejar creación/edición de variante
    const handleVariantSubmit = async (formData: VariantFormData) => {
        if (!productId) return;

        try {
            const variantData = {
                sku_suffix: formData.sku_suffix.trim(),
                stock: parseInt(formData.stock),
                price: parseFloat(formData.price),
                min_stock: parseInt(formData.min_stock),
                attributes: formData.attributes
            };

            if (editingVariant) {
                await updateProductVariant(editingVariant.id, variantData as ProductVariantUpdateData);
                addToast('Variante actualizada exitosamente', 'success');
            } else {
                await createProductVariant(productId, variantData as ProductVariantCreateData);
                addToast('Variante creada exitosamente', 'success');
            }

            setIsModalOpen(false);
            setEditingVariant(null);
        } catch (error) {
            addToast('Error al guardar la variante', 'error');
        }
    };

    // Abrir modal para crear variante
    const handleCreateVariant = () => {
        setEditingVariant(null);
        setIsModalOpen(true);
    };

    // Abrir modal para editar variante
    const handleEditVariant = (variant: any) => {
        setEditingVariant(variant);
        setIsModalOpen(true);
    };

    // Eliminar variante
    const handleDeleteVariant = async (variantId: string) => {
        if (!confirm('¿Estás seguro de que quieres eliminar esta variante?')) return;

        try {
            await deleteProductVariant(variantId);
            addToast('Variante eliminada exitosamente', 'success');
        } catch (error) {
            addToast('Error al eliminar la variante', 'error');
        }
    };

    if (!product) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <RefreshCw className="mx-auto h-8 w-8 text-gray-400 animate-spin" />
                    <p className="mt-2 text-gray-500">Cargando producto...</p>
                </div>
            </div>
        );
    }

    const productVariants = variants[productId] || [];

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
                                Variantes del Producto
                            </h1>
                            <p className="text-gray-600 mt-1 text-sm sm:text-base">
                                {product.name}
                            </p>
                        </div>
                    </div>

                    <div className="flex gap-3">
                        <button
                            onClick={() => navigate(`/admin/products/edit/${productId}`)}
                            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                        >
                            Editar Producto
                        </button>
                        <button
                            onClick={handleCreateVariant}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-semibold transition-colors flex items-center gap-2"
                        >
                            <Plus size={20} />
                            Nueva Variante
                        </button>
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="px-4 sm:px-6 lg:px-8 py-6">
                <div className="max-w-7xl mx-auto">
                    {/* Información del producto */}
                    <div className="bg-white p-6 rounded-lg shadow-sm mb-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <h2 className="text-lg font-semibold text-gray-900">{product.name}</h2>
                                <p className="text-gray-600">SKU: {product.sku}</p>
                                <p className="text-gray-600">Tipo: {product.type === 'SIMPLE' ? 'Producto Simple' : 'Producto Variable'}</p>
                            </div>
                            <div className="text-right">
                                <p className="text-sm text-gray-500">Precio base</p>
                                <p className="text-xl font-bold text-gray-900">
                                    S/ {product.base_price?.toFixed(2) || '0.00'}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Lista de variantes */}
                    <div className="bg-white rounded-lg shadow-sm">
                        <div className="p-6 border-b border-gray-200">
                            <h3 className="text-lg font-semibold text-gray-900">
                                Variantes ({productVariants.length})
                            </h3>
                            <p className="text-sm text-gray-600 mt-1">
                                Gestiona las diferentes versiones de este producto
                            </p>
                        </div>

                        {loading ? (
                            <div className="p-8 text-center">
                                <RefreshCw className="mx-auto h-8 w-8 text-gray-400 animate-spin" />
                                <p className="mt-2 text-gray-500">Cargando variantes...</p>
                            </div>
                        ) : productVariants.length > 0 ? (
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                SKU
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Atributos
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Stock
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Precio
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Estado
                                            </th>
                                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Acciones
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {productVariants.map((variant) => (
                                            <tr key={variant.id} className="hover:bg-gray-50">
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div>
                                                        <div className="text-sm font-medium text-gray-900">
                                                            {product.sku}-{variant.sku_suffix}
                                                        </div>
                                                        <div className="text-sm text-gray-500">
                                                            {variant.sku_suffix}
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex flex-wrap gap-1">
                                                        {variant.attributes && Object.entries(variant.attributes).map(([key, value]) => (
                                                            <span
                                                                key={key}
                                                                className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                                                            >
                                                                {key}: {value}
                                                            </span>
                                                        ))}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-sm text-gray-900">{variant.stock}</div>
                                                    <div className="text-sm text-gray-500">Mín: {variant.min_stock}</div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-sm font-medium text-gray-900">
                                                        S/ {variant.price.toFixed(2)}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                                        variant.is_active
                                                            ? 'bg-green-100 text-green-800'
                                                            : 'bg-red-100 text-red-800'
                                                    }`}>
                                                        {variant.is_active ? 'Activo' : 'Inactivo'}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                    <div className="flex items-center justify-end gap-2">
                                                        <button
                                                            onClick={() => handleEditVariant(variant)}
                                                            className="text-blue-600 hover:text-blue-900 p-1"
                                                            title="Editar variante"
                                                        >
                                                            <Edit size={16} />
                                                        </button>
                                                        <button
                                                            onClick={() => handleDeleteVariant(variant.id)}
                                                            className="text-red-600 hover:text-red-900 p-1"
                                                            title="Eliminar variante"
                                                            disabled={deleting}
                                                        >
                                                            <Trash2 size={16} />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <div className="p-8 text-center">
                                <Package className="mx-auto h-12 w-12 text-gray-300 mb-4" />
                                <h3 className="text-lg font-medium text-gray-900 mb-2">No hay variantes</h3>
                                <p className="text-gray-500 mb-4">
                                    Este producto aún no tiene variantes. Crea la primera variante para comenzar.
                                </p>
                                <button
                                    onClick={handleCreateVariant}
                                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-semibold transition-colors flex items-center gap-2 mx-auto"
                                >
                                    <Plus size={20} />
                                    Crear Primera Variante
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Modal */}
            <VariantModal
                isOpen={isModalOpen}
                onClose={() => {
                    setIsModalOpen(false);
                    setEditingVariant(null);
                }}
                onSubmit={handleVariantSubmit}
                variant={editingVariant}
                productName={product.name}
                productBasePrice={product.base_price}
                isLoading={creating || updating}
            />
        </div>
    );
};

export default ProductVariantsPage; 