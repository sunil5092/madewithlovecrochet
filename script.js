document.addEventListener('DOMContentLoaded', () => {

	// adjust page offset to account for fixed nav + category menu
	function adjustPageOffset() {
		const nav = document.querySelector('nav');
		const catMenu = document.getElementById('categoryMenu');
		const navH = nav ? nav.offsetHeight : 0;
		const menuH = catMenu ? catMenu.offsetHeight : 0;
		const total = navH + menuH + 12; // small gap
		document.documentElement.style.setProperty('--page-offset', total + 'px');
		// also add top padding to body so fixed elements don't overlay content
		document.body.style.paddingTop = total + 'px';
	}

	window.addEventListener('resize', adjustPageOffset);
	adjustPageOffset();
	// CAROUSEL
	const track = document.getElementById('carouselTrack');
	const dotsContainer = document.getElementById('carouselDots');
	const items = document.querySelectorAll('.carousel-item');
	window.currentIndex = 0;
	let itemsPerView = 3;

	function updateItemsPerView() {
		if (window.innerWidth <= 600) itemsPerView = 1;
		else if (window.innerWidth <= 900) itemsPerView = 2;
		else itemsPerView = 3;
	}

	function createDots() {
		updateItemsPerView();
		const totalDots = Math.ceil(items.length / itemsPerView);
		dotsContainer.innerHTML = '';
		for (let i = 0; i < totalDots; i++) {
			const dot = document.createElement('div');
			dot.className = 'carousel-dot' + (i === 0 ? ' active' : '');
			dot.onclick = () => goToSlide(i);
			dotsContainer.appendChild(dot);
		}
	}

	function updateCarousel() {
		updateItemsPerView();
		const itemWidth = items[0].offsetWidth + 20;
		const maxIndex = Math.max(0, items.length - itemsPerView);
		window.currentIndex = Math.min(window.currentIndex, maxIndex);
		track.style.transform = `translateX(-${window.currentIndex * itemWidth}px)`;

		const dots = document.querySelectorAll('.carousel-dot');
		dots.forEach((dot, i) => {
			dot.classList.toggle('active', i === Math.floor(window.currentIndex / itemsPerView));
		});
	}

	window.moveCarousel = function(direction) {
		updateItemsPerView();
		const maxIndex = Math.max(0, items.length - itemsPerView);
		window.currentIndex = Math.min(Math.max(0, window.currentIndex + direction * itemsPerView), maxIndex);
		updateCarousel();
	};

	window.goToSlide = function(index) {
		updateItemsPerView();
		window.currentIndex = index * itemsPerView;
		updateCarousel();
	};

	window.addEventListener('resize', () => {
		updateCarousel();
		createDots();
	});

	createDots();
	updateCarousel();

	// Initialize carousels for each category-carousel block
	function initCategoryCarousel(carouselEl) {
		const track = carouselEl.querySelector('.carousel-track');
		const dotsContainer = carouselEl.querySelector('.carousel-dots');
		const items = carouselEl.querySelectorAll('.carousel-item');
		const prevBtn = carouselEl.querySelector('.carousel-btn.prev');
		const nextBtn = carouselEl.querySelector('.carousel-btn.next');
		let currentIndex = 0;
		let itemsPerView = 3;

		function updateItemsPerViewLocal() {
			if (window.innerWidth <= 600) itemsPerView = 1;
			else if (window.innerWidth <= 900) itemsPerView = 2;
			else itemsPerView = 3;
		}

		function createDotsLocal() {
			updateItemsPerViewLocal();
			if (!dotsContainer) return;
			const totalDots = Math.ceil(items.length / itemsPerView);
			dotsContainer.innerHTML = '';
			for (let i = 0; i < totalDots; i++) {
				const dot = document.createElement('div');
				dot.className = 'carousel-dot' + (i === 0 ? ' active' : '');
				dot.onclick = () => goToSlideLocal(i);
				dotsContainer.appendChild(dot);
			}
		}

		function updateCarouselLocal() {
			updateItemsPerViewLocal();
			if (!items || items.length === 0) return;
			const itemWidth = items[0].offsetWidth + 20;
			const maxIndex = Math.max(0, items.length - itemsPerView);
			currentIndex = Math.min(currentIndex, maxIndex);
			if (track) track.style.transform = `translateX(-${currentIndex * itemWidth}px)`;

			if (!dotsContainer) return;
			const dots = dotsContainer.querySelectorAll('.carousel-dot');
			dots.forEach((dot, i) => {
				dot.classList.toggle('active', i === Math.floor(currentIndex / itemsPerView));
			});
		}

		function moveLocal(direction) {
			updateItemsPerViewLocal();
			const maxIndex = Math.max(0, items.length - itemsPerView);
			currentIndex = Math.min(Math.max(0, currentIndex + direction * itemsPerView), maxIndex);
			updateCarouselLocal();
		}

		function goToSlideLocal(index) {
			updateItemsPerViewLocal();
			currentIndex = index * itemsPerView;
			updateCarouselLocal();
		}

		if (prevBtn) prevBtn.addEventListener('click', () => moveLocal(-1));
		if (nextBtn) nextBtn.addEventListener('click', () => moveLocal(1));

		window.addEventListener('resize', () => { updateCarouselLocal(); createDotsLocal(); });

		createDotsLocal();
		updateCarouselLocal();
	}

	document.querySelectorAll('.category-carousel').forEach(initCategoryCarousel);

	// CURRENCY & CART
	const currencyFormatter = new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' });
	document.querySelectorAll('.price').forEach(p => {
		const raw = p.textContent || '';
		const num = parseFloat(raw.replace(/[^0-9.]/g, '')) || 0;
		p.textContent = currencyFormatter.format(num);
	});

	const cartTotalEl = document.getElementById('cartTotal');
	if (cartTotalEl) cartTotalEl.textContent = currencyFormatter.format(0);

	(function(){
		const cart = {};
		const cartCountEl = document.getElementById('cartCount');
		const cartItemsEl = document.getElementById('cartItems');
		const checkoutBtn = document.getElementById('checkoutBtn');

		function updateCartUI() {
			const totalQty = Object.values(cart).reduce((s, it) => s + it.qty, 0);
			if (cartCountEl) cartCountEl.textContent = totalQty;

			if (!cartItemsEl) return;

			if (totalQty === 0) {
				cartItemsEl.innerHTML = '<div class="cart-empty"><i class="fas fa-shopping-bag"></i><p>Your cart is empty</p></div>';
				if (checkoutBtn) checkoutBtn.disabled = true;
				if (cartTotalEl) cartTotalEl.textContent = currencyFormatter.format(0);
				return;
			}

			if (checkoutBtn) checkoutBtn.disabled = false;
			cartItemsEl.innerHTML = '';
			let total = 0;
			Object.values(cart).forEach(item => {
				total += item.price * item.qty;
				const itemEl = document.createElement('div');
				itemEl.className = 'cart-item';
				itemEl.innerHTML = `
					<img src="${item.image}" alt="${escapeHtml(item.name)}">
					<div class="cart-item-info">
						<h4>${escapeHtml(item.name)}</h4>
						<div class="item-price">${currencyFormatter.format(item.price)}</div>
						<div class="cart-item-quantity">
							<button class="qty-btn" data-action="decrease" data-id="${item.id}">-</button>
							<div class="qty">${item.qty}</div>
							<button class="qty-btn" data-action="increase" data-id="${item.id}">+</button>
							<button class="cart-item-remove" data-action="remove" data-id="${item.id}"><i class="fas fa-trash-alt"></i></button>
						</div>
					</div>
				`;
				cartItemsEl.appendChild(itemEl);
			});
			if (cartTotalEl) cartTotalEl.textContent = currencyFormatter.format(total);
		}

		function escapeHtml(text) {
			return text
				.replace(/&/g, "&amp;")
				.replace(/</g, "&lt;")
				.replace(/>/g, "&gt;")
				.replace(/\"/g, "&quot;")
				.replace(/'/g, "&#039;");
		}

		window.toggleCart = function() {
			const overlay = document.getElementById('cartOverlay');
			const sidebar = document.getElementById('cartSidebar');
			if (overlay) overlay.classList.toggle('active');
			if (sidebar) sidebar.classList.toggle('active');
		};

		window.addToCart = function(buttonEl) {
			const card = buttonEl.closest('.carousel-item');
			if (!card) return;
			const id = card.dataset.id;
			const name = card.dataset.name || 'Item';
			const price = parseFloat(card.dataset.price) || 0;
			const image = card.dataset.image || (card.querySelector('img') ? card.querySelector('img').src : '');

			if (cart[id]) cart[id].qty += 1;
			else cart[id] = { id, name, price, image, qty: 1 };

			buttonEl.classList.add('added');
			setTimeout(() => buttonEl.classList.remove('added'), 800);

			updateCartUI();
		};

		if (cartItemsEl) {
			cartItemsEl.addEventListener('click', (e) => {
				const btn = e.target.closest('[data-action]');
				if (!btn) return;
				const action = btn.dataset.action;
				const id = btn.dataset.id;
				if (!id || !cart[id]) return;

				if (action === 'increase') cart[id].qty += 1;
				else if (action === 'decrease') cart[id].qty = Math.max(1, cart[id].qty - 1);
				else if (action === 'remove') delete cart[id];

				updateCartUI();
			});
		}

		window.checkout = function() {
			const total = Object.values(cart).reduce((s, it) => s + it.price * it.qty, 0);
			if (total <= 0) { alert('Your cart is empty.'); return; }
			alert('Proceeding to checkout. Total: ' + currencyFormatter.format(total));
			for (const k of Object.keys(cart)) delete cart[k];
			updateCartUI();
			window.toggleCart();
		};

		updateCartUI();
	})();

	// HAMBURGER / SIDE MENU
	const hamburgerBtn = document.getElementById('hamburgerBtn');
	const sideMenu = document.getElementById('sideMenu');
	const sideClose = document.getElementById('sideClose');
	const menuOverlay = document.getElementById('menuOverlay');

	function openMenu() {
		if (sideMenu) sideMenu.classList.add('open');
		if (menuOverlay) menuOverlay.classList.add('visible');
		if (sideMenu) sideMenu.setAttribute('aria-hidden', 'false');
		if (menuOverlay) menuOverlay.setAttribute('aria-hidden', 'false');
	}

	function closeMenu() {
		if (sideMenu) sideMenu.classList.remove('open');
		if (menuOverlay) menuOverlay.classList.remove('visible');
		if (sideMenu) sideMenu.setAttribute('aria-hidden', 'true');
		if (menuOverlay) menuOverlay.setAttribute('aria-hidden', 'true');
	}

	if (hamburgerBtn) hamburgerBtn.addEventListener('click', openMenu);
	if (sideClose) sideClose.addEventListener('click', closeMenu);
	if (menuOverlay) menuOverlay.addEventListener('click', closeMenu);

	document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeMenu(); });

	// CATEGORY MENU: wire category buttons to scroll to their carousel
	document.querySelectorAll('.category-btn').forEach(btn => {
		btn.addEventListener('click', () => {
			document.querySelectorAll('.category-btn').forEach(b => b.classList.remove('active'));
			btn.classList.add('active');
			const cat = btn.dataset.category;
			const targetId = cat === 'all' ? 'shop' : 'shop-' + cat;
			const target = document.getElementById(targetId);
			if (target) {
				// compute offset for fixed header + category menu so target isn't hidden
				const nav = document.querySelector('nav');
				const catMenu = document.getElementById('categoryMenu');
				const navH = nav ? nav.offsetHeight : 0;
				const menuH = catMenu ? catMenu.offsetHeight : 0;
				const extra = 12; // small gap
				const top = target.getBoundingClientRect().top + window.pageYOffset - (navH + menuH + extra);
				window.scrollTo({ top, behavior: 'smooth' });
			}
		});
	});

	// make side menu category links behave the same (trigger category button)
	document.querySelectorAll('#sideMenu a[data-category]').forEach(a => {
		a.addEventListener('click', (e) => {
			closeMenu();
			const cat = a.dataset.category;
			const btn = document.querySelector('.category-btn[data-category="' + cat + '"]');
			if (btn) btn.click();
			else {
				const shop = document.getElementById('shop');
				if (shop) {
					const nav = document.querySelector('nav');
					const catMenu = document.getElementById('categoryMenu');
					const navH = nav ? nav.offsetHeight : 0;
					const menuH = catMenu ? catMenu.offsetHeight : 0;
					const top = shop.getBoundingClientRect().top + window.pageYOffset - (navH + menuH + 12);
					window.scrollTo({ top, behavior: 'smooth' });
				}
			}
		});
	});

	// Reveal scroll-animated elements when they enter the viewport
	(function setupScrollReveal(){
		const els = document.querySelectorAll('.scroll-animate');
		if ('IntersectionObserver' in window) {
			const io = new IntersectionObserver((entries) => {
				entries.forEach(en => {
					if (en.isIntersecting) {
						en.target.classList.add('visible');
						io.unobserve(en.target);
					}
				});
			}, { threshold: 0.12 });
			els.forEach(e => io.observe(e));
		} else {
			// fallback: make all visible after a short delay
			setTimeout(() => els.forEach(e => e.classList.add('visible')), 500);
		}
	})();
});

