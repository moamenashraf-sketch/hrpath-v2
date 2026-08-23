/* ==========================================================================
   HR PATH — Landing interactions
   i18n (AR/EN) · header · reveal · counters · tabs · accordion · modal · forms
   ========================================================================== */
(function () {
  "use strict";

  var docEl = document.documentElement;

  /* ------------------------------------------------------------------
     1. i18n — Arabic inline (default) / English via data-en attributes
     ------------------------------------------------------------------ */
  var PLANS = {
    expert: { ar: "خبير — باقة إسناد", en: "Expert — Esnad", price: "2,500" },
    basic:  { ar: "الأساسية",          en: "Basic",          price: "3,900" },
    gold:   { ar: "الذهبية",           en: "Gold",           price: "4,900" }
  };
  var currentLang = "ar";
  var currentPlan = "";

  function applyLang(lang) {
    currentLang = lang;

    // Text nodes. Swapping rewrites innerHTML, so a data-en element must not
    // wrap another one — the inner element would be destroyed on the first
    // swap and its translation lost. Keep such labels as siblings instead.
    document.querySelectorAll("[data-en]").forEach(function (el) {
      if (el.querySelector("[data-en]")) return;
      if (el.dataset.ar === undefined) el.dataset.ar = el.innerHTML;
      el.innerHTML = lang === "en" ? el.dataset.en : el.dataset.ar;
    });
    // labels
    document.querySelectorAll("[data-en-label]").forEach(function (el) {
      if (el.dataset.arLabel === undefined) el.dataset.arLabel = el.textContent;
      el.textContent = lang === "en" ? el.dataset.enLabel : el.dataset.arLabel;
    });
    // placeholders
    document.querySelectorAll("[data-en-ph]").forEach(function (el) {
      if (el.dataset.arPh === undefined) el.dataset.arPh = el.getAttribute("placeholder") || "";
      el.setAttribute("placeholder", lang === "en" ? el.dataset.enPh : el.dataset.arPh);
    });

    docEl.setAttribute("lang", lang);
    docEl.setAttribute("dir", lang === "en" ? "ltr" : "rtl");
    document.title = lang === "en"
      ? "HR Path | Flexible, professional HR solutions"
      : "اتش آر باث | حلول مرنة واحترافية للموارد البشرية";

    document.querySelectorAll("#langToggle, [data-langtoggle]").forEach(function (btn) {
      btn.textContent = lang === "en" ? "عربي" : (btn.id === "langToggle" ? "EN" : "English");
    });

    updatePlanBadge();
    try { localStorage.setItem("hrpath-lang", lang); } catch (e) {}
  }

  document.querySelectorAll("#langToggle, [data-langtoggle]").forEach(function (btn) {
    btn.addEventListener("click", function () {
      applyLang(currentLang === "ar" ? "en" : "ar");
    });
  });

  var savedLang = null;
  try { savedLang = localStorage.getItem("hrpath-lang"); } catch (e) {}
  if (savedLang === "en") applyLang("en");

  /* ------------------------------------------------------------------
     2. Header scroll state
     ------------------------------------------------------------------ */
  var header = document.getElementById("header");
  function onScroll() {
    header.classList.toggle("is-scrolled", window.scrollY > 8);
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* ------------------------------------------------------------------
     3. Mobile menu
     ------------------------------------------------------------------ */
  var burger = document.getElementById("burger");
  var mobileMenu = document.getElementById("mobileMenu");
  function closeMenu() {
    document.body.classList.remove("menu-open");
    burger.setAttribute("aria-expanded", "false");
  }
  burger.addEventListener("click", function () {
    var open = document.body.classList.toggle("menu-open");
    burger.setAttribute("aria-expanded", open ? "true" : "false");
  });
  mobileMenu.addEventListener("click", function (e) {
    if (e.target === mobileMenu || e.target.closest("[data-menuclose]") || e.target.closest("a")) closeMenu();
  });

  /* ------------------------------------------------------------------
     3b. Client marquee — duplicate the set so the 50% loop is seamless
     ------------------------------------------------------------------ */
  var clientTrack = document.getElementById("clientTrack");
  if (clientTrack) {
    clientTrack.innerHTML += clientTrack.innerHTML;
    clientTrack.querySelectorAll("img").forEach(function (img, i) {
      if (i >= clientTrack.children.length / 2) img.setAttribute("aria-hidden", "true");
    });
  }

  /* ------------------------------------------------------------------
     4. Reveal on scroll
     ------------------------------------------------------------------ */
  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (en) {
      if (en.isIntersecting) { en.target.classList.add("is-in"); io.unobserve(en.target); }
    });
  }, { threshold: 0.12, rootMargin: "0px 0px -40px 0px" });
  document.querySelectorAll(".reveal").forEach(function (el) { io.observe(el); });

  /* ------------------------------------------------------------------
     5. Animated counters
     ------------------------------------------------------------------ */
  var cio = new IntersectionObserver(function (entries) {
    entries.forEach(function (en) {
      if (!en.isIntersecting) return;
      cio.unobserve(en.target);
      var el = en.target;
      var target = parseFloat(el.dataset.count);
      var start = null, dur = 1600;
      function frame(ts) {
        if (!start) start = ts;
        var p = Math.min((ts - start) / dur, 1);
        var eased = 1 - Math.pow(1 - p, 3);
        var val = Math.round(target * eased);
        el.textContent = val.toLocaleString("en-US");
        if (p < 1) requestAnimationFrame(frame);
      }
      requestAnimationFrame(frame);
    });
  }, { threshold: 0.5 });
  document.querySelectorAll("[data-count]").forEach(function (el) { cio.observe(el); });

  /* ------------------------------------------------------------------
     6. System photo tabs (employees / managers)
     ------------------------------------------------------------------ */
  document.querySelectorAll("[data-apptab]").forEach(function (tab) {
    tab.addEventListener("click", function () {
      document.querySelectorAll("[data-apptab]").forEach(function (t) {
        t.classList.remove("is-active");
        t.setAttribute("aria-selected", "false");
      });
      tab.classList.add("is-active");
      tab.setAttribute("aria-selected", "true");
      var key = tab.dataset.apptab;
      document.querySelectorAll(".shot").forEach(function (s) {
        s.classList.toggle("is-active", s.dataset.screen === key);
      });
    });
  });

  /* ------------------------------------------------------------------
     7. FAQ accordion
     ------------------------------------------------------------------ */
  document.querySelectorAll(".acc").forEach(function (acc) {
    var btn = acc.querySelector(".acc__btn");
    var panel = acc.querySelector(".acc__panel");
    btn.addEventListener("click", function () {
      var isOpen = acc.classList.contains("is-open");
      document.querySelectorAll(".acc.is-open").forEach(function (other) {
        other.classList.remove("is-open");
        other.querySelector(".acc__btn").setAttribute("aria-expanded", "false");
        other.querySelector(".acc__panel").style.maxHeight = "";
      });
      if (!isOpen) {
        acc.classList.add("is-open");
        btn.setAttribute("aria-expanded", "true");
        panel.style.maxHeight = panel.scrollHeight + "px";
      }
    });
  });

  /* ------------------------------------------------------------------
     8. Compare table toggle
     ------------------------------------------------------------------ */
  var cmpBtn = document.getElementById("compareToggle");
  var cmpWrap = document.getElementById("compareWrap");
  if (cmpBtn) {
    cmpBtn.addEventListener("click", function () {
      var open = cmpWrap.hidden;
      cmpWrap.hidden = !open;
      cmpBtn.setAttribute("aria-expanded", open ? "true" : "false");
    });
  }

  /* ------------------------------------------------------------------
     9. Lead modal (glassy) + plan preselection
     ------------------------------------------------------------------ */
  var modal = document.getElementById("leadModal");
  var leadGrid = document.getElementById("leadGrid");
  var leadSuccess = document.getElementById("leadSuccess");
  var planField = document.getElementById("planField");
  var planBadge = document.getElementById("modalPlanBadge");
  var planName = document.getElementById("modalPlanName");
  var planPrice = document.getElementById("modalPlanPrice");

  function updatePlanBadge() {
    if (!planBadge) return;
    var p = PLANS[currentPlan];
    if (p) {
      planBadge.hidden = false;
      planName.textContent = currentLang === "en" ? p.en : p.ar;
      planPrice.textContent = p.price + (currentLang === "en" ? " SAR / month" : " ر.س / شهريًا");
    } else {
      planBadge.hidden = true;
    }
  }

  function openModal(plan) {
    currentPlan = plan || "";
    if (planField) planField.value = currentPlan;
    updatePlanBadge();
    leadGrid.hidden = false;
    leadSuccess.hidden = true;
    modal.classList.add("is-open");
    modal.setAttribute("aria-hidden", "false");
    document.body.classList.add("modal-open");
    var first = modal.querySelector("input[name='name']");
    if (first) setTimeout(function () { first.focus(); }, 260);
  }
  function closeModal() {
    modal.classList.remove("is-open");
    modal.setAttribute("aria-hidden", "true");
    document.body.classList.remove("modal-open");
  }

  document.querySelectorAll("[data-open-lead]").forEach(function (btn) {
    btn.addEventListener("click", function () {
      closeMenu();
      openModal(btn.dataset.plan || "");
    });
  });
  modal.querySelectorAll("[data-close]").forEach(function (el) {
    el.addEventListener("click", closeModal);
  });
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && modal.classList.contains("is-open")) closeModal();
  });

  /* ------------------------------------------------------------------
     10. Forms (modal + inline lead-gen)
     ------------------------------------------------------------------ */
  document.querySelectorAll("[data-leadform]").forEach(function (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      if (!form.checkValidity()) { form.reportValidity(); return; }

      if (form.classList.contains("modal__form")) {
        leadGrid.hidden = true;
        leadSuccess.hidden = false;
        form.reset();
      } else {
        var ok = form.querySelector(".lead-form__success");
        var btn = form.querySelector("button[type='submit']");
        if (ok) ok.hidden = false;
        if (btn) btn.disabled = true;
        setTimeout(function () {
          form.reset();
          if (btn) btn.disabled = false;
        }, 400);
      }
    });
  });

})();
