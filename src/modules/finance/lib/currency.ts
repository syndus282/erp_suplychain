/**
 * Quy đổi tiền tệ theo đúng công thức đã chốt ở docs/currency-handling.md
 * mục "Công thức quy đổi": `amountVND = round(amountForeignSmallestUnit /
 * 10^decimalDigits(currency) * exchangeRate)`. VND có 0 số lẻ, các ngoại tệ
 * phổ biến khác mặc định 2 số lẻ (đủ dùng trong phạm vi ERP này).
 */
export function decimalDigits(currency: string): number {
  return currency === "VND" ? 0 : 2;
}

export function convertToVnd(amountSmallestUnit: number, currency: string, exchangeRate: number): number {
  return Math.round((amountSmallestUnit / 10 ** decimalDigits(currency)) * exchangeRate);
}
