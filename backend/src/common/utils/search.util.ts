/**
 * Loại bỏ dấu tiếng Việt và các ký tự đặc biệt
 */
export function removeVietnameseAccents(str: string): string {
  if (!str) return '';

  return str
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D');
}

/**
 * Chuẩn hóa chuỗi search (lowercase, trim, remove accents)
 */
export function normalizeSearchString(str: string): string {
  if (!str) return '';

  return removeVietnameseAccents(str.toLowerCase().trim());
}

/**
 * Build query search cho Prisma với nhiều fields
 */
export function buildPrismaSearchQuery(
  search: string,
  fields: string[],
):
  | { OR: Array<Record<string, { contains: string; mode: 'insensitive' }>> }
  | Record<string, never> {
  if (!search || !search.trim()) return {};

  const searchLower = search.toLowerCase().trim();

  const orConditions = fields.map((field) => ({
    [field]: { contains: searchLower, mode: 'insensitive' as const },
  }));

  return { OR: orConditions };
}

/**
 * Filter items ở application level (xử lý dấu tiếng Việt)
 */
export function filterBySearchTerm<T extends Record<string, any>>(
  items: T[],
  searchTerm: string,
  fields: (keyof T)[],
): T[] {
  if (!searchTerm || !searchTerm.trim()) return items;

  const normalizedSearch = normalizeSearchString(searchTerm);

  return items.filter((item) => {
    return fields.some((field) => {
      const fieldValue = item[field];
      if (!fieldValue) return false;

      const normalizedValue = normalizeSearchString(String(fieldValue));
      return normalizedValue.includes(normalizedSearch);
    });
  });
}
