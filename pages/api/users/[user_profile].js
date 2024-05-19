import { get_local_user, get_user_xp, get_puzzles_completed, } from '/database';

export default async (req, res) => {

    const { user_profile } = req.query;

    let user = await get_local_user(user_profile);
    let xp = await get_user_xp(user_profile);
    let solved = await get_puzzles_completed(user_profile);

    user['xp'] = xp;
    user['solved'] = solved.length;

    console.log('xp:', xp);
    console.log('solved:', solved.length);
    console.log(user);

    res.status(200).json(user);
}  