// Module for data storage and access

import { MongoClient, ObjectId } from 'mongodb';
import { readFileSync } from 'fs';
import randomstring from 'randomstring';
import process from 'node:process';
import bcrypt from 'bcrypt';

const config = JSON.parse(readFileSync('dbconfig.json'));

const uri = `mongodb://${config.user}:${config.password}@${config.host}:${config.port}/?serverSelectionTimeoutMS=2000`;
const client = new MongoClient(uri);
const db = client.db(config.database);

let inc = 0;

const collections = {
    users: db.collection('users'),
    puzzles: db.collection('puzzles'),
    logins: db.collection('login'),
    tokens: db.collection('tokens'),
    oauths: db.collection('oauth'),
    oauth_codes: db.collection('oauth-code'),
    oauth_clients: db.collection('oauth-client'),
    puzzles_complete: db.collection('completed-puzzles'),
    comments: db.collection('comments'),
    votes: db.collection('votes')
}

// cleanup on exit
process.on('uncaughtException', () => { client.close() });
process.on('exit', () => { client.close() });

/**
 * Closes database connections. Should only be used for testing or extreme circumstances.
 */
export function close_connections() {
    client.close();
}

/**
 * Creates a UUID.
 * @returns UUID
 */
function generate_uuid() {
    return `${randomstring.generate(16)}-${Date.now().toString(36)}${inc++}`;
}

/**
 * Returns the user data if they are registered and null otherwise.
 * @param {string} user_key The user's uuid
 * @returns                 The user's data if found, null otherwise.
 */
export async function get_local_user(user_uuid) {
    return await collections.users.findOne({_id: user_uuid});
}

/**
 * Returns an array of the users of every user currently registered
 * 
 * @returns {Array<string>}
 */
export async function all_users() {
    return (await collections.users.find({}).toArray());
}

/**
 * Returns the user data if they are registered and null otherwise.
 * @param {string} username The user's username.
 * @returns                 The user's data if found, null otherwise.
 */
export async function get_local_user_by_username(username) {
    return await collections.users.findOne({username: username, 'origin.name': 'Group 8'});
}

/**
 * Registers the user data in the database, and returns the user's UUID if successful.
 * @param {object} user_data  The user data to register.
 * @returns {Promise<string>} The user UUID assigned if successful, undefined otherwise.
 */
export async function register_local_user(user_data) {
    user_data._id = generate_uuid();
    user_data.origin = {name: 'Group 8', url: 'https://cs3099user08.host.cs.st-andrews.ac.uk', id: user_data._id};
    const success = await collections.users.insertOne(user_data);
    if (success.acknowledged) return user_data._id;
}

export async function register_foreign_user(user_data) {
    user_data._id = `${user_data.origin.url}/${user_data.origin.id}`;
    const exists = await collections.users.findOne({_id: user_data._id});
    if (exists) {
        const success = await collections.users.findOneAndReplace({_id: user_data._id}, user_data, {returnDocument: 'after'});
        return success;
    } else {
        const success = await collections.users.insertOne(user_data);
        if (success.acknowledged) return user_data;
    }
}

/**
 * Updates local user data of the uuid given.
 * @param {string} uuid 
 * @param {object} new_user_data Object containing fields that will be updated
 * @returns {object} The updated user data if it was successfully updated, undefined otherwise.
 */
export async function update_local_user(uuid, new_user_data) {
    let user_data = await collections.users.findOne({_id: uuid});
    if (!user_data) return false;
    for (const item in new_user_data) {
        user_data[item] = new_user_data[item];
    }
    const success = await collections.users.findOneAndReplace({_id: uuid}, user_data, {returnDocument: 'after'});
    return success.value;
}

/**
 * Deletes the local user data of the uuid given.
 * @param {string} uuid 
 * @returns {boolean} Whether the deletion was acknowledged.
 */
export async function delete_local_user(uuid) {
    const success = await collections.users.deleteOne({_id: uuid});
    return success.acknowledged;
}

