import { afterAll, beforeAll, describe, expect, it } from "vitest";
import request from "supertest";
import app from "../app.js";
import prisma from "../config/prisma.js";

const testEmail = `auth-test-${Date.now()}@example.com`;
const testPassword = "TestPassword123!";

describe("Authentication API", () => {
  beforeAll(async () => {
    // Ensure this test user does not already exist.
    await prisma.user.deleteMany({
      where: { email: testEmail },
    });
  });

  afterAll(async () => {
    // Clean up the user created by these tests.
    await prisma.user.deleteMany({
      where: { email: testEmail },
    });

  });

  it("registers a new user", async () => {
    const response = await request(app)
      .post("/api/auth/register")
      .send({
        name: "Auth Test User",
        email: testEmail,
        password: testPassword,
      });

    expect(response.status).toBe(201);
    expect(response.body.message).toBe("User registered successfully");
    expect(response.body.user).toMatchObject({
      name: "Auth Test User",
      email: testEmail,
    });
    expect(response.body.user.id).toBeDefined();
    expect(response.body.user.passwordHash).toBeUndefined();
  });

  it("rejects registering the same email twice", async () => {
    const response = await request(app)
      .post("/api/auth/register")
      .send({
        name: "Duplicate User",
        email: testEmail,
        password: testPassword,
      });

    expect(response.status).toBe(409);
    expect(response.body.error).toBe("Email already registered");
  });

  it("logs in with valid credentials and returns a JWT", async () => {
    const response = await request(app)
      .post("/api/auth/login")
      .send({
        email: testEmail,
        password: testPassword,
      });

    expect(response.status).toBe(200);
    expect(response.body.token).toEqual(expect.any(String));
    expect(response.body.user).toMatchObject({
      email: testEmail,
      name: "Auth Test User",
    });
    expect(response.body.user.id).toBeDefined();
  });

  it("rejects an incorrect password", async () => {
    const response = await request(app)
      .post("/api/auth/login")
      .send({
        email: testEmail,
        password: "WrongPassword123!",
      });

    expect(response.status).toBe(401);
    expect(response.body.error).toBe("Invalid email or password");
  });

  it("rejects login for an unknown email", async () => {
    const response = await request(app)
      .post("/api/auth/login")
      .send({
        email: `unknown-${Date.now()}@example.com`,
        password: testPassword,
      });

    expect(response.status).toBe(401);
    expect(response.body.error).toBe("Invalid email or password");
  });

  it("rejects invalid registration input", async () => {
    const response = await request(app)
      .post("/api/auth/register")
      .send({
        name: "A",
        email: "not-an-email",
        password: "short",
      });

    expect(response.status).toBe(400);
  });

  it("rejects access to /me without a token", async () => {
    const response = await request(app).get("/api/auth/me");

    expect(response.status).toBe(401);
  });

  it("allows access to /me with a valid token", async () => {
    const loginResponse = await request(app)
      .post("/api/auth/login")
      .send({
        email: testEmail,
        password: testPassword,
      });

    const token = loginResponse.body.token as string;

    const response = await request(app)
      .get("/api/auth/me")
      .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body.userId).toBe(loginResponse.body.user.id);
  });
});
