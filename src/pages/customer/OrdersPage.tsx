import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Package, Truck, CheckCircle, Clock, AlertCircle } from 'lucide-react';

// TODO: Mover a types
interface Order {
  id: string;
  order_number: string;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  total: number;
  items: {
    id: string;
    name: string;
    quantity: number;
    price: number;
    image: string;
  }[];
  created_at: string;
  updated_at: string;
}

const OrdersPage = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // TODO: Implementar fetch real de pedidos
    const fetchOrders = async () => {
      try {
        // Simulación de fetch
        const mockOrders: Order[] = [
          {
            id: '1',
            order_number: 'ORD-2024-001',
            status: 'delivered',
            total: 1299.99,
            items: [
              {
                id: '1',
                name: 'Sofá Chesterfield Moderno',
                quantity: 1,
                price: 1299.99,
                image: '/images/products/sofa-chesterfield-1.jpg'
              }
            ],
            created_at: '2024-03-01T10:00:00Z',
            updated_at: '2024-03-05T15:30:00Z'
          },
          {
            id: '2',
            order_number: 'ORD-2024-002',
            status: 'processing',
            total: 799.99,
            items: [
              {
                id: '3',
                name: 'Mesa de Centro Mármol',
                quantity: 1,
                price: 799.99,
                image: '/images/products/mesa-marmol-1.jpg'
              }
            ],
            created_at: '2024-03-10T14:30:00Z',
            updated_at: '2024-03-10T14:30:00Z'
          }
        ];

        setOrders(mockOrders);
      } catch (error) {
        console.error('Error al cargar los pedidos:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchOrders();
  }, []);

  const getStatusIcon = (status: Order['status']) => {
    switch (status) {
      case 'pending':
        return <Clock className="text-yellow-500" />;
      case 'processing':
        return <Package className="text-blue-500" />;
      case 'shipped':
        return <Truck className="text-purple-500" />;
      case 'delivered':
        return <CheckCircle className="text-green-500" />;
      case 'cancelled':
        return <AlertCircle className="text-red-500" />;
    }
  };

  const getStatusText = (status: Order['status']) => {
    switch (status) {
      case 'pending':
        return 'Pendiente';
      case 'processing':
        return 'En Proceso';
      case 'shipped':
        return 'Enviado';
      case 'delivered':
        return 'Entregado';
      case 'cancelled':
        return 'Cancelado';
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-accent"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-8">Mis Pedidos</h1>

      {orders.length === 0 ? (
        <div className="text-center py-12">
          <Package size={48} className="mx-auto text-gray-400 mb-4" />
          <h2 className="text-xl font-medium text-gray-900 mb-2">
            No tienes pedidos aún
          </h2>
          <p className="text-gray-500">
            Cuando realices un pedido, aparecerá aquí
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {orders.map((order) => (
            <motion.div
              key={order.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-lg shadow-sm overflow-hidden"
            >
              {/* Header */}
              <div className="p-6 border-b">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900">
                      Pedido {order.order_number}
                    </h2>
                    <p className="text-sm text-gray-500">
                      Realizado el{' '}
                      {new Date(order.created_at).toLocaleDateString('es-ES', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    {getStatusIcon(order.status)}
                    <span className="font-medium">{getStatusText(order.status)}</span>
                  </div>
                </div>
              </div>

              {/* Items */}
              <div className="divide-y">
                {order.items.map((item) => (
                  <div key={item.id} className="p-6 flex items-center space-x-4">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-20 h-20 object-cover rounded"
                    />
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900">{item.name}</h3>
                      <p className="text-sm text-gray-500">
                        Cantidad: {item.quantity}
                      </p>
                      <p className="font-medium text-accent">
                        ${item.price.toFixed(2)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Footer */}
              <div className="p-6 bg-gray-50">
                <div className="flex justify-between items-center">
                  <span className="text-gray-500">Total</span>
                  <span className="text-xl font-bold text-accent">
                    ${order.total.toFixed(2)}
                  </span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

export default OrdersPage; 