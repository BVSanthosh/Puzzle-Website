import { store_puzzle, close_connections } from '../database.js';
import { readFileSync } from 'fs';

if (process.argv.length !== 3) {
    console.log(`Usage: node adduser <puzzle file>`);
    process.exit();
}

const file = readFileSync(process.argv[2], {encoding:'utf8', flag:'r'});
try {
    const parsed = JSON.parse(file);
    await store_puzzle(parsed);
    close_connections();
} catch {
    console.log('Error parsing file.');
}
