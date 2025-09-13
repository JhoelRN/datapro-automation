/* assets/js/product.js */

const $ = (s, c = document) => c.querySelector(s);
const WA_NUMBER = '51980790737'; // +51 980 790 737

// DEMO por si falla fetch en file:// o no hay datos
const DEMO_PRODUCTS = [
  {
    id: "vm-siemens-tia-v17",
    category: "vm",
    brand: "Siemens",
    title: "VM Siemens TIA Portal V17",
    price: 89,
    currency: "USD",
    image: "assets/img/vms/siemens-tia-v17.jpg",
    short: "Imagen lista con TIA Portal V17 + PLCSIM + WinCC RT Advanced para prácticas de PLC y HMI.",
    specs: [
      "Plataforma: VMware",
      "Tamaño aprox: 85 GB",
      "RAM recomendada: 16 GB",
      "+ Incluye ejemplos de proyectos"
    ],
    tags: ["siemens", "tia", "plc", "wincc", "hmi"]
  }
];

async function loadProducts() {
  try {
    const r = await fetch('./data/products.json', { cache: 'no-store' });
    if (!r.ok) throw new Error('HTTP ' + r.status);
    return await r.json();
  } catch (e) {
    console.warn('No se pudo leer data/products.json (probable file://). Usando DEMO.', e);
    return DEMO_PRODUCTS;
  }
}

function labelCat(c) {
  return ({ vm: 'Máquina Virtual', software: 'Software', curso: 'Curso', servicio: 'Servicio' })[c] || 'Producto';
}

// Escapar texto por seguridad (evita HTML inesperado)
const esc = s => String(s ?? '').replace(/[&<>"']/g, m => ({
  '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;'
}[m]));

// Lista de características en estilo pro (icono + color por tipo)
function renderSpecs(list) {
  if (!Array.isArray(list) || !list.length) return '';

  const items = list.map(raw => {
    let s = String(raw || '').trim();
    let cls = '';

    // Reglas simples:
    // + prefijo => extra/gratis (verde)
    if (s.startsWith('+')) { cls = 'is-free'; s = s.replace(/^\+\s*/, ''); }
    // palabras clave => nota/requisito (ámbar)
    else if (/(recomendad|minim|requisit|nota)/i.test(s)) { cls = 'is-note'; }
    // advertencias (rojo)
    else if (/(advert|cuidado|no compatible)/i.test(s)) { cls = 'is-warn'; }

    return `<li class="${cls}"><span class="ico"></span><span class="txt">${esc(s)}</span></li>`;
  }).join('');

  return `<ul class="specs-list">${items}</ul>`;
}

function renderTags(tags) {
  if (!tags?.length) return '';
  return tags.map(t => `<span class="badge">${esc(t)}</span>`).join(' ');
}

function price(n, cur) {
  if (n == null) return '—';
  return cur === 'USD'
    ? `$ ${Number(n).toLocaleString('es-PE')}`
    : `S/ ${Number(n).toLocaleString('es-PE')}`;
}

(async function () {
  const host = $('#product');
  const params = new URLSearchParams(location.search);
  let id = params.get('id');

  const products = await loadProducts();
  let p = products.find(x => String(x.id) === String(id));

  // Si no hay id o no lo encuentra, toma el primero para que siempre veas algo.
  if (!p) { p = products[0]; }

  document.title = `${p.title} — DTP Automation`;

  const badgeHTML = p.badge
    ? `<span class="badge-flag ${badgeClass(p.badge)}">${badgeText(p.badge)}</span>`
    : '';

  // Render
  host.innerHTML = `
    <div class="media">
      <img src="${esc(p.image || 'assets/img/placeholder.jpg')}" alt="${esc(p.title)}"
           onerror="this.src='assets/img/placeholder.jpg'"/>
      ${badgeHTML}
    </div>
    <div class="meta">
      <h1>${esc(p.title)}</h1>
      <div class="muted">${esc(labelCat(p.category))}${p.brand ? ' · ' + esc(p.brand) : ''}</div>
      <div class="price">${price(p.price, p.currency || 'PEN')}</div>

      <p>${esc(p.short || 'Descripción breve del producto (edítame con tu texto real: qué incluye, a quién va dirigido, requisitos, etc.).')}</p>
      ${renderSpecs(p.specs)}
      <div style="margin-top:12px">${renderTags(p.tags)}</div>
    </div>
  `;

  function badgeClass(b) {
    const k = String(b || '').toLowerCase();
    if (k === 'new' || k === 'nuevo') return 'is-new';
    if (k === 'sale' || k === 'oferta') return 'is-sale';
    if (k === 'hot' || k === 'destacado') return 'is-hot';
    return 'is-new';
  }
  function badgeText(b) {
    const k = String(b || '').toLowerCase();
    if (k === 'new' || k === 'nuevo') return 'NUEVO';
    if (k === 'sale' || k === 'oferta') return 'OFERTA';
    if (k === 'hot' || k === 'destacado') return 'DESTACADO';
    return 'NUEVO';
  }

  // Mensaje y enlace de WhatsApp (CTA fuera del bloque .meta)
  const msg = `Hola DTP Automation, necesito más información de la "${p.title}" y apoyo en el procedimiento.`;
  const cta = document.getElementById('product-cta');
  if (cta) {
    cta.hidden = false;
    const a = cta.querySelector('#waCta');
    if (a) a.href = `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(msg)}`;
  }
})();
