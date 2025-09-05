export interface PromiseError {
  response?: {
    status: number;
    data: {
      code: number;
    };
  };
}
