// src/models/payment.ts
export interface Payment {
    id: string;
    invoiceId: string;
    amount: number;
    paymentMethod: 'credit_card';
  }
  