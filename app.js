/* ==========================================================================
   (ANCESTRAL CURLY - ACADEMIA)
   Application Logic & Interactivity
   Alineado con el Modelo de Negocio y Propuesta de Valor (ACA 2)
   ========================================================================== */

// Configuration & Marketing Settings
const CONFIG = {
  // Flag para ocultar precios actualmente mientras se cotiza / marketing por consulta.
  // Cuando se desee activar precios públicos en el futuro, solo cambiar a true.
  showPrices: false,
  
  // Número de WhatsApp oficial (se deja dinámico si aún no está asignado)
  whatsappNumber: "" 
};

// 1. Initial State & Default Catalog (con precios base preparados para el futuro)
const INITIAL_PRODUCTS = [
  {
    id: "prod-1",
    title: "Shampoo Equilibrante de Romero & Shikakai",
    category: "shampoos",
    price: 38000,
    botanical: "Extracto de Romero & Fruto Shikakai • Libre de Sulfatos",
    desc: "Limpieza suave que estimula el cuero cabelludo sin resecar. Ideal para la transición capilar y para retirar acumulaciones en climas cálidos y húmedos.",
    image: "assets/images/shampoo.jpg",
    isCustom: false
  },
  {
    id: "prod-2",
    title: "Mascarilla Hidronutritiva de Murumuru & Linaza",
    category: "tratamientos",
    price: 48000,
    botanical: "Manteca de Murumuru Amazónica & Mucílago de Linaza",
    desc: "Nutrición profunda para recuperar cutículas abiertas por alisados químicos previos (estilo CARMEL). Aporta suavidad, brillo y desenredo fácil sin dolor.",
    image: "assets/images/mascarilla.jpg",
    isCustom: false
  },
  {
    id: "prod-3",
    title: "Sérum Activador de Ondas & Rizos con Argán y Aloe",
    category: "activadores",
    price: 42000,
    botanical: "Aceite de Argán Prensado en Frío & Gel de Aloe Orgánico",
    desc: "Fórmula ingrávida que sella la humedad y protege la hebra del calor ambiental del Caribe. Define la forma natural en 'S' y los bucles elásticos sin apelmazar.",
    image: "assets/images/serum.jpg",
    isCustom: false
  },
  {
    id: "prod-4",
    title: "Bruma Hidratante Revitalizadora con Té Verde & Rosas",
    category: "activadores",
    price: 32000,
    botanical: "Hidrolato de Rosas & Té Verde Antioxidante",
    desc: "El elixir ideal para reactivar ondas y rizos al segundo o tercer día frente a la humedad del Magdalena, sin necesidad de lavar con shampoo nuevamente.",
    image: "assets/images/shampoo.jpg",
    isCustom: false
  },
  {
    id: "prod-5",
    title: "Gorro y Funda de Satén Mulberry Ancestral",
    category: "accesorios",
    price: 35000,
    botanical: "Fibra de Satén de Alta Densidad",
    desc: "Accesorio imprescindible para preservar la definición durante la noche. Reduce la fricción, previene el frizz nocturno y evita el quiebre de la hebra.",
    image: "assets/images/hero.jpg",
    isCustom: false
  }
];

// App State
let products = [];
let cart = [];
let currentCategory = 'todos';
let quizAnswers = {
  textureType: null,
  porosity: null,
  challenge: null
};

// ==========================================================================
// INITIALIZATION
// ==========================================================================
document.addEventListener('DOMContentLoaded', () => {
  loadProducts();
  loadCart();
  renderProducts();
  setupEventListeners();
  setupSmoothNavigation();
  setDefaultBookingDate();
});

function loadProducts() {
  const stored = localStorage.getItem('ancestral_curly_products');
  if (stored) {
    try {
      products = JSON.parse(stored);
    } catch (e) {
      console.error("Error loading products:", e);
      products = [...INITIAL_PRODUCTS];
    }
  } else {
    products = [...INITIAL_PRODUCTS];
    saveProducts();
  }
}

function saveProducts() {
  localStorage.setItem('ancestral_curly_products', JSON.stringify(products));
}

function loadCart() {
  const stored = localStorage.getItem('ancestral_curly_cart');
  if (stored) {
    try {
      cart = JSON.parse(stored);
    } catch (e) {
      cart = [];
    }
  }
  updateCartBadge();
}

