/* =====================================================================
   JP Plumbing & Heating — Site JavaScript
   All features use feature-detection so this one file works on every page.
   ===================================================================== */
(function () {
  "use strict";

  /* ---------- Trigger hero load animations ---------- */
  // Add .loaded once the page is ready so on-load animations fire immediately.
  window.addEventListener("load", function () {
    document.body.classList.add("loaded");
  });
  // Fallback in case 'load' already fired.
  if (document.readyState === "complete") document.body.classList.add("loaded");

  /* =================================================================
     1. NAVIGATION — shrink on scroll + mobile slide-in menu
     ================================================================= */
  var nav = document.querySelector(".nav");
  var hamburger = document.querySelector(".hamburger");
  var mobileMenu = document.querySelector(".mobile-menu");
  var overlay = document.querySelector(".menu-overlay");

  if (nav) {
    var onScroll = function () {
      if (window.scrollY > 30) nav.classList.add("scrolled");
      else nav.classList.remove("scrolled");
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
  }

  function closeMenu() {
    if (!mobileMenu) return;
    mobileMenu.classList.remove("open");
    if (overlay) overlay.classList.remove("open");
    if (hamburger) hamburger.classList.remove("open");
    document.body.style.overflow = "";
  }
  function openMenu() {
    if (!mobileMenu) return;
    mobileMenu.classList.add("open");
    if (overlay) overlay.classList.add("open");
    if (hamburger) hamburger.classList.add("open");
    document.body.style.overflow = "hidden";
  }

  if (hamburger && mobileMenu) {
    hamburger.addEventListener("click", function () {
      if (mobileMenu.classList.contains("open")) closeMenu();
      else openMenu();
    });
  }
  if (overlay) overlay.addEventListener("click", closeMenu);
  // Close when a mobile link is tapped.
  if (mobileMenu) {
    mobileMenu.querySelectorAll("a").forEach(function (a) {
      a.addEventListener("click", closeMenu);
    });
  }
  // Close on Escape.
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") closeMenu();
  });

  /* =================================================================
     2. SCROLL REVEAL — Intersection Observer for all .reveal elements
     ================================================================= */
  var revealEls = document.querySelectorAll(".reveal");
  if (revealEls.length) {
    if ("IntersectionObserver" in window) {
      var revealObserver = new IntersectionObserver(
        function (entries, obs) {
          entries.forEach(function (entry) {
            if (entry.isIntersecting) {
              entry.target.classList.add("visible");
              obs.unobserve(entry.target);
            }
          });
        },
        { threshold: 0.15, rootMargin: "0px 0px -60px 0px" }
      );
      revealEls.forEach(function (el) { revealObserver.observe(el); });
    } else {
      // No IO support: just show everything.
      revealEls.forEach(function (el) { el.classList.add("visible"); });
    }
  }

  /* =================================================================
     3. STAT COUNTERS — count up when scrolled into view
     ================================================================= */
  var counters = document.querySelectorAll("[data-count]");
  if (counters.length) {
    var runCounter = function (el) {
      var target = parseInt(el.getAttribute("data-count"), 10);
      var duration = 1800;
      var startTime = null;
      var step = function (ts) {
        if (!startTime) startTime = ts;
        var progress = Math.min((ts - startTime) / duration, 1);
        // easeOutCubic for a satisfying finish
        var eased = 1 - Math.pow(1 - progress, 3);
        el.textContent = Math.floor(eased * target).toLocaleString("en-GB");
        if (progress < 1) requestAnimationFrame(step);
        else el.textContent = target.toLocaleString("en-GB");
      };
      requestAnimationFrame(step);
    };
    if ("IntersectionObserver" in window) {
      var countObserver = new IntersectionObserver(
        function (entries, obs) {
          entries.forEach(function (entry) {
            if (entry.isIntersecting) {
              runCounter(entry.target);
              obs.unobserve(entry.target);
            }
          });
        },
        { threshold: 0.5 }
      );
      counters.forEach(function (el) { countObserver.observe(el); });
    } else {
      counters.forEach(runCounter);
    }
  }

  /* =================================================================
     4. TESTIMONIALS CAROUSEL — auto-advance + dots
     ================================================================= */
  var carousel = document.querySelector(".carousel");
  if (carousel) {
    var slides = carousel.querySelectorAll(".testimonial");
    var dots = carousel.querySelectorAll(".dot");
    var current = 0;
    var timer = null;

    var goTo = function (index) {
      slides[current].classList.remove("active");
      if (dots[current]) dots[current].classList.remove("active");
      current = (index + slides.length) % slides.length;
      slides[current].classList.add("active");
      if (dots[current]) dots[current].classList.add("active");
    };
    var next = function () { goTo(current + 1); };
    var startAuto = function () { timer = setInterval(next, 4000); };
    var resetAuto = function () { clearInterval(timer); startAuto(); };

    dots.forEach(function (dot, i) {
      dot.addEventListener("click", function () { goTo(i); resetAuto(); });
    });
    if (slides.length > 1) startAuto();
  }

  /* =================================================================
     5. ACCORDION — services detail + FAQ (smooth expand/collapse)
     ================================================================= */
  var accHeaders = document.querySelectorAll(".acc-header");
  accHeaders.forEach(function (header) {
    header.setAttribute("aria-expanded", "false");
    header.addEventListener("click", function () {
      var item = header.closest(".acc-item");
      var body = item.querySelector(".acc-body");
      var isOpen = item.classList.contains("open");

      // Close siblings within the same accordion group.
      var group = item.parentElement;
      group.querySelectorAll(".acc-item.open").forEach(function (openItem) {
        if (openItem !== item) {
          openItem.classList.remove("open");
          openItem.querySelector(".acc-body").style.maxHeight = null;
          openItem.querySelector(".acc-header").setAttribute("aria-expanded", "false");
        }
      });

      if (isOpen) {
        item.classList.remove("open");
        body.style.maxHeight = null;
        header.setAttribute("aria-expanded", "false");
      } else {
        item.classList.add("open");
        body.style.maxHeight = body.scrollHeight + "px";
        header.setAttribute("aria-expanded", "true");
      }
    });
  });
  // Recalculate open accordion heights on resize so content never clips.
  window.addEventListener("resize", function () {
    document.querySelectorAll(".acc-item.open .acc-body").forEach(function (body) {
      body.style.maxHeight = body.scrollHeight + "px";
    });
  });

  /* =================================================================
     6. HERO PARTICLES — floating water drops on canvas
     ================================================================= */
  var canvas = document.getElementById("particles");
  if (canvas && canvas.getContext) {
    var ctx = canvas.getContext("2d");
    var hero = canvas.parentElement;
    var drops = [];
    var prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    var sizeCanvas = function () {
      canvas.width = hero.offsetWidth;
      canvas.height = hero.offsetHeight;
    };
    var makeDrops = function () {
      drops = [];
      var count = Math.min(46, Math.floor(canvas.width / 26));
      for (var i = 0; i < count; i++) {
        drops.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          r: 1.5 + Math.random() * 3.5,
          speed: 0.25 + Math.random() * 0.7,
          drift: (Math.random() - 0.5) * 0.3,
          alpha: 0.15 + Math.random() * 0.4
        });
      }
    };
    var draw = function () {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      for (var i = 0; i < drops.length; i++) {
        var d = drops[i];
        ctx.beginPath();
        ctx.arc(d.x, d.y, d.r, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(0, 102, 255, " + d.alpha + ")";
        ctx.fill();
        d.y += d.speed;
        d.x += d.drift;
        if (d.y - d.r > canvas.height) { d.y = -d.r; d.x = Math.random() * canvas.width; }
        if (d.x < -10) d.x = canvas.width + 10;
        if (d.x > canvas.width + 10) d.x = -10;
      }
      requestAnimationFrame(draw);
    };

    sizeCanvas();
    makeDrops();
    if (!prefersReduced) {
      draw();
    } else {
      // Draw a single static frame for reduced-motion users.
      for (var i = 0; i < drops.length; i++) {
        var d = drops[i];
        ctx.beginPath();
        ctx.arc(d.x, d.y, d.r, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(0, 102, 255, " + d.alpha + ")";
        ctx.fill();
      }
    }
    var resizeT;
    window.addEventListener("resize", function () {
      clearTimeout(resizeT);
      resizeT = setTimeout(function () { sizeCanvas(); makeDrops(); }, 200);
    });
  }

  /* =================================================================
     7. CONTACT FORM — validation + Formspree submission
     ================================================================= */
  var form = document.getElementById("bookingForm");
  if (form) {
    var emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    var showError = function (field, on) {
      if (on) field.classList.add("error");
      else field.classList.remove("error");
    };

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var valid = true;

      // Validate every required control inside a .field wrapper.
      form.querySelectorAll("[required]").forEach(function (input) {
        var field = input.closest(".field");
        var value = (input.value || "").trim();
        var ok = value !== "";
        if (ok && input.type === "email") ok = emailRe.test(value);
        showError(field, !ok);
        if (!ok) valid = false;
      });

      if (!valid) {
        var firstErr = form.querySelector(".field.error input, .field.error select, .field.error textarea");
        if (firstErr) firstErr.focus();
        return;
      }

      // Validation passed — submit to Formspree.
      var submitBtn = form.querySelector("[type=submit]");
      if (submitBtn) { submitBtn.disabled = true; submitBtn.textContent = "Sending…"; }

      fetch(form.action, {
        method: "POST",
        body: new FormData(form),
        headers: { "Accept": "application/json" }
      }).then(function (response) {
        if (response.ok) {
          var success = document.getElementById("formSuccess");
          form.style.display = "none";
          if (success) {
            success.classList.add("show");
            success.scrollIntoView({ behavior: "smooth", block: "center" });
          }
          form.reset();
        } else {
          if (submitBtn) { submitBtn.disabled = false; submitBtn.textContent = "Send Booking Request"; }
          alert("Something went wrong — please try again or call us on 029 2000 0000.");
        }
      }).catch(function () {
        if (submitBtn) { submitBtn.disabled = false; submitBtn.textContent = "Send Booking Request"; }
        alert("Could not send your request — please check your connection or call us on 029 2000 0000.");
      });
    });

    // Clear an error as soon as the user starts fixing it.
    form.querySelectorAll("input, select, textarea").forEach(function (input) {
      var clear = function () {
        var field = input.closest(".field");
        if (field && field.classList.contains("error")) {
          var value = (input.value || "").trim();
          var ok = value !== "";
          if (ok && input.type === "email") ok = emailRe.test(value);
          if (ok) field.classList.remove("error");
        }
      };
      input.addEventListener("input", clear);
      input.addEventListener("change", clear);
    });
  }

  /* =================================================================
     8. CHATBOT — rule-based, with typing indicator
     ================================================================= */
  var launcher = document.getElementById("chatLauncher");
  var chatWindow = document.getElementById("chatWindow");
  if (launcher && chatWindow) {
    var chatBody = chatWindow.querySelector(".chat-body");
    var chatInput = document.getElementById("chatInput");
    var chatSend = document.getElementById("chatSend");
    var chatClose = chatWindow.querySelector(".chat-close");
    var quickWrap = chatWindow.querySelector(".chat-quick");
    var greeted = false;

    var PHONE = "029 2000 0000";

    // Rule base: each rule has keyword triggers and a reply (HTML allowed).
    var rules = [
      {
        keys: ["area", "areas", "cover", "where", "location", "located"],
        reply: "We cover all of Cardiff and the surrounding areas, including Cardiff Bay, Pontcanna, Roath, Canton, Cathays, Llandaff, Penarth, Whitchurch and Cyncoed. If you are nearby and not sure, just ask!"
      },
      {
        keys: ["boiler service", "boiler", "service cost", "how much", "price", "cost", "pricing", "quote"],
        reply: "A standard boiler service typically ranges from <b>£70 to £120</b> depending on the boiler type. For repairs and installations we provide a free, no-obligation quote. Pop over to our <a href='contact.html'>booking page</a> for an exact price."
      },
      {
        keys: ["today", "available today", "now", "available", "availability"],
        reply: "We may well be able to help today! For same-day availability the quickest way is to call us on <a href='tel:02920000000'>" + PHONE + "</a>, or use our <a href='contact.html'>booking form</a> and we'll confirm a slot."
      },
      {
        keys: ["emergency", "callout", "call out", "urgent", "24", "leak now", "burst"],
        reply: "Yes — we offer <b>24/7 emergency callouts</b> across Cardiff. For urgent issues call us right now on <a href='tel:02920000000'>" + PHONE + "</a> and we'll be on our way."
      },
      {
        keys: ["book", "booking", "appointment", "arrange", "schedule"],
        reply: "Booking is easy! Head to our <a href='contact.html'>contact &amp; booking page</a>, fill in the short form with your preferred date and time, and we'll confirm your appointment. Or call <a href='tel:02920000000'>" + PHONE + "</a>."
      },
      {
        keys: ["service", "services", "offer", "do you do", "what do you"],
        reply: "We offer six core services:<br>• Boiler Installation<br>• Emergency Repairs<br>• Bathroom Fitting<br>• Central Heating<br>• Gas Safety Checks<br>• Leak Detection<br>See full details on our <a href='services.html'>services page</a>."
      },
      {
        keys: ["hour", "hours", "open", "opening", "times"],
        reply: "Our office hours are Mon–Fri 8am–6pm and Sat 9am–4pm. Emergency callouts are available <b>24/7</b>, every day of the year."
      },
      {
        keys: ["gas safe", "insured", "registered", "qualified", "certified"],
        reply: "Absolutely — we are fully insured and <b>Gas Safe registered</b>, so every gas job is carried out safely and legally."
      },
      {
        keys: ["hi", "hello", "hey", "good morning", "good afternoon"],
        reply: "Hello! 👋 How can I help you today? You can ask about our services, pricing, areas we cover, or emergency callouts."
      },
      {
        keys: ["thank", "thanks", "cheers", "great"],
        reply: "You're very welcome! Is there anything else I can help with?"
      }
    ];

    var FALLBACK = "I'm not sure about that — call us on <a href='tel:02920000000'>" + PHONE + "</a> or use our <a href='contact.html'>booking form</a> and a member of the team will be happy to help.";

    var scrollChat = function () { chatBody.scrollTop = chatBody.scrollHeight; };

    var addMessage = function (text, who) {
      var msg = document.createElement("div");
      msg.className = "msg " + who;
      msg.innerHTML = text;
      chatBody.appendChild(msg);
      scrollChat();
    };

    var showTyping = function () {
      var t = document.createElement("div");
      t.className = "msg bot typing";
      t.id = "typingIndicator";
      t.innerHTML = "<span></span><span></span><span></span>";
      chatBody.appendChild(t);
      scrollChat();
    };
    var removeTyping = function () {
      var t = document.getElementById("typingIndicator");
      if (t) t.remove();
    };

    var matchRule = function (text) {
      var lower = text.toLowerCase();
      for (var i = 0; i < rules.length; i++) {
        for (var j = 0; j < rules[i].keys.length; j++) {
          if (lower.indexOf(rules[i].keys[j]) !== -1) return rules[i].reply;
        }
      }
      return FALLBACK;
    };

    var botRespond = function (userText) {
      showTyping();
      setTimeout(function () {
        removeTyping();
        addMessage(matchRule(userText), "bot");
      }, 900);
    };

    var sendUser = function (text) {
      text = (text || "").trim();
      if (!text) return;
      addMessage(text, "user");
      chatInput.value = "";
      botRespond(text);
    };

    var openChat = function () {
      chatWindow.classList.add("open");
      launcher.classList.add("hidden");
      if (!greeted) {
        greeted = true;
        setTimeout(function () {
          addMessage("Hi there! 👋 I'm the JP Plumbing assistant. Ask me anything, or tap a question below.", "bot");
        }, 300);
      }
      setTimeout(function () { if (chatInput) chatInput.focus(); }, 350);
    };
    var closeChat = function () {
      chatWindow.classList.remove("open");
      launcher.classList.remove("hidden");
    };

    launcher.addEventListener("click", openChat);
    if (chatClose) chatClose.addEventListener("click", closeChat);
    if (chatSend) chatSend.addEventListener("click", function () { sendUser(chatInput.value); });
    if (chatInput) {
      chatInput.addEventListener("keydown", function (e) {
        if (e.key === "Enter") { e.preventDefault(); sendUser(chatInput.value); }
      });
    }
    // Quick-reply chips.
    if (quickWrap) {
      quickWrap.querySelectorAll("button").forEach(function (btn) {
        btn.addEventListener("click", function () { sendUser(btn.textContent); });
      });
    }
  }

  /* =================================================================
     9. FOOTER YEAR — keep copyright current automatically
     ================================================================= */
  var yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();
})();
