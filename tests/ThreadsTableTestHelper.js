/* istanbul ignore file */
const pool = require("../src/Infrastructures/database/postgres/pool");
const UsersTableTestHelper = require("./UsersTableTestHelper");

const ThreadsTableTestHelper = {
  async addThread({
    id = "thread-123",
    title = "dicoding",
    body = "secret",
    owner = "user-123",    
  }) {
    const date = new Date().toISOString();
    const query = {
      text: "INSERT INTO threads VALUES($1, $2, $3, $4, $5)",
      values: [id, owner, title, body, date],
    };

    await pool.query(query);
  },

  async findThreadById(id) {
    const query = {
      text: "SELECT * FROM threads WHERE id = $1",
      values: [id],
    };

    const result = await pool.query(query);
    return result.rows;
  },

  async addUserAndThread(
    user = {
      id: "user-123",
      username: "tester",
      password: "123456",
      fullname: "The Tester",
    },
    thread = {
      id: "thread-123",
      owner: "user-123",
      title: "thread title",
      body: "lorem ipsum dummy",
    }
  ) {
    thread.date = new Date().toISOString();
    await UsersTableTestHelper.addUser(user);
    await this.addThread(thread);
  },

  async cleanTable() {
    await pool.query("DELETE FROM threads WHERE 1=1");
  },
};

module.exports = ThreadsTableTestHelper;