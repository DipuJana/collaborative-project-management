
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
const password = "TestPassword123!";

const ownerEmail = `authz-owner-${unique}@example.com`;
const memberEmail = `authz-member-${unique}@example.com`;
const outsiderEmail = `authz-outsider-${unique}@example.com`;

let ownerToken: string;
let memberToken: string;
let outsiderToken: string;

let projectOneId: string;
let projectOneCode: string;
let projectTwoId: string;
let invitationId: string;
let joinRequestId: string;
let projectTwoTaskId: string;

async function registerAndLogin(name: string, email: string) {
  const registration = await request(app)
    .post("/api/auth/register")
    .send({ name, email, password });

  expect(registration.status).toBe(201);

  const login = await request(app)
    .post("/api/auth/login")
    .send({ email, password });

  expect(login.status).toBe(200);

  return login.body.token as string;
}

describe("Authorization boundaries", () => {
  beforeAll(async () => {
    // Create three independent users.
    ownerToken = await registerAndLogin("Authorization Owner", ownerEmail);
    memberToken = await registerAndLogin("Authorization Member", memberEmail);
    outsiderToken = await registerAndLogin("Authorization Outsider", outsiderEmail);

    // Project One: the owner and member will belong to this project.
    const projectOneResponse = await request(app)
      .post("/api/projects")
      .set("Authorization", `Bearer ${ownerToken}`)
      .send({
        name: "Authorization Project One",
        description: "Project used for authorization tests",
      });

    expect(projectOneResponse.status).toBe(201);

    projectOneId = projectOneResponse.body.project.id;
    projectOneCode = projectOneResponse.body.project.code;

    // Project Two: the outsider and member will not belong to this project.
    const projectTwoResponse = await request(app)
      .post("/api/projects")
      .set("Authorization", `Bearer ${ownerToken}`)
      .send({
        name: "Authorization Project Two",
        description: "Private project for cross-project tests",
      });

    expect(projectTwoResponse.status).toBe(201);

    projectTwoId = projectTwoResponse.body.project.id;

    // Invite the member to Project One.
    const memberInvitationResponse = await request(app)
      .post(`/api/projects/${projectOneId}/invitations`)
      .set("Authorization", `Bearer ${ownerToken}`)
      .send({ email: memberEmail });

    expect(memberInvitationResponse.status).toBe(201);

    const memberInvitationId =
      memberInvitationResponse.body.invitation.id;

    // Accept the invitation so the user becomes a regular member.
    const acceptResponse = await request(app)
      .post(`/api/invitations/${memberInvitationId}/accept`)
      .set("Authorization", `Bearer ${memberToken}`);

    expect(acceptResponse.status).toBe(200);

    // Create an invitation intended for the outsider.
    const outsiderInvitationResponse = await request(app)
      .post(`/api/projects/${projectOneId}/invitations`)
      .set("Authorization", `Bearer ${ownerToken}`)
      .send({ email: outsiderEmail });

    expect(outsiderInvitationResponse.status).toBe(201);

    invitationId = outsiderInvitationResponse.body.invitation.id;

    // Create a pending join request from the outsider to Project One.
    const joinRequestResponse = await request(app)
      .post("/api/projects/join-requests")
      .set("Authorization", `Bearer ${outsiderToken}`)
      .send({ projectCode: projectOneCode });

    expect(joinRequestResponse.status).toBe(201);

    joinRequestId = joinRequestResponse.body.request.id;

    // Create a task in Project Two, where the member has no membership.
    const taskResponse = await request(app)
      .post(`/api/projects/${projectTwoId}/tasks`)
      .set("Authorization", `Bearer ${ownerToken}`)
      .send({
        title: "Private Project Two Task",
        description: "Used to test cross-project access",
      });

    expect(taskResponse.status).toBe(201);

    projectTwoTaskId = taskResponse.body.task.id;
  });

  afterAll(async () => {
    // Remove projects before their dependent records and users.
    const projectIds = [projectOneId, projectTwoId]
      .filter(Boolean)
      .map((id) => BigInt(id));

    if (projectIds.length > 0) {
      await prisma.project.deleteMany({
        where: { id: { in: projectIds } },
      });
    }

    await prisma.user.deleteMany({
      where: {
        email: {
          in: [ownerEmail, memberEmail, outsiderEmail],
        },
      },
    });
  });

  describe("Owner/admin-only actions", () => {
    it("prevents a regular member from inviting users", async () => {
      const response = await request(app)
        .post(`/api/projects/${projectOneId}/invitations`)
        .set("Authorization", `Bearer ${memberToken}`)
        .send({ email: `new-user-${unique}@example.com` });

      expect(response.status).toBe(403);
    });

    it("prevents a regular member from listing join requests", async () => {
      const response = await request(app)
        .get(`/api/projects/${projectOneId}/join-requests`)
        .set("Authorization", `Bearer ${memberToken}`);

      expect(response.status).toBe(403);
    });

    it("prevents a regular member from approving join requests", async () => {
      const response = await request(app)
        .post(
          `/api/projects/${projectOneId}/join-requests/${joinRequestId}/approve`,
        )
        .set("Authorization", `Bearer ${memberToken}`);

      expect(response.status).toBe(403);
    });

    it("prevents a regular member from deleting a project", async () => {
      const response = await request(app)
        .delete(`/api/projects/${projectOneId}`)
        .set("Authorization", `Bearer ${memberToken}`);

      expect(response.status).toBe(403);
    });
  });

  describe("Invitation ownership", () => {
    it("prevents a user from accepting another user's invitation", async () => {
      const response = await request(app)
        .post(`/api/invitations/${invitationId}/accept`)
        .set("Authorization", `Bearer ${memberToken}`);

      expect(response.status).toBe(404);
    });
  });

  describe("Cross-project task access", () => {
    it("prevents a member from reading a task belonging to another project", async () => {
      const response = await request(app)
        .get(
          `/api/projects/${projectOneId}/tasks/${projectTwoTaskId}`,
        )
        .set("Authorization", `Bearer ${memberToken}`);

      expect(response.status).toBe(404);
    });

    it("prevents a member from updating a task belonging to another project", async () => {
      const response = await request(app)
        .patch(
          `/api/projects/${projectOneId}/tasks/${projectTwoTaskId}`,
        )
        .set("Authorization", `Bearer ${memberToken}`)
        .send({ title: "Unauthorized task update" });

      expect(response.status).toBe(404);
    });
  });
});
