import type { AppProps } from 'next/app'
import { Header } from '../components/Header'
import { SessionProvider as NextAuthSessionProvider } from "next-auth/react"

import '../styles/global.scss'

export default function App({ 
  Component, 
  pageProps: {session, ...pageProps}, 
}: AppProps) {
  return (
    <NextAuthSessionProvider session={session}>
      <Header />
      <Component {...pageProps} />
    </NextAuthSessionProvider>
  )
}
