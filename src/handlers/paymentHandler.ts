import { Invoice } from '../models/invoice';
import { Payment } from '../models/payment';
import { sendEmail } from '../utils/sendGrid';

declare const KV_SUBSCRIPTION_DATA: KVNamespace;

export const handlePayment = async (request: Request) => {
  const { invoiceId, amount, paymentMethod } = await request.json();
  const invoice: Invoice | null = JSON.parse(await KV_SUBSCRIPTION_DATA.get(`invoice-${invoiceId}`));

  if (!invoice || invoice.paymentStatus === 'paid') {
    return new Response('Invoice not found or already paid', { status: 404 });
  }

  try {
    const paymentSuccess = await processPaymentWithExternalService(amount, paymentMethod);

    if (paymentSuccess) {
      invoice.paymentStatus = 'paid';
      invoice.paymentDate = new Date();
      await KV_SUBSCRIPTION_DATA.put(`invoice-${invoice.id}`, JSON.stringify(invoice));

      const payment: Payment = {
        id: crypto.randomUUID(),
        invoiceId: invoice.id,
        amount,
        paymentMethod,
      };
      await KV_SUBSCRIPTION_DATA.put(`payment-${payment.id}`, JSON.stringify(payment));

      await sendEmail(invoice.customerId, 'Payment Successful', `Your payment of $${amount} was successful.`);
    } else {
      await retryFailedPayment(invoice);
    }
  } catch (error) {
    return new Response('Payment failed', { status: 500 });
  }

  return new Response('Payment processed', { status: 201 });
};

async function retryFailedPayment(invoice: Invoice) {
  invoice.paymentStatus = 'failed';
  await KV_SUBSCRIPTION_DATA.put(`invoice-${invoice.id}`, JSON.stringify(invoice));
  await sendEmail(invoice.customerId, 'Payment Failed', `Your payment failed. We will retry soon.`);
}

async function processPaymentWithExternalService(amount: number, method: string): Promise<boolean> {
  return Math.random() > 0.1; // Simulate 90% success rate
}
