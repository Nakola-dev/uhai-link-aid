import { describe, expect, it } from "vitest";
import { redactPath } from "./web-vitals";

describe("redactPath", () => {
  it("removes emergency access tokens from responder URLs", () => {
    expect(redactPath("/profile/Xk3v9QpL2mN8rT5wY1zA0b")).toBe("/profile/:token");
    expect(redactPath("/profile/abc/extra")).toBe("/profile/:token/extra");
  });

  it("leaves other paths unchanged", () => {
    expect(redactPath("/")).toBe("/");
    expect(redactPath("/dashboard/profile")).toBe("/dashboard/profile");
    expect(redactPath("/learn")).toBe("/learn");
  });
});
