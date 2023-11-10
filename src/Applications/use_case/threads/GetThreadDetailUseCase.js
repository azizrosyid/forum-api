class GetThreadDetailUseCase {
    constructor({ threadRepository, commentRepository }) {
      this._threadRepository = threadRepository;
      this._commentRepository = commentRepository;
    }
  
    async execute(useCasePayload) {
      const { id } = useCasePayload;
      await this._threadRepository.verifyIsThreadExists(id);
      const thread = await this._threadRepository.getThreadDetail(id);
      const comments = await this._commentRepository.getCommentsByThreadId(id);
      thread.comments = comments;
      return thread;
    }
  }
  
  module.exports = GetThreadDetailUseCase;