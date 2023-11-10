const NewComment = require("../NewComment");

describe("a NewComment entities", () => {
  it("should throw error when payload did not contain needed property", () => {
    // Arrange
    const payload = {
      owner: "user-123",
      thread_id: "thread-123",
    }; //kurang content

    // Action and Assert
    expect(() => new NewComment(payload)).toThrowError(
      "NEW_COMMENT.NOT_CONTAIN_NEEDED_PROPERTY"
    );
  });

  it("should throw error when payload did not meet data type specification", () => {
    // Arrange
    const payload = {
      owner: true,
      content: 123,
      thread_id: "thread-valid",
    };

    // Action and Assert
    expect(() => new NewComment(payload)).toThrowError(
      "NEW_COMMENT.NOT_MEET_DATA_TYPE_SPECIFICATION"
    );
  });

  it("should create NewComment object correctly", () => {
    // Arrange
    const payload = {
      owner: "user-123",
      content: "Comment Content",
      thread_id: "thread-123",
    };

    // Action
    const { owner, content, thread_id } = new NewComment(payload);

    // Assert
    expect(owner).toEqual(payload.owner);
    expect(content).toEqual(payload.content);
    expect(thread_id).toEqual(payload.thread_id);
  });
});