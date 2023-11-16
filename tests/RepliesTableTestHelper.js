/* istanbul ignore file */

const pool = require('../src/Infrastructures/database/postgres/pool');
const CommentsTableTestHelper = require('./CommentsTableTestHelper');

const RepliesTableTestHelper = {
  async addReply({
    id = 'reply-123',
    content = 'content reply comment',
    owner = 'user-123',
    threadId = 'thread-123',
    commentId = 'comment-123',
    date = new Date().toISOString(),
  }) {
    const commentExists = await CommentsTableTestHelper.findCommentById(commentId);

    if (commentExists.length === 0) {
      await CommentsTableTestHelper.addComment(commentId);
    }

    const query = {
      text: 'INSERT INTO comment_replies VALUES ($1, $2, $3, $4, $5, $6)',
      values: [id, content, owner, threadId, commentId, date],
    };

    await pool.query(query);
  },

  async findReplyByIdIsDeleteFalse(replyId) {
    const query = {
      text: 'SELECT * FROM comment_replies WHERE id = $1 AND is_deleted = FALSE',
      values: [replyId],
    };
    const result = await pool.query(query);

    return result.rows;
  },

  async cleanTable() {
    await pool.query('DELETE FROM comment_replies');
  },
};

module.exports = RepliesTableTestHelper;
