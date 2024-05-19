import { get_puzzle_votes } from '/database';

export default async function handler(req, res) {
    const votes = await get_puzzle_votes(req.query.pid);
    const value = votes.reduce((acc, current) => acc + current.vote, 0);
    res.status(200).json({value: value}); 
}
