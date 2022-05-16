import { GetStaticProps } from 'next';
import  Head  from 'next/head';
import { format } from 'date-fns';
import ptBR from 'date-fns/locale/pt-BR';
import  * as Prismic from '@prismicio/client'
import { getPrismicClient } from '../services/prismic';
import Link from 'next/link'

import { FiCalendar, FiUser } from "react-icons/fi";
import commonStyles from '../styles/common.module.scss';
import styles from './home.module.scss';
import { RichText } from 'prismic-dom';
import { useState } from 'react';

interface Post {
  uid?: string;
  first_publication_date: string | null;
  data: {
    title: string;
    subtitle: string;
    author: string;
  };
}

interface PostPagination {
  next_page: string;
  results: Post[];
}

interface HomeProps {
  postsPagination: PostPagination;
}



export default function Home({postsPagination}:HomeProps) {

  const [nextPage, setNextPage] = useState<string>(postsPagination.next_page)
  const [postList, setPostList] = useState<Post[]>(postsPagination.results)
  const fetchPostHandle = async()=>{
    await fetch(nextPage).
    then(response=>response.json()).
    then(data=>{
      setNextPage(data.next_page)

      let newPost = data.results.map(post=>{
        return{
          uid:post.uid,
          first_publication_date:post.first_publication_date,
          data: {
            title: post.data.title,
            subtitle: post.data.subtitle,
            author: post.data.author,
          }
        }
      })
      
      setPostList([...postList,...newPost])
    })
  }


  return(
    <>
      <Head>
        <title>Home | DZ News</title>
      </Head>

      <main>
        <section className={styles.container}>
          <div className={styles.posts}> 
            {postList.map((post:any)=>{
              return(
              <Link href={`/post/${post.uid}`} key={post.uid}>
                <a>
                  <h1>{post.data.title}</h1>
                  <p>{post.data.subtitle}</p>
                  <div>
                    <time><FiCalendar color="white" className={styles.icon}/>
                      {format(
                      new Date( post.first_publication_date),
                      'dd MMM yyyy',{locale: ptBR,})}
                    </time>
                    <p><FiUser color="white" className={styles.icon}/>{post.data.author}</p>
                  </div>
                </a>
              </Link>
            )})}
          </div>
          {
            (nextPage?  
            <button 
              onClick={fetchPostHandle}>
              Carregar mais posts
            </button>  : ''
          )}
        </section>
      </main>
    </>
  )
}


 export const getStaticProps = async () => {
  const prismic = getPrismicClient({});


  const postsR = await prismic.getByType('posts',{
    pageSize:1
  });

  const posts = postsR.results.map(post=>{
    return{
      uid:post.uid,
      first_publication_date:post.first_publication_date,
      data: {
        title: post.data.title,
        subtitle: post.data.subtitle,
        author: post.data.author,
      }
    }
  })

  return {
    props:{
      postsPagination:{
          next_page: postsR.next_page,
          results: posts,
      }
    }
  }
 
}