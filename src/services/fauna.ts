import { Client } from 'faunadb'
import { query as q } from "faunadb"

export const fauna = new Client({
  secret: process.env.FAUNADB_KEY as string,
})


export async function createUserIfNotExist (userEmail: string) {
  return await fauna.query(
    q.If(
      q.Not(
        q.Exists(
          q.Match(
            q.Index('user_by_email'),
            q.Casefold(userEmail)
          )
      )
    ),
      q.Create(
        q.Collection('users'),
        { data: { userEmail } }
      ),
      q.Get(
        q.Match(
          q.Index('user_by_email'),
          q.Casefold(userEmail)
        )
      )
    )
  )
}


export async function getUser<T> (userEmail: string): Promise<T> {
  return await fauna.query(
    q.Get(
      q.Match(
        q.Index('user_by_email'),
        q.Casefold(userEmail)
      )
    )
  )
}

export async function updateUser (userRef: string, stripeCustomerId: string) {
  await fauna.query(
    q.Update(
      q.Ref(q.Collection('users'), userRef),
      {
        data: {
          stripe_customer_id: stripeCustomerId,
        },
      },
    )
  )
}

