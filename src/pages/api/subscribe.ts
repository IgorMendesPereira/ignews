import { NextApiRequest, NextApiResponse } from "next";
import {query as q } from 'faunadb'
import { getSession } from 'next-auth/client' //buscar o cookie do usuário logado
import { fauna } from "../../services/fauna";
import { stripe } from "../../services/stripe";

type User = {
    ref: {
        id:string;
    }
    data:{
        stripe_customer_id: string;
    }
}

export default async ( req: NextApiRequest, res: NextApiResponse ) => {
    if(req.method === 'POST'){
        const session = await getSession({ req })  //Buscamos o cookie do usário logado

        //Busca o id do stripe do usuario dentro do DB
        const user = await fauna.query<User>(
            q.Get(
                q.Match(
                    q.Index('user_by_email'),
                    q.Casefold(session.user.email)
                )
            )
        )

        let costumerId = user.data.stripe_customer_id 


        //fazendo a verificação se já existe esse usuário criado no stripe
        //se não exister, cria e atualiza o banco de dados do usuário
        //se existir não cria outro usuário no stripe e o mesmo é reaproveitado
        if (!costumerId){
            //Criamos um usuário dentro do stripe com o email que foi logado pelo GitHub
        const stripeCustomer = await stripe.customers.create({
            email: session.user.email,
            //metadata:
        })

        //atualizamos o banco de dados no fauna com o id do stripe
        await fauna.query(
            q.Update(
                q.Ref(q.Collection('users'),user.ref.id),
                {
                    data:{
                        stripe_customer_id: stripeCustomer.id,
                    }
                }
            )
        )
        costumerId = stripeCustomer.id
        }
 

        //Aqui criamos uma checkout para pagamento   
        const stripeCheckoutSession = await stripe.checkout.sessions.create({
            customer: costumerId,
            payment_method_types: ['card'],
            billing_address_collection: 'required',
            line_items: [
                {price: 'price_1IkXmwDvJg6uMqJbegslLoBY', quantity: 1}
            ],
            mode: 'subscription',
            allow_promotion_codes: true,
            success_url: process.env.STRIPE_SUCCESS_URL,
            cancel_url: process.env.STRIPE_CANCEL_URL,
        })

        return res.status(200).json( {sessionId: stripeCheckoutSession.id})
    }else{
        res.setHeader('Allow', 'POST')
        res.status(405).end('Method not allowed')
    }
}