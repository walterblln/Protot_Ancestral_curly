/* ==========================================================================
   (ANCESTRAL CURLY - ACADEMIA)
   Application Logic & Interactivity
   Alineado con el Modelo de Negocio y Propuesta de Valor (ACA 2)
   ========================================================================== */

// Configuration & Marketing Settings
const CONFIG = {
  // Precios públicos visibles para el catálogo de productos
  showPrices: true,
  
  // Número de WhatsApp oficial para solicitudes y cotizaciones
  whatsappNumber: "573138106274" 
};

// 1. Initial State & Default Catalog (Exactamente 4 categorías y 4 productos solicitados)
const INITIAL_PRODUCTS = [
  {
    id: "prod-shampoo",
    title: "Shampoo Botánico Equilibrante",
    category: "shampoos",
    price: 25000,
    botanical: "Romero, Shikakai & Aloe Vera • Libre de Sulfatos",
    desc: "Limpieza suave y respetuosa que retira impurezas y exceso de sebo sin resecar los aceites naturales de tus ondas y rizos.",
    image: "assets/images/shampoo.jpg",
    isCustom: false
  },
  {
    id: "prod-tratamiento",
    title: "Tratamiento Mascarilla Hidronutritiva",
    category: "tratamientos",
    price: 35000,
    botanical: "Manteca de Murumuru Amazónica & Mucílago de Linaza",
    desc: "Nutrición profunda para recuperar cutículas abiertas, reparar hebras quebradizas y devolver elasticidad y desenredo fácil sin dolor.",
    image: "assets/images/mascarilla.jpg",
    isCustom: false
  },
  {
    id: "prod-aceite",
    title: "Aceite Botánico Nutritivo & Sellador",
    category: "aceites",
    price: 30000,
    botanical: "Argán Puro Prensado en Frío, Jojoba & Esencia de Romero",
    desc: "Elixir ligero que sella la hidratación dentro de la hebra capilar, combate el frizz frente a la humedad del clima y aporta un brillo radiante.",
    image: "assets/images/serum.jpg",
    isCustom: false
  },
  {
    id: "prod-crema",
    title: "Crema de Peinar Definición Profunda (Grande)",
    category: "cremas",
    price: 37000,
    botanical: "Linaza Dorada & Manteca de Karité • Presentación Grande",
    desc: "Presentación grande de máxima duración y rendimiento. Moldea y define ondas, rizos y afros con fijación flexible y movimiento natural sin acartonar.",
    image: "assets/images/crema.jpg",
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
  setupNavSlider();
  setDefaultBookingDate();
});

function loadProducts() {
  const storageKey = 'ancestral_curly_products_v5';
  const stored = localStorage.getItem(storageKey);
  if (stored) {
    try {
      products = JSON.parse(stored);
    } catch (e) {
      console.error("Error loading products:", e);
      products = [...INITIAL_PRODUCTS];
    }
  } else {
    // Limpieza de versiones anteriores para asegurar catálogo oficial de 4 productos
    localStorage.removeItem('ancestral_curly_products');
    localStorage.removeItem('ancestral_curly_products_v4');
    products = [...INITIAL_PRODUCTS];
    saveProducts();
  }
}

function saveProducts() {
  localStorage.setItem('ancestral_curly_products_v5', JSON.stringify(products));
}

function loadCart() {
  const storageKey = 'ancestral_curly_cart_v5';
  const stored = localStorage.getItem(storageKey);
  if (stored) {
    try {
      cart = JSON.parse(stored);
    } catch (e) {
      cart = [];
    }
  } else {
    localStorage.removeItem('ancestral_curly_cart');
    localStorage.removeItem('ancestral_curly_cart_v4');
    cart = [];
  }
  updateCartBadge();
}

function saveCart() {
  localStorage.setItem('ancestral_curly_cart_v5', JSON.stringify(cart));
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
        <i class="fa-solid fa-leaf" style="font-size: 3rem; color: var(--primary); margin-bottom: 1rem;"></i>
        <h3 style="font-family: var(--font-serif); font-size: 1.5rem; margin-bottom: 0.5rem;">No hay productos en esta categoría</h3>
        <p style="color: var(--text-muted); margin-bottom: 1.5rem;">Explora las demás opciones de nuestro catálogo recomendado.</p>
        <button class="btn btn-secondary btn-sm" onclick="filterProducts('todos')">
          Ver Todos los Productos
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
      </div>

      <div class="product-content">
        <div class="product-botanical-tag">
          <i class="fa-solid fa-leaf"></i>
          <span>${escapeHtml(product.botanical || 'Extractos Botánicos Certificados')}</span>
        </div>

        <h3 class="product-title">${escapeHtml(product.title)}</h3>
        <p class="product-desc">${escapeHtml(product.desc)}</p>

        <div class="product-footer">
          <div class="product-price">${formatMoney(product.price)}</div>
          <button class="product-btn-want" onclick="addToCart('${product.id}')" aria-label="Añadir ${escapeHtml(product.title)} a tu bolsa">
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
    aceites: 'Aceite',
    cremas: 'Crema de Peinar'
  };
  return map[cat] || cat;
}

