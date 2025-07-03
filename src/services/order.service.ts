import api from './api.service';
import { API_CONFIG } from '../config/api.config';

export const createOrder = async (orderData: any) => {
  const response = await api.post(API_CONFIG.ENDPOINTS.ORDERS.CREATE, orderData);
  return response.data;
};

export const getMyOrders = async () => {
  const response = await api.get(API_CONFIG.ENDPOINTS.ORDERS.LIST_MY);
  return response.data;
}; 