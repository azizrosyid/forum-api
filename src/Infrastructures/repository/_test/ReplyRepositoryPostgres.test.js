const CommentTableTestHelper = require('../../../../tests/CommentsTableTestHelper');
const RepliesTableTestHelper = require('../../../../tests/RepliesTableTestHelper');
const ThreadTableTestHelper = require('../../../../tests/ThreadsTableTestHelper');
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const AuthorizationError = require('../../../Commons/exceptions/AuthorizationError');
const NotFoundError = require('../../../Commons/exceptions/NotFoundError');
const AddedReply = require('../../../Domains/replies/entities/AddedReply');
const NewReply = require('../../../Domains/replies/entities/NewReply');
const pool = require('../../database/postgres/pool');
const ReplyRepositoryPostgres = require('../ReplyRepositoryPostgres');

describe('ReplyRepositoryPostgres', () => {
  beforeEach(async () => {
    await UsersTableTestHelper.addUser({ id: 'user-123', username: 'dicoding' });
    await ThreadTableTestHelper.addThread({
      id: 'thread-123',
      owner: 'user-123',
    });
    await CommentTableTestHelper.addComment('comment-123', {
      id: 'comment-123',
      thread_id: 'thread-123',
      owner: 'user-123',
      content: 'content comment',
    });
  });

  afterEach(async () => {
    await CommentTableTestHelper.cleanTable();
    await UsersTableTestHelper.cleanTable();
    await ThreadTableTestHelper.cleanTable();
    await RepliesTableTestHelper.cleanTable();
  });

  afterAll(async () => {
    await pool.end();
  });

  describe('addCommentReply function', () => {
    it('should persis new reply comment and return added reply correctly', async () => {
      // Arrange
      const newReply = new NewReply({
        threadId: 'thread-123',
        commentId: 'comment-123',
        owner: 'user-123',
        content: 'content reply comment',
      });

      const fakeIdGenerator = () => '123';
      const replyRepositoryPostgres = new ReplyRepositoryPostgres(
        pool,
        fakeIdGenerator,
      );

      // Action
      await replyRepositoryPostgres.addCommentReply(newReply);

      // Assert
      const replies = await RepliesTableTestHelper.findReplyByIdIsDeleteFalse(
        'reply-123',
      );
      expect(replies).toHaveLength(1);
    });

    it('should return added reply comment correctly', async () => {
      // Arrange
      const newReply = new NewReply({
        threadId: 'thread-123',
        commentId: 'comment-123',
        owner: 'user-123',
        content: 'content reply comment',
      });

      const fakeIdGenerator = () => '123';
      const replyRepositoryPostgres = new ReplyRepositoryPostgres(
        pool,
        fakeIdGenerator,
      );

      // Action
      const addedReply = await replyRepositoryPostgres.addCommentReply(
        newReply,
      );

      // Assert
      expect(addedReply).toStrictEqual(
        new AddedReply({
          id: 'reply-123',
          content: 'content reply comment',
          owner: 'user-123',
        }),
      );
    });
  });

  describe('getRepliesCommentByThreadId function', () => {
    it('should return replies comment correctly', async () => {
      const firstReply = {
        id: 'reply-123',
        content: 'content reply comment',
        owner: 'user-123',
        threadId: 'thread-123',
        commentId: 'comment-123',
      };
      await RepliesTableTestHelper.addReply(firstReply);

      const secondReply = {
        id: 'reply-124',
        content: 'second content reply comment',
        owner: 'user-123',
        threadId: 'thread-123',
        commentId: 'comment-123',
      };

      await RepliesTableTestHelper.addReply(secondReply);

      const replyRepositoryPostgres = new ReplyRepositoryPostgres(
        pool,
        () => { },
      );

      // Action
      const replies = await replyRepositoryPostgres.getRepliesCommentByThreadId(
        'thread-123',
      );

      // Assert
      expect(replies).toHaveLength(2);

      expect(replies[0].id).toBe('reply-123');
      expect(replies[1].id).toBe('reply-124');

      expect(replies[0].content).toBe(firstReply.content);
      expect(replies[1].content).toBe(secondReply.content);

      expect(replies[0].comment_id).toBe(firstReply.commentId);
      expect(replies[1].comment_id).toBe(secondReply.commentId);
    });
  });

  describe('verifyAvailableCommentReply function', () => {
    it('should throw NotFoundError when comment reply id not found', async () => {
      // Arrange
      const replyId = 'reply-123';
      const replyRepositoryPostgres = new ReplyRepositoryPostgres(
        pool,
        () => { },
      );

      // Action and Assert
      await expect(
        replyRepositoryPostgres.verifyAvailableCommentReply(replyId),
      ).rejects.toThrowError(NotFoundError);
    });

    it('should not throw NotFoundError when comment reply id found', async () => {
      // Arrange
      const replyId = 'reply-123';
      await RepliesTableTestHelper.addReply({
        id: replyId,
        commentId: 'comment-123',
        threadId: 'thread-123',
      });

      const replyRepositoryPostgres = new ReplyRepositoryPostgres(
        pool,
        () => { },
      );

      // Action and Assert
      await expect(
        replyRepositoryPostgres.verifyAvailableCommentReply(replyId),
      ).resolves.not.toThrowError(NotFoundError);
    });
  });

  describe('verifyOwnerCommentReply function', () => {
    it('should throw AuthorizationError when comment reply have invalid owner', async () => {
      // Arrange
      const payload = {
        replyId: 'reply-123',
        owner: 'stranger owner',
      };

      await RepliesTableTestHelper.addReply({
        id: payload.replyId,
        owner: 'user-123',
        threadId: 'thread-123',
        commentId: 'comment-123',
      });

      const replyRepositoryPostgres = new ReplyRepositoryPostgres(
        pool,
        () => { },
      );

      // Action and Assert
      await expect(
        replyRepositoryPostgres.verifyOwnerCommentReply(
          payload.replyId,
          payload.owner,
        ),
      ).rejects.toThrowError(AuthorizationError);
    });

    it('should not throw AuthorizationError when comment reply have valid owner', async () => {
      // Arrange
      const payload = {
        replyId: 'reply-123',
        owner: 'user-123',
      };

      await RepliesTableTestHelper.addReply({
        id: payload.replyId,
        owner: payload.owner,
        threadId: 'thread-123',
        commentId: 'comment-123',
      });

      const replyRepositoryPostgres = new ReplyRepositoryPostgres(
        pool,
        () => { },
      );

      // Action and Assert
      await expect(
        replyRepositoryPostgres.verifyOwnerCommentReply(
          payload.replyId,
          payload.owner,
        ),
      ).resolves.not.toThrowError(AuthorizationError);
    });
  });

  describe('deleteCommentReplyByReplyId function', () => {
    it('should delete comment reply by reply id correctly', async () => {
      // Arrange
      const payload = {
        replyId: 'reply-123',
        owner: 'user-123',
      };

      await RepliesTableTestHelper.addReply({
        id: payload.replyId,
        owner: payload.owner,
        threadId: 'thread-123',
        commentId: 'comment-123',
      });

      const replyRepositoryPostgres = new ReplyRepositoryPostgres(
        pool,
        () => { },
      );

      // Action
      await replyRepositoryPostgres.deleteCommentReplyByReplyId(
        payload.replyId,
      );

      // Assert
      const replies = await RepliesTableTestHelper.findReplyByIdIsDeleteFalse(
        payload.replyId,
      );
      expect(replies).toHaveLength(0);
    });
  });
});
