/* eslint-disable camelcase */
const CommentsTableTestHelper = require('../../../../tests/CommentsTableTestHelper');
const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper');
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const AuthorizationError = require('../../../Commons/exceptions/AuthorizationError');
const NotFoundError = require('../../../Commons/exceptions/NotFoundError');
const AddedComment = require('../../../Domains/comments/entities/AddedComment');
const DetailComment = require('../../../Domains/comments/entities/DetailComment');
const NewComment = require('../../../Domains/comments/entities/NewComment');
const pool = require('../../database/postgres/pool');
const CommentRepositoryPostgres = require('../CommentRepositoryPostgres');

describe('CommentRepositoryPostgres', () => {
  afterEach(async () => {
    await CommentsTableTestHelper.cleanTable();
    await ThreadsTableTestHelper.cleanTable();
    await UsersTableTestHelper.cleanTable();
  });

  afterAll(async () => {
    await pool.end();
  });

  describe('addComment function', () => {
    it('should persist added comment and return added comment correctly', async () => {
      // Arrange
      const user_id = 'user-123';
      const fakeRegisterUser = {
        id: user_id,
        username: 'fake_user',
        password: 'secret_password',
        fullname: 'User Tester',
      };
      await UsersTableTestHelper.addUser(fakeRegisterUser);

      const thread_id = 'thread-123';
      const newThread = {
        id: thread_id,
        owner: user_id,
        title: 'thread title',
        body: 'thread body',
      };
      await ThreadsTableTestHelper.addThread(newThread);

      const newComment = new NewComment({
        owner: user_id,
        content: 'This is the comment content',
        thread_id,
      });

      const fakeIdGenerator = () => '123'; // stub!
      const commentRepositoryPostgres = new CommentRepositoryPostgres(
        pool,
        fakeIdGenerator,
      );

      // Action
      await commentRepositoryPostgres.addComment(newComment);

      // Assert
      const comments = await CommentsTableTestHelper.findCommentById(
        `comment-${fakeIdGenerator()}`,
      );
      expect(comments).toHaveLength(1);
    });

    it('should return added comment correctly', async () => {
      // Arrange
      const user_id = 'user-123';
      const fakeRegisterUser = {
        id: user_id,
        username: 'fake_user',
        password: 'secret_password',
        fullname: 'User Tester',
      };
      await UsersTableTestHelper.addUser(fakeRegisterUser);

      const thread_id = 'thread-123';
      const newThread = {
        id: thread_id,
        owner: user_id,
        title: 'thread title',
        body: 'thread body',
      };
      await ThreadsTableTestHelper.addThread(newThread);

      const newComment = new NewComment({
        owner: user_id,
        content: 'This is the comment content',
        thread_id,
      });

      const fakeIdGenerator = () => '123'; // stub!
      const commentRepositoryPostgres = new CommentRepositoryPostgres(
        pool,
        fakeIdGenerator,
      );

      // Action
      const addedComment = await commentRepositoryPostgres.addComment(
        newComment,
      );

      // Assert
      expect(addedComment).toStrictEqual(
        new AddedComment({
          id: `comment-${fakeIdGenerator()}`,
          content: newComment.content,
          owner: newComment.owner,
        }),
      );
    });
  });

  describe('verifyCommentOwner', () => {
    it('should throw error when the owner doesnt match with comments.user_id', async () => {
      const commentRepositoryPostgres = new CommentRepositoryPostgres(
        pool,
        () => { }, // Fake function
      );

      await ThreadsTableTestHelper.addUserAndThread();
      const comment_id = 'comment-123';
      await CommentsTableTestHelper.addComment(comment_id);
      return expect(
        commentRepositoryPostgres.verifyCommentOwner(comment_id, 'user-xyz'),
      ).rejects.toThrowError(AuthorizationError);
    });

    it('should pass authorization error when the owner matchs with users.user_id', async () => {
      const commentRepositoryPostgres = new CommentRepositoryPostgres(
        pool,
        () => { }, // Fake function
      );

      await ThreadsTableTestHelper.addUserAndThread();
      const comment_id = 'comment-123';
      await CommentsTableTestHelper.addComment(comment_id);

      const verified = await commentRepositoryPostgres.verifyCommentOwner(
        comment_id,
        'user-123',
      );

      return expect(verified).toStrictEqual(true);
    });
  });

  describe('verifyIsCommentExists', () => {
    it('should throw not found error when comments.id do not exists', async () => {
      const commentRepositoryPostgres = new CommentRepositoryPostgres(
        pool,
        () => { },
      );
      const user_id = 'user-123';
      const fakeUser = {
        id: user_id,
        email: 'fake@fake.fake',
        fullname: 'The Fake User',
        password: '123321',
      };
      const thread_id = 'thread-123';
      const fakeThread = {
        id: thread_id,
        owner: user_id,
        title: 'Thread title',
        body: 'the thread body',
      };
      await UsersTableTestHelper.addUser(fakeUser);
      await ThreadsTableTestHelper.addThread(fakeThread);

      const comment_id = 'comment-123';
      await CommentsTableTestHelper.addComment(comment_id);

      return expect(
        commentRepositoryPostgres.verifyIsCommentExists('xyz'),
      ).rejects.toThrowError(NotFoundError);
    });

    it('should pass not found error when threads.id was exists', async () => {
      const commentRepositoryPostgres = new CommentRepositoryPostgres(
        pool,
        () => { },
      );
      const user_id = 'user-123';
      const fakeUser = {
        id: user_id,
        email: 'fake@fake.fake',
        fullname: 'The Fake User',
        password: '123321',
      };
      const thread_id = 'thread-123';
      const fakeThread = {
        id: thread_id,
        owner: user_id,
        title: 'Thread title',
        body: 'the thread body',
      };
      await UsersTableTestHelper.addUser(fakeUser);
      await ThreadsTableTestHelper.addThread(fakeThread);
      const comment_id = 'comment-123';
      await CommentsTableTestHelper.addComment(comment_id);

      const isExists = await commentRepositoryPostgres.verifyIsCommentExists(
        comment_id,
      );

      return expect(isExists).toStrictEqual(true);
    });
  });

  describe('deleteComment function', () => {
    it('should delete comment by soft delete (update it is_deleted column tp true)', async () => {
      // Arrange
      const user_id = 'user-123';
      const fakeRegisterUser = {
        id: user_id,
        username: 'fake_user',
        password: 'secret_password',
        fullname: 'User Tester',
      };
      await UsersTableTestHelper.addUser(fakeRegisterUser);

      const thread_id = 'thread-123';
      const newThread = {
        id: thread_id,
        owner: user_id,
        title: 'thread title',
        body: 'thread body',
      };
      await ThreadsTableTestHelper.addThread(newThread);

      const comment_id = 'comment-123';
      const newComment = {
        id: comment_id,
        owner: user_id,
        content: 'This is the comment content',
        thread_id,
      };
      await CommentsTableTestHelper.addComment(comment_id, newComment);

      const commentRepositoryPostgres = new CommentRepositoryPostgres(
        pool,
        () => { },
      );

      // Action
      await commentRepositoryPostgres.deleteComment(comment_id);

      // Assert
      const comment = await CommentsTableTestHelper.findCommentById(comment_id);
      expect(comment[0].is_deleted).toStrictEqual(true);
      expect(comment).toHaveLength(1);
    });
  });

  describe('getCommentsByThreadId function', () => {
    it('should delete comment by soft delete (update it is_deleted column tp true)', async () => {
      // Arrange

      // user_id and thread_id from helper was: user-123 and thread-123
      await ThreadsTableTestHelper.addUserAndThread();

      const firstComment = {
        id: 'comment-123',
        owner: 'user-123',
        username: 'tester',
        content: 'This is the comment content',
        thread_id: 'thread-123',
        date: new Date().toISOString(),
      };

      const secondComment = {
        id: 'comment-321',
        owner: 'user-123',
        username: 'tester',
        content: 'This is the comment content',
        thread_id: 'thread-123',
        date: new Date().toISOString(),
      };

      await CommentsTableTestHelper.addComment(firstComment.id, firstComment);
      await CommentsTableTestHelper.addComment(secondComment.id, secondComment);
      await CommentsTableTestHelper.softDeleteComment(secondComment.id);

      const commentRepositoryPostgres = new CommentRepositoryPostgres(
        pool,
        () => { },
      );

      // Action
      const comments = await commentRepositoryPostgres.getCommentsByThreadId(
        'thread-123',
      );

      // Assert
      expect(comments).toHaveLength(2);
      // Verify the first comment
      expect(comments[0]).toHaveProperty('id');
      expect(comments[0]).toHaveProperty('content');
      expect(comments[0]).toHaveProperty('username');
      expect(comments[0]).toHaveProperty('date');

      // Verify the second comment
      expect(comments[1]).toHaveProperty('id');
      expect(comments[1]).toHaveProperty('content');
      expect(comments[1]).toHaveProperty('username');
      expect(comments[1]).toHaveProperty('date');

      const firstCommentDB = comments.find(
        (comment) => comment.id === firstComment.id,
      );

      const secondCommentDB = comments.find(
        (comment) => comment.id === secondComment.id,
      );

      expect(secondCommentDB).toStrictEqual(new DetailComment({
        id: secondComment.id,
        content: secondComment.content,
        username: secondComment.username,
        date: secondComment.date,
        is_deleted: true,
      }));

      expect(firstCommentDB).toStrictEqual(new DetailComment({
        id: firstComment.id,
        content: firstComment.content,
        username: firstComment.username,
        date: firstComment.date,
        is_deleted: false,
      }));
    });
  });
});