function saveCart() {
  localStorage.setItem('ancestral_curly_cart', JSON.stringify(cart));
  updateCartBadge();
}

function setDefaultBookingDate() {
  const dateInput = document.getElementById('bookDate');
  if (dateInput) {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    dateInput.min = tomorrow.toISOString().split('T')[0];
    dateInput.value = tomorrow.toISOString().split('T')[0];
  }
}

// ==========================================================================
// PRODUCTS RENDERING & FILTERING
// ==========================================================================
function renderProducts() {
  const grid = document.getElementById('productsGrid');
  if (!grid) return;

  const filtered = currentCategory === 'todos'
    ? products
    : products.filter(p => p.category === currentCategory);

  if (filtered.length === 0) {
    grid.innerHTML = `
      <div class="empty-products">
        <i class="fa-solid fa-seedling" style="font-size: 3rem; color: var(--primary); margin-bottom: 1rem;"></i>
        <h3 style="font-family: var(--font-serif); font-size: 1.5rem; margin-bottom: 0.5rem;">No hay productos en esta categoría</h3>
        <p style="color: var(--text-muted); margin-bottom: 1.5rem;">Sé la primera persona en publicar un producto certificado o botánico en esta sección.</p>
        <button class="btn btn-primary" onclick="openAddProductModal()">
          <i class="fa-solid fa-plus"></i> Agregar Nuevo Producto
        </button>
      </div>
    `;
    return;
  }

  grid.innerHTML = filtered.map(product => `
    <article class="product-card" id="card-${product.id}">
      <div class="product-media">
        <img src="${product.image}" alt="${escapeHtml(product.title)}" class="product-img" onerror="this.src='assets/images/shampoo.jpg'">
        <span class="product-category-tag">${getCategoryName(product.category)}</span>
        ${product.isCustom ? '<span class="product-custom-badge"><i class="fa-solid fa-sparkles"></i> Nuevo</span>' : ''}
        ${product.isCustom ? `
          <button class="product-delete-btn" onclick="deleteProduct('${product.id}')" title="Eliminar este producto">
            <i class="fa-regular fa-trash-can"></i>
          </button>
        ` : ''}
      </div>

      <div class="product-content">
        <div class="product-botanical-tag">
          <i class="fa-solid fa-leaf"></i>
          <span>${escapeHtml(product.botanical || 'Extractos Botánicos Certificados')}</span>
        </div>

        <h3 class="product-title">${escapeHtml(product.title)}</h3>
        <p class="product-desc">${escapeHtml(product.desc)}</p>

        <div class="product-footer">
          ${CONFIG.showPrices && product.price 
            ? `<div class="product-price">${formatMoney(product.price)}</div>`
            : `<div class="product-inquiry-tag"><i class="fa-solid fa-leaf"></i> Consultar precio</div>`
          }
          <button class="product-btn-want" onclick="addToCart('${product.id}')">
            <i class="fa-solid fa-bag-shopping"></i>
            <span>¡Lo quiero!</span>
          </button>
        </div>
      </div>
    </article>
  `).join('');
}

function filterProducts(category, tabBtn) {
  currentCategory = category;

  document.querySelectorAll('.filter-tab').forEach(tab => {
    tab.classList.remove('active');
  });

  if (tabBtn) {
    tabBtn.classList.add('active');
  } else {
    const btn = document.querySelector(`.filter-tab[data-category="${category}"]`);
    if (btn) btn.classList.add('active');
  }

  const grid = document.getElementById('productsGrid');
  if (grid) {
    grid.classList.add('fading');
    setTimeout(() => {
      renderProducts();
      grid.classList.remove('fading');
    }, 150);
  } else {
    renderProducts();
  }
}

function getCategoryName(cat) {
  const map = {
    shampoos: 'Shampoo',
    tratamientos: 'Tratamiento',
    activadores: 'Activador',
    accesorios: 'Accesorio'
  };
  return map[cat] || cat;
}

// ==========================================================================
// ADD NEW PRODUCT (GESTIÓN DE PRODUCTOS)
// ==========================================================================
let uploadedImageBase64 = null;

function openAddProductModal() {
  const modal = document.getElementById('addProductModal');
  if (modal) modal.classList.add('active');
  resetProductForm();
}

