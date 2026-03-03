import type { ToolCategory } from '@/types/diagram';

export const CATEGORY_COLORS: Record<ToolCategory, { border: string; bg: string; text: string }> = {
  database: { border: 'border-[var(--category-database)]', bg: 'bg-[var(--category-database)]/10', text: 'text-[var(--category-database)]' },
  payments: { border: 'border-[var(--category-payments)]', bg: 'bg-[var(--category-payments)]/10', text: 'text-[var(--category-payments)]' },
  crm: { border: 'border-[var(--category-crm)]', bg: 'bg-[var(--category-crm)]/10', text: 'text-[var(--category-crm)]' },
  communication: { border: 'border-[var(--category-communication)]', bg: 'bg-[var(--category-communication)]/10', text: 'text-[var(--category-communication)]' },
  analytics: { border: 'border-[var(--category-analytics)]', bg: 'bg-[var(--category-analytics)]/10', text: 'text-[var(--category-analytics)]' },
  storage: { border: 'border-[var(--category-storage)]', bg: 'bg-[var(--category-storage)]/10', text: 'text-[var(--category-storage)]' },
  api: { border: 'border-[var(--category-api)]', bg: 'bg-[var(--category-api)]/10', text: 'text-[var(--category-api)]' },
};

export function getCategoryColor(category?: ToolCategory) {
  if (!category) return { border: 'border-neutral-300', bg: 'bg-white', text: 'text-neutral-700' };
  return CATEGORY_COLORS[category];
}
