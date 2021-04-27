import { NextApiRequest, NextApiResponse} from 'next';

export default (request: NextApiRequest, response: NextApiResponse) =>{
    const users = [
        {id: 1, name: 'Igor'},
        {id: 2, name: 'Marcos'},
        {id: 3, name: 'Edu'},
    ]

    return response.json(users)
}