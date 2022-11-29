import { ExceptionFilter, Catch, ArgumentsHost, HttpException } from '@nestjs/common';
import { Request, Response } from 'express';

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
	catch(exception: HttpException, host: ArgumentsHost) {
		const ctx = host.switchToHttp();
		const response = ctx.getResponse<Response>();
		const request = ctx.getRequest<Request>();
		const status = exception.getStatus();

		if (status === 400) {
			const errorResponse = {
				errorsMessages: [],
			};
			const responseBody: any = exception.getResponse();
			typeof responseBody.message !== 'string' && responseBody.message.forEach((m) => errorResponse.errorsMessages.push({message: m.message, field: m.field}));
			response.status(status).json(errorResponse);
		} else {
			response.status(status).json({
				statusCode: status,
				timestamp: new Date().toISOString(),
				path: request.url,
			});
		}
	}
}
