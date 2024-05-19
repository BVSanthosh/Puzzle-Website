import { search_many_puzzles } from '/database';

export default async function handler(req, res) {
    const variant = req.query.variant ?? 'sudoku';
    let all_puzzles = await search_many_puzzles({"variant": variant});
    const max = req.query.maxPuzzles;
    if (max) {
        all_puzzles = all_puzzles.slice(0, max);
    }
    all_puzzles = all_puzzles.map(puzzle => {puzzle.id = puzzle._id; return puzzle});
    if (!req.query.variant) all_puzzles = {puzzles: all_puzzles};
    res.status(200).json(all_puzzles); 
}
