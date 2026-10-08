/**
 * TN DAWKI NIGHT CAMPING MEGHALAYA - JAVASCRIPT
 * Vanilla JavaScript. No external libraries, no frameworks, no localStorage.
 */

/* ============================================================================
   IMAGE REGISTRY (LOCAL IMAGES)
   To swap in your real photography, simply place your photos inside the
   `images/` folder with these filenames or change the paths below!
   ============================================================================ */
const SITE_IMAGES = {
  hero: [
    { url: "images/hero-1.jpg", alt: "Blue dome tents beside the clear Dawki river", title: "Dome tents by the river" },
    { url: "images/hero-2.jpg", alt: "Red tents reflected in still river water", title: "Red tents and reflections" },
    { url: "images/hero-3.jpg", alt: "Wooden boat on the green Dawki river", title: "Boating on Dawki" },
    { url: "images/hero-4.jpg", alt: "Tents lit by string lights at night", title: "The camp at night" }
  ],
  gallery: [
    "images/gallery-1.jpg", "images/gallery-2.jpg", "images/gallery-3.jpg", "images/gallery-4.jpg",
    "images/gallery-5.jpg", "images/gallery-6.jpg", "images/gallery-7.jpg", "images/gallery-8.jpg"
  ]
};

/* ============================================================================
   INITIALIZATION
   ============================================================================ */
function runInit() {
  initMobileNav();
  initHeroSlider();
  initBookingForm();
  initGalleryLightbox();
  initFaqAccordion();
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", runInit);
} else {
  runInit();
}

/* ============================================================================
   1. MOBILE NAVIGATION
   ============================================================================ */
function initMobileNav() {
  const toggleBtn = document.getElementById("mobile-menu-toggle");
  const mobileNav = document.getElementById("mobile-nav");
  if (!toggleBtn || !mobileNav) return;

  function toggleMenu(show) {
    const isExpanded = show !== undefined ? show : toggleBtn.getAttribute("aria-expanded") !== "true";
    toggleBtn.setAttribute("aria-expanded", String(isExpanded));
    mobileNav.hidden = !isExpanded;
  }

  toggleBtn.addEventListener("click", () => {
    toggleMenu();
  });

  mobileNav.querySelectorAll(".mobile-nav-link, .btn").forEach(link => {
    link.addEventListener("click", () => {
      toggleMenu(false);
    });
  });

  window.addEventListener("resize", () => {
    if (window.innerWidth >= 900 && !mobileNav.hidden) {
      toggleMenu(false);
    }
  });
}

/* ============================================================================
   2. HERO SLIDER
   - 4 slides
   - Autoplay 5s with pause on hover/touch
   - Touch swipe support
   - Dots and arrows
   - Keyboard navigation
   ============================================================================ */
function initHeroSlider() {
  const sliderContainer = document.querySelector(".hero-section");
  const slides = document.querySelectorAll(".hero-slide");
  const dots = document.querySelectorAll(".slider-dot");
  const prevBtn = document.getElementById("slider-prev");
  const nextBtn = document.getElementById("slider-next");

  if (!slides.length) return;

  let currentIndex = 0;
  let autoplayTimer = null;
  const AUTOPLAY_INTERVAL = 5000;
  let isPaused = false;

  function goToSlide(index) {
    if (index < 0) {
      currentIndex = slides.length - 1;
    } else if (index >= slides.length) {
      currentIndex = 0;
    } else {
      currentIndex = index;
    }

    slides.forEach((slide, i) => {
      if (i === currentIndex) {
        slide.classList.add("active");
        slide.setAttribute("aria-hidden", "false");
      } else {
        slide.classList.remove("active");
        slide.setAttribute("aria-hidden", "true");
      }
    });

    dots.forEach((dot, i) => {
      if (i === currentIndex) {
        dot.classList.add("active");
        dot.setAttribute("aria-selected", "true");
      } else {
        dot.classList.remove("active");
        dot.setAttribute("aria-selected", "false");
      }
    });
  }

  function nextSlide() {
    goToSlide(currentIndex + 1);
  }

  function prevSlide() {
    goToSlide(currentIndex - 1);
  }

  function startAutoplay() {
    stopAutoplay();
    autoplayTimer = setInterval(() => {
      if (!isPaused) {
        nextSlide();
      }
    }, AUTOPLAY_INTERVAL);
  }

  function stopAutoplay() {
    if (autoplayTimer) {
      clearInterval(autoplayTimer);
      autoplayTimer = null;
    }
  }

  if (prevBtn) {
    prevBtn.addEventListener("click", () => {
      prevSlide();
      startAutoplay();
    });
  }

  if (nextBtn) {
    nextBtn.addEventListener("click", () => {
      nextSlide();
      startAutoplay();
    });
  }

  dots.forEach((dot, index) => {
    dot.addEventListener("click", () => {
      goToSlide(index);
      startAutoplay();
    });
  });

  if (sliderContainer) {
    sliderContainer.addEventListener("mouseenter", () => { isPaused = true; });
    sliderContainer.addEventListener("mouseleave", () => { isPaused = false; });
    sliderContainer.addEventListener("focusin", () => { isPaused = true; });
    sliderContainer.addEventListener("focusout", () => { isPaused = false; });

    let touchStartX = 0;
    let touchEndX = 0;

    sliderContainer.addEventListener("touchstart", (e) => {
      isPaused = true;
      touchStartX = e.changedTouches[0].screenX;
    }, { passive: true });

    sliderContainer.addEventListener("touchend", (e) => {
      touchEndX = e.changedTouches[0].screenX;
      isPaused = false;
      const swipeDistance = touchEndX - touchStartX;
      if (swipeDistance > 45) {
        prevSlide();
      } else if (swipeDistance < -45) {
        nextSlide();
      }
      startAutoplay();
    }, { passive: true });

    sliderContainer.addEventListener("keydown", (e) => {
      if (e.key === "ArrowLeft") {
        prevSlide();
        startAutoplay();
      } else if (e.key === "ArrowRight") {
        nextSlide();
        startAutoplay();
      }
    });
  }

  goToSlide(0);
  startAutoplay();
}

