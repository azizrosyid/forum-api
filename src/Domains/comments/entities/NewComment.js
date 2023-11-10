class NewComment {
    constructor(payload) {
      this._verifyPayload(payload);
  
      const { owner, content, thread_id } = payload;
  
      this.owner = owner;
      this.content = content;
      this.thread_id = thread_id;
    }
  
    _verifyPayload({ owner, content, thread_id }) {
      if (!owner || !content || !thread_id) {
        throw new Error("NEW_COMMENT.NOT_CONTAIN_NEEDED_PROPERTY");
      }
  
      if (
        typeof owner !== "string" ||
        typeof content !== "string" ||
        typeof thread_id !== "string"
      ) {
        throw new Error("NEW_COMMENT.NOT_MEET_DATA_TYPE_SPECIFICATION");
      }
    }
  }
  
  module.exports = NewComment;