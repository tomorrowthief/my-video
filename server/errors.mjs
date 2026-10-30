export class HttpError extends Error {
  constructor(status, code, message) {
    super(message);
    this.status = status;
    this.code = code;
  }
}
export const invalidAsset = () => new HttpError(400, "INVALID_ASSET", "素材格式不受支持、损坏或超过解码限制，请重新上传。");
