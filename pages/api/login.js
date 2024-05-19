import { authenticate_login, get_local_user } from '../../database';
import jwt from 'jsonwebtoken';
import getConfig from 'next/config';

const { serverRuntimeConfig } = getConfig();

export default async (req, res) => {

    const { username, password } = req.body;

    const uuid = await authenticate_login(username, password);

    if(!uuid){
        console.log("Invalid credentials");
        return res.status(401).json({});
    }
    let user_data = await get_local_user(uuid);

    if (req.query.nocookie !== undefined) {
        return res.status(200).json({ uuid: uuid });
    }

    const payload = {
        username: user_data.username,
        email: user_data.email,
        user_id: user_data._id,
        display_name: user_data.display_name
    };

    const token = jwt.sign(
        payload,
        serverRuntimeConfig.secret,
        {
            expiresIn: '1d'
        }
    );

    return res.status(200).json({
        username: payload.username,
        email: payload.email,
        user_id: payload.user_id,
        display_name: payload.display_name,
        token
    });
}