function closeAddProductModal() {
  const modal = document.getElementById('addProductModal');
  if (modal) modal.classList.remove('active');
}

function resetProductForm() {
  const form = document.getElementById('addProductForm');
  if (form) form.reset();
  uploadedImageBase64 = null;
  updateImagePreview('');
}

function handleImageFileUpload(e) {
  const file = e.target.files[0];
  if (!file) return;

  if (!file.type.startsWith('image/')) {
    showToast('Por favor selecciona un archivo de imagen válido');
    return;
  }

  const reader = new FileReader();
  reader.onload = function(event) {
    uploadedImageBase64 = event.target.result;
    document.getElementById('prodImageUrl').value = '';
    updateImagePreview(uploadedImageBase64);
  };
  reader.readAsDataURL(file);
}

function updateImagePreview(src) {
  const previewImg = document.getElementById('previewImgElement');
  const icon = document.getElementById('previewPlaceholderIcon');
  const text = document.getElementById('previewPlaceholderText');

  if (src && src.trim() !== '') {
    previewImg.src = src;
    previewImg.style.display = 'block';
    if (icon) icon.style.display = 'none';
    if (text) text.style.display = 'none';
  } else {
    previewImg.style.display = 'none';
    if (icon) icon.style.display = 'block';
    if (text) text.style.display = 'block';
  }
}

function usePresetSampleImage() {
  const samples = [
    'assets/images/shampoo.jpg',
    'assets/images/mascarilla.jpg',
    'assets/images/serum.jpg'
  ];
  const randomSample = samples[Math.floor(Math.random() * samples.length)];
  uploadedImageBase64 = randomSample;
  document.getElementById('prodImageUrl').value = randomSample;
  updateImagePreview(randomSample);
  showToast('Muestra botánica seleccionada');
}

function handleCreateProduct(e) {
  e.preventDefault();

  const title = document.getElementById('prodTitle').value.trim();
  const category = document.getElementById('prodCategory').value;
  const rawPrice = document.getElementById('prodPrice').value;
  const price = rawPrice ? parseFloat(rawPrice) : 0;
  const botanical = document.getElementById('prodBotanical').value.trim();
  const desc = document.getElementById('prodDesc').value.trim();
  const urlInput = document.getElementById('prodImageUrl').value.trim();

  let finalImage = uploadedImageBase64 || urlInput;
  if (!finalImage) {
    finalImage = 'assets/images/shampoo.jpg';
  }

  const newProduct = {
    id: "custom-" + Date.now(),
    title,
    category,
    price,
    botanical,
    desc,
    image: finalImage,
    isCustom: true
  };

  products.unshift(newProduct);
  saveProducts();
  renderProducts();
  closeAddProductModal();

  showToast(`¡"${title}" ha sido publicado en la botica!`);

  const el = document.getElementById(`card-${newProduct.id}`);
  if (el) {
    el.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }
}

function deleteProduct(id) {
  if (confirm('¿Estás seguro de que deseas eliminar este producto de la botica?')) {
    products = products.filter(p => p.id !== id);
    cart = cart.filter(item => item.id !== id);
    saveProducts();
    saveCart();
    renderProducts();
    renderCart();
    showToast('Producto eliminado');
  }
}

// ==========================================================================
// CART & "¡LO QUIERO!" BEHAVIOR
// ==========================================================================
function addToCart(productId) {
  const product = products.find(p => p.id === productId);
  if (!product) return;

  const existingItem = cart.find(item => item.id === productId);
  if (existingItem) {
    existingItem.qty += 1;
  } else {
    cart.push({
      id: product.id,
      title: product.title,
      price: product.price,
      image: product.image,
      qty: 1
    });
  }

  saveCart();
  renderCart();
  openCartDrawer();
  triggerBadgeBump();
  showToast(`¡"${product.title}" añadido a tu lista de interés!`);
}

function updateCartQty(productId, delta) {
  const item = cart.find(i => i.id === productId);
  if (!item) return;

  item.qty += delta;
  if (item.qty <= 0) {
    cart = cart.filter(i => i.id !== productId);
  }

  saveCart();
  renderCart();
}

