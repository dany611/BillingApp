// src/handlers/billingHandler.ts
import { Customer } from '../models/customer';
import { Invoice } from '../models/invoice';
import { SubscriptionPlan } from "../models/subscriptionPlan";
import { sendEmail } from '../utils/sendGrid';

declare const KV_SUBSCRIPTION_DATA: KVNamespace;

export const handleGenerateInvoice = async (request: Request) => {
  const { customerId } = await request.json();
  
  const customer: Customer = JSON.parse(await KV_SUBSCRIPTION_DATA.get(`customer-${customerId}`));
  const subscription: SubscriptionPlan = JSON.parse(await KV_SUBSCRIPTION_DATA.get(`subscription-${customer.subscriptionPlanId}`));
  
  const invoice: Invoice = {
    id: crypto.randomUUID(),
    customerId: customer.id,
    amount: subscription.price,
    dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // Due in 7 days
    paymentStatus: 'pending',
  };
  
  await KV_SUBSCRIPTION_DATA.put(`invoice-${invoice.id}`, JSON.stringify(invoice));

  // Notify customer via email
  await sendEmail(customer.email, 'Invoice Generated', `Your invoice for $${invoice.amount} is due on ${invoice.dueDate}.`);
  
  return new Response(JSON.stringify(invoice), { status: 201 });
};

export const generateInvoices = async () => {
  const customers: Customer[] = await fetchAllCustomers();

  for (const customer of customers) {
    const subscription = JSON.parse(await KV_SUBSCRIPTION_DATA.get(`subscription-${customer.id}`));

    if (subscription) {
      const plan: SubscriptionPlan = JSON.parse(await KV_SUBSCRIPTION_DATA.get(`plan-${subscription.planId}`));
      const invoiceAmount = calculateInvoiceAmount(plan, subscription);

      const invoice: Invoice = {
        id: crypto.randomUUID(),
        customerId: customer.id,
        amount: invoiceAmount,
        dueDate: calculateDueDate(),
        paymentStatus: 'pending',
      };

      await KV_SUBSCRIPTION_DATA.put(`invoice-${invoice.id}`, JSON.stringify(invoice));

      await sendEmail(customer.email, 'Invoice Generated', `Your invoice of $${invoiceAmount} has been generated.`);
    }
  }
};

function calculateInvoiceAmount(plan: SubscriptionPlan, subscription: any): number {
  const billingCycleLength = plan.billing_cycle === 'monthly' ? 30 : 365;
  const remainingDays = billingCycleLength - getDaysSinceLastBilling(subscription);
  return subscription.isMidCycleChange ? (plan.price * remainingDays) / billingCycleLength : plan.price;
}

function getDaysSinceLastBilling(subscription: any): number {
  const lastBillingDate = new Date(subscription.lastBillingDate);
  const currentDate = new Date();
  return Math.floor((currentDate.getTime() - lastBillingDate.getTime()) / (1000 * 60 * 60 * 24));
}

function calculateDueDate(): string {
  const dueDate = new Date();
  dueDate.setDate(dueDate.getDate() + 30); // 30 days payment terms
  return dueDate.toISOString();
}

async function fetchAllCustomers(): Promise<Customer[]> {
  return []; // Replace with actual customer fetch logic
}

