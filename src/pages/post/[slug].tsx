import { ptBR } from 'date-fns/locale';
import { GetStaticPaths, GetStaticProps } from 'next';
import path from 'path';
import { format } from 'date-fns';

import { getPrismicClient } from '../../services/prismic';

import commonStyles from '../../styles/common.module.scss';
import styles from './post.module.scss';
import { RichText } from 'prismic-dom';
import { FiCalendar, FiClock, FiUser } from 'react-icons/fi';
import { useRouter } from 'next/router';
import Head from 'next/head';

interface Post {
  first_publication_date: string | null;
  data: {
    title: string;
    banner: {
      url: string;
    };
    author: string;
    content: {
      heading: string;
      body: {
        text: string;
      }[];
    }[];
  };
}

interface PostProps {
  post: Post;
}

export default function Post<PostProps>({post}) {
  
  const router = useRouter()
  if (router.isFallback) {
    return <span className={styles.fallback}>Carregando...</span>
  }
  
  const first_publication_date = post.first_publication_date
  const data = post.data

  const wordCount = Math.round(
    data.content.reduce(
      (acc, content)=>{
        return(
          acc +
          (content.heading?.toString().lenght || 0) +
          content.body.reduce((acc, body)=> 
            acc + body.text?.toString().split(' ').length,0
          )
        )},0)
      )
  ;

  const wordsPerMin = 200;


  const readTime = Math.ceil( wordCount / wordsPerMin)


  return(
    <>
      <Head>
        <title>{data.title}</title>
      </Head>
      <img className = {styles.banner} src = {data.banner.url} alt="" />
      <div className = {styles.container}>
        <h1 className = {styles.title}>{data.title}</h1>
        <div className = {styles.info}>
          <time><FiCalendar className = {styles.icon}/>{format(
        new Date(first_publication_date), 'dd MMM yyyy',{locale:ptBR})}</time>
          <p><FiUser className = {styles.icon}/>{data.author}</p>
          <time><FiClock className={styles.icon}/>{readTime} min</time>
        </div>
      </div>
          {data.content.map(content=>{
            return(
              <div key = {content.heading} className = {styles.content}>
                <h3 className = {styles.heading}>{content.heading}</h3>
                <div className={styles.body} dangerouslySetInnerHTML={{__html:RichText.asHtml(content.body)}}/>
              </div>
            )}
          )}
    </>
  )
}

export const getStaticPaths:GetStaticPaths = async () => {
  const prismic = getPrismicClient({});
  const posts = await prismic.getByType('posts');
  console.log(posts.results[0].slugs)
  return{
    // paths:[],
    paths: posts.results.map((post)=>{
      return({
        params:{
          slug: post.uid
        }
      })
    }),
    fallback: true
  }
  // TODO
};

export const getStaticProps = async ({params }) => {
  const prismic = getPrismicClient({});
  const {slug} = params;
  const response = await prismic.getByUID('posts', String(slug));
  if(!response){
    return{
      redirect:{
      destination: '/',
      permanent: false,}
    }
  }
  
  const post = {
    uid: response.uid,
    first_publication_date: response.first_publication_date,
    last_publication_date: response.last_publication_date,
    data: {
      title: response.data.title,
      subtitle: response.data.subtitle,
      author: response.data.author,
      banner: {
        url: response.data.banner.url,
      },
      content: response.data.content.map(content => {
        return {
          heading: content.heading,
          body: [...content.body],
        };
      }),
    },
  };
  return{
    props:{
      post
    }
  }
};
