const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper');
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const NotFoundError = require('../../../Commons/exceptions/NotFoundError');
const AddedThread = require('../../../Domains/threads/entities/AddedThread');
const DetailThread = require('../../../Domains/threads/entities/DetailThread');
const AddThread = require('../../../Domains/threads/entities/AddThread');
const pool = require('../../database/postgres/pool');
const ThreadRepositoryPostgres = require('../ThreadRepositoryPostgres');

describe('ThreadRepositoryPostgres', () => {
  afterEach(async () => {
    await ThreadsTableTestHelper.cleanTable();
    await UsersTableTestHelper.cleanTable();
  });

  afterAll(async () => {
    await pool.end();
  });

  describe('addThread function', () => {
    it('should persist added thread and return added thread correctly', async () => {
      // Arrange
      const user_id = 'user-123';
      const fakeRegisterUser = {
        id: user_id,
        username: 'fake_user',
        password: 'secret_password',
        fullname: 'User Tester',
      };
      await UsersTableTestHelper.addUser(fakeRegisterUser);

      const addThread = new AddThread({
        owner: user_id,
        title: 'thread title',
        body: 'thread body',
      });
      const fakeIdGenerator = () => '123'; // stub!
      const threadRepositoryPostgres = new ThreadRepositoryPostgres(
        pool,
        fakeIdGenerator,
      );

      // Action
      await threadRepositoryPostgres.addThread(addThread);

      // Assert
      const threads = await ThreadsTableTestHelper.findThreadById(
        `thread-${fakeIdGenerator()}`,
      );
      expect(threads).toHaveLength(1);
    });

    it('should return added thread correctly', async () => {
      // Arrange
      const user_id = 'user-123';
      const fakeRegisterUser = {
        id: user_id,
        username: 'fake_user',
        password: 'secret_password',
        fullname: 'User Tester',
      };
      await UsersTableTestHelper.addUser(fakeRegisterUser);

      const addThread = new AddThread({
        owner: user_id,
        title: 'thread title',
        body: 'This is long text of thread body',
      });
      const fakeIdGenerator = () => '123'; // stub!
      const threadRepositoryPostgres = new ThreadRepositoryPostgres(
        pool,
        fakeIdGenerator,
      );

      // Action
      const addedThread = await threadRepositoryPostgres.addThread(addThread);

      // Assert
      expect(addedThread).toStrictEqual(
        new AddedThread({
          id: `thread-${fakeIdGenerator()}`,
          title: addThread.title,
          owner: addThread.owner,
        }),
      );
    });
  });

  describe('verifyIsThreadExists', () => {
    it('should throw notfound error when threads.id do not exists', async () => {
      const threadRepositoryPostgres = new ThreadRepositoryPostgres(
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

      return expect(
        threadRepositoryPostgres.verifyIsThreadExists('xyz'),
      ).rejects.toThrowError(NotFoundError);
    });

    it('should pass notfound error when threads.id was exists', async () => {
      const threadRepositoryPostgres = new ThreadRepositoryPostgres(
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

      const isExists = await threadRepositoryPostgres.verifyIsThreadExists(
        thread_id,
      );

      return expect(isExists).toStrictEqual(true);
    });
  });

  describe('getThreadDetail function', () => {
    it('should return detail thread correctly', async () => {
      // Arrange
      // thread_id from helper: thread-123

      const mockUser = {
        id: 'user-123',
        username: 'tester',
        password: '123456',
        fullname: 'The Tester',
      };
      const mockThread = {
        id: 'thread-123',
        owner: 'user-123',
        title: 'thread title',
        username: 'tester',
        body: 'lorem ipsum dummy',
      };

      await ThreadsTableTestHelper.addUserAndThread(mockUser, mockThread);
      const threadRepositoryPostgres = new ThreadRepositoryPostgres(
        pool,
        () => { },
      );

      // Action
      const thread = await threadRepositoryPostgres.getThreadDetail(
        'thread-123',
      );

      //  console.log(thread);
      // Assert
      expect(thread).toHaveProperty('id');
      expect(thread).toHaveProperty('title');
      expect(thread).toHaveProperty('body');
      expect(thread).toHaveProperty('username');
      expect(thread).toHaveProperty('date');

      // lakukan pengecekan nilai dari setiap property
      expect(typeof thread.id).toBe('string');
      expect(typeof thread.title).toBe('string');
      expect(typeof thread.body).toBe('string');
      expect(typeof thread.username).toBe('string');
      expect(typeof thread.date).toBe('string');
      // console.log(mockThread);
      expect(thread).toStrictEqual(new DetailThread({
        // Define the properties based on your data structure
        id: mockThread.id,
        title: mockThread.title,
        body: mockThread.body,
        username: mockThread.username,
        date: thread.date,
        comments: [],
      }));
    });
  });
});
