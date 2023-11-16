const CommentRepository = require('../../../../Domains/comments/CommentRepository');
const ReplyRepository = require('../../../../Domains/replies/ReplyRepository');
const AddedReply = require('../../../../Domains/replies/entities/AddedReply');
const NewReply = require('../../../../Domains/replies/entities/NewReply');
const ThreadRepository = require('../../../../Domains/threads/ThreadRepository');
const AddCommentReplyUseCase = require('../AddCommentReplyUseCase');

describe('AddCommentReplyUseCase', () => {
  it('should orchestrating the add comment reply action correctly', async () => {
    // Arrange
    const useCasePayload = {
      threadId: 'thread-123',
      commentId: 'comment-123',
      content: 'content reply comment',
      owner: 'user-123',
    };

    const expectedAddedReply = {
      id: 'reply-123',
      content: 'content reply comment',
      owner: 'user-123',
    };

    const mockCommentRepository = new CommentRepository();
    const mockReplyRepository = new ReplyRepository();
    const mockThreadRepository = new ThreadRepository();

    mockCommentRepository.verifyIsCommentExists = jest
      .fn()
      .mockImplementation(() => Promise.resolve(true));
    mockReplyRepository.addCommentReply = jest.fn().mockImplementation(() => Promise.resolve(
      new AddedReply({
        id: 'reply-123',
        content: useCasePayload.content,
        owner: useCasePayload.owner,
      }),
    ));

    mockThreadRepository.verifyIsThreadExists = jest
      .fn()
      .mockImplementation(() => Promise.resolve());

    const addCommentReply = new AddCommentReplyUseCase({
      commentRepository: mockCommentRepository,
      replyRepository: mockReplyRepository,
      threadRepository: mockThreadRepository,
    });

    // Action
    const addedReply = await addCommentReply.execute(useCasePayload);

    // Assert
    expect(addedReply).toStrictEqual(new AddedReply(expectedAddedReply));
    expect(mockCommentRepository.verifyIsCommentExists).toBeCalledWith(
      useCasePayload.commentId,
    );
    expect(mockCommentRepository.verifyIsCommentExists).toBeCalledTimes(1);

    expect(mockReplyRepository.addCommentReply).toBeCalledWith(
      new NewReply(useCasePayload),
    );
    expect(mockReplyRepository.addCommentReply).toBeCalledTimes(1);

    expect(mockThreadRepository.verifyIsThreadExists).toBeCalledWith(
      useCasePayload.threadId,
    );

    expect(mockThreadRepository.verifyIsThreadExists).toBeCalledTimes(1);
  });
});