/* ============================================================================
   3. BOOKING FORM
   - Rate: Rs 1400 / person
   - Block past dates (min = today)
   - Live total calculation
   - Stepper +/- buttons
   - WhatsApp redirect
   ============================================================================ */
function initBookingForm() {
  const form = document.getElementById("booking-form");
  const nameInput = document.getElementById("book-name");
  const dateInput = document.getElementById("book-date");
  const guestsInput = document.getElementById("book-guests");
  const messageInput = document.getElementById("book-message");
  const minusBtn = document.getElementById("guest-minus");
  const plusBtn = document.getElementById("guest-plus");
  const totalDisplay = document.getElementById("live-total-display");
  const breakdownDisplay = document.getElementById("live-breakdown-display");
  const successNote = document.getElementById("booking-success-note");

  const nameError = document.getElementById("name-error");
  const dateError = document.getElementById("date-error");
  const guestsError = document.getElementById("guests-error");

  const PRICE_PER_PERSON = 1400;

  if (dateInput) {
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, "0");
    const dd = String(today.getDate()).padStart(2, "0");
    dateInput.min = `${yyyy}-${mm}-${dd}`;

    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomYyyy = tomorrow.getFullYear();
    const tomMm = String(tomorrow.getMonth() + 1).padStart(2, "0");
    const tomDd = String(tomorrow.getDate()).padStart(2, "0");
    dateInput.value = `${tomYyyy}-${tomMm}-${tomDd}`;
  }

  function updateLiveTotal() {
    let guests = parseInt(guestsInput.value, 10);
    if (isNaN(guests) || guests < 1) {
      guests = 1;
    }
    const total = guests * PRICE_PER_PERSON;
    const formattedTotal = total.toLocaleString("en-IN");

    if (totalDisplay) {
      totalDisplay.textContent = `Rs ${formattedTotal}`;
    }
    if (breakdownDisplay) {
      breakdownDisplay.textContent = `Rs 1,400 × ${guests} ${guests === 1 ? 'guest' : 'guests'}`;
    }
  }

  if (guestsInput) {
    guestsInput.addEventListener("input", updateLiveTotal);
    guestsInput.addEventListener("change", () => {
      if (parseInt(guestsInput.value, 10) < 1) {
        guestsInput.value = 1;
      }
      updateLiveTotal();
    });
  }

  if (minusBtn && guestsInput) {
    minusBtn.addEventListener("click", () => {
      let current = parseInt(guestsInput.value, 10) || 1;
      if (current > 1) {
        guestsInput.value = current - 1;
        updateLiveTotal();
      }
    });
  }

  if (plusBtn && guestsInput) {
    plusBtn.addEventListener("click", () => {
      let current = parseInt(guestsInput.value, 10) || 1;
      guestsInput.value = current + 1;
      updateLiveTotal();
    });
  }

  updateLiveTotal();

  if (form) {
    form.addEventListener("submit", (e) => {
      e.preventDefault();

      let hasError = false;

      const nameVal = nameInput ? nameInput.value.trim() : "";
      if (!nameVal) {
        if (nameError) nameError.classList.add("show");
        if (nameInput) nameInput.focus();
        hasError = true;
      } else {
        if (nameError) nameError.classList.remove("show");
      }

      const dateVal = dateInput ? dateInput.value : "";
      if (!dateVal) {
        if (dateError) dateError.classList.add("show");
        if (!hasError && dateInput) dateInput.focus();
        hasError = true;
      } else {
        if (dateError) dateError.classList.remove("show");
      }

      const guestsVal = parseInt(guestsInput ? guestsInput.value : "1", 10);
      if (isNaN(guestsVal) || guestsVal < 1) {
        if (guestsError) guestsError.classList.add("show");
        if (!hasError && guestsInput) guestsInput.focus();
        hasError = true;
      } else {
        if (guestsError) guestsError.classList.remove("show");
      }

      if (hasError) return;

      const noteVal = messageInput && messageInput.value.trim() ? messageInput.value.trim() : "None";
      const totalAmount = guestsVal * PRICE_PER_PERSON;

      const messageText = [
        "Hi, I want to book Dawki night camping.",
        `Name: ${nameVal}`,
        `Date: ${dateVal}`,
        `Guests: ${guestsVal}`,
        `Total: Rs ${totalAmount}`,
        `Note: ${noteVal}`
      ].join("\n");

      const waUrl = `https://wa.me/919954943807?text=${encodeURIComponent(messageText)}`;

      if (successNote) {
        successNote.hidden = false;
        successNote.scrollIntoView({ behavior: "smooth", block: "nearest" });
      }

      window.open(waUrl, "_blank", "noopener,noreferrer");
    });
  }
}

