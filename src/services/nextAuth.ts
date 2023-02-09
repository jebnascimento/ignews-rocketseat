import GithubProvider from "next-auth/providers/github"
import { createUserIfNotExist } from "./fauna"

const gitHubProvider = [
  GithubProvider({
    clientId: process.env.GITHUB_CLIENT_ID as string,
    clientSecret: process.env.GITHUB_CLIENT_SECRET as string,
  }),
]

async function signIn( {user, account, profile}: any) {

  const { email } = user;

  const userCreated = await createUserIfNotExist(email)
  if(userCreated){
    return true
  }
  return false
}

export const authOptions = {
  providers: gitHubProvider,
  callbacks: {
    signIn,

  }
}