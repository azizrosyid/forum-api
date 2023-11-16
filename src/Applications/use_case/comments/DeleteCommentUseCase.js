class DeleteCommentUseCase {
  constructor({ commentRepository, threadRepository }) {
    this._commentRepository = commentRepository;
    this._threadRepository = threadRepository;
  }

  async execute(useCasePayload) {
    const { id, owner, thread_id } = useCasePayload;
    await this._threadRepository.verifyIsThreadExists(thread_id);
    await this._commentRepository.verifyIsCommentExists(id);
    await this._commentRepository.verifyCommentOwner(id, owner);
    await this._commentRepository.deleteComment(id);
    return true;
  }
}

module.exports = DeleteCommentUseCase;
