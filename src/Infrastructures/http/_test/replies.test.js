const AuthenticationsTableTestHelper = require('../../../../tests/AuthenticationsTableTestHelper');
const CommentTableTestHelper = require('../../../../tests/CommentsTableTestHelper');
const RepliesTableTestHelper = require('../../../../tests/RepliesTableTestHelper');
const ServerTestHelper = require('../../../../tests/ServerTestHelper');
const ThreadTableTestHelper = require('../../../../tests/ThreadsTableTestHelper');
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const container = require('../../container');
const pool = require('../../database/postgres/pool');
const createServer = require('../createServer');

describe('/threads/{threadId}/comments/{commentId}/replies', () => {
  afterEach(async () => {
    await UsersTableTestHelper.cleanTable();
    await ThreadTableTestHelper.cleanTable();
    await CommentTableTestHelper.cleanTable();
    await AuthenticationsTableTestHelper.cleanTable();
    await RepliesTableTestHelper.cleanTable();
  });

  afterAll(async () => {
    await pool.end();
  });

  describe('when POST /threads/{threadId}/comments/{commentId}/replies', () => {
    it('should response 401 when request missing authentication', async () => {
      // Arrange
      const server = await createServer(container);

      // Action
      const response = await server.inject({
        method: 'POST',
        url: '/threads/thread-123/comments/comment-123/replies',
        payload: {},
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(401);
      expect(responseJson.error).toEqual('Unauthorized');
      expect(responseJson.message).toEqual('Missing authentication');
    });

    it('should response 404 when request id thread or id comment not found in database', async () => {
      // Arrange
      const requestPayload = {
        content: 'content reply comment',
      };
      const server = await createServer(container);
      const userId = await ServerTestHelper.registerUser({ server });
      const accessToken = await ServerTestHelper.getAccessToken({ server });

      await ThreadTableTestHelper.addThread({
        id: 'thread-123',
        owner: userId,
      });

      // Action
      const response = await server.inject({
        method: 'POST',
        url: '/threads/thread-123/comments/xxx/replies',
        payload: requestPayload,
        headers: {
          authorization: `Bearer ${accessToken}`,
        },
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(404);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toEqual('comment tidak ada');
    });

    it('should response 400 when request payload not contain needed property', async () => {
      // Arrange
      const server = await createServer(container);
      const userId = await ServerTestHelper.registerUser({ server });
      const accessToken = await ServerTestHelper.getAccessToken({ server });

      await ThreadTableTestHelper.addThread({
        id: 'thread-123',
        owner: userId,
      });

      await CommentTableTestHelper.addComment('comment-123', {
        id: 'comment-123',
        thread_id: 'thread-123',
        owner: userId,
      });

      //   Action
      const response = await server.inject({
        method: 'POST',
        url: '/threads/thread-123/comments/comment-123/replies',
        payload: {},
        headers: {
          authorization: `Bearer ${accessToken}`,
        },
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(400);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toEqual(
        'tidak dapat menambahkan reply comment, request payload tidak lengkap',
      );
    });

    it('should response 400 when request payload not meet data type specification', async () => {
      // Arrange
      const requestPayload = {
        content: true,
      };
      const server = await createServer(container);
      const userId = await ServerTestHelper.registerUser({ server });
      const accessToken = await ServerTestHelper.getAccessToken({ server });

      await ThreadTableTestHelper.addThread({
        id: 'thread-123',
        owner: userId,
      });

      await CommentTableTestHelper.addComment('comment-123', {
        id: 'comment-123',
        thread_id: 'thread-123',
        owner: userId,
      });

      //   Action
      const response = await server.inject({
        method: 'POST',
        url: '/threads/thread-123/comments/comment-123/replies',
        payload: requestPayload,
        headers: {
          authorization: `Bearer ${accessToken}`,
        },
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(400);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toEqual(
        'tidak dapat menambahkan reply comment, tipe data tidak sesuai',
      );
    });

    it('should response 201x and persisted reply', async () => {
      // Arrange
      const requestPayload = {
        content: 'content reply comment',
      };
      const server = await createServer(container);
      const userId = await ServerTestHelper.registerUser({ server });
      const accessToken = await ServerTestHelper.getAccessToken({ server });

      await ThreadTableTestHelper.addThread({
        id: 'thread-123',
        owner: userId,
      });

      await CommentTableTestHelper.addComment('comment-123', {
        id: 'comment-123',
        thread_id: 'thread-123',
        owner: userId,
      });

      //   Action
      const response = await server.inject({
        method: 'POST',
        url: '/threads/thread-123/comments/comment-123/replies',
        payload: requestPayload,
        headers: {
          authorization: `Bearer ${accessToken}`,
        },
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(201);
      expect(responseJson.status).toEqual('success');
      expect(responseJson.data.addedReply).toBeDefined();
    });
  });

  describe('when DELETE /threads/{threadId}/comments/{commentId}/replies/{replyId}', () => {
    it('should response 401 when missing authentication', async () => {
      // Arrange
      const server = await createServer(container);

      // Action
      const response = await server.inject({
        method: 'DELETE',
        url: '/threads/threadId/comments/commentId/replies/replyId',
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(401);
      expect(responseJson.error).toEqual('Unauthorized');
      expect(responseJson.message).toEqual('Missing authentication');
    });

    it('should response 403 when delete reply is invalid owner', async () => {
      // Arrange
      const payload = {
        threadId: 'thread-123',
        commentId: 'comment-123',
        replyId: 'reply-123',
      };
      const server = await createServer(container);
      const userIdValidOwner = await ServerTestHelper.registerUser({ server });
      await ServerTestHelper.registerUser({
        server,
        username: 'john',
      });

      const accessTokenInvalidOwner = await ServerTestHelper.getAccessToken({
        server,
        username: 'john',
      });

      await ThreadTableTestHelper.addThread({
        id: payload.threadId,
        owner: userIdValidOwner,
      });

      await CommentTableTestHelper.addComment(payload.commentId, {
        id: payload.commentId,
        thread_id: payload.threadId,
        owner: userIdValidOwner,
      });
      await RepliesTableTestHelper.addReply({
        id: payload.replyId,
        thread_id: payload.threadId,
        commentId: payload.commentId,
        owner: userIdValidOwner,
      });

      // Action
      const response = await server.inject({
        method: 'DELETE',
        url: `/threads/${payload.threadId}/comments/${payload.commentId}/replies/${payload.replyId}`,
        headers: {
          authorization: `Bearer ${accessTokenInvalidOwner}`,
        },
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(403);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toEqual(
        'Anda tidak berhak mengakses resorce ini',
      );
    });

    it('should response 404 when delete thread, comment, or reply not found in database', async () => {
      // Arrange
      const payload = {
        threadId: 'thread-123',
        commentId: 'comment-123',
        replyId: 'reply-123',
      };

      const server = await createServer(container);
      const userId = await ServerTestHelper.registerUser({ server });
      const accessToken = await ServerTestHelper.getAccessToken({
        server,
      });

      await ThreadTableTestHelper.addThread({
        id: payload.threadId,
        owner: userId,
      });
      await CommentTableTestHelper.addComment(payload.commentId, {
        id: payload.commentId,
        thread_id: payload.threadId,
        owner: userId,
      });

      // Action
      const response = await server.inject({
        method: 'DELETE',
        url: `/threads/${payload.threadId}/comments/${payload.commentId}/replies/${payload.replyId}`,
        headers: {
          authorization: `Bearer ${accessToken}`,
        },
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(404);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toEqual('reply tidak ditemukan');
    });

    it('should response 200 when delete reply correctly', async () => {
      // Arrange
      const payload = {
        threadId: 'thread-123',
        commentId: 'comment-123',
        replyId: 'reply-123',
      };

      const server = await createServer(container);
      const userId = await ServerTestHelper.registerUser({ server });
      const accessToken = await ServerTestHelper.getAccessToken({
        server,
      });

      await ThreadTableTestHelper.addThread({
        id: payload.threadId,
        owner: userId,
      });
      await CommentTableTestHelper.addComment(payload.commentId, {
        id: payload.commentId,
        thread_id: payload.threadId,
        owner: userId,
      });
      await RepliesTableTestHelper.addReply({
        id: payload.replyId,
        thread_id: payload.threadId,
        commentId: payload.commentId,
        owner: userId,
      });

      // Action
      const response = await server.inject({
        method: 'DELETE',
        url: `/threads/${payload.threadId}/comments/${payload.commentId}/replies/${payload.replyId}`,
        headers: {
          authorization: `Bearer ${accessToken}`,
        },
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(200);
      expect(responseJson.status).toEqual('success');
    });
  });
});
