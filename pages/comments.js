import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { setItem, getItem } from './localStorage';
import styles from '../styles/comments.module.css'

function CommentSection(props) {

    const { user_id, puzzle_id } = props;
    const [comments, setComments] = useState([]);
    const [newComment, setNewComment] = useState('');

  useEffect(() => {
    async function fetchComments() {
      const res = await fetch(`/api/comments/${puzzle_id}`);
      const data = await res.json();
      data.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
      setComments(data);
    }

    const intervalId = setInterval(fetchComments, 100);
    return () => clearInterval(intervalId);
  }, [puzzle_id, comments]);

  async function handleAddComment(e) {
    e.preventDefault();

    const res = await fetch(`/api/comments/${puzzle_id}`, {
      method: 'POST',
      body: JSON.stringify({ user_id: user_id, text: newComment }),
      headers: { 'Content-Type': 'application/json' }
    });
    const data = await res.json();
    setComments([...comments, data]);
    setNewComment('');
  }

  async function handleEditComment(e, commentId) {
    e.preventDefault();
  
    const res = await fetch(`/api/comments/${puzzle_id}`, {
      method: 'PUT',
      body: JSON.stringify({ comment_id: commentId, edited_text: newComment }),
      headers: { 'Content-Type': 'application/json' }
    });
    const data = await res.json();
    console.log(data);
    const newComments = [...comments];
    const commentIndex = newComments.findIndex(comment => comment._id === commentId);
    newComments[commentIndex] = data;
    setComments(newComments);
    setNewComment('');
  }

  return (
    <>
      <h2 className={styles.heading}>Comments</h2>
      <ul className={styles.list}>
        {comments.map(comment => (
          <a key={comment._id}>
            <div className={styles.contentBox}>
            {comment.username}: {comment.text}
            </div>
            <form onSubmit={e => handleEditComment(e, comment._id)}>
              <input className={styles.commentInput} type="text" value={newComment} onChange={e => setNewComment(e.target.value)} />
              <button className={styles.editButton} type="submit">Edit</button>
            </form>
          </a>
        ))}
      </ul>

      <form className={styles.submit} onSubmit={handleAddComment}>
        <input className={styles.commentCreate} type="text" value={newComment} onChange={e => setNewComment(e.target.value)} />
        <button className={styles.editButton} type="submit">Add Comment</button>
      </form>
    </>
  );
}

export default CommentSection;