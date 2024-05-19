import jwt from 'jsonwebtoken';
import getConfig from 'next/config';
import { get_oauth_client, register_foreign_user } from '/database';

const { serverRuntimeConfig } = getConfig();

export default async function(req, res) {
    const { access_token, client_id } = req.body;

    const client_data = await get_oauth_client(client_id);
    const user_data = await fetch(`${client_data.host}/api/user/me`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({access_token: access_token})
    }).then(res => res.json());

    const new_user_data = (await register_foreign_user(user_data))?.value;

    console.log(new_user_data)

    const payload = {
        client_id: client_id,
        username: new_user_data.username,
        user_id: new_user_data._id,
        display_name: new_user_data.display_name
    }

    const token = jwt.sign(
        payload,
        serverRuntimeConfig.secret,
        {
            expiresIn: '1d'
        }
    );

    return res.status(200).json({
        client_id: client_id,
        username: new_user_data.username,
        user_id: new_user_data._id,
        display_name: payload.display_name,
        token
    })
}