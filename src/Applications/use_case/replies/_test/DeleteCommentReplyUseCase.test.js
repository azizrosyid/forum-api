const CommentRepository = require('../../../../Domains/comments/CommentRepository');
const ReplyRepository = require('../../../../Domains/replies/ReplyRepository');
const DeleteCommentReplyUseCase = require('../DeleteCommentReplyUseCase');

describe('DeleteCommentReplyUseCase', () => {
  it('should orchestrating the delete comment reply action correctly', async () => {
    // Arrange
    const useCasePayload = {
      threadId: 'thread-123',
      commentId: 'comment-123',
      replyId: 'reply-123',
      owner: 'user-123',
    };
    const mockCommentRepository = new CommentRepository();
    const mockReplyRepository = new ReplyRepository();

    mockCommentRepository.verifyIsCommentExists = jest
      .fn()
      .mockImplementation(() => Promise.resolve(true));
    mockReplyRepository.verifyAvailableCommentReply = jest
      .fn()
      .mockImplementation(() => Promise.resolve());
    mockReplyRepository.verifyOwnerCommentReply = jest
      .fn()
      .mockImplementation(() => Promise.resolve());
    mockReplyRepository.deleteCommentReplyByReplyId = jest
      .fn()
      .mockImplementation(() => Promise.resolve());

    const deleteCommentReplyUseCase = new DeleteCommentReplyUseCase({
      commentRepository: mockCommentRepository,
      replyRepository: mockReplyRepository,
    });

    // Action
    await deleteCommentReplyUseCase.execute(useCasePayload);

    // Assert
    expect(mockCommentRepository.verifyIsCommentExists).toBeCalledWith(
      useCasePayload.commentId,
    );
    expect(mockReplyRepository.verifyAvailableCommentReply).toBeCalledWith(
      useCasePayload.replyId,
    );
    expect(mockReplyRepository.verifyOwnerCommentReply).toBeCalledWith(
      useCasePayload.replyId,
      useCasePayload.owner,
    );
    expect(mockReplyRepository.deleteCommentReplyByReplyId).toBeCalledWith(
      useCasePayload.replyId,
    );
    expect(mockCommentRepository.verifyIsCommentExists).toBeCalledTimes(1);
    expect(mockReplyRepository.verifyAvailableCommentReply).toBeCalledTimes(1);
    expect(mockReplyRepository.verifyOwnerCommentReply).toBeCalledTimes(1);
    expect(mockReplyRepository.deleteCommentReplyByReplyId).toBeCalledTimes(1);
  });
});
