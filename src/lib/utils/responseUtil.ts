import { NextApiResponse } from "next";

class ResponseHandler {
  static sendSuccess(
    res: NextApiResponse,
    data: any = null,
    message: string = "Success",
    statusCode: number = 200,
  ) {
    return res.status(statusCode).json({
      success: true,
      message,
      data,
      error: null,
    });
  }

  static sendError(
    res: NextApiResponse,
    message: string = "Internal Server Error",
    statusCode: number = 500,
    errors: any = null,
  ) {
    return res.status(statusCode).json({
      success: false,
      message,
      data: null,
      error: errors,
    });
  }

  static validationError(res: NextApiResponse, error: any) {
    const formatted = error.details.map((err: any) => ({
      field: err.path[0],
      message: err.message,
    }));

    return res.status(400).json({
      success: false,
      message: "Validation Error",
      data: null,
      error: formatted,
    });
  }

  // Unauthorized
  static unauthorized(res: NextApiResponse, message = "Unauthorized") {
    return res.status(401).json({
      success: false,
      message,
      data: null,
      error: null,
    });
  }

 
  static forbidden(res: NextApiResponse, message = "Forbidden") {
    return res.status(403).json({
      success: false,
      message,
      data: null,
      error: null,
    });
  }
}

export default ResponseHandler;
