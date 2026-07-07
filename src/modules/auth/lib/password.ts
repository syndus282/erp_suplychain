import bcrypt from "bcryptjs";

const SALT_ROUNDS = 10;

export function hashPassword(plain: string): Promise<string> {
  return bcrypt.hash(plain, SALT_ROUNDS);
}

export function verifyPassword(plain: string, hash: string): Promise<boolean> {
  return bcrypt.compare(plain, hash);
}

/** Theo docs/nfr.md mục 3: tối thiểu 8 ký tự, bắt buộc chữ hoa/thường/số. */
export function isPasswordStrongEnough(plain: string): boolean {
  return (
    plain.length >= 8 &&
    /[a-z]/.test(plain) &&
    /[A-Z]/.test(plain) &&
    /[0-9]/.test(plain)
  );
}
