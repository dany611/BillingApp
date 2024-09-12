import { retryFailedPayment } from '../handlers/paymentHandler';
import { Invoice } from '../models/invoice
declare const KV_SUBSCRIPTION_DATA: KVNamespace;

export const retryFailedPayments = async () => {
  const failedInvoices = await fetchFailedInvoices();

  for (const invoice of failedInvoices) {
    await retryFailedPayment(invoice);
  }
};

async function fetchFailedInvoices(): Promise<Invoice[]> {
  // Fetch all failed invoices from KV storage
  const keys = await KV_SUBSCRIPTION_DATA.list({ prefix: 'invoice-' });
  const failedInvoices: Invoice[] = [];

  for (const key of keys.keys) {
    const invoice: Invoice = JSON.parse(await KV_SUBSCRIPTION_DATA.get(key.name));
    if (invoice.paymentStatus === 'failed') {
      failedInvoices.push(invoice);
    }
  }

  return failedInvoices;
}
