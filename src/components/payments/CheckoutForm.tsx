import { useStripe, useElements, PaymentElement } from '@stripe/react-stripe-js';
import { FormEvent, useState } from 'react';

interface CheckoutFormProps {
  onSuccess: () => void;
}

const CheckoutForm = ({ onSuccess }: CheckoutFormProps) => {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    if (!stripe || !elements) {
      setError('Stripe no está listo');
      setLoading(false);
      return;
    }
    const result = await stripe.confirmPayment({
      elements,
      confirmParams: {},
      redirect: 'if_required',
    });
    if (result.error) {
      setError(result.error.message || 'Error al procesar el pago');
    } else if (result.paymentIntent && result.paymentIntent.status === 'succeeded') {
      onSuccess();
    }
    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <PaymentElement />
      {error && <div className="text-red-500 text-sm">{error}</div>}
      <button
        type="submit"
        disabled={!stripe || loading}
        className="w-full bg-accent text-white py-2 rounded-lg font-medium hover:bg-accent/90 transition-colors"
      >
        {loading ? 'Procesando...' : 'Pagar'}
      </button>
    </form>
  );
};

export default CheckoutForm; 