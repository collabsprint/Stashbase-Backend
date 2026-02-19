import { Response } from 'express';

interface SuccessResponse {
  success: boolean;
  data: any;
  message: string;
}

interface ErrorResponse {
  success: boolean;
  message: string;
  data: null;
}

function success(res: Response, data: any = {}, message: string = ''): Response {
    return res.status(200).json({
        success: true,
        data: data,
        message: message
    });
}

function error(res: Response, message: string, statusCode: number = 400): Response {
    return res.status(statusCode).json({
        success: false,
        message: message,
        data: null
    });
}

function validationError(res: Response, message: string): Response {
    return res.status(422).json({
        success: false,
        message: message,
        data: null
    });
}

export { success, error, validationError };
