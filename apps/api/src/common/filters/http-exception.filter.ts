import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from '@nestjs/common';

@Catch()
export class HttpExceptionFilter
  implements ExceptionFilter
{
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();

    const response = ctx.getResponse();

    const request = ctx.getRequest();

    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    const exceptionResponse =
      exception instanceof HttpException
        ? exception.getResponse()
        : 'Internal server error';

    let message = 'Internal server error';

    if (typeof exceptionResponse === 'string') {
      message = exceptionResponse;
    } else if (
      typeof exceptionResponse === 'object' &&
      exceptionResponse !== null
    ) {
      const res = exceptionResponse as any;

      message = Array.isArray(res.message)
        ? res.message.join(', ')
        : res.message;
    }

    response.status(status).json({
      success: false,
      statusCode: status,
      path: request.url,
      timestamp: new Date().toISOString(),
      message,
    });
  }
}