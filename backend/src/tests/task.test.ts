import {
  afterAll,
  beforeAll,
  describe,
  expect,
  it,
} from "vitest";
import request from "supertest";
import app from "../app.js";
import prisma from "../config/prisma.js";

const unique = Date.now();
const ownerEmail = `task-owner-${unique}@example.com`;
const outsiderEmail = `task-outsider-${unique}@example.com`;
const password = "TestPassword123!";

let ownerToken: string;
let outsiderToken: string;
let projectId: string;
let taskId: string;

describe("Task API", () => {
  beforeAll(async () => {
    await request(app).post("/api/auth/register").send({
      name: "Task Test Owner",
      email: ownerEmail,
      password,
    });

    const ownerLogin = await request(app).post("/api/auth/login").send({
      email: ownerEmail,
      password,
    });
    ownerToken = ownerLogin.body.token;

    await request(app).post("/api/auth/register").send({
      name: "Task Test Outsider",
      email: outsiderEmail,
      password,
    });

    const outsiderLogin = await request(app).post("/api/auth/login").send({
      email: outsiderEmail,
      password,
    });
    outsiderToken = outsiderLogin.body.token;

    const projectResponse = await request(app)
      .post("/api/projects")
      .set("Authorization", `Bearer ${ownerToken}`)
      .send({
        name: "Task Integration Project",
        description: "Temporary project for task tests",
      });

    projectId = projectResponse.body.project.id;
  });

  afterAll(async () => {
    // Delete the project first so its tasks and memberships are removed.
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

  it("rejects task creation without authentication", async () => {
    const response = await request(app)
      .post(`/api/projects/${projectId}/tasks`)
      .send({ title: "Unauthenticated task" });

    expect(response.status).toBe(401);
  });

  it("rejects an invalid task payload", async () => {
    const response = await request(app)
      .post(`/api/projects/${projectId}/tasks`)
      .set("Authorization", `Bearer ${ownerToken}`)
      .send({ title: "" });

    expect(response.status).toBe(400);
  });

  it("rejects task creation by a non-member", async () => {
    const response = await request(app)
      .post(`/api/projects/${projectId}/tasks`)
      .set("Authorization", `Bearer ${outsiderToken}`)
      .send({ title: "Outsider task" });

    expect(response.status).toBe(404);
    expect(response.body.error).toBe("Project not found");
  });

  it("creates a task with default status and priority", async () => {
    const response = await request(app)
      .post(`/api/projects/${projectId}/tasks`)
      .set("Authorization", `Bearer ${ownerToken}`)
      .send({
        title: "Implement task tests",
        description: "Cover the task API",
        dueDate: "2027-01-15",
      });

    expect(response.status).toBe(201);
    expect(response.body.message).toBe("Task created successfully");
    expect(response.body.task).toMatchObject({
      title: "Implement task tests",
      description: "Cover the task API",
      status: "TODO",
      priority: "MEDIUM",
      assignedTo: null,
      projectId,
      dueDate: "2027-01-15",
    });

    taskId = response.body.task.id;
    expect(taskId).toBeDefined();
  });

  it("rejects assigning a task to a non-member", async () => {
    const response = await request(app)
      .post(`/api/projects/${projectId}/tasks`)
      .set("Authorization", `Bearer ${ownerToken}`)
      .send({
        title: "Invalid assignment",
        assignedTo: "999999999",
      });

    expect(response.status).toBe(400);
    expect(response.body.error).toBe(
      "Assignee must be a member of this project",
    );
  });

  it("retrieves a task by ID", async () => {
    const response = await request(app)
      .get(`/api/projects/${projectId}/tasks/${taskId}`)
      .set("Authorization", `Bearer ${ownerToken}`);

    expect(response.status).toBe(200);
    expect(response.body.task).toMatchObject({
      id: taskId,
      projectId,
      title: "Implement task tests",
    });
  });

  it("updates task status and priority", async () => {
    const response = await request(app)
      .patch(`/api/projects/${projectId}/tasks/${taskId}`)
      .set("Authorization", `Bearer ${ownerToken}`)
      .send({
        status: "IN_PROGRESS",
        priority: "HIGH",
      });

    expect(response.status).toBe(200);
    expect(response.body.task).toMatchObject({
      id: taskId,
      status: "IN_PROGRESS",
      priority: "HIGH",
    });
  });

  it("rejects an empty task update", async () => {
    const response = await request(app)
      .patch(`/api/projects/${projectId}/tasks/${taskId}`)
      .set("Authorization", `Bearer ${ownerToken}`)
      .send({});

    expect(response.status).toBe(400);
  });

  it("filters tasks by status and priority", async () => {
    const response = await request(app)
      .get(`/api/projects/${projectId}/tasks`)
      .query({
        status: "IN_PROGRESS",
        priority: "HIGH",
      })
      .set("Authorization", `Bearer ${ownerToken}`);

    expect(response.status).toBe(200);
    expect(response.body.tasks).toHaveLength(1);
    expect(response.body.tasks[0]).toMatchObject({
      id: taskId,
      status: "IN_PROGRESS",
      priority: "HIGH",
    });
  });

  it("returns pagination metadata", async () => {
    const response = await request(app)
      .get(`/api/projects/${projectId}/tasks`)
      .query({ page: 1, limit: 1 })
      .set("Authorization", `Bearer ${ownerToken}`);

    expect(response.status).toBe(200);
    expect(response.body.pagination).toMatchObject({
      page: 1,
      limit: 1,
      total: 1,
      totalPages: 1,
    });
    expect(response.body.tasks).toHaveLength(1);
  });

  it("rejects an invalid status filter", async () => {
    const response = await request(app)
      .get(`/api/projects/${projectId}/tasks`)
      .query({ status: "INVALID" })
      .set("Authorization", `Bearer ${ownerToken}`);

    expect(response.status).toBe(400);
    expect(response.body.error).toBe("Invalid task status filter");
  });

  it("does not expose project tasks to a non-member", async () => {
    const response = await request(app)
      .get(`/api/projects/${projectId}/tasks`)
      .set("Authorization", `Bearer ${outsiderToken}`);

    expect(response.status).toBe(404);
    expect(response.body.error).toBe("Project not found");
  });

  it("deletes a task", async () => {
    const response = await request(app)
      .delete(`/api/projects/${projectId}/tasks/${taskId}`)
      .set("Authorization", `Bearer ${ownerToken}`);

    expect(response.status).toBe(200);
    expect(response.body.message).toBe("Task deleted successfully");

    const followUp = await request(app)
      .get(`/api/projects/${projectId}/tasks/${taskId}`)
      .set("Authorization", `Bearer ${ownerToken}`);

    expect(followUp.status).toBe(404);
    expect(followUp.body.error).toBe("Task not found");
  });
});
