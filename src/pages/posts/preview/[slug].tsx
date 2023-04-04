import { useSession } from "next-auth/react";
import { GetStaticPaths, GetStaticProps } from "next/types";
import { createClient } from "../../../services/prismic";
import { RichText } from "prismic-dom";
import Link from "next/link";
import Head from "next/head";
import styles from "../post.module.scss";
import { ParsedUrlQuery } from "querystring";
import { useEffect } from "react";
import { useRouter } from "next/router";

interface PostPreviewProps {
  post: {
    slug: string;
    title: string;
    content: string;
    updatedAt: string;
  }
}

interface Params extends ParsedUrlQuery {
  slug: string;
}

const PostPreview: React.FC<PostPreviewProps> = ({ post }) => {

  const session = useSession();
  const router = useRouter();

  useEffect(() => {
    if(session?.data?.activeSubscription){
      router.push(`/posts/${post.slug}`)
    }
  }, [session])
  
  return (
    <>
      <Head>
        <title>{post.title} | ignews </title>
      </Head>

      <main className={styles.container}>
        <article className={styles.post}>
          <h1>{post.title}</h1>
          <time>{post.updatedAt}</time>
          <div
            className={`${styles.postContent} ${styles.previewContent}`} 
            dangerouslySetInnerHTML={{__html: post.content}} />

            <div className={styles.continueReading}>
              Wanna continue reading
              <Link href="/" >Subscribe Now! 🤗</Link>
            </div>
        </article>
      </main>
    </>
  )
}

export default PostPreview;


export const getStaticPaths: GetStaticPaths = async () => {
  return {
    paths: [],
    fallback: 'blocking'
  }
}

export const getStaticProps: GetStaticProps = async ({ params, previewData }) => {
  
  const { slug } = params as Params;
  
  const prismic = createClient({ previewData })
  const response = await prismic.getByUID('post', String(slug), {})

  if (!response) {
    return {
      redirect: {
        destination: '/',
        permanent: false
      }
    }
  }

  const post = {
    slug,
    title: RichText.asText(response.data.title),
    content: RichText.asHtml(response.data.content.splice(0, 3)),
    updatedAt: new Date(response.last_publication_date).toLocaleDateString(
      "pt-BR",
      {
        day: "2-digit",
        month: "long",
        year: "numeric",
      }
    ),
  }

  return {
    props: {
      post
    },
    revalidate: 60 * 30 // 30 minutes,
  };
}



