const GetThreadDetailUseCase = require('../GetThreadDetailUseCase');
const CommentRepository = require('../../../../Domains/comments/CommentRepository');
const ThreadRepository = require('../../../../Domains/threads/ThreadRepository');
const ReplyRepository = require('../../../../Domains/replies/ReplyRepository');
const DetailThread = require('../../../../Domains/threads/entities/DetailThread');
const DetailReply = require('../../../../Domains/replies/entities/DetailReply');

describe('GetThreadDetailUseCase', () => {
  it('should correctly get the thread detail', async () => {
    // Arrange
    const useCasePayload = {
      id: 'thread-123',
    };

    const expectedComment = [
      {
        id: 'comment-123',
        content: 'This is a content of my comment',
        username: 'commentator',
        date: '2021-08-10T07:22:33.555Z',
        replies: [
          new DetailReply({
            id: 'reply-123',
            content: 'This is a content of my reply',
            username: 'commentator',
            date: '2021-08-10T07:22:33.555Z',
          }),
          new DetailReply({
            id: 'reply-321',
            content: '**balasan telah dihapus**',
            username: 'commentator',
            date: '2021-08-10T07:22:33.555Z',
          }),
        ],
      },
      {
        id: 'comment-321',
        content: '**komentar telah dihapus**',
        username: 'commentator',
        date: '2021-08-10T07:22:33.555Z',
        replies: [
        ],
      },
    ];

    const expectedDetailThread = new DetailThread({
      id: 'thread-123',
      title: 'A thread title',
      body: 'The body of my thread',
      username: 'iamuser',
      date: '2021-08-08T07:22:33.555Z',
      comments: expectedComment,
    });

    // Create mock objects for the test
    const mockDetailThread = new DetailThread({
      id: 'thread-123',
      title: 'A thread title',
      body: 'The body of my thread',
      username: 'iamuser',
      date: '2021-08-08T07:22:33.555Z',
    });

    const mockCommentDetail1 = {
      id: 'comment-123',
      content: 'This is a content of my comment',
      username: 'commentator',
      replies: [],
      date: '2021-08-10T07:22:33.555Z',
      is_deleted: false,
    };

    const mockCommentDetail2 = {
      id: 'comment-321',
      content: 'This is a content of my 2 comment',
      username: 'commentator',
      replies: [],
      date: '2021-08-10T07:22:33.555Z',
      is_deleted: true,
    };

    const mockComments = [mockCommentDetail1, mockCommentDetail2];

    // Mock the dependencies
    const mockThreadRepository = new ThreadRepository();
    const mockCommentRepository = new CommentRepository();
    const mockReplyRepository = new ReplyRepository();

    mockThreadRepository.verifyIsThreadExists = jest.fn().mockResolvedValue(true);
    mockThreadRepository.getThreadDetail = jest.fn().mockResolvedValue(mockDetailThread);
    mockCommentRepository.getCommentsByThreadId = jest.fn().mockReturnValue(mockComments);
    mockReplyRepository.getRepliesCommentByThreadId = jest.fn().mockReturnValue([
      {
        id: 'reply-123',
        content: 'This is a content of my reply',
        username: 'commentator',
        is_deleted: false,
        date: '2021-08-10T07:22:33.555Z',
        comment_id: 'comment-123',
      },
      {
        id: 'reply-321',
        content: 'tes',
        is_deleted: true,
        username: 'commentator',
        date: '2021-08-10T07:22:33.555Z',
        comment_id: 'comment-123',
      },
    ]);

    const getThreadDetailUseCase = new GetThreadDetailUseCase({
      threadRepository: mockThreadRepository,
      commentRepository: mockCommentRepository,
      replyRepository: mockReplyRepository,
    });

    // Action
    const threadDetail = await getThreadDetailUseCase.execute(useCasePayload);

    // Assert
    expect(mockThreadRepository.verifyIsThreadExists).toHaveBeenCalledWith(useCasePayload.id);
    expect(mockThreadRepository.getThreadDetail).toHaveBeenCalledWith(useCasePayload.id);
    expect(mockCommentRepository.getCommentsByThreadId).toHaveBeenCalledWith(useCasePayload.id);
    expect(mockReplyRepository.getRepliesCommentByThreadId).toHaveBeenCalledWith(useCasePayload.id);

    expect(threadDetail).toStrictEqual(expectedDetailThread);
  });
});
