import { ProfileError } from "./errors";
import { userRepository, User } from "../users/userRepository";
import { normalizeEmail, validateEmail } from "../validation/email";

export function changeEmail(userId: number, newEmail: string): User {
  const user = userRepository.findById(userId);
  if (!user) {
    throw new ProfileError("USER_NOT_FOUND");
  }

  const email = normalizeEmail(newEmail);

  const emailErrors = validateEmail(email);
  if (emailErrors.length) {
    throw new ProfileError("INVALID_INPUT", { email: emailErrors });
  }

  if (email === user.email) {
    return user;
  }

  if (userRepository.findByEmail(email)) {
    throw new ProfileError("EMAIL_TAKEN");
  }

  const updated = userRepository.updateEmail(userId, email);
  if (!updated) {
    throw new ProfileError("USER_NOT_FOUND");
  }

  return updated;
}