function removeFromCart(productId) {
  cart = cart.filter(i => i.id !== productId);
  saveCart();
  renderCart();
  showToast('Producto retirado de la lista');
}

function clearCart() {
  if (cart.length === 0) return;
  if (confirm('¿Deseas vaciar tu lista de interés?')) {
    cart = [];
    saveCart();
    renderCart();
    showToast('Lista vaciada');
  }
}

function renderCart() {
  const container = document.getElementById('cartItemsList');
  const countLabel = document.getElementById('cartItemCountLabel');
  if (!container) return;

  const totalItems = cart.reduce((sum, item) => sum + item.qty, 0);
  if (countLabel) {
    countLabel.textContent = `${totalItems} producto${totalItems === 1 ? '' : 's'}`;
  }

  if (cart.length === 0) {
    container.innerHTML = `
      <div style="text-align: center; padding: 3rem 1rem; color: var(--text-muted);">
        <i class="fa-solid fa-leaf" style="font-size: 3rem; color: var(--border-medium); margin-bottom: 1rem;"></i>
        <h4 style="font-family: var(--font-serif); font-size: 1.25rem; color: var(--text-main); margin-bottom: 0.5rem;">Tu lista está vacía</h4>
        <p style="font-size: 0.88rem; margin-bottom: 1.5rem;">Explora los shampoos y tratamientos de la botica y pulsa "¡Lo quiero!" para añadirlos.</p>
        <button class="btn btn-secondary btn-sm" onclick="closeCartDrawer()">Explorar Botica</button>
      </div>
    `;
    return;
  }

  container.innerHTML = cart.map(item => `
    <div class="cart-item">
      <img src="${item.image}" alt="${escapeHtml(item.title)}" class="cart-item-img" onerror="this.src='assets/images/shampoo.jpg'">
      <div class="cart-item-details">
        <h4>${escapeHtml(item.title)}</h4>
        ${CONFIG.showPrices && item.price
          ? `<div class="cart-item-price">${formatMoney(item.price)}</div>`
          : `<span class="cart-item-inquiry">Consultar valor</span>`
        }
        <div class="cart-item-qty">
          <button class="qty-btn" onclick="updateCartQty('${item.id}', -1)" aria-label="Disminuir">-</button>
          <span class="qty-num">${item.qty}</span>
          <button class="qty-btn" onclick="updateCartQty('${item.id}', 1)" aria-label="Aumentar">+</button>
        </div>
      </div>
      <button class="cart-item-remove" onclick="removeFromCart('${item.id}')" aria-label="Eliminar ítem">
        <i class="fa-regular fa-trash-can"></i>
      </button>
    </div>
  `).join('');
}

function openCartDrawer() {
  const drawer = document.getElementById('cartDrawer');
  const overlay = document.getElementById('cartOverlay');
  if (drawer && overlay) {
    drawer.classList.add('active');
    overlay.classList.add('active');
    renderCart();
  }
}

function closeCartDrawer() {
  const drawer = document.getElementById('cartDrawer');
  const overlay = document.getElementById('cartOverlay');
  if (drawer && overlay) {
    drawer.classList.remove('active');
    overlay.classList.remove('active');
  }
}

function updateCartBadge() {
  const badge = document.getElementById('cartBadge');
  if (!badge) return;
  const count = cart.reduce((sum, item) => sum + item.qty, 0);
  badge.textContent = count;
}

function triggerBadgeBump() {
  const badge = document.getElementById('cartBadge');
  if (!badge) return;
  badge.classList.add('bump');
  setTimeout(() => badge.classList.remove('bump'), 250);
}

function checkoutViaWhatsApp() {
  if (cart.length === 0) {
    showToast('Tu lista está vacía. Selecciona un producto primero.');
    return;
  }

  let message = "¡Hola (Ancestral Curly - Academia)! 🌿 Deseo consultar la disponibilidad, precios y modo de uso de los siguientes productos de su botica:\n\n";

  cart.forEach((item, index) => {
    message += `${index + 1}. *${item.title}* (Cantidad: ${item.qty})\n`;
  });

  message += `\n¿Me podrían indicar los valores y si tienen envíos a mi ubicación? Muchas gracias.`;

  const baseUrl = CONFIG.whatsappNumber 
    ? `https://wa.me/${CONFIG.whatsappNumber}?text=`
    : `https://api.whatsapp.com/send?text=`;

  window.open(`${baseUrl}${encodeURIComponent(message)}`, '_blank');
}