/**
 * Registers a user login.
 * @param {string} username         
 * @param {string} password 
 * @returns {boolean} Whether the registration was acknowledged.
 */
export async function register_login(username, password) {
    const password_hash = await bcrypt.hash(password, 10);
    const success = await collections.logins.insertOne({username: username, password_hash: password_hash});
    return success.acknowledged;
}

/**
 * Returns true if the login details match, false otherwise.
 * @param {string} username
 * @param {string} password 
 * @returns        The UUID of the user that has been logged in.
 */
export async function authenticate_login(username, password) {
    const success = await collections.logins.findOne({username: username});
    if (success?.password_hash && await bcrypt.compare(password, success?.password_hash)) {
        return (await collections.users.findOne({username: username}))._id;
    };
}

export async function update_password(username, password) {
    const success = await collections.logins.findOneAndUpdate({username: username}, {$set: {password_hash: await bcrypt.hash(password, 10)}}, {returnDocument: 'after'});
    return success.value;
}

export async function update_username(old_username, new_username) {
    const success = await collections.logins.findOneAndUpdate({username: old_username}, {$set: {username: new_username}});
    return success.value;
}

export async function store_puzzle(puzzle) {
    puzzle._id = generate_uuid();
    const success = await collections.puzzles.insertOne(puzzle);
    if (success) return puzzle._id;
}

/**
 * Accepts a predicate for finding a puzzle in the form of {key: value} pairs. Returns the first match found.
 * @param {object} predicate 
 * @returns The first puzzle found matching the predicate.
 */
export async function search_puzzle(predicate) {
    const puzzle = await collections.puzzles.findOne(predicate);
    return puzzle;
}

/**
 * Returns the puzzle with the id provided.
 * @param {string} puzzle_id The puzzle's _id field.
 * @returns                  The puzzle if found.
 */
export async function get_puzzle(puzzle_id) {
    const puzzle = await collections.puzzles.findOne({_id: puzzle_id});
    return puzzle;
}

/**
 * Accepts a predicate for finding a puzzle in the form of {key: value} pairs. Returns all matches found.
 * @param {object} predicate 
 * @returns All puzzles found matching the predicate.
 */
export async function search_many_puzzles(predicate) {
    const r_puzzles = await collections.puzzles.find(predicate).toArray();
    return r_puzzles;
}

/**
 * Accepts a user and puzzle id, indicating that the given user has completed the provided puzzle
 * @param {string} user_id 
 * @param {string} puzzle_id 
 * @returns Whether the insertion was acknowledged
 */
export async function add_puzzle_complete(user_id, puzzle_id) {
    const success = await collections.puzzles_complete.insertOne({user_id: user_id, puzzle_id: puzzle_id, time_completed: (new Date()).getTime()});
    return success.acknowledged;
}

/**
 * Accepts a user id and returns a list of puzzle id's corresponding to puzzles that the user has completed
 * @param {string} user_id 
 * @returns A list containing objects of type {user_id, puzzle_id, time_completed}
 */
export async function get_puzzles_completed(user_id) {
    const r_puzzles = await collections.puzzles_complete.find({user_id: user_id}).toArray();
    return r_puzzles;
}

/**
 * Calculates a user's XP total based off of puzzles they have solved
 * @param {string} user_id 
 * @returns An XP value
 */
export async function get_user_xp(user_id) {
    const puzzles = await get_puzzles_completed(user_id);
    let xp = 0;
    for (const puzzle of puzzles) {
        const puzzle_data = await get_puzzle(puzzle.puzzle_id);
        xp += puzzle_data.difficulty * 10;
    }
    return xp;
}

/**
 * Adds a comment to the specified puzzle by the specified user
 * @param {string} user_id 
 * @param {string} puzzle_id 
 * @param {string} text 
 * @returns The comments' ID on success, false otherwise
 */
export async function add_comment(user_id, puzzle_id, text) {
    const success = await collections.comments.insertOne({user_id: user_id, puzzle_id: puzzle_id, text: text, timestamp: (new Date()).getTime()});
    return success.insertedId;
}

