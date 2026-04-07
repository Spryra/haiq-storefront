// usePayments.js — React Query hooks for payment flows
import { useMutation } from '@tanstack/react-query';

// Initiate payment
export const useInitiatePayment = () =>
  useMutation((data) =>
    fetch('/payments/initiate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    }).then((res) => res.json())
  );

// Confirm payment (simulation only)
export const useConfirmPayment = () =>
  useMutation((data) =>
    fetch('/payments/confirm', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    }).then((res) => res.json())
  );