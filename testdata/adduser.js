import { register_local_user, register_login, close_connections } from '../database.js';

if (process.argv.length !== 4) {
    console.log(`Usage: node adduser <username> <password>`);
    process.exit();
}

await register_local_user({username: process.argv[2], origin: {}});
await register_login(process.argv[2], process.argv[3]);
close_connections();