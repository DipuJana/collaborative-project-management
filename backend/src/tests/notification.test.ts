
import { afterAll, describe, expect, it } from "vitest";
import request from "supertest";
import app from "../app.js";

const BASE_URL = "/api";

type TestUser = {
  name: string;
  email: string;
  password: string;
  token: string;
};

type TestProject = {
  id: string;
  code: string;
};

let sequence = 0;

function uniqueValue(prefix: string) {
  sequence += 1;
  return `${prefix}_${Date.now()}_${sequence}`;
}

function getToken(body: any): string {
  const token = body.token ?? body.data?.token;

  if (typeof token !== "string") {
    throw new Error(`Could not find JWT token in response: ${JSON.stringify(body)}`);
  }

  return token;
}

function getEntityId(body: any, ...keys: string[]): string {
  for (const key of keys) {
    const value = body[key]?.id;

    if (value !== undefined && value !== null) {
      return String(value);
    }
  }

  if (body.id !== undefined && body.id !== null) {
    return String(body.id);
  }

  throw new Error(`Could not find entity ID in response: ${JSON.stringify(body)}`);
}

async function registerUser(): Promise<TestUser> {
  const suffix = uniqueValue("notification_user");

  const user = {
    name: suffix,
    email: `${suffix}@example.com`,
    password: "TestPassword123!",
  };

  const registration = await request(app)
    .post(`${BASE_URL}/auth/register`)
    .send(user);

  expect(registration.status).toBe(201);

  const login = await request(app)
    .post(`${BASE_URL}/auth/login`)
    .send({
      email: user.email,
      password: user.password,
    });

  expect(login.status).toBe(200);

  return {
    ...user,
    token: getToken(login.body),
  };
}

async function createProject(owner: TestUser): Promise<TestProject> {
  const suffix = uniqueValue("notification_project");

  const response = await request(app)
    .post(`${BASE_URL}/projects`)
    .set("Authorization", `Bearer ${owner.token}`)
    .send({
      name: suffix,
      code: suffix,
      description: "Project created by notification integration tests",
    });

  expect(response.status).toBe(201);

  return {
    id: getEntityId(response.body, "project", "data"),
    code: response.body.project?.code ?? response.body.code ?? suffix,
  };
}

async function inviteUser(
  owner: TestUser,
  projectId: string,
  invitedUser: TestUser
): Promise<string> {
  const response = await request(app)
    .post(`${BASE_URL}/projects/${projectId}/invitations`)
    .set("Authorization", `Bearer ${owner.token}`)
    .send({
      email: invitedUser.email,
    });

  expect(response.status).toBe(201);

  return getEntityId(response.body, "invitation", "data");
}

async function createJoinRequest(
  user: TestUser,
  projectCode: string
): Promise<string> {
  const response = await request(app)
    .post(`${BASE_URL}/projects/join-requests`)
    .set("Authorization", `Bearer ${user.token}`)
    .send({
      projectCode,
    });

  expect(response.status).toBe(201);

  return getEntityId(response.body, "request", "joinRequest", "data");
}

async function getNotifications(token: string, query = "") {
  return request(app)
    .get(`${BASE_URL}/notifications${query}`)
    .set("Authorization", `Bearer ${token}`);
}

async function getNotificationByType(
  token: string,
  type: string
) {
  const response = await getNotifications(token);

  expect(response.status).toBe(200);

  const notification = response.body.notifications.find(
    (item: { type: string }) => item.type === type
  );

  expect(notification).toBeDefined();

  return notification;
}

