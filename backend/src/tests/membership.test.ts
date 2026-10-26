
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

const ownerEmail = `membership-owner-${unique}@example.com`;
const inviteeEmail = `membership-invitee-${unique}@example.com`;
const requesterEmail = `membership-requester-${unique}@example.com`;
const rejectInviteEmail = `membership-reject-${unique}@example.com`;
const rejectRequestEmail = `membership-reject-request-${unique}@example.com`;

let ownerToken: string;
let inviteeToken: string;
let requesterToken: string;
let rejectInviteToken: string;
let rejectRequestToken: string;

let projectId: string;
let projectCode: string;
let invitationId: string;
let rejectInvitationId: string;
let joinRequestId: string;
let rejectJoinRequestId: string;

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

describe("Invitation and join-request APIs", () => {
  beforeAll(async () => {
    ownerToken = await registerAndLogin("Membership Owner", ownerEmail);
    inviteeToken = await registerAndLogin(
      "Invitation Recipient",
      inviteeEmail,
    );
    requesterToken = await registerAndLogin(
      "Join Requester",
      requesterEmail,
    );
    rejectInviteToken = await registerAndLogin(
      "Invitation Rejecter",
      rejectInviteEmail,
    );
    rejectRequestToken = await registerAndLogin(
      "Join Request Rejecter",
      rejectRequestEmail,
    );

    const projectResponse = await request(app)
      .post("/api/projects")
      .set("Authorization", `Bearer ${ownerToken}`)
      .send({
        name: "Membership Integration Project",
        description: "Temporary membership test project",
      });

    expect(projectResponse.status).toBe(201);

    projectId = projectResponse.body.project.id;
    projectCode = projectResponse.body.project.code;
  });

  afterAll(async () => {
    // Delete the project first to clean up dependent records.
    if (projectId) {
      await prisma.project.deleteMany({
        where: { id: BigInt(projectId) },
      });
    }

    await prisma.user.deleteMany({
      where: {
        email: {
          in: [
            ownerEmail,
            inviteeEmail,
            requesterEmail,
            rejectInviteEmail,
            rejectRequestEmail,
          ],
        },
      },
    });
  });

  describe("Invitations", () => {
    it("rejects invitation creation without authentication", async () => {
      const response = await request(app)
        .post(`/api/projects/${projectId}/invitations`)
        .send({ email: inviteeEmail });

      expect(response.status).toBe(401);
    });

    it("creates an invitation for a registered user", async () => {
      const response = await request(app)
        .post(`/api/projects/${projectId}/invitations`)
        .set("Authorization", `Bearer ${ownerToken}`)
        .send({ email: inviteeEmail.toUpperCase() });

      expect(response.status).toBe(201);
      expect(response.body.invitation).toMatchObject({
        projectId,
        status: "PENDING",
      });

      invitationId = response.body.invitation.id;
    });

    it("rejects a duplicate pending invitation", async () => {
      const response = await request(app)
        .post(`/api/projects/${projectId}/invitations`)
        .set("Authorization", `Bearer ${ownerToken}`)
        .send({ email: inviteeEmail });

      expect(response.status).toBe(409);
      expect(response.body.error).toBe(
        "A pending invitation already exists",
      );
    });

    it("lists pending invitations for the invited user", async () => {
      const response = await request(app)
        .get("/api/invitations")
        .set("Authorization", `Bearer ${inviteeToken}`);

      expect(response.status).toBe(200);
      expect(response.body.invitations).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            id: invitationId,
            projectId,
            projectName: "Membership Integration Project",
            status: "PENDING",
          }),
        ]),
      );
    });

    it("accepts an invitation and creates project membership", async () => {
      const response = await request(app)
        .post(`/api/invitations/${invitationId}/accept`)
        .set("Authorization", `Bearer ${inviteeToken}`);

      expect(response.status).toBe(200);
      expect(response.body.invitation).toMatchObject({
        invitationId,
        projectId,
        status: "ACCEPTED",
      });

      // Look up the invitee's actual user ID.
      const invitee = await prisma.user.findUniqueOrThrow({
        where: { email: inviteeEmail },
        select: { id: true },
      });

      // Verify that accepting the invitation created membership.
      const membership = await prisma.projectMember.findUnique({
        where: {
          projectId_userId: {
            projectId: BigInt(projectId),
            userId: invitee.id,
          },
        },
      });

      expect(membership?.role).toBe("MEMBER");
    });

    it("rejects processing an already accepted invitation again", async () => {
      const response = await request(app)
        .post(`/api/invitations/${invitationId}/accept`)
        .set("Authorization", `Bearer ${inviteeToken}`);

      expect(response.status).toBe(409);
      expect(response.body.error).toBe(
        "Invitation has already been processed",
      );
    });

    it("creates a second invitation that can be rejected", async () => {
      const response = await request(app)
        .post(`/api/projects/${projectId}/invitations`)
        .set("Authorization", `Bearer ${ownerToken}`)
        .send({ email: rejectInviteEmail });

      expect(response.status).toBe(201);
      rejectInvitationId = response.body.invitation.id;

      const rejectResponse = await request(app)
        .post(`/api/invitations/${rejectInvitationId}/reject`)
        .set("Authorization", `Bearer ${rejectInviteToken}`);

      expect(rejectResponse.status).toBe(200);
      expect(rejectResponse.body.invitation.status).toBe("REJECTED");
    });
  });

  describe("Join requests", () => {
    it("rejects join requests without authentication", async () => {
      const response = await request(app)
        .post("/api/projects/join-requests")
        .send({ projectCode });

      expect(response.status).toBe(401);
    });

    it("creates a join request using the project code", async () => {
      const response = await request(app)
        .post("/api/projects/join-requests")
        .set("Authorization", `Bearer ${requesterToken}`)
        .send({ projectCode });

      expect(response.status).toBe(201);
      expect(response.body.request).toMatchObject({
        projectId,
        projectCode,
        status: "PENDING",
      });

      joinRequestId = response.body.request.id;
    });

    it("rejects a duplicate pending join request", async () => {
      const response = await request(app)
        .post("/api/projects/join-requests")
        .set("Authorization", `Bearer ${requesterToken}`)
        .send({ projectCode });

      expect(response.status).toBe(409);
      expect(response.body.error).toBe(
        "A pending join request already exists",
      );
    });

    it("lists pending requests for the project owner", async () => {
      const response = await request(app)
        .get(`/api/projects/${projectId}/join-requests`)
        .set("Authorization", `Bearer ${ownerToken}`);

      expect(response.status).toBe(200);
      expect(response.body.requests).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            id: joinRequestId,
            projectId,
            status: "PENDING",
          }),
        ]),
      );
    });

    it("approves a join request and creates membership", async () => {
      const response = await request(app)
        .post(
          `/api/projects/${projectId}/join-requests/${joinRequestId}/approve`,
        )
        .set("Authorization", `Bearer ${ownerToken}`);

      expect(response.status).toBe(200);
      expect(response.body.request).toMatchObject({
        id: joinRequestId,
        projectId,
        status: "APPROVED",
      });

      const requester = await prisma.user.findUniqueOrThrow({
        where: { email: requesterEmail },
        select: { id: true },
      });

      const membership = await prisma.projectMember.findUnique({
        where: {
          projectId_userId: {
            projectId: BigInt(projectId),
            userId: requester.id,
          },
        },
      });

      expect(membership?.role).toBe("MEMBER");
    });

    it("rejects processing an already approved join request", async () => {
      const response = await request(app)
        .post(
          `/api/projects/${projectId}/join-requests/${joinRequestId}/approve`,
        )
        .set("Authorization", `Bearer ${ownerToken}`);

      expect(response.status).toBe(409);
      expect(response.body.error).toBe(
        "Join request has already been processed",
      );
    });

    it("rejects join-request listing for a non-member", async () => {
      const response = await request(app)
        .get(`/api/projects/${projectId}/join-requests`)
        .set("Authorization", `Bearer ${rejectRequestToken}`);

      expect(response.status).toBe(404);
      expect(response.body.error).toBe("Project not found");
    });

    it("allows the owner to reject another join request", async () => {
      const createResponse = await request(app)
        .post("/api/projects/join-requests")
        .set("Authorization", `Bearer ${rejectRequestToken}`)
        .send({ projectCode });

      expect(createResponse.status).toBe(201);
      rejectJoinRequestId = createResponse.body.request.id;

      const response = await request(app)
        .post(
          `/api/projects/${projectId}/join-requests/${rejectJoinRequestId}/reject`,
        )
        .set("Authorization", `Bearer ${ownerToken}`);

      expect(response.status).toBe(200);
      expect(response.body.request.status).toBe("REJECTED");
    });
  });
});
