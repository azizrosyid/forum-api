const DetailReply = require('../../../Domains/replies/entities/DetailReply');
const DetailThread = require('../../../Domains/threads/entities/DetailThread');

class GetThreadDetailUseCase {
  constructor({ threadRepository, commentRepository, replyRepository }) {
    this._threadRepository = threadRepository;
    this._commentRepository = commentRepository;
    this._replyRepository = replyRepository;
  }

  async execute({ id }) {
    await this._threadRepository.verifyIsThreadExists(id);
    const thread = await this._threadRepository.getThreadDetail(id);
    const comments = await this._commentRepository.getCommentsByThreadId(id);
    const replies = await this._replyRepository.getRepliesCommentByThreadId(id);

    const getRepliesForComment = (commentId) => replies
      .filter((reply) => reply.comment_id === commentId)
      .map((reply) => {
        let { content } = reply;
        if (reply.is_deleted) {
          content = '**balasan telah dihapus**';
        }
        return new DetailReply({
          id: reply.id,
          content,
          date: reply.date,
          username: reply.username,
        });
      });

    const mappedComments = comments.map((comment) => ({
      id: comment.id,
      username: comment.username,
      date: comment.date,
      content: comment.is_deleted ? '**komentar telah dihapus**' : comment.content,
      replies: getRepliesForComment(comment.id),
    }));

    const detailThread = new DetailThread({
      ...thread,
      comments: mappedComments,
    });

    return detailThread;
  }
}

module.exports = GetThreadDetailUseCase;
