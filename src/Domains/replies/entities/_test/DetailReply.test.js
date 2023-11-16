const DetailReply = require('../DetailReply');

describe('DetailReply entities', () => {
  it('should throw error when payload does not contain needed property', () => {
    // Arrange
    const payload = {
      id: 'reply-123',
      date: '2023-11-14',
    };

    // Action and Assert
    expect(() => new DetailReply(payload)).toThrowError(
      'DETAIL_REPLY.NOT_CONTAIN_NEEDED_PROPERTY',
    );
  });

  it('should throw error when payload does not meet data type specification', () => {
    // Arrange
    const payload = {
      id: 'reply-123',
      content: 'content',
      username: true,
      date: '2023-11-14',
    };

    // Action and Assert
    expect(() => new DetailReply(payload)).toThrowError(
      'DETAIL_REPLY.NOT_MEET_DATA_TYPE_SPECIFICATION',
    );
  });

  it('should create detail reply entities correctly', () => {
    // Arrange
    const payload = {
      id: 'reply-123',
      content: 'content',
      username: 'user-123',
      date: '2023-11-14',
    };
    // Action
    const detailReply = new DetailReply(payload);

    //   Assert
    expect(detailReply).toBeInstanceOf(DetailReply);
    expect(detailReply.id).toEqual(payload.id);
    expect(detailReply.content).toEqual(payload.content);
    expect(detailReply.username).toEqual(payload.username);
    expect(detailReply.date).toEqual(payload.date);
    expect(detailReply.id).toBeDefined();
    expect(detailReply.content).toBeDefined();
    expect(detailReply.username).toBeDefined();
    expect(detailReply.date).toBeDefined();
  });
});
