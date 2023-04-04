import type { AppProps } from "next/app";
import { Header } from "../components/Header";
import { SessionProvider as NextAuthSessionProvider } from "next-auth/react";

import { PrismicProvider } from "@prismicio/react";
import { PrismicPreview } from "@prismicio/next";
import { repositoryName } from "../services/prismic";
import "../styles/global.scss";
import Link from "next/link";

export default function App({
  Component,
  pageProps: { session, ...pageProps },
}: AppProps) {
  return (
    <NextAuthSessionProvider session={session}>
      <Header />
      <PrismicProvider internalLinkComponent={(props) => <Link {...props} />}>
        <PrismicPreview repositoryName={repositoryName}>
          <Component {...pageProps} />
        </PrismicPreview>
      </PrismicProvider>
    </NextAuthSessionProvider>
  );
}
