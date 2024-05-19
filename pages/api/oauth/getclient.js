import { get_oauth_client } from "/database";

export default async function handler(req, res) {
    const client = req.body;
    const client_source = await get_oauth_client(client.client_id);
    res.status(200).json(client_source);
}