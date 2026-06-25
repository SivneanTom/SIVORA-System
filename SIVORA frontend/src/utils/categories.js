// Fixed shop categories shown in the Shop page dropdown and used to
// generate dedicated category landing pages at /category/:slug
export const SHOP_CATEGORIES = [
  {
    name: 'Women',
    slug: 'women',
    image: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=1200&auto=format&fit=crop&q=80',
  },
  {
    name: 'Men',
    slug: 'men',
    image: 'https://images.unsplash.com/photo-1617127365659-c47fa864d8bc?w=1200&auto=format&fit=crop&q=80',
  },
  {
    name: 'Dresses',
    slug: 'dresses',
    image: 'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=1200&auto=format&fit=crop&q=80',
  },
  {
    name: 'Shoes',
    slug: 'shoes',
    image: 'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=1200&auto=format&fit=crop&q=80',
  },
  {
    name: 'Bags',
    slug: 'bags',
    image: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=1200&auto=format&fit=crop&q=80',
  },
  {
    name: 'Accessories',
    slug: 'accessories',
    image: 'https://images.unsplash.com/photo-1611923134239-b9be5816e23c?w=1200&auto=format&fit=crop&q=80',
  },
];

/**
 * Resolve a human-readable category name for a product, regardless of
 * whether `product.category` is a plain string (e.g. "Women") or a
 * numeric ID that maps to an entry in /api/categories.
 */
export function resolveCategoryName(product, categories = []) {
  if (!product) return '';

  const raw = product.category ?? product.category_id;

  if (raw === null || raw === undefined || raw === '') return '';

  // If it's a non-numeric string, treat it as the category name itself.
  if (isNaN(raw)) return String(raw);

  // Otherwise treat it as an ID and try to look up the matching category.
  const match = categories.find((c) => String(c.id) === String(raw));
  return match ? match.name : String(raw);
}

/**
 * True if a product belongs to the given category name (case-insensitive,
 * partial match — e.g. "Dress" matches "Dresses").
 */
export function productMatchesCategory(product, categoryName, categories = []) {
  const resolved = resolveCategoryName(product, categories).toLowerCase();
  const target = categoryName.toLowerCase();
  if (!resolved) return false;
  return resolved.includes(target) || target.includes(resolved);
}