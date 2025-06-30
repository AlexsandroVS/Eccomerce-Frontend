import api from './api.service';

export const createPaymentIntent = async ({ orderId, amount, currency, customerEmail, metadata }: {
  orderId: string;
  amount: number;
  currency: string;
  customerEmail?: string;
  metadata?: Record<string, any>;
}) => {
  const response = await api.post('/payments/create', {
    orderId,
    amount,
    currency,
    customerEmail,
    metadata,
  });
  return response.data;
}; 