// ==========================================================================
// BOOKING MODAL (ASESORÍAS PERSONALIZADAS)
// ==========================================================================
function openBookingModal(planName = 'Asesoría VIP 1 a 1 & Taller') {
  const modal = document.getElementById('bookingModal');
  const select = document.getElementById('bookPlan');

  if (select && planName) {
    for (let i = 0; i < select.options.length; i++) {
      if (select.options[i].value.includes(planName) || select.options[i].text.includes(planName)) {
        select.selectedIndex = i;
        break;
      }
    }
  }

  if (modal) modal.classList.add('active');
}

function closeBookingModal() {
  const modal = document.getElementById('bookingModal');
  if (modal) modal.classList.remove('active');
}

function handleBookingSubmit(e) {
  e.preventDefault();

  const plan = document.getElementById('bookPlan').value;
  const name = document.getElementById('bookName').value;
  const modality = document.getElementById('bookModalidad').value;
  const waveType = document.getElementById('bookType').value;
  const date = document.getElementById('bookDate').value;
  const notes = document.getElementById('bookNotes').value;

  let message = `¡Hola (Ancestral Curly - Academia)! 🌿 Deseo solicitar información y agendar una sesión:\n\n`;
  message += `👤 *Nombre:* ${name}\n`;
  message += `📋 *Asesoría:* ${plan}\n`;
  message += `📍 *Modalidad:* ${modality}\n`;
  message += `🌊 *Tipo de Textura:* ${waveType}\n`;
  message += `🗓️ *Fecha tentativa:* ${date}\n`;
  if (notes) {
    message += `📝 *Detalles de mi caso:* ${notes}\n`;
  }
  message += `\nQuedo atenta para conocer el valor y coordinar el horario disponible.`;

  const baseUrl = CONFIG.whatsappNumber 
    ? `https://wa.me/${CONFIG.whatsappNumber}?text=`
    : `https://api.whatsapp.com/send?text=`;

  window.open(`${baseUrl}${encodeURIComponent(message)}`, '_blank');
  closeBookingModal();
  showToast('¡Solicitud preparada! Redirigiendo a WhatsApp...');
}

// ==========================================================================
// DIAGNOSTIC QUIZ (INTERACTIVE 3 STEPS - ADAPTADO AL PDF)
// ==========================================================================
function selectQuizOption(step, value, element) {
  const stepContainer = document.getElementById(`quizStep${step}`);
  if (!stepContainer) return;

  stepContainer.querySelectorAll('.quiz-option-card').forEach(c => c.classList.remove('selected'));
  element.classList.add('selected');

  if (step === 1) {
    quizAnswers.textureType = value;
    document.getElementById('btnStep1Next').removeAttribute('disabled');
  } else if (step === 2) {
    quizAnswers.porosity = value;
    document.getElementById('btnStep2Next').removeAttribute('disabled');
  } else if (step === 3) {
    quizAnswers.challenge = value;
    document.getElementById('btnStep3Next').removeAttribute('disabled');
  }
}

function nextQuizStep(stepToGo) {
  hideAllQuizSteps();
  document.getElementById(`quizStep${stepToGo}`).classList.add('active');
  updateQuizIndicators(stepToGo);
}

function prevQuizStep(stepToGo) {
  hideAllQuizSteps();
  document.getElementById(`quizStep${stepToGo}`).classList.add('active');
  updateQuizIndicators(stepToGo);
}

function hideAllQuizSteps() {
  document.querySelectorAll('.quiz-step-content').forEach(s => s.classList.remove('active'));
}

function updateQuizIndicators(currentStep) {
  for (let i = 1; i <= 3; i++) {
    const ind = document.getElementById(`stepIndicator${i}`);
    if (i <= currentStep) {
      ind.classList.add('active');
    } else {
      ind.classList.remove('active');
    }
  }
}

