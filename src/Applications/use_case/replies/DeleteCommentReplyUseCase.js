class DeleteCommentReplyUseCase {
  constructor({ commentRepository, replyRepository }) {
    this._commentRepository = commentRepository;
    this._replyRepository = replyRepository;
  }

  async execute(useCasePayload) {
    const { commentId, replyId, owner } = useCasePayload;
    await this._commentRepository.verifyIsCommentExists(commentId);
    await this._replyRepository.verifyAvailableCommentReply(replyId);
    await this._replyRepository.verifyOwnerCommentReply(replyId, owner);

    await this._replyRepository.deleteCommentReplyByReplyId(replyId);
  }
}

module.exports = DeleteCommentReplyUseCase;
