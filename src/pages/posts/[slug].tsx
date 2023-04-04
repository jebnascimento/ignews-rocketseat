import { getSession } from "next-auth/react";
import { GetServerSideProps } from "next/types";
import { createClient } from "../../services/prismic";
import { RichText } from "prismic-dom";
import Head from "next/head";
import styles from "./post.module.scss";
import { ParsedUrlQuery } from "querystring";

interface PostProps {
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

const Post: React.FC<PostProps> = ({ post }) => {
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
            className={styles.postContent} 
            dangerouslySetInnerHTML={{__html: post.content}} />
        </article>
      </main>
    </>
  )
}

export default Post;


export const getServerSideProps: GetServerSideProps = async ({ req, params, previewData }) => {
  
  const { slug } = params as Params;
  const session = await getSession({ req })
  
  if(!session?.activeSubscription){
    return {
      redirect: {
        destination: '/',
        permanent: false
      }
    }
  }
  
  const prismic = createClient({ previewData, ...req})
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
    content: RichText.asHtml(response.data.content),
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
  };
}



