import { get_oauth_owner, get_local_user } from '/database';

export default async function handler(req, res) {
    const { access_token } = req.body;
    console.log(`Recieving access token: ${access_token}`)
    const owner_uuid = await get_oauth_owner(access_token);
    if (owner_uuid) {
        const owner = await get_local_user(owner_uuid);
        if (owner) {
            res.status(200).json(owner);
            return;
        }
    }
    res.status(404).json();
}