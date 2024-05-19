import { search_puzzle } from '../../database';

export default async (req, res) => {

    const predicate = req.body;
    const puzzle = await search_puzzle(predicate);

    return res.status(200).json(puzzle);
}