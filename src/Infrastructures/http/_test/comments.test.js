const pool = require("../../database/postgres/pool");
const UsersTableTestHelper = require("../../../../tests/UsersTableTestHelper");
const container = require("../../container");
const createServer = require("../createServer");
const ThreadsTableTestHelper = require("../../../../tests/ThreadsTableTestHelper");
const CommentsTableTestHelper = require("../../../../tests/CommentsTableTestHelper");

describe("/threads/{threadId}/comments endpoint", () => {
  let threadId;
  let token;
  beforeEach(async () => {
    // eslint-disable-next-line no-undef
    const server = await createServer(container);

    // Action
    await server.inject({
      method: "POST",
      url: "/users",
      payload: {
        username: "tester",
        password: "secret",
        fullname: "The Tester",
      },
    });
    const authResp = await server.inject({
      method: "POST",
      url: "/authentications",
      payload: { username: "tester", password: "secret" },
    });
    const authJson = JSON.parse(authResp.payload);
    const { accessToken } = authJson.data;
    token = accessToken;

    const threadPayload = {
      title: "Thread title",
      body: "The thread body",
    };
    const threadResp = await server.inject({
      method: "POST",
      url: "/threads",
      payload: threadPayload,
      headers: {
        Authorization: `Bearer ${accessToken}`, // Sertakan token dalam header Authorization
      },
    });
    const threadJson = JSON.parse(threadResp.payload);
    const { id } = threadJson.data.addedThread;
    threadId = id;
  });

  afterAll(async () => {
    await pool.end();
  });

  afterEach(async () => {
    await CommentsTableTestHelper.cleanTable();
    await ThreadsTableTestHelper.cleanTable();
    await UsersTableTestHelper.cleanTable();
  });

  describe("when POST /threads/{threadId}/comments", () => {
    it("should response 201 and persisted comment", async () => {
      // Arrange
      // eslint-disable-next-line no-undef
      const server = await createServer(container);

      const requestPayload = {
        content: "This is my comment",
      };

      // Action
      const response = await server.inject({
        method: "POST",
        url: `/threads/${threadId}/comments`,
        payload: requestPayload,
        headers: {
          Authorization: `Bearer ${token}`, // Sertakan token dalam header Authorization
        },
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(201);
      expect(responseJson.status).toEqual("success");
      expect(responseJson.data.addedComment).toBeDefined();
    });

    it("should response 404 when threadId was invalid", async () => {
      // Arrange
      // eslint-disable-next-line no-undef
      const server = await createServer(container);

      const requestPayload = {
        content: "This is my comment",
      };

      // Action
      const response = await server.inject({
        method: "POST",
        url: "/threads/xxx/comments",
        payload: requestPayload,
        headers: {
          Authorization: `Bearer ${token}`, // Sertakan token dalam header Authorization
        },
      });

      // Assert
      expect(response.statusCode).toEqual(404);
    });

    it("should response 401 when no token in request", async () => {
      // Arrange
      // eslint-disable-next-line no-undef
      const server = await createServer(container);

      const requestPayload = {
        content: "This is my comment",
      };

      // Action
      const response = await server.inject({
        method: "POST",
        url: `/threads/${threadId}/comments`,
        payload: requestPayload,
      });

      // Assert
      //   const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(401);
    });

    it("should response 400 when request payload not contain needed property", async () => {
      // Arrange
      // eslint-disable-next-line no-undef
      const server = await createServer(container);

      const requestPayload = {};

      // Action
      const response = await server.inject({
        method: "POST",
        url: `/threads/${threadId}/comments`,
        payload: requestPayload,
        headers: {
          Authorization: `Bearer ${token}`, // Sertakan token dalam header Authorization
        },
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(400);
      expect(responseJson.status).toEqual("fail");
      expect(responseJson.message).toEqual(
        "tidak dapat membuat comment baru karena properti yang dibutuhkan tidak ada"
      );
    });

    it("should response 400 when request payload not meet data type specification", async () => {
      // Arrange
      // eslint-disable-next-line no-undef
      const server = await createServer(container);

      const requestPayload = {
        content: true,
      };

      // Action
      const response = await server.inject({
        method: "POST",
        url: `/threads/${threadId}/comments`,
        payload: requestPayload,
        headers: {
          Authorization: `Bearer ${token}`, // Sertakan token dalam header Authorization
        },
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(400);
      expect(responseJson.status).toEqual("fail");
      expect(responseJson.message).toEqual(
        "tidak dapat membuat comment baru karena tipe data tidak sesuai"
      );
    });
  });

  describe("when DELETE /threads/{threadId}/comments/{id}", () => {
    let commentId;
    beforeEach(async () => {
      // eslint-disable-next-line no-undef
      const server = await createServer(container);

      const comment = {
        content: "This is my comment",
      };

      // Action
      const commentResp = await server.inject({
        method: "POST",
        url: `/threads/${threadId}/comments`,
        payload: comment,
        headers: {
          Authorization: `Bearer ${token}`, // Sertakan token dalam header Authorization
        },
      });
      const commentJson = JSON.parse(commentResp.payload);
      const { id } = commentJson.data.addedComment;
      commentId = id;
    });
    it("should response 200", async () => {
      // Arrange
      // eslint-disable-next-line no-undef
      const server = await createServer(container);

      // Action
      const resp = await server.inject({
        method: "DELETE",
        url: `/threads/${threadId}/comments/${commentId}`,
        payload: {},
        headers: {
          Authorization: `Bearer ${token}`, // Sertakan token dalam header Authorization
        },
      });

      // Assert
      const responseJson = JSON.parse(resp.payload);
      expect(resp.statusCode).toEqual(200);
      expect(responseJson.status).toEqual("success");
      expect(responseJson.message).toEqual("Comment deleted");
    });
    it("should response 401 when no token in request", async () => {
      // Arrange
      // eslint-disable-next-line no-undef
      const server = await createServer(container);

      // Action
      const response = await server.inject({
        method: "DELETE",
        url: `/threads/${threadId}/comments/${commentId}`,
        payload: {},
      });

      // Assert
      //   const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(401);
    });
    it("should response 404 when threadId was invalid", async () => {
      // Arrange
      // eslint-disable-next-line no-undef
      const server = await createServer(container);

      // Action
      const response = await server.inject({
        method: "DELETE",
        url: `/threads/xxx/comments/${commentId}`,
        payload: {},
        headers: {
          Authorization: `Bearer ${token}`, // Sertakan token dalam header Authorization
        },
      });

      // Assert
      expect(response.statusCode).toEqual(404);
    });
    it("should response 404 when commentId was invalid", async () => {
      // Arrange
      // eslint-disable-next-line no-undef
      const server = await createServer(container);

      // Action
      const response = await server.inject({
        method: "DELETE",
        url: `/threads/${threadId}/comments/xxx`,
        payload: {},
        headers: {
          Authorization: `Bearer ${token}`, // Sertakan token dalam header Authorization
        },
      });

      // Assert
      expect(response.statusCode).toEqual(404);
    });
    it("should response 403 when accessToken was invalid", async () => {
      // Arrange
      // eslint-disable-next-line no-undef
      const server = await createServer(container);

      await server.inject({
        method: "POST",
        url: "/users",
        payload: {
          username: "wrongUser",
          password: "secret123",
          fullname: "The Hacker",
        },
      });
      const authResp = await server.inject({
        method: "POST",
        url: "/authentications",
        payload: { username: "wrongUser", password: "secret123" },
      });
      const authJson = JSON.parse(authResp.payload);
      const { accessToken } = authJson.data;
      // Action
      const response = await server.inject({
        method: "DELETE",
        url: `/threads/${threadId}/comments/${commentId}`,
        payload: {},
        headers: {
          Authorization: `Bearer ${accessToken}`, // Sertakan token dalam header Authorization
        },
      });

      // Assert
      expect(response.statusCode).toEqual(403);
    });
  });
});