import { AuthOptions } from "next-auth";
import GithubProvider from "next-auth/providers/github";
import { createUserIfNotExist, fauna } from "./fauna";
import { query as q } from "faunadb";


const providers = [
  GithubProvider({
    clientId: process.env.GITHUB_CLIENT_ID as string,
    clientSecret: process.env.GITHUB_CLIENT_SECRET as string,
  }),
];

export const authOptions: AuthOptions = {
  providers,
  callbacks: {
    
    async signIn({ user }) {

      let userCreated: boolean = false;
      const { email } = user;

      try {
        userCreated = !!await createUserIfNotExist(email!);
      } catch (error) {
        console.log(error);
      }
      return userCreated;
    },

    async session({ session }) {

      try {
        const userSubscription = await fauna.query<string>(
          q.Get(
            q.Intersection(
              [
                q.Match(
                  q.Index('subscription_by_user_ref'),
                  q.Select(
                    "ref",
                    q.Get(
                      q.Match(
                        q.Index('user_by_email'),
                        q.Casefold(session.user?.email!)
                      )
                    )
                  )
                ),
                q.Match(
                  q.Index('subscription_by_status'),
                  "active",
                )
              ]
            )
          )
        )

        return {
          ...session,
          activeSubscription: userSubscription
        }
        
      } catch {
        return {
          ...session,
          activeSubscription: null
        }
      }
    },
  },
};