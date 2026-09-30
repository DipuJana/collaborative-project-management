import bcrypt from "bcrypt";
import prisma from "../config/prisma.js";
import { AppError } from "../errors/app.error.js";
import { generateToken } from "../config/jwt.js";

export async function registerUser(
  name: string,
  email: string,
  password: string,
) {
  const existingUser = await prisma.user.findUnique({
    where: { email },
  });

  if (existingUser) {
    throw new AppError("Email already registered", 409);
  }

  // ...
  const passwordHash = await bcrypt.hash(password, 12);

  const user = await prisma.user.create({
    data: {
      name,
      email,
      passwordHash,
    },
    select: {
      id: true,
      name: true,
      email: true,
      createdAt: true,
    },
  });

  return {
  ...user,
  id: user.id.toString(),
  };

}

export async function loginUser(
  email: string,
  password: string,
) {
  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user) {
    throw new AppError("Invalid email or password", 401);
  }

  const passwordMatches = await bcrypt.compare(
    password,
    user.passwordHash,
  );

  if (!passwordMatches) {
    throw new AppError("Invalid email or password", 401);
  }

  const token = generateToken(user.id);

  return {
    token,
    user: {
      id: user.id.toString(),
      name: user.name,
      email: user.email,
    },
  };
}