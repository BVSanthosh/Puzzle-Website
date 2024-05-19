import * as db from '../database';
import randomstring from 'randomstring';

let dummy_user;
let dummy_login;

function get_dummy_user() {
    return {username: `Username-${Date.now().toString()}-${randomstring.generate(5)}`, pronouns: ['he/him']}
}

function get_dummy_login(username) {
    return {username: username, password: randomstring.generate(20)};
}


test('Registering a user adds the user', async () => {
    const uuid = await db.register_local_user(dummy_user);
    expect(uuid).toBeTruthy();
    const user_in_db = await db.get_local_user(uuid);
    expect(user_in_db.username).toBe(dummy_user.username);
});

test('Registering a login makes that login valid', async () => {
    await db.register_local_user(dummy_user);
    const success = await db.register_login(dummy_login.username, dummy_login.password);
    expect(success).toBeTruthy();
    const login_success = await db.authenticate_login(dummy_login.username, dummy_login.password);
    expect(login_success).toBeTruthy();
})

test('Updating a user changes their data', async () => {
    const uuid = await db.register_local_user(dummy_user);
    expect(uuid).toBeTruthy();
    const updated = await db.update_local_user(uuid, {pronouns: ['she/her']});
    expect(updated).toBeTruthy();
    expect(updated.username).toBe(dummy_user.username);
    expect(updated.pronouns[0]).toBe('she/her');
})

test('Deleting a user removes their data from the database', async () => {
    const uuid = await db.register_local_user(dummy_user);
    expect(uuid).toBeTruthy();
    const deleted = await db.delete_local_user(uuid);
    expect(deleted).toBeTruthy();
    const success = await db.get_local_user(uuid);
    expect(success).toBeFalsy();
})

test('Changing a password changes the password', async () => {
    await db.register_local_user(dummy_user);
    const register_success = await db.register_login(dummy_login.username, dummy_login.password);
    expect(register_success).toBeTruthy();
    const change_success = await db.update_password(dummy_login.username, 'new_password');
    expect(change_success).toBeTruthy();
    const login_fail = await db.authenticate_login(dummy_login.username, dummy_login.password);
    expect(login_fail).toBeFalsy();
    const login_success = await db.authenticate_login(dummy_login.username, 'new_password');
    expect(login_success).toBeTruthy();
})

test('Registering puzzles as complete by the user', async () => {
    const uid = await db.register_local_user(dummy_user);
    const pid1 = await db.store_puzzle({data: randomstring.generate(30)});
    const pid2 = await db.store_puzzle({data: randomstring.generate(30)});
    const success = await db.add_puzzle_complete(uid, pid1);
    const success2 = await db.add_puzzle_complete(uid, pid2);
    expect(success).toBeTruthy();
    expect(success2).toBeTruthy();
    const get_data = await db.get_puzzles_completed(uid);
    expect(get_data).toBeTruthy();
    expect(get_data.length).toBe(2);
    expect(get_data[0].puzzle_id).toBe(pid1);
    expect(get_data[1].puzzle_id).toBe(pid2);
})

test('You can derive an XP value from puzzles', async () => {
    const uid = await db.register_local_user(dummy_user);
    const pid1 = await db.store_puzzle({data: randomstring.generate(30), difficulty: 3});
    const pid2 = await db.store_puzzle({data: randomstring.generate(30), difficulty: 5});
    await db.add_puzzle_complete(uid, pid1);
    await db.add_puzzle_complete(uid, pid2);
    const xp = await db.get_user_xp(uid);
    expect(xp > 0).toBeTruthy();
})

test('Adding a comment adds the comment', async() => {
    const uid = await db.register_local_user(dummy_user);
    const pid = await db.store_puzzle({data: randomstring.generate(30), difficulty: 3});
    const s = await db.add_comment(uid, pid, "Dummy text");
    expect(s).toBeTruthy();
    const comments = await db.get_comments(pid);
    expect(comments.length).toBe(1);
})

test('Editing a comment edits the comment', async() => {
    const uid = await db.register_local_user(dummy_user);
    const pid = await db.store_puzzle({data: randomstring.generate(30), difficulty: 3});
    const cid = await db.add_comment(uid, pid, "Dummy text");
    const s = db.edit_comment(cid, "New text");
    expect(s).toBeTruthy();
    const comments = await db.get_comments(pid);
    expect(comments[0].text).toBe("New text");
})

afterAll(done => {
    db.close_connections();
    done();
})

beforeEach(() => {
    dummy_user = get_dummy_user();
    dummy_login = get_dummy_login(dummy_user.username);
})