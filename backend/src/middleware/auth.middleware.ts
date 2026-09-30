import type { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { AppError } from "../errors/app.error.js";

const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  throw new Error("JWT_SECRET is not defined");
}

export function authenticate(
  req: Request,
  _res: Response,
  next: NextFunction,
) {
  const authorization = req.headers.authorization;

  if (!authorization) {
    next(new AppError("Authentication required", 401));
    return;
  }

  const [scheme, token] = authorization.split(" ");

  if (scheme !== "Bearer" || !token) {
    next(new AppError("Invalid authorization header", 401));
    return;
  }

  try {
    const payload = jwt.verify(token, JWT_SECRET as string);

    if (typeof payload === "string") {
      next(new AppError("Invalid token", 401));
      return;
    }

    if (
      !("userId" in payload) ||
      typeof payload.userId !== "string"
    ) {
      next(new AppError("Invalid token", 401));
      return;
    }

    req.user = {
      id: BigInt(payload.userId),
    };

    next();
  } catch {
    next(new AppError("Invalid or expired token", 401));
  }
}