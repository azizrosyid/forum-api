const AddThreadUseCase = require("../../../../Applications/use_case/threads/AddThreadUseCase");
const GetThreadDetailUseCase = require("../../../../Applications/use_case/threads/GetThreadDetailUseCase");

class ThreadsHandler {
  constructor(container) {
    this._container = container;

    this.postThreadHandler = this.postThreadHandler.bind(this);
    this.getThreadHandler = this.getThreadHandler.bind(this);
  }

  async postThreadHandler(request, h) {
    const addThreadUseCase = this._container.getInstance(AddThreadUseCase.name);
    const { title, body } = request.payload;
    const { id: owner } = request.auth.credentials;
    const addedThread = await addThreadUseCase.execute({ owner, title, body });

    const response = h.response({
      status: "success",
      data: {
        addedThread, 
      },
    });
    response.code(201);
    return response;
  }

  async getThreadHandler(request, h) {
    const getThreadDetailUseCase = this._container.getInstance(
      GetThreadDetailUseCase.name
    );
    const thread = await getThreadDetailUseCase.execute(request.params);
    const response = h.response({
      status: "success",
      data: {
        thread,
      },
    });
    response.code(200);
    return response;
  }
}

module.exports = ThreadsHandler;