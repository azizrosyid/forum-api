const pool = require("../../database/postgres/pool");
const UsersTableTestHelper = require("../../../../tests/UsersTableTestHelper");
const container = require("../../container");
const createServer = require("../createServer");
const ThreadsTableTestHelper = require("../../../../tests/ThreadsTableTestHelper");

describe("/threads endpoint", () => {
  let token;
  beforeEach(async () => {
    // eslint-disable-next-line no-undef
    const server = await createServer(container);

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
  });

  afterAll(async () => {
    await pool.end();
  });

  afterEach(async () => {
    await ThreadsTableTestHelper.cleanTable();
    await UsersTableTestHelper.cleanTable();
  });

  describe("when POST /threads", () => {
    it("should response 201 and persisted thread", async () => {
      // Arrange
      // eslint-disable-next-line no-undef
      const server = await createServer(container);

      const requestPayload = {
        title: "Thread title",
        body: "The thread body",
      };

      // Action
      const response = await server.inject({
        method: "POST",
        url: "/threads",
        payload: requestPayload,
        headers: {
          Authorization: `Bearer ${token}`, // Sertakan token dalam header Authorization
        },
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(201);
      expect(responseJson.status).toEqual("success");
      expect(responseJson.data.addedThread).toBeDefined();
    });

    it("should response 401 when no token in request", async () => {
      // Arrange
      // eslint-disable-next-line no-undef
      const server = await createServer(container);

      const requestPayload = {
        title: "Thread Title",
        body: "Thread Body",
      };

      // Action
      const response = await server.inject({
        method: "POST",
        url: "/threads",
        payload: requestPayload,
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(401);
    });

    it("should response 400 when request payload not contain needed property", async () => {
      // Arrange
      // eslint-disable-next-line no-undef
      const server = await createServer(container);

      const requestPayload = {
        title: "Only Thread Title",
      };

      // Action
      const response = await server.inject({
        method: "POST",
        url: "/threads",
        payload: requestPayload,
        headers: {
          Authorization: `Bearer ${token}`, // Sertakan token dalam header Authorization
        },
      });

      // Debugging
      //console.log("Response Status Code: ", response.statusCode);
      //console.log("Response Payload: ", response.payload);

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(400);
      expect(responseJson.status).toEqual("fail");
      expect(responseJson.message).toEqual(
        "tidak dapat membuat thread baru karena properti yang dibutuhkan tidak ada"
      );
    });

    it("should response 400 when request payload not meet data type specification", async () => {
      // Arrange
      // eslint-disable-next-line no-undef
      const server = await createServer(container);

      const requestPayload = {
        title: true,
        body: "correct body",
      };

      // Action
      const response = await server.inject({
        method: "POST",
        url: "/threads",
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
        "tidak dapat membuat thread baru karena tipe data tidak sesuai"
      );
    });

    it("should response 400 when thread title more than 50 character", async () => {
      // Arrange
      // eslint-disable-next-line no-undef
      const server = await createServer(container);

      const requestPayload = {
        title:
          "dicodingindonesiadicodingindonesiadicodingindonesiadicodingloremlorem",
        body: "This is thread body",
      };

      // Action
      const response = await server.inject({
        method: "POST",
        url: "/threads",
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
        "tidak dapat membuat thread baru karena karakter title melebihi batas limit"
      );
    });
  });

  describe("when GET /threads/{id}", () => {
    let threadId;
    let commentatorToken;
    beforeEach(async () => {
      // eslint-disable-next-line no-undef
      const server = await createServer(container);

      await server.inject({
        method: "POST",
        url: "/users",
        payload: {
          username: "commentator",
          password: "secret",
          fullname: "The Tester",
        },
      });

      const authResp = await server.inject({
        method: "POST",
        url: "/authentications",
        payload: { username: "commentator", password: "secret" },
      });
      const authJson = JSON.parse(authResp.payload);
      const { accessToken } = authJson.data;
      commentatorToken = accessToken;

      const threadResp = await server.inject({
        method: "POST",
        url: "/threads",
        payload: {
          title: "THis is tester thread",
          body: "THis is body of tester thread",
        },
        headers: {
          Authorization: `Bearer ${token}`, // Sertakan token dalam header Authorization
        },
      });

      const threadJson = JSON.parse(threadResp.payload);
      const { id } = threadJson.data.addedThread;
      threadId = id;
    });

    it("should response 200 and return detail comment correctly", async () => {
      // Arrange
      // eslint-disable-next-line no-undef
      const server = await createServer(container);
      await server.inject({
        method: "POST",
        url: `/threads/${threadId}/comments`,
        payload: { content: "Hello iam comment your thread sir" },
        headers: {
          Authorization: `Bearer ${commentatorToken}`, // Sertakan token dalam header Authorization
        },
      });
      const commentResp = await server.inject({
        method: "POST",
        url: `/threads/${threadId}/comments`,
        payload: { content: "Sure, i am also comment my thread" },
        headers: {
          Authorization: `Bearer ${token}`, // Sertakan token dalam header Authorization
        },
      });
      const commentParsed = JSON.parse(commentResp.payload);
      const { id } = commentParsed.data.addedComment;
      await server.inject({
        method: "DELETE",
        url: `/threads/${threadId}/comments/${id}`,
        payload: {},
        headers: {
          Authorization: `Bearer ${token}`, // Sertakan token dalam header Authorization
        },
      });

      // Action
      const response = await server.inject({
        method: "GET",
        url: `/threads/${threadId}`,
        payload: {},
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(200);
      expect(responseJson.status).toEqual("success");
      expect(responseJson.data.thread).toBeDefined();
      expect(responseJson.data.thread).toHaveProperty("id");
      expect(responseJson.data.thread).toHaveProperty("date");
      expect(responseJson.data.thread).toHaveProperty("username");
      expect(responseJson.data.thread).toHaveProperty("title");
      expect(responseJson.data.thread).toHaveProperty("body");
      expect(responseJson.data.thread.comments).toHaveLength(2);
      responseJson.data.thread.comments.forEach((comment) => {
        expect(comment).toHaveProperty("id");
        expect(comment).toHaveProperty("date");
        expect(comment).toHaveProperty("content");
        expect(comment).toHaveProperty("username");
        if (comment.username === "tester") {
          expect(comment.content).toStrictEqual("**komentar telah dihapus**");
        }
      });
    });

    it("should response 200 but 0 comments length", async () => {
      // Arrange
      // eslint-disable-next-line no-undef
      const server = await createServer(container);

      // Action
      const response = await server.inject({
        method: "GET",
        url: `/threads/${threadId}`,
        payload: {},
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(200);
      expect(responseJson.status).toEqual("success");
      expect(responseJson.data.thread).toBeDefined();
      expect(responseJson.data.thread).toHaveProperty("id");
      expect(responseJson.data.thread).toHaveProperty("date");
      expect(responseJson.data.thread).toHaveProperty("username");
      expect(responseJson.data.thread).toHaveProperty("title");
      expect(responseJson.data.thread).toHaveProperty("body");
      expect(responseJson.data.thread.comments).toHaveLength(0);
    });

    it("should response 404 error", async () => {
      // Arrange
      // eslint-disable-next-line no-undef
      const server = await createServer(container);

      // Action
      const response = await server.inject({
        method: "GET",
        url: "/threads/xyz",
        payload: {},
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(404);
      expect(responseJson.status).toEqual("fail");
    });
  });
});