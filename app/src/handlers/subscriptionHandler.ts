// src/handlers/subscriptionHandler.ts
import { Customer } from '../models/customer';
import { SubscriptionPlan } from '../models/subscriptionPlan'
import { KV } from '@cloudflare/workers-types';

declare const KV_SUBSCRIPTION_DATA: KVNamespace;

export const handleCreateSubscription = async (request: Request) => {
  const data = await request.json();
  const subscription: SubscriptionPlan = {
    id: crypto.randomUUID(),
    name: data.name,
    billingCycle: data.billingCycle,
    price: data.price,
    status: 'active',
  };

  await KV_SUBSCRIPTION_DATA.put(`subscription-${subscription.id}`, JSON.stringify(subscription));

  return new Response(JSON.stringify(subscription), { status: 201 });
};

export const handleCreateCustomer = async (request: Request) => {
  const data = await request.json();
  const customer: Customer = {
    id: crypto.randomUUID(),
    name: data.name,
    email: data.email,
    subscriptionPlanId: data.subscriptionPlanId,
    subscriptionStatus: 'active',
  };

  await KV_SUBSCRIPTION_DATA.put(`customer-${customer.id}`, JSON.stringify(customer));

  return new Response(JSON.stringify(customer), { status: 201 });
};
