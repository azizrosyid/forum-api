const GetThreadDetailUseCase = require("../GetThreadDetailUseCase");
const CommentRepository = require("../../../../Domains/comments/CommentRepository");
const ThreadRepository = require("../../../../Domains/threads/ThreadRepository");
const DetailThread = require("../../../../Domains/threads/entities/DetailThread");
const DetailComment = require("../../../../Domains/comments/entities/DetailComment");

describe('GetThreadDetailUseCase', () => {
  it('should correctly get the thread detail', async () => {
    // Arrange
    const useCasePayload = {
      id: 'thread-123',
    };

    const expectedDetailThread = new DetailThread({
      id: 'thread-123',
      title: 'A thread title',
      body: 'The body of my thread',
      username: 'iamuser',
      date: '2021-08-08T07:22:33.555Z',
    })
    const expectedComment = [
          new DetailComment({
            id: 'comment-123',
            content: 'This is a content of my comment',
            username: 'commentator',
            date: '2021-08-10T07:22:33.555Z',
            is_deleted: false,
          }),
          new DetailComment({
            id: 'comment-321',
            content: 'second', // Updated content
            username: 'commentator',
            date: '2021-08-10T07:22:33.555Z',
            is_deleted: true,
          }),
        ];
    expectedDetailThread.comments = expectedComment;

    // Create mock objects for the test
    const mockDetailThread = new DetailThread({
      id: 'thread-123',
      title: 'A thread title',
      body: 'The body of my thread',
      username: 'iamuser',
      date: '2021-08-08T07:22:33.555Z',
    })

    const mockCommentDetail1 = new DetailComment({
      id: 'comment-123',
      content: 'This is a content of my comment',
      username: 'commentator',
      date: '2021-08-10T07:22:33.555Z',
      is_deleted: false,
    });

    const mockCommentDetail2 = new DetailComment({
      id: 'comment-321',
      content: 'This is a content of my 2 comment',
      username: 'commentator',
      date: '2021-08-10T07:22:33.555Z',
      is_deleted: true,
    });

    const mockComments = [mockCommentDetail1, mockCommentDetail2];

    // Mock the dependencies
    const mockThreadRepository = new ThreadRepository();
    const mockCommentRepository = new CommentRepository();

    mockThreadRepository.verifyIsThreadExists = jest.fn().mockResolvedValue(true);
    mockThreadRepository.getThreadDetail = jest.fn().mockResolvedValue(mockDetailThread);
    mockCommentRepository.getCommentsByThreadId = jest.fn().mockReturnValue(mockComments);

    const getThreadDetailUseCase = new GetThreadDetailUseCase({
      threadRepository: mockThreadRepository,
      commentRepository: mockCommentRepository,
    });

    // Action
    const threadDetail = await getThreadDetailUseCase.execute(useCasePayload);

    // Assert
    expect(mockThreadRepository.verifyIsThreadExists).toHaveBeenCalledWith(useCasePayload.id);
    expect(mockThreadRepository.getThreadDetail).toHaveBeenCalledWith(useCasePayload.id);
    expect(mockCommentRepository.getCommentsByThreadId).toHaveBeenCalledWith(useCasePayload.id);

    // Assert that the actual threadDetail matches the expectedDetailThread
    expect(threadDetail).toStrictEqual(expectedDetailThread);
  });
});
