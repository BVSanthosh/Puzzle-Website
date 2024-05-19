import { add_comment, get_comments, get_comment, edit_comment } from '/database';

let comments = [];

export default async (req, res) => {

    const { puzzle_id } = req.query;

    switch (req.method) {
        case 'GET':
          try {
            comments = await get_comments(puzzle_id);

            res.status(200).json(comments);
          } catch (error) {
            res.status(500).json({ error: 'Error fetching comments' });
          }
          break;
        case 'POST':
          const { user_id, text } = req.body;
    
          if (!user_id || !text) {
            res.status(400).json({ error: 'Missing required fields' });
            return;
          }
    
          try {
            const inserted_id = await add_comment(user_id, puzzle_id, text);
            const newComment = await get_comment(inserted_id);

            res.status(201).json(newComment);
          } catch (error) {
            res.status(500).json({ error: 'Error adding comment' });
          }
          break;
        case 'PUT':

          const { comment_id, edited_text } = req.body;
    
          if (!comment_id || !edited_text) {
            res.status(400).json({ error: 'Missing required fields' });
            return;
          }

          try {
            const edited = await edit_comment(comment_id, edited_text);
            console.log('edited comment object:', edited);
            res.status(200).json(edited);
          } catch (error) {
            res.status(500).json({ error: 'Error updating comment' });
          }
          break;
        default:
          res.status(405).json({ error: 'Method not allowed' });
          break;
    }
}