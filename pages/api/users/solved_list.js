import { get_local_user, get_user_xp, get_puzzles_completed, } from '/database';

export default async (req, res) => {
    if (req.method === 'POST') {
        const { user_id } = req.body;
        let solved = await get_puzzles_completed(user_id);
        console.log(solved);
        res.status(200).json(solved);
    }
}  