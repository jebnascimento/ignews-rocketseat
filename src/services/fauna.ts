import { Client } from "faunadb";
import { query as q } from "faunadb";
import { stripe } from "./stripe";

export const fauna = new Client({
  secret: process.env.FAUNADB_KEY as string,
});

export async function createUserIfNotExist(userEmail: string) {
  return await fauna.query(
    q.If(
      q.Not(q.Exists(q.Match(q.Index("user_by_email"), q.Casefold(userEmail)))),
      q.Create(q.Collection("users"), { data: { userEmail } }),
      q.Get(q.Match(q.Index("user_by_email"), q.Casefold(userEmail)))
    )
  );
}

export async function getUserByEmail<T>(userEmail: string): Promise<T> {
  return await fauna.query(
    q.Get(q.Match(q.Index("user_by_email"), q.Casefold(userEmail)))
  );
}

export async function getSubscriptionByUserRef<T>(userRef: string): Promise<T> {
  return await fauna.query(
    q.Get(q.Match(q.Index("subscription_by_user_ref"), q.Casefold(userRef)))
  );
}

export async function updateUserCustomerId(
  userRef: string,
  stripeCustomerId: string
) {
  await fauna.query(
    q.Update(q.Ref(q.Collection("users"), userRef), {
      data: {
        stripe_customer_id: stripeCustomerId,
      },
    })
  );
}

export async function saveSubscription(
  subscriptionId: string,
  customerId: string,
  createAction = false
) {
  const userRef = await fauna.query(
    q.Select(
      "ref",
      q.Get(q.Match(q.Index("user_by_stripe_customer_id"), customerId))
    )
  );

  const subscription = await stripe.subscriptions.retrieve(subscriptionId);

  const subscriptionData = {
    id: subscription.id,
    user_id: userRef,
    status: subscription.status,
    price_id: subscription.items.data[0].price.id,
  };

  if (createAction) {
    await fauna.query(
      q.Create(q.Collection("subscriptions"), { data: subscriptionData })
    );
  } else {
    await fauna.query(
      q.Replace(
        q.Select(
          "ref",
          q.Get(q.Match(q.Index("subscription_by_id"), subscriptionId))
        ),
        { data: subscriptionData }
      )
    );
  }
}
