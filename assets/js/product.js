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
    "images": [
      "assets/img/vms/siemens-tia-v17.jpg",
      "assets/img/vms/siemens-tia-v17-2.jpg",
      "assets/img/vms/siemens-tia-v17-3.jpg"
    ],
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

// Lista de características con icono + color por tipo
function renderSpecs(list) {
  if (!Array.isArray(list) || !list.length) return '';

  const items = list.map(raw => {
    let s = String(raw || '').trim();
    let cls = '';

    if (s.startsWith('+')) { cls = 'is-free'; s = s.replace(/^\+\s*/, ''); }            // extra/gratis (verde)
    else if (/(recomendad|minim|requisit|nota)/i.test(s)) { cls = 'is-note'; }         // nota/requisito (ámbar)
    else if (/(advert|cuidado|no compatible)/i.test(s)) { cls = 'is-warn'; }           // advertencia (rojo)

    return `<li class="${cls}"><span class="ico"></span><span class="txt">${esc(s)}</span></li>`;
  }).join('');

  return `<ul class="specs-list">${items}</ul>`;
}





// Usa tu archivo SVG como imagen (computadora en tags)
const TAG_ICON_HTML = `
  <img src="assets/img/ui/computadora.svg?v=1" class="tags-ico-img" alt="" aria-hidden="true">
`;

function renderTags(tags) {
  if (!tags?.length) return '';
  return `
    <div class="tags-row">
      <span class="tags-ico">${TAG_ICON_HTML}</span>
      ${tags.map(t => `<span class="badge">#${esc(t)}</span>`).join(' ')}
    </div>
  `;
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
  if (!p) p = products[0];

  document.title = `${p.title} — DTP Automation`;

  const badgeHTML = p.badge
    ? `<span class="badge-flag ${badgeClass(p.badge)}">${badgeText(p.badge)}</span>`
    : '';

  // Galería: usa p.images si existe; si no, la imagen única
  const images = (Array.isArray(p.images) ? p.images : []).filter(Boolean);
  if (!images.length) images.push(p.image);

  // Render: UNA sola vista + flechas + contador
  host.innerHTML = `
    <div class="media" data-gallery>
      <div class="media-main">
        <img id="mainImg" src="${esc(images[0] || 'assets/img/placeholder.jpg')}"
             alt="${esc(p.title)}"
             onerror="this.src='assets/img/placeholder.jpg'"/>
        ${badgeHTML}
        ${images.length > 1 ? `
          <button class="nav prev" aria-label="Anterior">‹</button>
          <button class="nav next" aria-label="Siguiente">›</button>
          <div class="pager"><span id="pgCur">1</span>/<span id="pgTotal">${images.length}</span></div>
        ` : ``}
      </div>
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

  // ---------- Interacciones ----------
  let idx = 0;
  const mainImg = $('#mainImg', host);
  const btnPrev = $('.nav.prev', host);
  const btnNext = $('.nav.next', host);
  const pgCur = $('#pgCur', host);

  function show(n) {
    idx = (n + images.length) % images.length;
    const src = images[idx] || 'assets/img/placeholder.jpg';
    mainImg.src = src;
    if (pgCur) pgCur.textContent = String(idx + 1);
    // si hay lightbox abierto, sincroniza
    if (lb && !lb.hidden) lbImg.src = src;
    // pre-carga la siguiente
    const pre = new Image(); pre.src = images[(idx + 1) % images.length];
  }

  btnPrev?.addEventListener('click', () => show(idx - 1));
  btnNext?.addEventListener('click', () => show(idx + 1));

  // Swipe en móviles
  let startX = null;
  mainImg.addEventListener('touchstart', e => { startX = e.changedTouches[0].clientX; }, { passive: true });
  mainImg.addEventListener('touchend', e => {
    if (startX == null) return;
    const dx = e.changedTouches[0].clientX - startX;
    if (Math.abs(dx) > 40) (dx < 0 ? show(idx + 1) : show(idx - 1));
    startX = null;
  }, { passive: true });

  // Teclado (solo si lightbox no está abierto)
  document.addEventListener('keydown', e => {
    if (lb && !lb.hidden) return;
    if (e.key === 'ArrowLeft') show(idx - 1);
    if (e.key === 'ArrowRight') show(idx + 1);
  });

  // ---------- Lightbox ----------
  // Si no existe en el DOM, créalo (para no depender del HTML)
  let lb = $('#lightbox');
  if (!lb) {
    lb = document.createElement('div');
    lb.id = 'lightbox';
    lb.className = 'lightbox';
    lb.hidden = true;
    lb.innerHTML = `<button class="lb-close" aria-label="Cerrar">×</button><img alt="">`;
    document.body.appendChild(lb);
  }
  const lbImg = $('img', lb);
  const lbClose = $('.lb-close', lb);

  function openLightbox(src) {
    lbImg.src = src;
    lb.hidden = false;
    document.body.classList.add('no-scroll');
  }
  function closeLightbox() {
    lb.hidden = true;
    lbImg.src = '';
    document.body.classList.remove('no-scroll');
  }

  mainImg.addEventListener('click', () => openLightbox(mainImg.src));
  lbClose.addEventListener('click', closeLightbox);
  lb.addEventListener('click', (e) => { if (e.target === lb) closeLightbox(); });
  document.addEventListener('keydown', (e) => {
    if (lb.hidden) return;
    if (e.key === 'Escape') closeLightbox();
    if (e.key === 'ArrowLeft') show(idx - 1);
    if (e.key === 'ArrowRight') show(idx + 1);
  });

  // ---------- Helpers de badge ----------
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

  // CTA WhatsApp (barra separada)
  const msg = `Hola Jhoel, estoy interesado en *${p.title}* y necesito que me comparta mayor información y procedimiento.`;
  const cta = document.getElementById('product-cta');
  if (cta) {
    cta.hidden = false;
    const a = cta.querySelector('#waCta');
    if (a) a.href = `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(msg)}`;
  }
})();