// Modal helper placeholders (Gestión directa en código por solicitud del usuario)
function openAddProductModal() {}
function closeAddProductModal() {}

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
  const totalPriceLabel = document.getElementById('cartTotalPriceLabel');
  if (!container) return;

  const totalItems = cart.reduce((sum, item) => sum + item.qty, 0);
  const totalPrice = cart.reduce((sum, item) => sum + ((item.price || 0) * item.qty), 0);

  if (countLabel) {
    countLabel.textContent = `${totalItems} producto${totalItems === 1 ? '' : 's'}`;
  }
  if (totalPriceLabel) {
    totalPriceLabel.textContent = formatMoney(totalPrice);
  }

  if (cart.length === 0) {
    container.innerHTML = `
      <div style="text-align: center; padding: 3rem 1rem; color: var(--text-muted);">
        <i class="fa-solid fa-leaf" style="font-size: 3rem; color: var(--border-medium); margin-bottom: 1rem;"></i>
        <h4 style="font-family: var(--font-serif); font-size: 1.25rem; color: var(--text-main); margin-bottom: 0.5rem;">Tu bolsa está vacía</h4>
        <p style="font-size: 0.88rem; margin-bottom: 1.5rem;">Explora nuestro catálogo de productos recomendados y pulsa "¡Lo quiero!" para añadirlos a tu pedido.</p>
        <button class="btn btn-secondary btn-sm" onclick="closeCartDrawer()">Explorar Catálogo</button>
      </div>
    `;
    return;
  }

  container.innerHTML = cart.map(item => `
    <div class="cart-item">
      <img src="${item.image}" alt="${escapeHtml(item.title)}" class="cart-item-img" onerror="this.src='assets/images/shampoo.jpg'">
      <div class="cart-item-details">
        <h4>${escapeHtml(item.title)}</h4>
        <div class="cart-item-price">${formatMoney(item.price)}</div>
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
    showToast('Tu bolsa está vacía. Selecciona un producto primero.');
    return;
  }

  let total = 0;
  let message = "¡Hola (Ancestral Curly - Academia)! 🌿 Deseo solicitar los siguientes productos de su catálogo:\n\n";

  cart.forEach((item, index) => {
    const itemTotal = (item.price || 0) * item.qty;
    total += itemTotal;
    message += `${index + 1}. *${item.title}*\n   • Cantidad: ${item.qty} | Valor: ${formatMoney(item.price)}\n`;
  });

  if (total > 0) {
    message += `\n💰 *Total Estimado:* ${formatMoney(total)}\n`;
  }

  message += `\n¿Me podrían confirmar disponibilidad y coordinar la entrega o envío? ¡Muchas gracias!`;

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

          // Actualizar botón activo de navegación y centrarlo suavemente en la barra
          document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
          const currentNavLink = document.querySelector(`.nav-menu .nav-link[href="${targetId}"]`);
          if (currentNavLink) {
            currentNavLink.classList.add('active');
            try {
              currentNavLink.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
            } catch (err) {}
          }

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
// CONTROLADOR DE DESLIZAMIENTO DE BOTONES (MÓVIL / TABLET)
// ==========================================================================
function setupNavSlider() {
  const container = document.getElementById('navScrollContainer');
  const prevBtn = document.getElementById('navArrowLeft');
  const nextBtn = document.getElementById('navArrowRight');
  const wrapper = document.getElementById('navSliderWrapper');
  if (!container) return;

  function updateArrows() {
    if (!prevBtn || !nextBtn) return;
    const maxScroll = container.scrollWidth - container.clientWidth;
    if (maxScroll <= 8) {
      prevBtn.classList.remove('is-visible');
      nextBtn.classList.remove('is-visible');
      if (wrapper) {
        wrapper.classList.remove('has-overflow');
        wrapper.classList.remove('has-left-overflow');
      }
      return;
    }

    // Flecha izquierda: se muestra ÚNICAMENTE si el usuario se ha desplazado más de 20px
    // Así el botón de "Inicio" nunca se traslapa ni se tapa de entrada
    if (container.scrollLeft > 20) {
      prevBtn.classList.add('is-visible');
      if (wrapper) wrapper.classList.add('has-left-overflow');
    } else {
      prevBtn.classList.remove('is-visible');
      if (wrapper) wrapper.classList.remove('has-left-overflow');
    }

    // Flecha derecha: visible mientras queden botones por descubrir
    if (container.scrollLeft < maxScroll - 20) {
      nextBtn.classList.add('is-visible');
      if (wrapper) wrapper.classList.add('has-overflow');
    } else {
      nextBtn.classList.remove('is-visible');
      if (wrapper) wrapper.classList.remove('has-overflow');
    }
  }

  container.addEventListener('scroll', updateArrows, { passive: true });
  window.addEventListener('resize', updateArrows);

  if (prevBtn) {
    prevBtn.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      container.scrollBy({ left: -160, behavior: 'smooth' });
    });
  }

  if (nextBtn) {
    nextBtn.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      container.scrollBy({ left: 160, behavior: 'smooth' });
    });
  }

  // Comprobar estado inicial y tras cargar fuentes / estilos
  setTimeout(updateArrows, 100);
  setTimeout(updateArrows, 400);
}

// ==========================================================================
// UI HELPERS & EVENT LISTENERS
// ==========================================================================
function setupEventListeners() {
  const openCart = document.getElementById('openCartBtn');
  if (openCart) openCart.addEventListener('click', openCartDrawer);

  const closeCart = document.getElementById('closeCartBtn');
  if (closeCart) closeCart.addEventListener('click', closeCartDrawer);

  const cartOverlay = document.getElementById('cartOverlay');
  if (cartOverlay) cartOverlay.addEventListener('click', closeCartDrawer);

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
