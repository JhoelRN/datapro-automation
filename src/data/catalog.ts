import productsRaw from '../../data/products.json';

export type ProductCategory = 'vm' | 'software' | 'curso' | 'servicio';

export interface Product {
  id: string;
  category: ProductCategory;
  brand: string;
  title: string;
  price: number | null;
  currency: 'USD' | 'PEN';
  image: string;
  images: string[];
  short: string;
  specs: string[];
  tags: string[];
  badge?: string;
}

const fixes = [
  ['Ã¡', 'á'],
  ['Ã©', 'é'],
  ['Ã­', 'í'],
  ['Ã³', 'ó'],
  ['Ãº', 'ú'],
  ['Ã', 'Á'],
  ['Ã‰', 'É'],
  ['Ã', 'Í'],
  ['Ã“', 'Ó'],
  ['Ãš', 'Ú'],
  ['Ã±', 'ñ'],
  ['Ã‘', 'Ñ'],
  ['â€”', '—'],
  ['â€“', '–'],
  ['â€¹', '‹'],
  ['â€º', '›'],
  ['Â·', '·'],
  ['Â¡', '¡'],
  ['Â¿', '¿'],
  ['Ã¼', 'ü'],
  ['Ãœ', 'Ü']
] as const;

function fixText(value: unknown): string {
  let output = String(value ?? '').trim();
  for (const [broken, fixed] of fixes) {
    output = output.split(broken).join(fixed);
  }
  return output;
}

function normalizeArray(values: unknown): string[] {
  if (!Array.isArray(values)) return [];
  return values.map((item) => fixText(item)).filter(Boolean);
}

const rawBaseUrl = import.meta.env.BASE_URL;
const baseUrl = rawBaseUrl.endsWith('/') ? rawBaseUrl : `${rawBaseUrl}/`;

function toPublicPath(path: string): string {
  if (!path) return `${baseUrl}assets/img/placeholder.jpg`;
  const cleanPath = path.startsWith('/') ? path.slice(1) : path;
  return `${baseUrl}${cleanPath}`;
}

export const categoryLabels: Record<ProductCategory, string> = {
  vm: 'Máquinas virtuales',
  software: 'Software',
  curso: 'Cursos',
  servicio: 'Servicios'
};

export const categoryDescriptions: Record<ProductCategory, string> = {
  vm: 'Entornos listos para practicar, enseñar o acelerar implementaciones.',
  software: 'Instaladores, herramientas y recursos digitales organizados por tecnología.',
  curso: 'Contenido formativo para fortalecer capacidades técnicas de tu comunidad.',
  servicio: 'Soporte y acompañamiento para instalación, implementación y puesta en marcha.'
};

export const products: Product[] = (productsRaw as Record<string, unknown>[]).map((item) => ({
  id: fixText(item.id),
  category: (item.category as ProductCategory) || 'software',
  brand: fixText(item.brand),
  title: fixText(item.title),
  price: typeof item.price === 'number' ? item.price : null,
  currency: item.currency === 'PEN' ? 'PEN' : 'USD',
  image: toPublicPath(fixText(item.image)),
  images: normalizeArray(item.images).map(toPublicPath),
  short: fixText(item.short),
  specs: normalizeArray(item.specs),
  tags: normalizeArray(item.tags),
  badge: item.badge ? fixText(item.badge) : undefined
})).map((product) => ({
  ...product,
  images: product.images.length ? product.images : [product.image]
}));

export const categories = (Object.keys(categoryLabels) as ProductCategory[]).map((slug) => {
  const items = products.filter((product) => product.category === slug);
  return {
    slug,
    label: categoryLabels[slug],
    description: categoryDescriptions[slug],
    count: items.length,
    image: items[0]?.image ?? `${baseUrl}assets/img/placeholder.jpg`
  };
});

export function formatPrice(price: number | null, currency: 'USD' | 'PEN' = 'USD') {
  if (price == null) return 'Consultar';
  if (price === 0) return 'Gratis';
  const amount = Number(price).toLocaleString('es-PE');
  return currency === 'USD' ? `USD ${amount}` : `S/ ${amount}`;
}

export function badgeLabel(badge?: string) {
  const value = String(badge || '').toLowerCase();
  if (value === 'sale' || value === 'oferta') return 'Oferta';
  if (value === 'hot' || value === 'destacado') return 'Destacado';
  if (value === 'new' || value === 'nuevo') return 'Nuevo';
  return '';
}

export function getFeaturedProducts(limit = 6) {
  return [...products]
    .sort((a, b) => Number(Boolean(b.badge)) - Number(Boolean(a.badge)))
    .slice(0, limit);
}

export function getProductsByCategory(category: ProductCategory) {
  return products.filter((product) => product.category === category);
}

export function getRelatedProducts(current: Product, limit = 3) {
  return products
    .filter((product) => product.id !== current.id && product.category === current.category)
    .slice(0, limit);
}

export function slugify(value: string) {
  return fixText(value)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function getProductUrl(product: Product) {
  return `${baseUrl}productos/${slugify(product.id)}/`;
}