function calculateQuizResult() {
  hideAllQuizSteps();
  const resultView = document.getElementById('quizResultView');
  resultView.classList.add('active');

  const titleEl = document.getElementById('resultTitle');
  const summaryEl = document.getElementById('resultSummary');
  const resTechEl = document.getElementById('resTech');
  const resFormulaEl = document.getElementById('resFormula');
  const resStepEl = document.getElementById('resStep');

  const texture = quizAnswers.textureType || 'ondulado';
  const porosity = quizAnswers.porosity || 'media';
  const challenge = quizAnswers.challenge || 'transicion';

  let textureLabel = "Cabello Ondulado (Tipo 2)";
  if (texture === 'rizado') textureLabel = "Cabello Rizado (Tipo 3)";
  if (texture === 'afro') textureLabel = "Cabello Afro / Crespo (Tipo 4)";

  let porosityLabel = "Media (Equilibrada)";
  if (porosity === 'baja') porosityLabel = "Baja (Estilo CORI - Cutícula Sellada)";
  if (porosity === 'alta') porosityLabel = "Alta (Estilo CARMEL - Cutícula Abierta)";

  titleEl.textContent = `${textureLabel} con Porosidad ${porosityLabel}`;

  let summary = `Tu cabello posee una belleza única y auténtica. `;
  
  if (porosity === 'alta') {
    summary += "Al presentar porosidad alta (estilo CARMEL, común tras alisados químicos, tintes o exposición al sol caribeño), tu cutícula pierde humedad con rapidez. Necesitas nutrición restauradora con Murumuru y un sérum botánico para sellar la fibra contra el frizz.";
    resTechEl.textContent = "Scrunch en mojado + Rotura de cast con sérum sellador";
    resFormulaEl.textContent = "Mascarilla de Murumuru y Linaza + Shampoo sin sulfatos";
  } else if (porosity === 'baja') {
    summary += "Al tener porosidad baja (estilo CORI), tu cutícula está muy compactada. El secreto está en aplicar calor suave en mascarillas y usar texturas botánicas hiper-livianas de base acuosa para no generar acumulación ni pesadez.";
    resTechEl.textContent = "Lavado tibio + Micro-plopping de 10 min con toalla de bambú";
    resFormulaEl.textContent = "Gel ligero de Linaza y Aloe + Shampoo Shikakai";
  } else {
    summary += "Tu porosidad equilibrada te permite lucir ondas y rizos definidos con una rutina simple y consciente, manteniendo la hidratación y protegiendo tu melena de la fricción nocturna.";
    resTechEl.textContent = "Técnica rizo a rizo + Secado al aire o difusor a baja temperatura";
    resFormulaEl.textContent = "Shampoo de Romero + Mascarilla Hidronutritiva quincenal";
  }

  if (challenge === 'transicion') {
    resStepEl.textContent = "Asesoría de Transición Capilar (Paso a paso para dejar los alisados)";
  } else if (challenge === 'familia') {
    resStepEl.textContent = "Asesoría Familiar (Cuidado y desenredo suave para niñas y adolescentes)";
  } else {
    resStepEl.textContent = "Asesoría VIP 1 a 1 (Presencial en Ciénaga o Virtual)";
  }

  summaryEl.textContent = summary;
}

function restartQuiz() {
  quizAnswers = { textureType: null, porosity: null, challenge: null };
  document.querySelectorAll('.quiz-option-card').forEach(c => c.classList.remove('selected'));
  document.getElementById('btnStep1Next').setAttribute('disabled', 'true');
  document.getElementById('btnStep2Next').setAttribute('disabled', 'true');
  document.getElementById('btnStep3Next').setAttribute('disabled', 'true');
  hideAllQuizSteps();
  document.getElementById('quizStep1').classList.add('active');
  updateQuizIndicators(1);
}

