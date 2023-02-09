import { NextApiRequest, NextApiResponse } from "next";
import { stripe } from "../../../services/stripe";

import { authOptions } from '../../../services/nextAuth'
import { getServerSession } from "next-auth/next"
import { getUser, updateUser } from "../../../services/fauna";

type User = {
  ref: {
    id: string;
  },
  data: {
    stripe_customer_id: string;
  }
}

export default async (req: NextApiRequest, res: NextApiResponse) => {

  if(req.method === 'POST') {

    const session = await getServerSession(req, res, authOptions)

    const user = await getUser<User>(session?.user?.email as string)

    let customerId = user.data.stripe_customer_id

    if(!customerId) {
      const stripeCustomer = await stripe.customers.create({
        email: session?.user?.email as string,
      })

      updateUser(user.ref.id, stripeCustomer.id)
      customerId = stripeCustomer.id
    }


    const StripeCheckoutSession = await stripe.checkout.sessions.create({
      customer: customerId,
      payment_method_types: ['card'],
      billing_address_collection: 'required',
      line_items: [
        {price: 'price_1MYzhlD6v3z7cK4lwn2ySbqp', quantity: 1 }
      ],
      mode: 'subscription',
      allow_promotion_codes: true,
      success_url: process.env.STRIPE_SUCCESS_URL as string,
      cancel_url: process.env.STRIPE_CANCEL_URL as string,
    })

    return res.status(200).json({ sessionId: StripeCheckoutSession.id})
  } else {
    res.setHeader('Allow', 'POST');
    res.status(405).end('Method not allowed');
  }

  return 
}