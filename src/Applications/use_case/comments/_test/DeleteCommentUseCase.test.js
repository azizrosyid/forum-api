const CommentRepository = require("../../../../Domains/comments/CommentRepository");
const ThreadRepository = require("../../../../Domains/threads/ThreadRepository");
const DeleteCommentUseCase = require("../DeleteCommentUseCase");

describe("DeleteCommentUseCase", () => {
  /**
   * Menguji apakah use case mampu mengoskestrasikan langkah demi langkah dengan benar.
   */
  it("should orchestrating the delete comment action correctly", async () => {
    // Arrange
    const useCasePayload = {
      id: "comment-123",
      owner: "user-123",
      thread_id: "thread-123",
    };

    /** creating dependency of use case */
    const mockCommentRepository = new CommentRepository();
    const mockThreadRepository = new ThreadRepository();
    /** mocking needed function */
    mockThreadRepository.verifyIsThreadExists = jest
      .fn()
      .mockImplementation(() => Promise.resolve(true));
    mockCommentRepository.verifyIsCommentExists = jest
      .fn()
      .mockImplementation(() => Promise.resolve(true));
    mockCommentRepository.verifyCommentOwner = jest
      .fn()
      .mockImplementation(() => Promise.resolve(true));
    mockCommentRepository.deleteComment = jest
      .fn()
      .mockImplementation(() => Promise.resolve());

    /** creating use case instance */
    const deleteCommentUseCase = new DeleteCommentUseCase({
      commentRepository: mockCommentRepository,
      threadRepository: mockThreadRepository,
    });

    // Action
    const success = await deleteCommentUseCase.execute(useCasePayload);

    // Assert
    expect(success).toStrictEqual(true);
    expect(mockThreadRepository.verifyIsThreadExists).toBeCalledWith(
      useCasePayload.thread_id
    );
    expect(mockCommentRepository.verifyIsCommentExists).toBeCalledWith(
      useCasePayload.id
    );
    expect(mockCommentRepository.verifyCommentOwner).toBeCalledWith(
      useCasePayload.id,
      useCasePayload.owner
    );

    expect(mockCommentRepository.deleteComment).toBeCalledWith(
      useCasePayload.id
    );
  });
});