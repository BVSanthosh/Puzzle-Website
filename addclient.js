import { set_oauth_client } from './database.js';

const client_id = process.argv[2];
const client_secret = process.argv[3];
const redirect_url = process.argv[4];
const hostpage = process.argv[5];

if (process.argv.length !== 6) {
    console.log(`Usage: node addclient <client_id> <client_secret> <redirect_url> <host>`);
}

console.log(`Adding the following client:`);
console.log(`Client ID: ${client_id}\nClient Secret: ${client_secret}\nRedirect URL: ${redirect_url}\nHost: ${hostpage}`);

await set_oauth_client(client_id, client_secret, redirect_url, hostpage);

console.log(`Client Added`);