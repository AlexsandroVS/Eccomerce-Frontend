import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { X, ShoppingBag, Trash2 } from 'lucide-react';
import { useCart } from '../../../contexts/CartContext';
import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';
import CheckoutForm from '../../payments/CheckoutForm';
import { useAuth } from '../../../contexts/AuthContext';
import { createOrder } from '../../../services/order.service';
import { createPaymentIntent } from '../../../services/payment.service';
import { getImageUrl } from '../../../utils/image.utils';

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || '');

// Simula el tipo Address (debería ir en types)
type Address = {
  id: string;
  name: string;
  street: string;
  city: string;
  state: string;
  postal_code: string;
  country: string;
  is_default: boolean;
};

const CartSidebar = ({ onClose }) => {
  const { items: cartItems, removeFromCart, total, clearCart } = useCart();
  const { user } = useAuth();
  const [showCheckout, setShowCheckout] = useState(false);
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [shippingAddress, setShippingAddress] = useState<Address | null>(null);
  const [showAddressModal, setShowAddressModal] = useState(false);

  // Simula fetch de direcciones y selecciona la por defecto
  useEffect(() => {
    // TODO: Reemplaza esto por tu API real de direcciones
    const mockAddresses: Address[] = [
      {
        id: '1',
        name: 'Casa',
        street: 'Calle Principal 123',
        city: 'Ciudad de México',
        state: 'CDMX',
        postal_code: '12345',
        country: 'México',
        is_default: true
      },
      {
        id: '2',
        name: 'Oficina',
        street: 'Av. Reforma 456',
        city: 'Ciudad de México',
        state: 'CDMX',
        postal_code: '67890',
        country: 'México',
        is_default: false
      }
    ];
    setAddresses(mockAddresses);
    const defaultAddress = mockAddresses.find(addr => addr.is_default) || null;
    setShippingAddress(defaultAddress);
  }, []);

  const handleCheckout = async () => {
    setLoading(true);
    try {
      if (!user) {
        alert('Debes iniciar sesión para comprar');
        setLoading(false);
        return;
      }
      if (!shippingAddress) {
        setShowAddressModal(true);
        setLoading(false);
        return;
      }
      // 1. Crear la orden
      const orderPayload = {
        user_id: user.id,
        items: cartItems.map(item => ({
          product_id: item.id,
          quantity: item.quantity,
          unit_price: item.price,
        })),
        shipping_address: shippingAddress,
        billing_address: shippingAddress,
        notes: '',
      };
      const orderRes = await createOrder(orderPayload);
      if (!orderRes.success || !orderRes.data?.id) {
        alert(orderRes.error || 'Error al crear la orden');
        setLoading(false);
        return;
      }
      const orderId = orderRes.data.id;

      // 2. Crear PaymentIntent
      const paymentRes = await createPaymentIntent({
        orderId,
        amount: total,
        currency: 'PEN',
        customerEmail: user.email,
      });
      if (paymentRes.success && paymentRes.data.clientSecret) {
        setClientSecret(paymentRes.data.clientSecret);
        setShowCheckout(true);
      } else {
        alert(paymentRes.error || 'Error al iniciar el pago');
      }
    } catch (e) {
      alert('Error al conectar con el servidor');
    } finally {
      setLoading(false);
    }
  };

  // Modal para seleccionar dirección
  const AddressModal = () => (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60">
      <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md relative">
        <button onClick={() => setShowAddressModal(false)} className="absolute top-2 right-2 text-gray-500 hover:text-black">✕</button>
        <h2 className="text-lg font-semibold mb-4">Selecciona una dirección de envío</h2>
        <div className="space-y-2">
          {addresses.map(addr => (
            <div key={addr.id} className={`p-3 border rounded cursor-pointer ${shippingAddress?.id === addr.id ? 'border-accent bg-accent/10' : 'border-gray-200'}`}
              onClick={() => { setShippingAddress(addr); setShowAddressModal(false); }}>
              <div className="font-medium">{addr.name}</div>
              <div className="text-sm text-gray-600">{addr.street}, {addr.city}, {addr.state}, {addr.country}, CP {addr.postal_code}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Overlay */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 z-40"
        onClick={onClose}
      />

      {/* Sidebar */}
      <motion.div
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        exit={{ x: '100%' }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        className="fixed right-0 top-0 h-full w-full max-w-md bg-white shadow-xl z-50"
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b">
            <div className="flex items-center space-x-2">
              <ShoppingBag size={24} className="text-accent" />
              <h2 className="text-xl font-semibold">Carrito de Compras</h2>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X size={24} />
            </button>
          </div>

          {/* Contenido */}
          <div className="flex-1 overflow-y-auto p-4">
            {cartItems.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-gray-500">
                <ShoppingBag size={48} className="mb-4" />
                <p className="text-lg">Tu carrito está vacío</p>
                <p className="text-sm">Añade productos para comenzar a comprar</p>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Lista de productos */}
                {cartItems.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg"
                  >
                    <img
                      src={getImageUrl(item.image || '')}
                      alt={item.name}
                      className="w-20 h-20 object-cover rounded"
                      onError={(e) => {
                        e.currentTarget.src = '/placeholder-product.jpg';
                      }}
                    />
                    <div className="flex-1">
                      <h3 className="font-medium">{item.name}</h3>
                      <p className="text-sm text-gray-500">
                        Cantidad: {item.quantity}
                      </p>
                      <p className="font-medium text-accent">
                        ${item.price.toFixed(2)}
                      </p>
                    </div>
                    <button
                      onClick={() => removeFromCart(item.id)}
                      className="p-2 text-red-500 hover:bg-red-50 rounded-full transition-colors"
                    >
                      <Trash2 size={20} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          {cartItems.length > 0 && (
            <div className="border-t p-4">
              <div className="flex justify-between mb-4">
                <span className="font-medium">Total</span>
                <span className="font-bold text-lg text-accent">
                  ${total.toFixed(2)}
                </span>
              </div>
              <div className="mb-2">
                <span className="text-sm text-gray-600">Envío a: </span>
                {shippingAddress ? (
                  <span className="text-sm font-medium">{shippingAddress.name} - {shippingAddress.street}, {shippingAddress.city}</span>
                ) : (
                  <button className="text-accent underline text-sm" onClick={() => setShowAddressModal(true)}>Seleccionar dirección</button>
                )}
              </div>
              <button
                onClick={handleCheckout}
                className="w-full bg-accent text-white py-3 rounded-lg font-medium hover:bg-accent/90 transition-colors"
                disabled={loading}
              >
                {loading ? 'Cargando...' : 'Proceder al Pago'}
              </button>
            </div>
          )}
        </div>
      </motion.div>

      {showCheckout && clientSecret && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md relative">
            <button onClick={() => setShowCheckout(false)} className="absolute top-2 right-2 text-gray-500 hover:text-black">✕</button>
            <Elements stripe={stripePromise} options={{ clientSecret }}>
              <CheckoutForm onSuccess={() => { setShowCheckout(false); clearCart(); onClose(); }} />
            </Elements>
          </div>
        </div>
      )}
      {showAddressModal && <AddressModal />}
    </>
  );
};

export default CartSidebar;
