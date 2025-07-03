import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { motion } from 'framer-motion';
import { User, Mail, Phone, MapPin, Edit2, Save, X, Package, CheckCircle, Truck, Clock, AlertCircle } from 'lucide-react';
import { getMyOrders } from '../../services/order.service';

const ProfilePage = () => {
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    full_name: user?.full_name || '',
    email: user?.email || '',
    phone: '',
    address: ''
  });
  const [orders, setOrders] = useState<any[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const data = await getMyOrders();
        setOrders(data);
      } catch (error) {
        setOrders([]);
      } finally {
        setLoadingOrders(false);
      }
    };
    fetchOrders();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Implementar actualización de perfil
    console.log('Actualizar perfil:', formData);
    setIsEditing(false);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  return (
    <div className="container mx-auto px-4 py-8 flex flex-col items-center min-h-screen">
      <div className="w-full max-w-4xl">
        <div className="bg-white rounded-2xl shadow-lg p-8 flex flex-col md:flex-row md:items-center md:justify-between gap-6 mb-8">
          <div className="flex items-center gap-4">
            <div className="w-20 h-20 rounded-full bg-accent/10 flex items-center justify-center text-accent text-3xl font-bold">
              {user?.full_name?.[0]?.toUpperCase() || 'U'}
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-1">{user?.full_name || 'Usuario'}</h1>
              <p className="text-gray-500">{user?.email}</p>
            </div>
          </div>
          <button
            onClick={() => setIsEditing(!isEditing)}
            className="flex items-center space-x-2 text-accent hover:text-accent/90 border border-accent px-4 py-2 rounded-lg font-medium transition-colors"
          >
            {isEditing ? (
              <>
                <X size={20} />
                <span>Cancelar</span>
              </>
            ) : (
              <>
                <Edit2 size={20} />
                <span>Editar</span>
              </>
            )}
          </button>
        </div>
        <div className="bg-white rounded-2xl shadow p-6 mb-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Nombre */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Nombre Completo
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User size={20} className="text-gray-400" />
                  </div>
                  <input
                    type="text"
                    name="full_name"
                    value={isEditing ? formData.full_name : user?.full_name || ''}
                    onChange={handleChange}
                    disabled={!isEditing}
                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent disabled:bg-gray-50 disabled:text-gray-500"
                  />
                </div>
              </div>

              {/* Email */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Correo Electrónico
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail size={20} className="text-gray-400" />
                  </div>
                  <input
                    type="email"
                    name="email"
                    value={isEditing ? formData.email : user?.email || ''}
                    onChange={handleChange}
                    disabled={!isEditing}
                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent disabled:bg-gray-50 disabled:text-gray-500"
                  />
                </div>
              </div>

              {/* Teléfono */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Teléfono
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Phone size={20} className="text-gray-400" />
                  </div>
                  <input
                    type="tel"
                    name="phone"
                    value={isEditing ? formData.phone : user?.phone || ''}
                    onChange={handleChange}
                    disabled={!isEditing}
                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent disabled:bg-gray-50 disabled:text-gray-500"
                  />
                </div>
              </div>

              {/* Dirección */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Dirección
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <MapPin size={20} className="text-gray-400" />
                  </div>
                  <input
                    type="text"
                    name="address"
                    value={isEditing ? formData.address : user?.address || ''}
                    onChange={handleChange}
                    disabled={!isEditing}
                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent disabled:bg-gray-50 disabled:text-gray-500"
                  />
                </div>
              </div>
            </div>

            {isEditing && (
              <motion.button
                type="submit"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full flex items-center justify-center space-x-2 bg-accent text-white py-3 px-6 rounded-lg hover:bg-accent/90 transition-colors"
              >
                <Save size={20} />
                <span>Guardar Cambios</span>
              </motion.button>
            )}
          </form>
        </div>
      </div>

      {/* Historial de órdenes */}
      <div className="w-full max-w-4xl mx-auto mt-8">
        <div className="bg-white rounded-2xl shadow p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Historial de Órdenes</h2>
          {loadingOrders ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-accent"></div>
            </div>
          ) : orders.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Package size={40} className="mx-auto mb-4 text-gray-300" />
              <p>No tienes órdenes registradas.</p>
            </div>
          ) : (
            <div className="flex flex-col gap-8">
              {orders.map((order: any) => (
                <div key={order.id} className="bg-gray-50 rounded-xl shadow p-6 flex flex-col gap-4">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
                    <div>
                      <span className="font-semibold text-gray-900 text-lg">Pedido #{order.order_number || order.id.slice(0, 8)}</span>
                      <span className="ml-2 text-sm text-gray-500">{new Date(order.created_at).toLocaleDateString('es-ES', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      {order.status === 'pending' && <Clock className="text-yellow-500" />}
                      {order.status === 'processing' && <Package className="text-blue-500" />}
                      {order.status === 'shipped' && <Truck className="text-purple-500" />}
                      {order.status === 'delivered' && <CheckCircle className="text-green-500" />}
                      {order.status === 'cancelled' && <AlertCircle className="text-red-500" />}
                      {order.status === 'succeed' && <CheckCircle className="text-green-600" />}
                      <span className="font-medium text-gray-700 capitalize">{order.status}</span>
                    </div>
                  </div>
                  <div className="overflow-x-auto mt-2">
                    <table className="min-w-full text-sm text-left">
                      <thead>
                        <tr className="bg-gray-100">
                          <th className="px-2 py-1 font-semibold text-gray-700">Producto</th>
                          <th className="px-2 py-1 font-semibold text-gray-700">Cantidad</th>
                          <th className="px-2 py-1 font-semibold text-gray-700">Precio</th>
                          <th className="px-2 py-1 font-semibold text-gray-700">Subtotal</th>
                        </tr>
                      </thead>
                      <tbody>
                        {order.items && order.items.map((item: any) => {
                          const productName = item.product?.name || 'Producto';
                          const productImage = item.product?.images?.find((img: any) => img.is_primary)?.url || item.product?.images?.[0]?.url;
                          return (
                            <tr key={item.id} className="border-b last:border-0">
                              <td className="px-2 py-1 flex items-center gap-2">
                                {productImage && <img src={productImage} alt={productName} className="w-10 h-10 object-cover rounded" />}
                                <span className="font-medium text-gray-900">{productName}</span>
                              </td>
                              <td className="px-2 py-1">{item.quantity}</td>
                              <td className="px-2 py-1">${item.unit_price?.toFixed(2)}</td>
                              <td className="px-2 py-1 font-semibold">${item.total_price?.toFixed(2)}</td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                  <div className="flex justify-end items-center mt-4">
                    <span className="text-gray-500 mr-2">Total</span>
                    <span className="text-xl font-bold text-accent">${order.total?.toFixed(2)}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfilePage; 