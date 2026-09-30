import type { NextFunction, Request, Response } from "express";
import { loginUser, registerUser } from "../services/auth.service.js";

export async function register(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const { name, email, password } = req.body;

    const user = await registerUser(name, email, password);

    res.status(201).json({
      message: "User registered successfully",
      user,
    });
  } catch (error) {
    next(error);
  }
}

export async function login(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const { email, password } = req.body;

    const result = await loginUser(email, password);

    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
}