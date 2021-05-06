import { query as q } from 'faunadb'

import NextAuth from 'next-auth'
import { session } from 'next-auth/client'
import Providers from 'next-auth/providers'

import { fauna } from '../../../services/fauna'


export default NextAuth({
    providers: [
        Providers.GitHub({
            clientId: process.env.GITHUB_CLIENT_ID,
            clientSecret: process.env.GITHUB_CLIENT_SECRET,
            scope: 'read:user'
        }),
    ],
    callbacks: {
        async session(session){
            try{
                const userActiveSubscription = await fauna.query(
                    q.Get(
                        q.Intersection([
                            q.Match(
                                q.Index('subscription_by_user_ref'),
                                q.Select(                       //Pego o Ref do usuario por email
                                    "ref",
                                    q.Get(
                                        q.Match(                    //procura o email que bate com o casefold
                                            q.Index('user_by_email'),
                                            q.Casefold(session.user.email)
                                        )
                                    )
                                )
                            ),
                            q.Match(                                //além disso procura qual está ativo
                                q.Index('subscription_by_status'),
                                "active"
                            )
                            ])
                    )
    
                )
                return {
                    ...session,
                    activeSubscription: userActiveSubscription
                }
                
            }catch{
                return{
                    ...session,
                    activeSubscription: null
                }
            }
        },
        async signIn(user, account, profile) {

            const { email } = user
            try {
                await fauna.query(
                    q.If(       //Se não existir um email desse cadastrado, crie, senão me retorne os dados
                        q.Not(
                            q.Exists(
                                q.Match(   //como se fosse o WHERE do mysql
                                    q.Index('user_by_email'),
                                    q.Casefold(user.email)        //Lower case
                                )
                            )
                        ),
                        q.Create(
                            q.Collection('users'),
                            { data: { email } }
                        ),
                        q.Get(  //como se fosse o SELECT do mysql
                            q.Exists(   //Retorna os dados de acordo com esse email
                                q.Match(
                                    q.Index('user_by_email'),
                                    q.Casefold(user.email)
                                )
                            )
                        )
                    ))
                return true
            } catch {
                return false
            }



        },
    }
})