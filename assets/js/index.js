const $ = (s, c = document) => c.querySelector(s);
const grid = $('#grid');
const categoryFilter = $('#categoryFilter');
const searchInput = $('#searchInput');
const searchBtn = $('#searchBtn');
const clearAllBtn = $('#clearAll');
const emptyMsg = $('#emptyMsg');

const DEMO_PRODUCTS = [
  {
    id: "vm-siemens-tia-v17",
    category: "vm",
    brand: "Siemens",
    title: "VM Siemens TIA Portal V17",
    price: 89, currency: "USD",
    image: "assets/img/vms/siemens-tia-v17.jpg",
    short: "Imagen lista con TIA Portal V17 + PLCSIM + WinCC RT Advanced.",
    specs: ["VMware", "85 GB", "RAM 16 GB"],
    tags: ["siemens", "tia", "plc", "wincc", "hmi"],
    badge: "new"   // ← ★ añade esto
  },
  {
    id: "serv-soporte-implementacion",
    category: "servicio",
    brand: "DTP Automation",
    title: "Servicio de Soporte e Implementación",
    price: 150, currency: "USD",
    image: "assets/img/servicios/soporte.jpg",
    short: "Acompañamiento remoto para instalación, licenciamiento y pruebas.",
    specs: ["Bolsas de horas"], tags: ["servicio", "soporte"]
  },
  {
    id: "serv-soporte-implementacion",
    category: "servicio",
    brand: "DTP Automation",
    title: "Servicio de Soporte e Implementación",
    price: 150, currency: "USD",
    image: "assets/img/servicios/soporte.jpg",
    short: "Acompañamiento remoto para instalación, licenciamiento y pruebas.",
    specs: ["Bolsas de horas"], tags: ["servicio", "soporte"]
  },
  {
    id: "serv-soporte-implementacion",
    category: "servicio",
    brand: "DTP Automation",
    title: "Servicio de Soporte e Implementación",
    price: 150, currency: "USD",
    image: "assets/img/servicios/soporte.jpg",
    short: "Acompañamiento remoto para instalación, licenciamiento y pruebas.",
    specs: ["Bolsas de horas"], tags: ["servicio", "soporte"]
  },
  {
    id: "serv-soporte-implementacion",
    category: "servicio",
    brand: "DTP Automation",
    title: "Servicio de Soporte e Implementación",
    price: 150, currency: "USD",
    image: "assets/img/servicios/soporte.jpg",
    short: "Acompañamiento remoto para instalación, licenciamiento y pruebas.",
    specs: ["Bolsas de horas"], tags: ["servicio", "soporte"]
  },

  {
    id: "serv-soporte-implementacion",
    category: "servicio",
    brand: "DTP Automation",
    title: "Servicio de Soporte e Implementación",
    price: 150, currency: "USD",
    image: "assets/img/servicios/soporte.jpg",
    short: "Acompañamiento remoto para instalación, licenciamiento y pruebas.",
    specs: ["Bolsas de horas"], tags: ["servicio", "soporte"]
  },

  {
    id: "serv-soporte-implementacion",
    category: "servicio",
    brand: "DTP Automation",
    title: "Servicio de Soporte e Implementación",
    price: 150, currency: "USD",
    image: "assets/img/servicios/soporte.jpg",
    short: "Acompañamiento remoto para instalación, licenciamiento y pruebas.",
    specs: ["Bolsas de horas"], tags: ["servicio", "soporte"]
  },

  {
    id: "serv-soporte-implementacion",
    category: "servicio",
    brand: "DTP Automation",
    title: "Servicio de Soporte e Implementación",
    price: 150, currency: "USD",
    image: "assets/img/servicios/soporte.jpg",
    short: "Acompañamiento remoto para instalación, licenciamiento y pruebas.",
    specs: ["Bolsas de horas"], tags: ["servicio", "soporte"]
  },

  {
    id: "serv-soporte-implementacion",
    category: "servicio",
    brand: "DTP Automation",
    title: "Servicio de Soporte e Implementación",
    price: 150, currency: "USD",
    image: "assets/img/servicios/soporte.jpg",
    short: "Acompañamiento remoto para instalación, licenciamiento y pruebas.",
    specs: ["Bolsas de horas"], tags: ["servicio", "soporte"]
  }







];

let DATA = [];
let state = { q: '', cat: '' };

