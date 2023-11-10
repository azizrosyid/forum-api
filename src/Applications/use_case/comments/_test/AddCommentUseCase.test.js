const AddedComment = require("../../../../Domains/comments/entities/AddedComment");
const CommentRepository = require("../../../../Domains/comments/CommentRepository");
const ThreadRepository = require("../../../../Domains/threads/ThreadRepository");
const AddCommentUseCase = require("../AddCommentUseCase");
const NewComment = require("../../../../Domains/comments/entities/NewComment");

describe("AddUserUseCase", () => {
  /**
   * Menguji apakah use case mampu mengoskestrasikan langkah demi langkah dengan benar.
   */
  it("should orchestrating the add comment action correctly", async () => {
    // Arrange
    const useCasePayload = {
      owner: "user-123",
      content: "This is comment content",
      thread_id: "thread-123",
    };

    const mockAddedComment = new AddedComment({
      id: "comment-123",
      content: useCasePayload.content,
      owner: useCasePayload.owner,
    });

    /** creating dependency of use case */
    const mockCommentRepository = new CommentRepository();
    const mockThreadRepository = new ThreadRepository();
    /** mocking needed function */
    mockThreadRepository.verifyIsThreadExists = jest
      .fn()
      .mockImplementation(() => Promise.resolve(true));
    mockCommentRepository.addComment = jest
      .fn()
      .mockImplementation(() => Promise.resolve(mockAddedComment));

    /** creating use case instance */
    const addCommentUseCase = new AddCommentUseCase({
      commentRepository: mockCommentRepository,
      threadRepository: mockThreadRepository,
    });

    // Action
    const addedComment = await addCommentUseCase.execute(useCasePayload);

    // Assert
    expect(addedComment).toStrictEqual(
      new AddedComment({
        id: "comment-123",
        content: useCasePayload.content,
        owner: useCasePayload.owner,
      })
    );
    expect(mockThreadRepository.verifyIsThreadExists).toBeCalledWith(
      useCasePayload.thread_id
    );
    expect(mockCommentRepository.addComment).toBeCalledWith(
      new NewComment({
        owner: useCasePayload.owner,
        content: useCasePayload.content,
        thread_id: useCasePayload.thread_id,
      })
    );
  });
});