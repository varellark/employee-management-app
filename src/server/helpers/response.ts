import { Context } from 'hono';
import { ContentfulStatusCode } from 'hono/utils/http-status';

export class ResponseHelper {
  static success(
    c: Context,
    message: string,
    data?: unknown,
    status: ContentfulStatusCode = 200
  ) {
    return c.json(
      {
        success: true,
        message,
        data,
      },
      status
    );
  }

  static error(
    c: Context,
    message: string,
    errors?: unknown,
    status: ContentfulStatusCode = 500
  ) {
    return c.json(
      {
        success: false,
        message,
        errors,
      },
      status
    );
  }
}
