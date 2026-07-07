/**
 * Sinh mã chứng từ đơn giản, đảm bảo duy nhất mà không cần đếm số thứ tự
 * (tránh race condition khi nhiều request tạo cùng lúc). Đánh số tuần tự đẹp
 * (PR-2026-0001) có thể làm sau khi cần báo cáo/đối chiếu theo số thứ tự thật.
 */
export function generateCode(prefix: string): string {
  const time = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `${prefix}-${time}${random}`;
}