// ==========================================================================
// SMOOTH CONTINUOUS NAVIGATION (FLUIDA, CONECTADA Y SIN REBOTES)
// ==========================================================================
function setupSmoothNavigation() {
  const navLinks = document.querySelectorAll('.nav-link, .footer-links a[href^="#"]');

  navLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      const targetId = link.getAttribute('href');
      if (targetId && targetId.startsWith('#') && targetId.length > 1) {
        const targetSection = document.querySelector(targetId);
        if (targetSection) {
          e.preventDefault();

          // Desplazamiento fluido continuo sin saltos ni tirones
          const navbar = document.getElementById('mainNavbar');
          const navOffset = navbar ? navbar.offsetHeight : 84;
          const targetY = targetSection.getBoundingClientRect().top + window.pageYOffset - navOffset;

          window.scrollTo({
            top: targetY,
            behavior: 'smooth'
          });

          // Actualizar botón activo de navegación
          document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
          const currentNavLink = document.querySelector(`.nav-menu .nav-link[href="${targetId}"]`);
          if (currentNavLink) currentNavLink.classList.add('active');

          // Conexión visual sutil sin modificar el flujo de la página
          targetSection.classList.remove('section-active-pulse');
          void targetSection.offsetWidth; // Reflow para reiniciar animación
          targetSection.classList.add('section-active-pulse');
          setTimeout(() => targetSection.classList.remove('section-active-pulse'), 800);

          // Enlace clickeado correctamente
        }
      }
    });
  });
}

// ==========================================================================
// UI HELPERS & EVENT LISTENERS
// ==========================================================================
function setupEventListeners() {
  const openCart = document.getElementById('openCartBtn');
  if (openCart) openCart.addEventListener('click', openCartDrawer);

  const mobileToggle = document.getElementById('mobileMenuBtn');
  const navMenu = document.getElementById('navMenu');
  const mobileBackdrop = document.getElementById('mobileNavBackdrop');

  function openMobileMenu() {
    if (!navMenu) return;
    navMenu.classList.add('mobile-open');
    if (mobileBackdrop) mobileBackdrop.classList.add('active');
    if (mobileToggle) {
      mobileToggle.setAttribute('aria-expanded', 'true');
      const icon = mobileToggle.querySelector('i');
      if (icon) {
        icon.classList.remove('fa-bars');
        icon.classList.add('fa-xmark');
      }
    }
  }

  function closeMobileMenu() {
    if (!navMenu) return;
    navMenu.classList.remove('mobile-open');
    if (mobileBackdrop) mobileBackdrop.classList.remove('active');
    if (mobileToggle) {
      mobileToggle.setAttribute('aria-expanded', 'false');
      const icon = mobileToggle.querySelector('i');
      if (icon) {
        icon.classList.remove('fa-xmark');
        icon.classList.add('fa-bars');
      }
    }
  }

  if (mobileToggle && navMenu) {
    mobileToggle.addEventListener('click', (e) => {
      e.stopPropagation();
      if (navMenu.classList.contains('mobile-open')) {
        closeMobileMenu();
      } else {
        openMobileMenu();
      }
    });

    if (mobileBackdrop) {
      mobileBackdrop.addEventListener('click', closeMobileMenu);
    }

    // Auto-cerrar al hacer clic en cualquier enlace del menú móvil
    navMenu.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        closeMobileMenu();
      });
    });

    // Cerrar menú móvil al redimensionar a pantallas de escritorio
    window.addEventListener('resize', () => {
      if (window.innerWidth > 1024 && navMenu.classList.contains('mobile-open')) {
        closeMobileMenu();
      }
    });
  }

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closeMobileMenu();
      closeAddProductModal();
      closeBookingModal();
      closeCartDrawer();
    }
  });

  // Resaltado de navegación activa conforme se hace scroll
  window.addEventListener('scroll', () => {
    const sections = document.querySelectorAll('section[id]');
    const scrollY = window.pageYOffset;

    sections.forEach(current => {
      const sectionHeight = current.offsetHeight;
      const sectionTop = current.offsetTop - 120;
      const sectionId = current.getAttribute('id');
      const navLink = document.querySelector(`.nav-menu a[href*="${sectionId}"]`);

      if (navLink) {
        if (scrollY > sectionTop && scrollY <= sectionTop + sectionHeight) {
          document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
          navLink.classList.add('active');
        }
      }
    });
  });
}

function showToast(message) {
  const toast = document.getElementById('toast');
  const text = document.getElementById('toastMessage');
  if (!toast || !text) return;

  text.textContent = message;
  toast.classList.add('active');

  setTimeout(() => {
    toast.classList.remove('active');
  }, 3500);
}

function formatMoney(amount) {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    maximumFractionDigits: 0
  }).format(amount);
}

function capitalize(str) {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1);
}

function escapeHtml(string) {
  const div = document.createElement('div');
  div.textContent = string;
  return div.innerHTML;
}
