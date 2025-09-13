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
      "Incluye ejemplos de proyectos"
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

function labelCat(c) { return ({ vm: 'Máquina Virtual', software: 'Software', curso: 'Curso', servicio: 'Servicio' })[c] || 'Producto'; }
function renderSpecs(list) {
  if (!Array.isArray(list) || !list.length) {
    return `<ul class="specs">
      <li>Característica 1 (edítame)</li>
      <li>Característica 2 (edítame)</li>
      <li>Característica 3 (edítame)</li>
    </ul>`;
  }
  return `<ul class="specs">${list.map(x => `<li>${x}</li>`).join('')}</ul>`;
}
function renderTags(tags) { if (!tags?.length) return ''; return tags.map(t => `<span class="badge">${t}</span>`).join(' '); }
function price(n, cur) { if (n == null) return '—'; return cur === 'USD' ? `$ ${Number(n).toLocaleString('es-PE')}` : `S/ ${Number(n).toLocaleString('es-PE')}`; }

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
      <img src="${p.image || 'assets/img/placeholder.jpg'}" alt="${p.title}"
           onerror="this.src='assets/img/placeholder.jpg'"/>
      ${badgeHTML}  <!-- ★ -->
    </div>
    <div class="meta">
      <h1>${p.title}</h1>
      <div class="muted">${labelCat(p.category)}${p.brand ? ' · ' + p.brand : ''}</div>
      <p class="price" style="font-size:1.4rem;margin:.4rem 0 1rem">${price(p.price, p.currency || 'PEN')}</p>
      <p>${p.short || 'Descripción breve del producto (edítame con tu texto real: qué incluye, a quién va dirigido, requisitos, etc.).'}</p>
      ${renderSpecs(p.specs)}
      <div style="margin-top:12px">${renderTags(p.tags)}</div>
      <a class="btn full" id="waBtn" target="_blank" rel="noopener">Comprar por WhatsApp</a>
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

  // Botón de WhatsApp con mensaje prellenado
  const msg = `Hola DTP Automation, necesito más información de la "${p.title}" y apoyo en el procedimiento.`;
  $('#waBtn').href = `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(msg)}`;
})();

