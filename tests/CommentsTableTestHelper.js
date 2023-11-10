/* istanbul ignore file */
const pool = require("../src/Infrastructures/database/postgres/pool");

const CommentsTableTestHelper = {
  async addComment(
    comment_id = "comment-123",
    comment = {
      id: "comment-123",
      owner: "user-123",
      content: "This is comment content",
      thread_id: "thread-123",
    }
  ) {
    let { id } = comment;
    const { owner, thread_id, content } = comment;
    if (comment_id !== id) {
      id = comment_id;
    }
    const date = new Date().toISOString();
    const query = {
      text: "INSERT INTO comments VALUES($1, $2, $3, $4, $5)",
      values: [id, owner, thread_id, content, date],
    };

    await pool.query(query);
  },

  async findCommentById(id) {
    const query = {
      text: "SELECT * FROM comments WHERE id = $1",
      values: [id],
    };

    const result = await pool.query(query);
    return result.rows;
  },

  async softDeleteComment(id) {
    const query = {
      text: "UPDATE comments SET is_deleted = true WHERE id = $1",
      values: [id],
    };
    await pool.query(query);
  },

  async cleanTable() {
    await pool.query("DELETE FROM comments WHERE 1=1");
  },
};

module.exports = CommentsTableTestHelper;