import { get_puzzle } from '/database'

export default async function handler(req, res) {
    const { id } = req.query;
    const puzzle = await get_puzzle(id);
    if (puzzle) {
        res.status(200).json(puzzle);
    } else {
        res.status(404).json();
    }
}