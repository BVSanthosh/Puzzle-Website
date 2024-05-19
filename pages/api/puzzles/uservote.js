import { get_puzzle_votes } from '/database';

export default async function handler(req, res) {
    const votes = await get_puzzle_votes(req.query.pid);
    const uid = req.query.uid;
    const value = votes.filter(vote => vote.user_id === uid);
    res.status(200).json({value: value[0]?.vote}); 
}
