import { get_local_user_by_username, create_oauth_code } from '/database';

export default async function handler(req, res) {
    const client_id = req.body.client_id;
    const uuid = req.body.uuid;
    if (!client_id || !uuid) return res.status(404).json();
    const code = await create_oauth_code(uuid, client_id);
    console.log(`Created code for uuid ${uuid} for client_id ${client_id}`)
    res.status(200).json({code: code});
}