describe("Notification API integration tests", () => {
  afterAll(() => {
    // Do not disconnect the shared Prisma client here.
    // Other test suites may use the same client.
  });

  describe("Authentication and access control", () => {
    it("rejects requests without authentication", async () => {
      const response = await request(app)
        .get(`${BASE_URL}/notifications`);

      expect(response.status).toBe(401);
    });

    it("does not expose another user's notifications", async () => {
      const owner = await registerUser();
      const invitedUser = await registerUser();
      const unrelatedUser = await registerUser();

      const project = await createProject(owner);
      await inviteUser(owner, project.id, invitedUser);

      const invitedUserNotifications = await getNotifications(
        invitedUser.token
      );

      expect(invitedUserNotifications.status).toBe(200);

      const notification =
        invitedUserNotifications.body.notifications.find(
          (item: { type: string }) =>
            item.type === "PROJECT_INVITATION"
        );

      expect(notification).toBeDefined();

      const unrelatedUserNotifications = await getNotifications(
        unrelatedUser.token
      );

      expect(unrelatedUserNotifications.status).toBe(200);
      expect(
        unrelatedUserNotifications.body.notifications.some(
          (item: { id: string }) => item.id === notification.id
        )
      ).toBe(false);

      const markAnotherUsersNotification = await request(app)
        .patch(
          `${BASE_URL}/notifications/${notification.id}/read`
        )
        .set("Authorization", `Bearer ${unrelatedUser.token}`);

      expect(markAnotherUsersNotification.status).toBe(404);
    });
  });

  describe("Listing and filtering", () => {
    it("supports pagination and unread filtering", async () => {
      const owner = await registerUser();
      const invitedUser = await registerUser();

      const projectOne = await createProject(owner);
      const projectTwo = await createProject(owner);

      await inviteUser(owner, projectOne.id, invitedUser);
      await inviteUser(owner, projectTwo.id, invitedUser);

      const allNotifications = await getNotifications(
        invitedUser.token,
        "?page=1&limit=1"
      );

      expect(allNotifications.status).toBe(200);
      expect(allNotifications.body.notifications).toHaveLength(1);
      expect(allNotifications.body.pagination).toMatchObject({
        page: 1,
        limit: 1,
        total: 2,
        totalPages: 2,
      });

      const unreadNotifications = await getNotifications(
        invitedUser.token,
        "?unreadOnly=true"
      );

      expect(unreadNotifications.status).toBe(200);
      expect(
        unreadNotifications.body.notifications.length
      ).toBe(2);

      expect(
        unreadNotifications.body.notifications.every(
          (item: { isRead: boolean }) => item.isRead === false
        )
      ).toBe(true);
    });

    it("returns the correct unread notification count", async () => {
      const owner = await registerUser();
      const invitedUser = await registerUser();

      const project = await createProject(owner);
      await inviteUser(owner, project.id, invitedUser);

      const response = await request(app)
        .get(`${BASE_URL}/notifications/unread-count`)
        .set("Authorization", `Bearer ${invitedUser.token}`);

      expect(response.status).toBe(200);
      expect(response.body.unreadCount).toBe(1);
    });
  });

  describe("Read operations", () => {
    it("marks one notification as read", async () => {
      const owner = await registerUser();
      const invitedUser = await registerUser();

      const project = await createProject(owner);
      await inviteUser(owner, project.id, invitedUser);

      const notification = await getNotificationByType(
        invitedUser.token,
        "PROJECT_INVITATION"
      );

      const response = await request(app)
        .patch(
          `${BASE_URL}/notifications/${notification.id}/read`
        )
        .set("Authorization", `Bearer ${invitedUser.token}`);

      expect(response.status).toBe(200);
      expect(response.body.notification.isRead).toBe(true);

      const unread = await getNotifications(
        invitedUser.token,
        "?unreadOnly=true"
      );

      expect(unread.body.notifications).toHaveLength(0);

      const count = await request(app)
        .get(`${BASE_URL}/notifications/unread-count`)
        .set("Authorization", `Bearer ${invitedUser.token}`);

      expect(count.status).toBe(200);
      expect(count.body.unreadCount).toBe(0);
    });

    it("marks all of the user's notifications as read", async () => {
      const owner = await registerUser();
      const invitedUser = await registerUser();

      const projectOne = await createProject(owner);
      const projectTwo = await createProject(owner);

      await inviteUser(owner, projectOne.id, invitedUser);
      await inviteUser(owner, projectTwo.id, invitedUser);

      const response = await request(app)
        .patch(`${BASE_URL}/notifications/read-all`)
        .set("Authorization", `Bearer ${invitedUser.token}`);

      expect(response.status).toBe(200);
      expect(response.body.updatedCount).toBe(2);

      const unread = await getNotifications(
        invitedUser.token,
        "?unreadOnly=true"
      );

      expect(unread.status).toBe(200);
      expect(unread.body.notifications).toHaveLength(0);
    });

    it("rejects an invalid notification ID", async () => {
      const user = await registerUser();

      const response = await request(app)
        .patch(`${BASE_URL}/notifications/invalid/read`)
        .set("Authorization", `Bearer ${user.token}`);

      expect(response.status).toBe(400);
    });
  });

  describe("Invitation notification events", () => {
    it("creates a notification when an invitation is sent and accepted", async () => {
      const owner = await registerUser();
      const invitedUser = await registerUser();

      const project = await createProject(owner);
      const invitationId = await inviteUser(
        owner,
        project.id,
        invitedUser
      );

      const invitationNotification = await getNotificationByType(
        invitedUser.token,
        "PROJECT_INVITATION"
      );

      expect(invitationNotification.isRead).toBe(false);
      expect(invitationNotification.relatedProjectId).toBe(project.id);
      expect(invitationNotification.relatedEntityId).toBe(invitationId);

      const accept = await request(app)
        .post(
          `${BASE_URL}/invitations/${invitationId}/accept`
        )
        .set("Authorization", `Bearer ${invitedUser.token}`);

      expect(accept.status).toBe(200);

      const acceptedNotification = await getNotificationByType(
        owner.token,
        "INVITATION_ACCEPTED"
      );

      expect(acceptedNotification.relatedProjectId).toBe(project.id);
      expect(acceptedNotification.relatedEntityId).toBe(invitationId);
    });

    it("notifies the inviter when an invitation is rejected", async () => {
      const owner = await registerUser();
      const invitedUser = await registerUser();

      const project = await createProject(owner);
      const invitationId = await inviteUser(
        owner,
        project.id,
        invitedUser
      );

      const reject = await request(app)
        .post(
          `${BASE_URL}/invitations/${invitationId}/reject`
        )
        .set("Authorization", `Bearer ${invitedUser.token}`);

      expect(reject.status).toBe(200);

      const notification = await getNotificationByType(
        owner.token,
        "INVITATION_REJECTED"
      );

      expect(notification.relatedEntityId).toBe(invitationId);
      expect(notification.relatedProjectId).toBe(project.id);
    });
  });

  describe("Join request notification events", () => {
    it("notifies the project owner when a join request is submitted", async () => {
      const owner = await registerUser();
      const requester = await registerUser();

      const project = await createProject(owner);
      const requestId = await createJoinRequest(
        requester,
        project.code
      );

      const notification = await getNotificationByType(
        owner.token,
        "JOIN_REQUEST_CREATED"
      );

      expect(notification.isRead).toBe(false);
      expect(notification.relatedProjectId).toBe(project.id);
      expect(notification.relatedEntityId).toBe(requestId);
    });

    it("notifies the requester when a join request is approved", async () => {
      const owner = await registerUser();
      const requester = await registerUser();

      const project = await createProject(owner);
      const requestId = await createJoinRequest(
        requester,
        project.code
      );

      const approve = await request(app)
        .post(
          `${BASE_URL}/projects/${project.id}/join-requests/${requestId}/approve`
        )
        .set("Authorization", `Bearer ${owner.token}`);

      expect(approve.status).toBe(200);

      const notification = await getNotificationByType(
        requester.token,
        "JOIN_REQUEST_APPROVED"
      );

      expect(notification.relatedEntityId).toBe(requestId);
      expect(notification.relatedProjectId).toBe(project.id);
    });

    it("notifies the requester when a join request is rejected", async () => {
      const owner = await registerUser();
      const requester = await registerUser();

      const project = await createProject(owner);
      const requestId = await createJoinRequest(
        requester,
        project.code
      );

      const reject = await request(app)
        .post(
          `${BASE_URL}/projects/${project.id}/join-requests/${requestId}/reject`
        )
        .set("Authorization", `Bearer ${owner.token}`);

      expect(reject.status).toBe(200);

      const notification = await getNotificationByType(
        requester.token,
        "JOIN_REQUEST_REJECTED"
      );

      expect(notification.relatedEntityId).toBe(requestId);
      expect(notification.relatedProjectId).toBe(project.id);
    });
  });
});
