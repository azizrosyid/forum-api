const AuthorizationError = require("../../Commons/exceptions/AuthorizationError");
const NotFoundError = require("../../Commons/exceptions/NotFoundError");
const ThreadRepository = require("../../Domains/threads/ThreadRepository");
const AddedThread = require("../../Domains/threads/entities/AddedThread");
const DetailThread = require("../../Domains/threads/entities/DetailThread");

class ThreadRepositoryPostgres extends ThreadRepository {
  constructor(pool, idGenerator) {
    super();
    this._pool = pool;
    this._idGenerator = idGenerator;
  }

  async addThread(addThread) {
    const { owner, title, body } = addThread;

    const id = `thread-${this._idGenerator()}`;
    const date = new Date().toISOString();

    const query = {
      text: "INSERT INTO threads VALUES($1, $2, $3, $4, $5) RETURNING id, title, owner",
      values: [id, owner, title, body, date],
    };

    const result = await this._pool.query(query);

    return new AddedThread({ ...result.rows[0] });
  }

  async verifyThreadOwner(id, owner) {
    const query = {
      text: "SELECT * FROM threads WHERE id = $1 AND owner = $2",
      values: [id, owner],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new AuthorizationError("owner tidak valid");
    }

    return true;
  }

  async verifyIsThreadExists(id) {
    const query = {
      text: "SELECT * FROM threads WHERE id = $1",
      values: [id],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new NotFoundError("thread tidak ada");
    }

    return true;
  }

  async getThreadDetail(id) {
    const query = {
      text: "SELECT t.*, u.username FROM threads t JOIN users u ON u.id = t.owner WHERE t.id = $1",
      values: [id],
    };

    const result = await this._pool.query(query);

    return new DetailThread({ ...result.rows[0] });
  }
}

module.exports = ThreadRepositoryPostgres;