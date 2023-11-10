const AuthorizationError = require("../../Commons/exceptions/AuthorizationError");
const NotFoundError = require("../../Commons/exceptions/NotFoundError");
const CommentRepository = require("../../Domains/comments/CommentRepository");
const AddedComment = require("../../Domains/comments/entities/AddedComment");
const DetailComment = require("../../Domains/comments/entities/DetailComment");

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

    const query = {
      text: "INSERT INTO comments VALUES($1, $2, $3, $4, $5) RETURNING id, content, owner",
      values: [id, owner, thread_id, content, date],
    };

    const result = await this._pool.query(query);

    return new AddedComment({ ...result.rows[0] });
  }

  async verifyCommentOwner(id, owner) {
    const query = {
      text: "SELECT * FROM comments WHERE id = $1 AND owner = $2",
      values: [id, owner],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new AuthorizationError("owner tidak valid");
    }

    return true;
  }

  async verifyIsCommentExists(id) {
    const query = {
      text: "SELECT * FROM comments WHERE id = $1",
      values: [id],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new NotFoundError("comment tidak ada");
    }

    return true;
  }

  async getCommentsByThreadId(threadId) {
    const query = {
      text: "SELECT c.id, c.content, c.date, c.is_deleted, u.username FROM comments c JOIN users u ON u.id = c.owner WHERE c.thread_id = $1",
      values: [threadId],
    };

    const result = await this._pool.query(query);

    const comments = [];
    result.rows.forEach((row) => {
      comments.push(new DetailComment(row));
    });

    return comments;
  }

  async deleteComment(id) {
    const query = {
      text: "UPDATE comments SET is_deleted = true WHERE id = $1",
      values: [id],
    };
    await this._pool.query(query);
  }
}

module.exports = CommentRepositoryPostgres;