import { handleCreateSubscription, handleCreateCustomer } from './handlers/subscriptionHandler';
import { handleGenerateInvoice } from './handlers/billingHandler';
import { retryFailedPayments } from './scheduled/retryPayments';
import { handlePayment } from "./handlers/paymentHandler"

addEventListener('fetch', (event) => {
    const url = new URL(event.request.url);

    switch (url.pathname) {
        case '/create-subscription':
            event.respondWith(handleCreateSubscription(event.request));
            break;
        case '/create-customer':
            event.respondWith(handleCreateCustomer(event.request));
            break;
        case '/generate-invoice':
            event.respondWith(handleGenerateInvoice(event.request));
            break;
        case '/process-payment':
            event.respondWith(handlePayment(event.request));
            break;

        case '/retry-failed-payments':
            event.respondWith(retryFailedPayments(event.request));
            break;

        default:
            event.respondWith(new Response('Not Found', { status: 404 }));
    }
});
