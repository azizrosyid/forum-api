const AuthorizationError = require('../../Commons/exceptions/AuthorizationError');
const NotFoundError = require('../../Commons/exceptions/NotFoundError');
const CommentRepository = require('../../Domains/comments/CommentRepository');
const AddedComment = require('../../Domains/comments/entities/AddedComment');
const DetailComment = require('../../Domains/comments/entities/DetailComment');

class CommentRepositoryPostgres extends CommentRepository {
  constructor(pool, idGenerator) {
    super();
    this._pool = pool;
    this._idGenerator = idGenerator;
  }

  async addComment(newComment) {
    const { owner, content, thread_id } = newComment;
    const id = `comment-${this._idGenerator()}`;
    const date = new Date().toISOString();

    const result = await this._pool.query({
      text: 'INSERT INTO comments VALUES($1, $2, $3, $4, $5) RETURNING id, content, owner',
      values: [id, owner, thread_id, content, date],
    });

    return new AddedComment({ ...result.rows[0] });
  }

  async verifyCommentOwner(id, owner) {
    const result = await this._pool.query({
      text: 'SELECT * FROM comments WHERE id = $1 AND owner = $2',
      values: [id, owner],
    });

    if (!result.rowCount) {
      throw new AuthorizationError('Invalid owner');
    }

    return true;
  }

  async verifyIsCommentExists(id) {
    const result = await this._pool.query({
      text: 'SELECT * FROM comments WHERE id = $1',
      values: [id],
    });

    if (!result.rowCount) {
      throw new NotFoundError('comment tidak ada');
    }

    return true;
  }

  async getCommentsByThreadId(threadId) {
    const result = await this._pool.query({
      text: 'SELECT c.id, c.content, c.date, c.is_deleted, u.username FROM comments c JOIN users u ON u.id = c.owner WHERE c.thread_id = $1',
      values: [threadId],
    });

    return result.rows.map((row) => new DetailComment(row));
  }

  async deleteComment(id) {
    await this._pool.query({
      text: 'UPDATE comments SET is_deleted = true WHERE id = $1',
      values: [id],
    });
  }
}

module.exports = CommentRepositoryPostgres;
