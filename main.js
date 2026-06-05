(function () {
  if ("scrollRestoration" in history) {
    history.scrollRestoration = "manual";
  }
  function scrollToTopHard() {
    window.scrollTo(0, 0);
    if (window.location.hash) {
      history.replaceState(
        null,
        "",
        window.location.pathname + window.location.search,
      );
    }
    window.dispatchEvent(new Event("scroll"));
  }
  window.addEventListener("load", scrollToTopHard);
  window.addEventListener("pageshow", function (ev) {
    if (!ev.persisted) {
      scrollToTopHard();
    }
  });

  var WHATSAPP_NUMBER = "905315015003";

  var waLink = document.getElementById("wa-contact-link");
  var waFab = document.getElementById("wa-fab-link");
  if (WHATSAPP_NUMBER && /^\d{10,15}$/.test(WHATSAPP_NUMBER)) {
    var waHref = "https://wa.me/" + WHATSAPP_NUMBER;
    if (waLink) {
      waLink.href = waHref;
    }
    if (waFab) {
      waFab.href = waHref;
    }
  }

  function neoStepPhaseLabel(card) {
    var grid = card.closest(".neo-step-grid");
    if (!grid) {
      return "";
    }
    var el = grid.previousElementSibling;
    while (el && el.nodeType === 1 && !el.classList.contains("subheading")) {
      el = el.previousElementSibling;
    }
    return el ? el.textContent.replace(/\s+/g, " ").trim() : "";
  }

  document.querySelectorAll("article.neo-card--step").forEach(function (card) {
    if (card.querySelector(".neo-step-accordion")) {
      return;
    }
    var num = card.querySelector(".neo-card__num");
    var title = card.querySelector(".neo-card__title");
    var locStrip = card.querySelector(".neo-card__loc-strip");
    var kicker = card.querySelector(".neo-card__kicker");
    var body = card.querySelector(".neo-card__body");
    if (!num || !title || !body) {
      return;
    }

    var details = document.createElement("details");
    details.className = "neo-step-accordion";

    var summary = document.createElement("summary");
    summary.className = "neo-step-accordion__summary";
    summary.setAttribute(
      "aria-label",
      "توسيع أو طي التفاصيل: " + title.textContent.trim().slice(0, 80),
    );

    var intro = document.createElement("div");
    intro.className = "neo-step-accordion__intro";

    var section = card.closest("section[id]");
    var totalSteps = section && section.getAttribute("data-steps-total");
    var phaseLabel = neoStepPhaseLabel(card);
    var stepDigits = num.textContent.replace(/\s+/g, "").trim();
    var stepTag = card.getAttribute("data-step-tag");
    var counterSuffix = card.getAttribute("data-step-counter-suffix");
    if (totalSteps && stepDigits) {
      if (stepTag) {
        var row = document.createElement("div");
        row.className = "neo-step-meta-row";
        var counterEl = document.createElement("span");
        counterEl.className = "neo-step-meta__counter";
        counterEl.textContent = "الخطوة " + stepDigits + " من " + totalSteps;
        var pillEl = document.createElement("span");
        pillEl.className = "neo-step-meta__pill";
        pillEl.textContent = stepTag.trim();
        row.appendChild(counterEl);
        row.appendChild(pillEl);
        intro.appendChild(row);
      } else if (counterSuffix) {
        var metaSuf = document.createElement("span");
        metaSuf.className = "neo-step-meta";
        metaSuf.textContent =
          "الخطوة " +
          stepDigits +
          " من " +
          totalSteps +
          " " +
          counterSuffix.trim();
        intro.appendChild(metaSuf);
      } else if (phaseLabel) {
        var meta = document.createElement("span");
        meta.className = "neo-step-meta";
        meta.textContent =
          "الخطوة " + stepDigits + " من " + totalSteps + " في " + phaseLabel;
        intro.appendChild(meta);
      }
    }

    var chev = document.createElement("span");
    chev.className = "neo-step-accordion__chev";
    chev.setAttribute("aria-hidden", "true");

    intro.appendChild(title);

    if (locStrip || kicker) {
      var locWrap = document.createElement("div");
      locWrap.className = "neo-step-accordion__loc-wrap";
      if (locStrip) {
        locWrap.appendChild(locStrip);
      }
      if (kicker) {
        locWrap.appendChild(kicker);
      }
      intro.appendChild(locWrap);
    }

    summary.appendChild(num);
    summary.appendChild(intro);
    summary.appendChild(chev);

    var panel = document.createElement("div");
    panel.className = "neo-step-accordion__panel";
    panel.appendChild(body);

    details.appendChild(summary);
    details.appendChild(panel);
    card.appendChild(details);

    details.addEventListener("toggle", function () {
      if (!details.open) {
        return;
      }
      var scope = details.closest("section") || document.body;
      Array.prototype.forEach.call(
        scope.querySelectorAll("details.neo-step-accordion"),
        function (d) {
          if (d !== details) {
            d.open = false;
          }
        },
      );
      details.querySelectorAll(".reveal:not(.visible)").forEach(function (el) {
        el.classList.add("visible");
      });
    });
  });

  var SECTION_IDS = ["alert", "papers", "turkey", "syria", "services", "contact"];
  var nav = document.querySelector(".nav-links");
  var navAnchors = nav
    ? Array.prototype.slice.call(nav.querySelectorAll("a[href^='#']"))
    : [];
  var navCtas = document.querySelectorAll(".nav-cta");
  Array.prototype.forEach.call(navCtas, function (navCta) {
    var href = navCta.getAttribute("href");
    if (href && href.charAt(0) === "#") {
      navAnchors.push(navCta);
    }
  });
  var ticking = false;
  var navTargetLockId = "";
  var navTargetLockUntil = 0;
  var NAV_LOCK_MS = 1400;

  function getHeaderThreshold() {
    var header = document.querySelector(".site-header");
    if (!header) {
      return 72;
    }
    var r = header.getBoundingClientRect();
    return Math.max(24, Math.round(r.bottom + 6));
  }

  function updateActiveNav() {
    if (!navAnchors.length) {
      return;
    }
    var docEl = document.documentElement;
    var threshold = getHeaderThreshold();
    var activeId = "";
    var scrollTop =
      window.scrollY || docEl.scrollTop || document.body.scrollTop || 0;

    if (navTargetLockId && Date.now() < navTargetLockUntil) {
      activeId = navTargetLockId;
    } else {
      navTargetLockId = "";
      for (var i = 0; i < SECTION_IDS.length; i++) {
        var sec = document.getElementById(SECTION_IDS[i]);
        if (!sec) {
          continue;
        }
        var top = sec.getBoundingClientRect().top;
        if (top <= threshold) {
          activeId = SECTION_IDS[i];
        }
      }
      if (!activeId && scrollTop < 100) {
        activeId = "alert";
      }

      var contactEl = document.getElementById("contact");
      if (contactEl) {
        var cr = contactEl.getBoundingClientRect();
        var vh = window.innerHeight || docEl.clientHeight;
        var maxScroll = Math.max(0, docEl.scrollHeight - docEl.clientHeight);
        var nearBottom = maxScroll > 32 && scrollTop >= maxScroll - 130;
        var contactFocused =
          cr.top < vh * 0.74 && cr.bottom > threshold + 12 && cr.height > 0;
        if (nearBottom || contactFocused) {
          activeId = "contact";
        }
      }
    }

    navAnchors.forEach(function (a) {
      var href = a.getAttribute("href");
      var id = href && href.charAt(0) === "#" ? href.slice(1) : "";
      var on = id === activeId && activeId !== "";
      a.classList.toggle("is-active", on);
      if (on) {
        a.setAttribute("aria-current", "location");
      } else {
        a.removeAttribute("aria-current");
      }
    });
  }

  function onScrollOrResize() {
    if (!ticking) {
      ticking = true;
      window.requestAnimationFrame(function () {
        ticking = false;
        updateActiveNav();
      });
    }
  }

  if (navAnchors.length) {
    updateActiveNav();
    window.addEventListener("scroll", onScrollOrResize, { passive: true });
    window.addEventListener("resize", onScrollOrResize);
    document.addEventListener("scrollend", function () {
      navTargetLockId = "";
      navTargetLockUntil = 0;
      updateActiveNav();
    });
    navAnchors.forEach(function (a) {
      a.addEventListener("click", function () {
        var href = a.getAttribute("href");
        if (!href || href.charAt(0) !== "#") {
          return;
        }
        var id = href.slice(1);
        navTargetLockId = id;
        navTargetLockUntil = Date.now() + NAV_LOCK_MS;
        updateActiveNav();
      });
    });
  }

  var revealEls = document.querySelectorAll(".reveal");
  revealEls.forEach(function (el, index) {
    var stagger = Math.min(index, 12) * 0.035;
    el.style.setProperty("--reveal-delay", stagger + "s");
  });

  if (revealEls.length && "IntersectionObserver" in window) {
    var obs = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (e) {
          if (e.isIntersecting) {
            e.target.classList.add("visible");
            obs.unobserve(e.target);
          }
        });
      },
      { threshold: 0.08, rootMargin: "0px 0px -8% 0px" },
    );
    revealEls.forEach(function (el) {
      obs.observe(el);
    });
  } else {
    revealEls.forEach(function (el) {
      el.classList.add("visible");
    });
  }

  document.querySelectorAll('a[href^="#syria-step-"]').forEach(function (anchor) {
    anchor.addEventListener("click", function (e) {
      var href = anchor.getAttribute("href");
      if (!href || href.charAt(0) !== "#") {
        return;
      }
      var id = href.slice(1);
      var card = document.getElementById(id);
      if (!card || !card.classList.contains("neo-card--step")) {
        return;
      }
      var details = card.querySelector("details.neo-step-accordion");
      if (!details) {
        return;
      }
      e.preventDefault();
      details.open = true;
      if (history.replaceState) {
        history.replaceState(null, "", href);
      } else {
        window.location.hash = id;
      }
      requestAnimationFrame(function () {
        requestAnimationFrame(function () {
          card.scrollIntoView({ behavior: "smooth", block: "start" });
        });
      });
    });
  });
})();
