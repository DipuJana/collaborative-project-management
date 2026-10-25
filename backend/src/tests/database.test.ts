import { describe, expect, it } from "vitest";

describe("Test database configuration", () => {
  it("should use the dedicated test database", () => {
    const databaseUrl = process.env.DATABASE_URL;

    expect(databaseUrl).toBeDefined();

    const parsedUrl = new URL(databaseUrl!);

    expect(parsedUrl.pathname).toBe("/project_management_test");
  });
});