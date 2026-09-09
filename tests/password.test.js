import { describe, it, expect } from "vitest";
import { validatePassword, hashResetToken, generateResetToken } from "@/lib/auth/password";

describe("password", () => {
  it("validates password policy", () => {
    expect(validatePassword("short").valid).toBe(false);
    expect(validatePassword("ValidPass1").valid).toBe(true);
  });

  it("hashes reset tokens consistently", () => {
    const { token, hash } = generateResetToken();
    expect(hashResetToken(token)).toBe(hash);
  });
});
