// src/models/invoice.ts
export interface Invoice {
    id: string;
    customerId: string;
    amount: number;
    dueDate: Date;
    paymentStatus: 'pending' | 'paid' | 'failed';
    paymentDate?: Date;
  }
  