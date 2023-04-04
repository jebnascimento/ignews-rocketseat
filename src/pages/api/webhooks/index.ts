import { NextApiRequest, NextApiResponse } from "next";
import { Readable } from "stream";
import Stripe from "stripe";
import { saveSubscription } from "../../../services/fauna";
import { stripe } from "../../../services/stripe";


type TSecret = string | string[] | Buffer;

async function buffer(readable: Readable) {
  const chunks = [];

  for await (const chunk of readable) {
    chunks.push(
      typeof chunk === "string" ? Buffer.from(chunk) : chunk
    );
  }

  return Buffer.concat(chunks);
}

export const config = {
  api: {
    bodyParser: false,
  }
}

const relevantEvents = new Set([
  'checkout.session.completed',
  'customer.subscription.updated',
  'customer.subscription.deleted',
])

export default async (req: NextApiRequest, res: NextApiResponse) => {
  
  if(req.method === 'POST') {

  const buf = await buffer(req);
  const secret = req.headers['stripe-signature']  
  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(buf, secret as TSecret, process.env.STRIPE_WEBHOOK_SECRET as string);
  } catch (error) {
    return res.status(400).send(`Webhook Error: ${(error as Error)?.message}`);
  }

  const type = event.type

  if(relevantEvents.has(type)) {
    try {

      switch (type) {
        case 'customer.subscription.updated':
        case 'customer.subscription.deleted':

          const subscription = event.data.object as Stripe.Subscription;

          await saveSubscription(
            subscription.id,
            subscription.customer.toString(),
            false,
          );

          break;

        case 'checkout.session.completed':
          const checkoutSessions = event.data.object as Stripe.Checkout.Session
          
          await saveSubscription(
            checkoutSessions.subscription?.toString() as string,
            checkoutSessions.customer?.toString() as string,
            true,
          )
          break;
      
        default:
          throw new Error('Unhandled event.');
      }
      
    } catch (error) {
      return res.json({ error: 'Webhook handler failed.'})
    }
  }

    res.json({ received: true })
  } else {
    res.setHeader('Allow', 'POST');
    res.status(405).end('Method not allowed');
  }
}