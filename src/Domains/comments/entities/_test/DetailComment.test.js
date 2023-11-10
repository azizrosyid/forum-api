const DetailComment = require("../DetailComment");

describe("a DetailComment entities", () => {
  it("should throw error when payload did not contain needed property", () => {
    // Arrange
    const payload = {
      content: "Comment Content",
      username: "uname",
    };

    // Action and Assert
    expect(() => new DetailComment(payload)).toThrowError(
      "DETAIL_COMMENT.NOT_CONTAIN_NEEDED_PROPERTY"
    );
  });

  it("should throw error when payload did not meet data type specification", () => {
    // Arrange
    const payload = {
      id: 123,
      content: "Correct content",
      username: {},
      date: true,
      is_deleted: [],
    };

    // Action and Assert
    expect(() => new DetailComment(payload)).toThrowError(
      "DETAIL_COMMENT.NOT_MEET_DATA_TYPE_SPECIFICATION"
    );
  });

  it("should create detailComment object correctly", () => {
    // Arrange
    const payload1 = {
      id: "comment-123",
      content: "Comment content",
      username: "iamuser",
      date: "2021-08-08T07:22:33.555Z",
      is_deleted: false,
    };
    const payload2 = {
      id: "comment-456",
      content: "Comment content",
      username: "iamotheruser",
      date: "2023-08-08T07:22:33.555Z",
      is_deleted: true,
    };

    // Action
    const detailComment1 = new DetailComment(payload1);
    const detailComment2 = new DetailComment(payload2);

    // Assert
    expect(detailComment1.id).toEqual(payload1.id);
    expect(detailComment1.content).toEqual(payload1.content);
    expect(detailComment1.username).toEqual(payload1.username);
    expect(detailComment1.date).toEqual(payload1.date);

    expect(detailComment2.id).toEqual(payload2.id);
    expect(detailComment2.content).toEqual("**komentar telah dihapus**");
    expect(detailComment2.username).toEqual(payload2.username);
    expect(detailComment2.date).toEqual(payload2.date);
  });
});