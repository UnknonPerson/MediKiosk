export default class ApiResponse {
  constructor(data = {}, message = 'Request successful') {
    this.success = true;
    this.message = message;
    this.data = data;
  }
}
