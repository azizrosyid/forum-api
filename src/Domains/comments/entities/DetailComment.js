class DetailComment {
    constructor(payload) {
      this._verifyPayload(payload);
  
      const { id, content, username, date, is_deleted } = payload;
  
      this.id = id;
      this.content = is_deleted ? "**komentar telah dihapus**" : content;
      this.username = username;
      this.date = date;
    }
  
    _verifyPayload({ id, content, username, date, is_deleted }) {
      if (!id || !content || !username || !date || is_deleted === undefined) {
        throw new Error("DETAIL_COMMENT.NOT_CONTAIN_NEEDED_PROPERTY");
      }
  
      if (
        typeof id !== "string" ||
        typeof date !== "string" ||
        typeof content !== "string" ||
        typeof username !== "string" ||
        typeof is_deleted !== "boolean"
      ) {
        throw new Error("DETAIL_COMMENT.NOT_MEET_DATA_TYPE_SPECIFICATION");
      }
    }
  }
  
  module.exports = DetailComment;