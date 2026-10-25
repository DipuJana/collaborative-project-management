import { afterAll, beforeAll, describe, expect, it } from "vitest";
import request from "supertest";
import app from "../app.js";
import prisma from "../config/prisma.js";

const unique = Date.now();
const ownerEmail = `project-owner-${unique}@example.com`;
const outsiderEmail = `project-outsider-${unique}@example.com`;
const password = "TestPassword123!";

let ownerToken: string;
let outsiderToken: string;
let projectId: string;

describe("Project API", () => {
  beforeAll(async () => {
    // Register and log in the project owner.
    await request(app).post("/api/auth/register").send({
      name: "Project Owner",
      email: ownerEmail,
      password,
    });

    const ownerLogin = await request(app).post("/api/auth/login").send({
      email: ownerEmail,
      password,
    });

    ownerToken = ownerLogin.body.token;

    // Register and log in a user who is not a project member.
    await request(app).post("/api/auth/register").send({
      name: "Project Outsider",
      email: outsiderEmail,
      password,
    });

    const outsiderLogin = await request(app).post("/api/auth/login").send({
      email: outsiderEmail,
      password,
    });

    outsiderToken = outsiderLogin.body.token;
  });

  afterAll(async () => {
    // Remove projects first so dependent records are cleaned up.
    if (projectId) {
      await prisma.project.deleteMany({
        where: { id: BigInt(projectId) },
      });
    }

    await prisma.user.deleteMany({
      where: {
        email: { in: [ownerEmail, outsiderEmail] },
      },
    });
  });

  it("rejects project creation without authentication", async () => {
    const response = await request(app)
      .post("/api/projects")
      .send({ name: "Unauthenticated Project" });

    expect(response.status).toBe(401);
  });

  it("rejects a project with an invalid name", async () => {
    const response = await request(app)
      .post("/api/projects")
      .set("Authorization", `Bearer ${ownerToken}`)
      .send({ name: "   " });

    expect(response.status).toBe(400);
  });

  it("creates a project and makes the creator its owner", async () => {
    const response = await request(app)
      .post("/api/projects")
      .set("Authorization", `Bearer ${ownerToken}`)
      .send({
        name: "Integration Test Project",
        description: "Created by an automated test",
      });

    expect(response.status).toBe(201);
    expect(response.body.message).toBe("Project created successfully");
    expect(response.body.project).toMatchObject({
      name: "Integration Test Project",
      description: "Created by an automated test",
    });

    projectId = response.body.project.id;

    expect(projectId).toBeDefined();
    expect(response.body.project.ownerId).toBeDefined();

    const membership = await prisma.projectMember.findFirst({
      where: {
        projectId: BigInt(projectId),
        role: "OWNER",
      },
    });

    expect(membership).not.toBeNull();
  });

  it("lists the owner's projects", async () => {
    const response = await request(app)
      .get("/api/projects")
      .set("Authorization", `Bearer ${ownerToken}`);

    expect(response.status).toBe(200);
    expect(response.body.projects).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: projectId,
          name: "Integration Test Project",
          role: "OWNER",
        }),
      ]),
    );
  });

  it("retrieves project details for a member", async () => {
    const response = await request(app)
      .get(`/api/projects/${projectId}`)
      .set("Authorization", `Bearer ${ownerToken}`);

    expect(response.status).toBe(200);
    expect(response.body.project).toMatchObject({
      id: projectId,
      name: "Integration Test Project",
      role: "OWNER",
    });
  });

  it("does not expose project details to a non-member", async () => {
    const response = await request(app)
      .get(`/api/projects/${projectId}`)
      .set("Authorization", `Bearer ${outsiderToken}`);

    expect(response.status).toBe(404);
    expect(response.body.error).toBe("Project not found");
  });

  it("rejects a malformed project ID", async () => {
    const response = await request(app)
      .get("/api/projects/not-a-number")
      .set("Authorization", `Bearer ${ownerToken}`);

    expect(response.status).toBe(400);
    expect(response.body.error).toBe("Invalid project ID");
  });
});