export async function get_comment(comment_id) {
    const comment = await collections.comments.findOne({_id: comment_id});
    const user = await get_local_user(comment.user_id);
    const name = user.display_name ? user.display_name : user.username;
    comment.username = name;
    return comment;
}

export async function get_comments(puzzle_id) {
    const comments = await collections.comments.find({puzzle_id: puzzle_id}).toArray();
    const u_comments = comments.map(comment => {
        return get_local_user(comment.user_id).then(user => {
            const name = user.display_name ? user.display_name : user.username;
            const new_comment = comment;
            new_comment.username = name;
            return new_comment;
        })
    });
    return await Promise.all(u_comments);
}

export async function edit_comment(comment_id, new_text) {
    const success = await collections.comments.findOneAndUpdate({_id: ObjectId(comment_id)}, {$set: {text: new_text}});
    return success.value;
}

/**
 * 
 * @param {*} user_id 
 * @param {*} puzzle_id 
 * @param {number} vote -1 to represent downvote, 1 to represent upvote, 0 to represent no vote 
 * @returns 
 */
export async function vote_puzzle(user_id, puzzle_id, vote) {
    const has_puzzle = await collections.votes.findOne({user_id: user_id, puzzle_id: puzzle_id});
    if (has_puzzle) {
        const success = await collections.votes.findOneAndUpdate({user_id: user_id, puzzle_id: puzzle_id}, {$set: {vote: vote}});
        return success.value;
    } else {
        const success = await collections.votes.insertOne({user_id: user_id, puzzle_id: puzzle_id, vote: vote});
        return success.acknowledged;
    }
}

export async function get_puzzle_votes(puzzle_id) {
    const votes = await collections.votes.find({puzzle_id: puzzle_id}).toArray();
    return votes;
}

/**
 * Adds a code used in the oauth validation process.
 * @param {string} code The code to add
 * @param {string} client_id The client for whom the code was dispensed.
 * @returns                  The code created.
 */
export async function create_oauth_code(client_id) {
    const code = `${client_id}-${generate_uuid()}`;
    const success = await collections.oauth_codes.insertOne({code: code, client_id: client_id});
    if (success.acknowledged) return code;
}

/**
 * Fetches an oauth code if it has been dispensed.
 * @param {string} code The code to search for
 * @returns The code's owner if found.
 */
export async function has_oauth_code(code) {
    const r = await collections.oauth_codes.findOne({code: code});
    return r?.client_id;
}

/**
 * Deletes an oauth code from memory.
 * @param {string} code The code to delete
 * @returns             Whether or not the deletion was successful.
 */
export async function delete_oauth_code(code) {
    const success = await collections.oauth_codes.deleteOne({code: code});
    return success.acknowledged;
}

/**
 * Creates and registers an oauth token into the database.
 * @param {string} token_owner       The user UUID for whom the token was created.
 * @param {number} timestamp_issued  The timestamp it was created on.
 * @returns                          The token.
 */
export async function issue_oauth_token(token_owner, timestamp_issued) {
    const issued_token = `TKN-${generate_uuid()}`;
    const success = await collections.tokens.insertOne({id: issued_token, owner: token_owner, timestamp: timestamp_issued});
    if (success.acknowledged) return issued_token;
}

/**
 * Returns the token's owner.
 * @param {string} issued_token_id 
 * @returns {string} User's UUID.
 */
export async function get_oauth_owner(issued_token_id) {
    const token = await collections.tokens.findOne({id: issued_token_id});
    return token?.owner;
}

export async function set_oauth_client(client_id, client_secret, redirect_url, host) {
    const success = await collections.oauth_clients.insertOne({client_id: client_id, client_secret: client_secret, redirect_url: redirect_url, host: host});
    return success.acknowledged;
}

export async function get_oauth_client(client_id) {
    const client = await collections.oauth_clients.findOne({client_id: client_id});
    return client;
}