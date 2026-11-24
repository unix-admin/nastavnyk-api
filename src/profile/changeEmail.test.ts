import { changeEmail } from "./changeEmail";
import { ProfileError } from "./errors";
import { registerUser } from "../registration/registerUser";
import { userRepository } from "../users/userRepository";

const JOHN_ID = 1;

function captureError(action: () => unknown): ProfileError {
  try {
    action();
  } catch (error) {
    if (error instanceof ProfileError) {
      return error;
    }
    throw error;
  }
  throw new Error("Expected ProfileError to be thrown");
}

beforeEach(() => {
  userRepository.reset();
  jest.restoreAllMocks();
});

describe("changeEmail", () => {
  it("saves a new free email in normalized form", () => {
    const user = changeEmail(JOHN_ID, "  John.New@Example.COM ");

    expect(user).toMatchObject({ id: JOHN_ID, email: "john.new@example.com" });
    expect(userRepository.findByEmail("john.new@example.com")?.id).toBe(JOHN_ID);
    expect(userRepository.findByEmail("john@example.com")).toBeUndefined();
  });

  it.each(["not-an-email", "john@example", "john @example.com", ""])(
    "rejects invalid email %p and keeps the current one",
    (invalidEmail) => {
      const error = captureError(() => changeEmail(JOHN_ID, invalidEmail));

      expect(error.code).toBe("INVALID_INPUT");
      expect(error.message).toBe("Please check the highlighted fields");
      expect(error.fields).toEqual({ email: ["must be a valid email"] });
      expect(userRepository.findById(JOHN_ID)?.email).toBe("john@example.com");
    },
  );

  it.each(["not-an-email", "a@b.co", "  Mixed.Case@Example.org  ", "john @example.com"])(
    "accepts %p only if registration accepts it",
    (email) => {
      const acceptedByRegistration = (() => {
        try {
          registerUser({ email, username: "probe", password: "s3cret-pass" });
          return true;
        } catch {
          return false;
        }
      })();
      userRepository.reset();

      const acceptedByChange = (() => {
        try {
          changeEmail(JOHN_ID, email);
          return true;
        } catch {
          return false;
        }
      })();

      expect(acceptedByChange).toBe(acceptedByRegistration);
    },
  );

  it("rejects an email that belongs to another user, ignoring case and spaces", () => {
    const error = captureError(() => changeEmail(JOHN_ID, " Olena@Example.com "));

    expect(error.code).toBe("EMAIL_TAKEN");
    expect(error.message).toBe("Email already registered");
    expect(userRepository.findById(JOHN_ID)?.email).toBe("john@example.com");
    expect(userRepository.findByEmail("olena@example.com")?.id).toBe(2);
  });

  it("does nothing when the new email matches the current one after normalization", () => {
    const updateEmail = jest.spyOn(userRepository, "updateEmail");

    const user = changeEmail(JOHN_ID, "  JOHN@example.com ");

    expect(user).toMatchObject({ id: JOHN_ID, email: "john@example.com" });
    expect(updateEmail).not.toHaveBeenCalled();
  });

  it("rejects a change for a user that does not exist", () => {
    const error = captureError(() => changeEmail(999, "someone@example.com"));

    expect(error.code).toBe("USER_NOT_FOUND");
    expect(userRepository.findByEmail("someone@example.com")).toBeUndefined();
  });
});
