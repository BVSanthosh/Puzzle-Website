import { has_oauth_code, delete_oauth_code } from '/database';

export default async function handler(req, res) {
    const code = req.body.code;
    const hascode = await has_oauth_code(code);
    if (hascode) {
        await delete_oauth_code(code);
        return res.status(200).json();
    }
    return res.status(404).json();
}