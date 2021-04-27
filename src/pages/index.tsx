import { GetStaticProps } from 'next';

import Head from 'next/head'
import { SubscribeButton } from '../components/SubscribeButton'
import { stripe } from '../services/stripe';
import styles from './home.module.scss'

// Client-side - Quando não precisa de indexação
// Server-side - Quando precisa de indexação do google e temos dados mais dinâmicos (busca assincrona)
// Static Site Generation - Quando Precisa de Indexação do google e temos dados estaticos(busca sincrona) - Maior performace

interface HomeProps{
  product:{
    priceId: string;
    amount: number;
  }
}

export default function Home({product}:HomeProps) {
  return (
    <>
       <Head>
         <title>Home | Ig.News</title>
        </Head>
        <main className={styles.contentContainer}>
          <section className={styles.hero}>
            <span>👏 Hey, welcome</span>
            <h1>News about the <span>React</span> word.</h1>
            <p>
              Get access to all the publications <br/>
              <span>for {product.amount} month</span> 
            </p>
            <SubscribeButton  priceId={product.priceId}/>
          </section>
          <img src="/images/avatar.svg" alt="Girl Coding"/>
        </main>
    </>
  )
}

//retrive é busca de um só, segundo o stripe
export const getStaticProps: GetStaticProps = async() => {
  const price = await stripe.prices.retrieve('price_1IkXmwDvJg6uMqJbegslLoBY',{ 
    expand: ['product']
  })  

  const product = {
    priceId: price.id,
    amount: new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(price.unit_amount / 100),
  };

  return{
    props: {
      product,
    },
    revalidate: 60 * 60 * 24, //24hrs
  }
}