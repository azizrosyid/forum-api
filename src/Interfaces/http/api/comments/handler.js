const AddCommentUseCase = require("../../../../Applications/use_case/comments/AddCommentUseCase");
const DeleteCommentUseCase = require("../../../../Applications/use_case/comments/DeleteCommentUseCase");

class CommentsHandler {
  constructor(container) {
    this._container = container;

    this.postCommentHandler = this.postCommentHandler.bind(this);
    this.deleteCommentHandler = this.deleteCommentHandler.bind(this);
  }

  async postCommentHandler(request, h) {
    const addCommentUseCase = this._container.getInstance(
      AddCommentUseCase.name
    );
    const { threadId } = request.params;
    const { content } = request.payload;
    const { id: owner } = request.auth.credentials;
    const addedComment = await addCommentUseCase.execute({
      owner,
      content,
      thread_id: threadId,
    });

    const response = h.response({
      status: "success",
      data: {
        addedComment,
      },
    });
    response.code(201);
    return response;
  }

  async deleteCommentHandler(request, h) {
    const deleteCommentUseCase = this._container.getInstance(
      DeleteCommentUseCase.name
    );

    const { id, threadId: thread_id } = request.params;
    const { id: owner } = request.auth.credentials;

    await deleteCommentUseCase.execute({
      id,
      owner,
      thread_id,
    });

    const response = h.response({
      status: "success",
      message: "Comment deleted",
    });
    response.code(200);
    return response;
  }
}

module.exports = CommentsHandler;