/* =============================================
   script.js — Formality Clothing
   Handles: nav toggle, dynamic products, search/filter,
   gallery + lightbox, tabs, accordion, store map,
   form validation + simulated AJAX submission
   ============================================= */

/* ---------- PRODUCT DATA (used for dynamic loading) ---------- */
const PRODUCTS = [
  {
    id: "p1",
    name: "Classic Blue Suit",
    category: "suits",
    price: 1999,
    image: "Suit.png",
    alt: "Classic navy blue formal suit on a tailor's mannequin"
  },
  {
    id: "p2",
    name: "Formal Blazer",
    category: "suits",
    price: 1299,
    image: "Black Suit.webp",
    alt: "Black formal blazer for business and special occasions"
  },
  {
    id: "p3",
    name: "Silk Tie",
    category: "accessories",
    price: 299,
    image: "Grey Suit.webp",
    alt: "Grey silk tie formal accessory"
  },
  {
    id: "p4",
    name: "Leather Shoes",
    category: "shoes",
    price: 1499,
    image: "Shoes.webp",
    alt: "Polished brown leather formal shoes"
  }
];

document.addEventListener("DOMContentLoaded", function () {

  /* ---------- MOBILE NAV TOGGLE ---------- */
  const navToggle = document.querySelector(".nav-toggle");
  const nav = document.querySelector("header nav");

  if (navToggle && nav) {
    navToggle.addEventListener("click", function () {
      nav.classList.toggle("open");
    });
  }

  /* ---------- DYNAMIC PRODUCT TABLE + SEARCH/FILTER/SORT ---------- */
  const tableBody = document.getElementById("productTableBody");
  const searchInput = document.getElementById("productSearch");
  const categoryFilter = document.getElementById("categoryFilter");
  const sortOrder = document.getElementById("sortOrder");
  const noResults = document.getElementById("noResults");
  let cartCount = 0;
  const cartCounterEl = document.querySelector(".cart-count");

  function renderProducts() {
    if (!tableBody) return;

    let list = [...PRODUCTS];

    // Filter by search text
    const query = (searchInput && searchInput.value.trim().toLowerCase()) || "";
    if (query) {
      list = list.filter(p => p.name.toLowerCase().includes(query));
    }

    // Filter by category
    const category = (categoryFilter && categoryFilter.value) || "all";
    if (category !== "all") {
      list = list.filter(p => p.category === category);
    }

    // Sort
    const sort = (sortOrder && sortOrder.value) || "default";
    if (sort === "low-high") list.sort((a, b) => a.price - b.price);
    if (sort === "high-low") list.sort((a, b) => b.price - a.price);

    tableBody.innerHTML = "";

    if (list.length === 0) {
      if (noResults) noResults.hidden = false;
      return;
    }
    if (noResults) noResults.hidden = true;

    list.forEach(product => {
      const row = document.createElement("tr");
      row.innerHTML = `
        <td>${product.name}</td>
        <td><img src="${product.image}" alt="${product.alt}" loading="lazy"></td>
        <td>R${product.price.toLocaleString()}</td>
        <td><button class="btn add-to-cart" data-id="${product.id}">Add to Cart</button></td>
      `;
      tableBody.appendChild(row);
    });

    attachCartListeners();
  }

  function attachCartListeners() {
    document.querySelectorAll(".add-to-cart").forEach(button => {
      button.addEventListener("click", function () {
        cartCount++;
        if (cartCounterEl) cartCounterEl.textContent = cartCount;

        const originalText = button.textContent;
        button.textContent = "Added ✓";
        button.disabled = true;

        setTimeout(() => {
          button.textContent = originalText;
          button.disabled = false;
        }, 1200);
      });
    });
  }

  if (tableBody) {
    renderProducts();
    if (searchInput) searchInput.addEventListener("input", renderProducts);
    if (categoryFilter) categoryFilter.addEventListener("change", renderProducts);
    if (sortOrder) sortOrder.addEventListener("change", renderProducts);
  } else {
    // Fallback: attach cart listeners to any static Add to Cart buttons
    attachCartListeners();
  }

  /* ---------- PRODUCT GALLERY + LIGHTBOX ---------- */
  const galleryEl = document.getElementById("productGallery");
  const lightbox = document.getElementById("lightbox");
  const lightboxImg = document.getElementById("lightboxImg");
  const lightboxCaption = document.getElementById("lightboxCaption");
  const lightboxClose = document.getElementById("lightboxClose");

  if (galleryEl) {
    PRODUCTS.forEach(product => {
      const img = document.createElement("img");
      img.src = product.image;
      img.alt = product.alt;
      img.dataset.caption = product.name;
      galleryEl.appendChild(img);
    });

    galleryEl.addEventListener("click", function (e) {
      if (e.target.tagName === "IMG") {
        lightboxImg.src = e.target.src;
        lightboxImg.alt = e.target.alt;
        lightboxCaption.textContent = e.target.dataset.caption || "";
        lightbox.classList.add("open");
      }
    });
  }

  if (lightboxClose) {
    lightboxClose.addEventListener("click", () => lightbox.classList.remove("open"));
  }
  if (lightbox) {
    lightbox.addEventListener("click", function (e) {
      if (e.target === lightbox) lightbox.classList.remove("open");
    });
  }
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && lightbox) lightbox.classList.remove("open");
  });

  /* ---------- TABS ---------- */
  const tabButtons = document.querySelectorAll(".tab-btn");
  const tabPanels = document.querySelectorAll(".tab-panel");

  tabButtons.forEach(btn => {
    btn.addEventListener("click", function () {
      tabButtons.forEach(b => b.classList.remove("active"));
      tabPanels.forEach(p => p.classList.remove("active"));

      btn.classList.add("active");
      const target = document.getElementById(btn.dataset.tab);
      if (target) target.classList.add("active");
    });
  });

  /* ---------- ACCORDION ---------- */
  document.querySelectorAll(".accordion-header").forEach(header => {
    header.addEventListener("click", function () {
      const body = header.nextElementSibling;
      const isOpen = header.classList.contains("open");

      // Close all
      document.querySelectorAll(".accordion-header").forEach(h => {
        h.classList.remove("open");
        h.nextElementSibling.style.maxHeight = null;
      });

      // Open clicked one (if it wasn't already open)
      if (!isOpen) {
        header.classList.add("open");
        body.style.maxHeight = body.scrollHeight + "px";
      }
    });
  });

  /* ---------- STORE LOCATIONS MAP (Leaflet) ---------- */
  const mapEl = document.getElementById("storeMap");
  if (mapEl && typeof L !== "undefined") {
    const map = L.map("storeMap").setView([-33.85, 23.9], 6);

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "&copy; OpenStreetMap contributors",
      maxZoom: 18
    }).addTo(map);

    const stores = [
      { name: "Port Elizabeth Branch", coords: [-33.9608, 25.6022] },
      { name: "Cape Town Branch", coords: [-33.9249, 18.4241] }
    ];

    const bounds = [];
    stores.forEach(store => {
      L.marker(store.coords).addTo(map).bindPopup(`<strong>${store.name}</strong>`);
      bounds.push(store.coords);
    });

    map.fitBounds(bounds, { padding: [40, 40] });
  }

  /* ---------- FORM VALIDATION + SIMULATED AJAX SUBMISSION ---------- */
  const forms = document.querySelectorAll("form");

  forms.forEach(function (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      clearErrors(form);

      let isValid = true;

      const nameField = form.querySelector('input[name="name"]');
      const emailField = form.querySelector('input[name="email"]');
      const detailsField = form.querySelector('textarea[name="details"], textarea[name="message"]');

      if (nameField && nameField.value.trim() === "") {
        showError(nameField, "Please enter your name.");
        isValid = false;
      }

      if (emailField) {
        const emailValue = emailField.value.trim();
        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (emailValue === "") {
          showError(emailField, "Please enter your email.");
          isValid = false;
        } else if (!emailPattern.test(emailValue)) {
          showError(emailField, "Please enter a valid email address.");
          isValid = false;
        }
      }

      if (detailsField && detailsField.value.trim() === "") {
        showError(detailsField, "Please enter your message.");
        isValid = false;
      }

      if (isValid) {
        // Special handling: Contact form compiles a message and opens
        // the user's email client addressed to the recipient.
        if (form.id === "contactForm") {
          sendContactEmail(form);
        } else {
          submitFormAsync(form);
        }
      }
    });
  });

  function sendContactEmail(form) {
    const name = form.querySelector('input[name="name"]').value.trim();
    const email = form.querySelector('input[name="email"]').value.trim();
    const typeSelect = form.querySelector('select[name="messageType"]');
    const type = typeSelect ? typeSelect.options[typeSelect.selectedIndex].text : "General Question";
    const message = form.querySelector('textarea[name="message"]').value.trim();

    const recipient = "info@formality.co.za";
    const subject = encodeURIComponent(`Website Enquiry: ${type}`);
    const body = encodeURIComponent(
      `Name: ${name}\nEmail: ${email}\nMessage Type: ${type}\n\nMessage:\n${message}`
    );

    window.location.href = `mailto:${recipient}?subject=${subject}&body=${body}`;

    showSuccessMessage(form);
    form.reset();
  }

  function showError(field, message) {
    field.style.borderColor = "#c0392b";
    const error = document.createElement("p");
    error.className = "field-error";
    error.style.color = "#c0392b";
    error.style.fontSize = "0.78rem";
    error.style.marginTop = "4px";
    error.textContent = message;
    field.insertAdjacentElement("afterend", error);
  }

  function clearErrors(form) {
    form.querySelectorAll(".field-error").forEach(el => el.remove());
    form.querySelectorAll("input, textarea, select").forEach(el => (el.style.borderColor = ""));
    const oldSuccess = form.querySelector(".form-success");
    if (oldSuccess) oldSuccess.remove();
  }

  /* Simulates an AJAX submission (no real backend) so the page
     does not reload and the user gets instant feedback. */
  function submitFormAsync(form) {
    const submitBtn = form.querySelector('button[type="submit"]');
    const originalText = submitBtn ? submitBtn.textContent : "";
    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.textContent = "Sending...";
    }

    setTimeout(function () {
      showSuccessMessage(form);
      form.reset();
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.textContent = originalText;
      }
    }, 800);
  }

  function showSuccessMessage(form) {
    const success = document.createElement("p");
    success.className = "form-success";
    success.style.color = "#1a7a3c";
    success.style.fontSize = "0.85rem";
    success.style.marginTop = "12px";
    success.textContent = "Thank you! Your message has been sent successfully.";
    form.appendChild(success);
  }

});