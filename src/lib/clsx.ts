// Tiện ích nối class name có điều kiện, tối giản — tránh thêm dependency ngoài
// chỉ để dùng 1 hàm nhỏ như thế này.
export type ClassValue = string | number | null | undefined | false | ClassValue[];

export function clsx(...args: ClassValue[]): string {
  const out: string[] = [];
  for (const arg of args) {
    if (!arg) continue;
    if (Array.isArray(arg)) {
      const nested = clsx(...arg);
      if (nested) out.push(nested);
    } else {
      out.push(String(arg));
    }
  }
  return out.join(" ");
}
