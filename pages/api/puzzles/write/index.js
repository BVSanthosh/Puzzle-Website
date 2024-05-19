import { store_puzzle } from '/database'

export default async function handler(req, res) {
    try {
        const puzzle = req.body;
        const success = await store_puzzle(JSON.parse(puzzle));
        if (success) {
            res.status(200).json({new_puzzle_id: success});
        } else {
            res.status(500).json();
        }
    } catch {
        return res.status(406).json();
    }
}