/* ============================================================================
   4. GALLERY & LIGHTBOX
   ============================================================================ */
function initGalleryLightbox() {
  const modal = document.getElementById("lightbox-modal");
  const modalImg = document.getElementById("lightbox-img");
  const modalCaption = document.getElementById("lightbox-caption");
  const closeBtn = document.getElementById("lightbox-close");
  const backdrop = document.getElementById("lightbox-backdrop");
  const galleryItems = document.querySelectorAll(".gallery-item");

  if (!modal || !modalImg || !closeBtn) return;

  function openLightbox(src, caption, alt) {
    modalImg.src = src;
    modalImg.alt = alt || caption || "Dawki camping view";
    if (modalCaption) {
      modalCaption.textContent = caption || "";
    }
    modal.hidden = false;
    document.body.style.overflow = "hidden";
    closeBtn.focus();
  }

  const TRANSPARENT_PIXEL = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg'/%3E";

  function closeLightbox() {
    modal.hidden = true;
    modalImg.src = TRANSPARENT_PIXEL;
    document.body.style.overflow = "";
  }

  galleryItems.forEach(item => {
    item.addEventListener("click", () => {
      const img = item.querySelector("img");
      const caption = item.getAttribute("data-caption");
      if (img) {
        openLightbox(img.src, caption || img.alt, img.alt);
      }
    });

    item.setAttribute("tabindex", "0");
    item.setAttribute("role", "button");
    item.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        item.click();
      }
    });
  });

  closeBtn.addEventListener("click", closeLightbox);
  if (backdrop) {
    backdrop.addEventListener("click", closeLightbox);
  }

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && !modal.hidden) {
      closeLightbox();
    }
  });
}

/* ============================================================================
   5. FAQ ACCORDION
   ============================================================================ */
function initFaqAccordion() {
  const faqItems = document.querySelectorAll(".faq-item");

  faqItems.forEach(item => {
    const questionBtn = item.querySelector(".faq-question");
    if (!questionBtn) return;

    questionBtn.addEventListener("click", () => {
      const isActive = item.classList.contains("active");

      faqItems.forEach(other => {
        if (other !== item) {
          other.classList.remove("active");
          const otherBtn = other.querySelector(".faq-question");
          if (otherBtn) otherBtn.setAttribute("aria-expanded", "false");
        }
      });

      if (isActive) {
        item.classList.remove("active");
        questionBtn.setAttribute("aria-expanded", "false");
      } else {
        item.classList.add("active");
        questionBtn.setAttribute("aria-expanded", "true");
      }
    });
  });
}
