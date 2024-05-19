// redirects from /oauth/token
import { has_oauth_code, delete_oauth_code, get_oauth_client, issue_oauth_token } from '/database';

export default async function handler(req, res) {
    console.log(`Getting token request:`);
    console.log(req.body);
    const body = req.body;
    console.log(body);
    const [access_code, client_id, client_secret] = [body['access_code'], body['client_id'], body['client_secret']];
    console.log(`${access_code}\n${client_id}\n${client_secret}`);
    if (!access_code || !client_id || !client_secret) {
        return res.status(401).json({error_message: "Missing field."});
    } else {
        // Check if code exists
        const owner = await has_oauth_code(access_code);
        console.log(`Oauth Owner: ${owner}`);
        if (owner) {
            const client = await get_oauth_client(client_id); //get client details
            console.log(`Client Details:`);
            console.log(client);
            if (client && client.client_id === client_id && client.client_secret === client_secret) { //check matching details
                await delete_oauth_code(access_code);
                const token = await issue_oauth_token(owner, new Date());
                console.log(`Sending ${token}`);
                return res.status(200).json({access_token: token});
            }
            return res.status(401).json({error_message: "Provided authentication details to not match registered details."});
        } else {
            return res.status(401).json({error_message: "Invalid code."});
        }
    }
}