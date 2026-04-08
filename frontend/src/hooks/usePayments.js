// usePayments.js — React Query hooks for payment flows
import { useMutation } from '@tanstack/react-query';
import api from '../services/api';

// Initiate payment
export const useInitiatePayment = () =>
  useMutation((data) => api.post('/payments/initiate', data));

// Confirm payment
export const useConfirmPayment = () =>
  useMutation((data) => api.post('/payments/confirm', data));