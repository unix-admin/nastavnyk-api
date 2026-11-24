import { FieldErrors, REGISTRATION_MESSAGES } from "../registration/errors";

export type ProfileErrorCode = "INVALID_INPUT" | "EMAIL_TAKEN" | "USER_NOT_FOUND";

export const PROFILE_MESSAGES: Record<ProfileErrorCode, string> = {
  INVALID_INPUT: REGISTRATION_MESSAGES.INVALID_INPUT,
  EMAIL_TAKEN: REGISTRATION_MESSAGES.EMAIL_TAKEN,
  USER_NOT_FOUND: "User not found",
};

export class ProfileError extends Error {
  constructor(
    public readonly code: ProfileErrorCode,
    public readonly fields: FieldErrors = {},
  ) {
    super(PROFILE_MESSAGES[code]);
    this.name = "ProfileError";
  }
}
