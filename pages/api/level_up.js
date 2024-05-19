import { add_puzzle_complete } from '/database';

export default async (req, res) => {
    if (req.method === 'POST') {
        const { user_id, puzzle_id } = req.body;

        console.log('values:', user_id, puzzle_id);

        if (!user_id || !puzzle_id) {
            return res.status(400).json({ error: 'Invalid input data' });
        }

        try {
            let added_puzzle = await add_puzzle_complete(user_id, puzzle_id);

            console.log(added_puzzle);

            if (added_puzzle) {
            console.log('Solved puzzle added to user profile');
            return res.status(201).json({});
            } else {
            console.error('Error adding solved puzzle');
            return res.status(500).json({ error: 'Error adding solved puzzle' });
            }
        } catch (err) {
            console.error('Error adding solved puzzle:', err);
            return res.status(500).json({ error: 'Error adding solved puzzle' });
        }
    }
}