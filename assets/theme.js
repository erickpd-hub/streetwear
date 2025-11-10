/**
 * Theme JavaScript
 * Handles navbar scroll effect, theme toggle, and cart functionality
 */

(function() {
  'use strict';

  // Theme State
  let isDark = localStorage.getItem('theme') === 'dark';

  // Initialize theme on load
  function initTheme() {
    if (isDark) {
      document.documentElement.classList.add('dark');
      updateThemeIcon(true);
    } else {
      document.documentElement.classList.remove('dark');
      updateThemeIcon(false);
    }
    updateNavbarColors();
  }

  // Update theme icon
  function updateThemeIcon(isDarkMode) {
    const sunIcons = document.querySelectorAll('.sun-icon');
    const moonIcons = document.querySelectorAll('.moon-icon');
    
    if (isDarkMode) {
      sunIcons.forEach(icon => icon.classList.remove('hidden'));
      moonIcons.forEach(icon => icon.classList.add('hidden'));
    } else {
      sunIcons.forEach(icon => icon.classList.add('hidden'));
      moonIcons.forEach(icon => icon.classList.remove('hidden'));
    }
  }

  // Toggle theme
  function toggleTheme() {
    isDark = !isDark;
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
    
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    
    updateThemeIcon(isDark);
    updateNavbarColors();
  }

  // Navbar scroll effect
  let isScrolled = false;

  function handleScroll() {
    const scrollPosition = window.scrollY;
    // El navbar es transparente cuando está en el top (scroll = 0)
    // Solo muestra fondo cuando hay scroll significativo
    const newIsScrolled = scrollPosition > 10;

    if (newIsScrolled !== isScrolled) {
      isScrolled = newIsScrolled;
      updateNavbar();
    }
  }

  function updateNavbar() {
    const navbar = document.querySelector('[data-navbar]');
    const header = document.querySelector('.site-header');
    if (!navbar || !header) return;

    if (isScrolled) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }

    updateNavbarColors();
  }

  function updateNavbarColors() {
    const navbar = document.querySelector('[data-navbar]');
    if (!navbar) return;

    const logoText = navbar.querySelector('.logo-text');
    const navLinks = navbar.querySelectorAll('.nav-link');
    const btnIcons = navbar.querySelectorAll('.btn-icon');

    const textColor = isScrolled 
      ? (isDark ? 'text-white' : 'text-black')
      : 'text-white';

    const hoverColor = 'hover:text-red-500';

    // Update logo text
    if (logoText) {
      logoText.className = `logo-text ${textColor}`;
    }

    // Update nav links
    navLinks.forEach(link => {
      link.className = `nav-link transition-colors ${hoverColor} ${textColor}`;
    });

    // Update icon buttons
    btnIcons.forEach(btn => {
      btn.className = `btn-icon transition-colors ${hoverColor} ${textColor}`;
    });
  }

  // Add to cart functionality
  function initAddToCart() {
    document.addEventListener('submit', function(e) {
      if (e.target.classList.contains('add-to-cart-form')) {
        e.preventDefault();
        
        const form = e.target;
        const formData = new FormData(form);
        const button = form.querySelector('button[type="submit"]');
        const originalText = button.innerHTML;

        button.disabled = true;
        button.innerHTML = 'Agregando...';

        fetch(window.routes.cart_add_url, {
          method: 'POST',
          body: formData
        })
        .then(response => response.json())
        .then(data => {
          // Update cart count
          updateCartCount();
          
          // Reset button
          button.disabled = false;
          button.innerHTML = '✓ Agregado';
          
          setTimeout(() => {
            button.innerHTML = originalText;
          }, 2000);
        })
        .catch(error => {
          console.error('Error:', error);
          button.disabled = false;
          button.innerHTML = originalText;
          alert('Error al agregar al carrito');
        });
      }
    });
  }

  // Update cart count
  function updateCartCount() {
    fetch(window.shopUrl + '/cart.js')
      .then(response => response.json())
      .then(cart => {
        const cartCountElements = document.querySelectorAll('[data-cart-count]');
        cartCountElements.forEach(element => {
          element.textContent = cart.item_count;
          
          if (cart.item_count > 0) {
            element.classList.remove('hidden');
          } else {
            element.classList.add('hidden');
          }
        });
      })
      .catch(error => console.error('Error updating cart count:', error));
  }

  // Initialize on DOM ready
  function init() {
    initTheme();
    initAddToCart();
    updateCartCount();

    // Event listeners
    window.addEventListener('scroll', handleScroll);
    
    // Theme toggle
    const themeToggle = document.querySelector('[data-theme-toggle]');
    if (themeToggle) {
      themeToggle.addEventListener('click', toggleTheme);
    }

    // Initial navbar state
    handleScroll();
  }

  // Run on load
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  // Re-initialize on section load (for theme editor)
  document.addEventListener('shopify:section:load', function() {
    initTheme();
    updateCartCount();
  });

})();