init();
async function init() {
  try {
    const res = await fetch('./data/products.json', { cache: 'no-store' });
    if (!res.ok) throw new Error('HTTP ' + res.status);
    DATA = await res.json();
  } catch (e) {
    console.warn('No se pudo leer data/products.json (probable file://). Usando DEMO.', e);
    DATA = DEMO_PRODUCTS;
  }

  document.querySelectorAll('.cat-link').forEach(a => {
    a.addEventListener('click', e => {
      e.preventDefault();
      state.cat = a.dataset.cat || '';
      categoryFilter.value = state.cat;
      render();
      window.scrollTo({ top: grid.offsetTop - 90, behavior: 'smooth' });
    });
  });

  searchBtn.addEventListener('click', () => { state.q = searchInput.value.trim().toLowerCase(); render(); });
  searchInput.addEventListener('keydown', e => { if (e.key === 'Enter') { state.q = searchInput.value.trim().toLowerCase(); render(); } });
  categoryFilter.addEventListener('change', e => { state.cat = e.target.value; render(); });
  clearAllBtn?.addEventListener('click', () => {
    state = { q: '', cat: '' };
    categoryFilter.value = ''; searchInput.value = '';
    render();
  });

  render();
}

(function () {
  const number = '51980790737'; // +51 980 790 737
  const message = `Hola DTP Automation, tengo una consulta desde la página principal: ${location.href}`;
  const url = `https://wa.me/${number}?text=${encodeURIComponent(message)}`;
  document.querySelectorAll('[data-wa]').forEach(a => a.href = url);
})();


function filterFn(p) {
  if (state.cat && p.category !== state.cat) return false;
  if (!state.q) return true;
  const blob = `${p.title} ${p.brand || ''} ${p.tags?.join(' ') || ''}`.toLowerCase();
  return blob.includes(state.q);
}

function render() {
  const items = DATA.filter(filterFn);
  grid.innerHTML = '';
  emptyMsg.hidden = items.length > 0;

  items.forEach(p => grid.appendChild(card(p)));
}

function card(p) {
  const a = document.createElement('a');
  a.href = `product.html?id=${encodeURIComponent(p.id)}`;
  a.className = 'card';

  const media = document.createElement('div'); media.className = 'media';
  const img = document.createElement('img');
  img.src = p.image || 'assets/img/placeholder.jpg';
  img.alt = p.title; img.loading = 'lazy';
  img.onerror = () => { img.src = 'assets/img/placeholder.jpg'; };
  media.appendChild(img);

  // ★ Badge
  if (p.badge) {
    const flag = document.createElement('span');
    flag.className = 'badge-flag ' + badgeClass(p.badge);
    flag.textContent = badgeText(p.badge);
    media.appendChild(flag);
  }


  const body = document.createElement('div'); body.className = 'body';
  const cat = document.createElement('div'); cat.className = 'cat'; cat.textContent = labelCat(p.category) + (p.brand ? ` · ${p.brand}` : '');
  const title = document.createElement('div'); title.className = 'title'; title.textContent = p.title;
  const price = document.createElement('div'); price.className = 'price'; price.textContent = formatPrice(p.price, p.currency || 'PEN');

  const badges = document.createElement('div'); badges.className = 'badges';
  (p.tags || []).slice(0, 3).forEach(t => {
    const b = document.createElement('span'); b.className = 'badge'; b.textContent = t; badges.appendChild(b);
  });

  body.append(cat, title, price, badges);
  a.append(media, body);
  return a;
}


function badgeClass(b) {
  if (!b) return '';
  const k = String(b).toLowerCase();
  if (k === 'new' || k === 'nuevo') return 'is-new';
  if (k === 'sale' || k === 'oferta') return 'is-sale';
  if (k === 'hot' || k === 'destacado') return 'is-hot';
  return 'is-new';
}
function badgeText(b) {
  const k = String(b).toLowerCase();
  if (k === 'new' || k === 'nuevo') return 'NUEVO';
  if (k === 'sale' || k === 'oferta') return 'OFERTA';
  if (k === 'hot' || k === 'destacado') return 'DESTACADO';
  return 'NUEVO';
}


function labelCat(c) { return ({ vm: 'Máquina Virtual', software: 'Software', curso: 'Curso', servicio: 'Servicio' })[c] || 'Producto'; }
function formatPrice(n, cur) { if (n == null) return '—'; return cur === 'USD' ? `$ ${Number(n).toLocaleString('es-PE')}` : `S/ ${Number(n).toLocaleString('es-PE')}`; }






