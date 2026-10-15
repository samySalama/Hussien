"use strict";
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const WA = "201120964345";
const reduceMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;
const finePointer = matchMedia("(hover: hover) and (pointer: fine)").matches;

/* ===== القائمة للموبايل (مع Escape وإرجاع التركيز) ===== */
const menuBtn = $("#menuBtn"), nav = $("#nav");
function setMenu(open) {
  nav.classList.toggle("open", open);
  menuBtn.classList.toggle("open", open);
  menuBtn.setAttribute("aria-expanded", String(open));
  menuBtn.setAttribute("aria-label", open ? "إغلاق القائمة" : "فتح القائمة");
  document.body.style.overflow = open ? "hidden" : "";
}
menuBtn?.addEventListener("click", () => setMenu(!nav.classList.contains("open")));
$$(".nav a").forEach(a => a.addEventListener("click", () => setMenu(false)));
document.addEventListener("keydown", e => {
  if (e.key === "Escape" && nav.classList.contains("open")) { setMenu(false); menuBtn.focus(); }
});

/* ===== الهيدر + التقدم + زر الأعلى (rAF بدل الحساب في كل scroll) ===== */
const header = $("#siteHeader"), progress = $("#scrollProgress"), backToTop = $("#backToTop");
const nativeProgress = CSS.supports("animation-timeline: scroll()");
if (nativeProgress && progress) progress.classList.add("native");
let ticking = false;
function onScroll() {
  const y = scrollY;
  header.classList.toggle("scrolled", y > 40);
  backToTop.classList.toggle("show", y > 600);
  if (!nativeProgress && progress) {
    const h = document.documentElement.scrollHeight - innerHeight;
    progress.style.width = (h > 0 ? (y / h) * 100 : 0) + "%";
  }
  ticking = false;
}
addEventListener("scroll", () => { if (!ticking) { ticking = true; requestAnimationFrame(onScroll); } }, { passive: true });
onScroll();
backToTop?.addEventListener("click", () => scrollTo({ top: 0, behavior: reduceMotion ? "auto" : "smooth" }));

/* ===== تفعيل اللينك الحالي ===== */
const navLinks = $$(".nav-link");
const sectionObserver = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      navLinks.forEach(l => {
        const on = l.getAttribute("href") === "#" + e.target.id;
        l.classList.toggle("active", on);
        on ? l.setAttribute("aria-current", "true") : l.removeAttribute("aria-current");
      });
    }
  });
}, { rootMargin: "-40% 0px -55% 0px" });
$$("main section[id]").forEach(s => sectionObserver.observe(s));

/* ===== أنيميشن الظهور ===== */
const revealObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) { entry.target.classList.add("visible"); revealObserver.unobserve(entry.target); }
  });
}, { threshold: 0.08 });
$$(".reveal").forEach(el => revealObserver.observe(el));
$$(".work-item").forEach((item, i) => item.style.setProperty("--d", (i % 4) * 80 + "ms"));

/* ===== عدّادات الأرقام ===== */
const counterObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (!entry.isIntersecting) return;
    const el = entry.target, target = +el.dataset.target;
    counterObserver.unobserve(el);
    if (reduceMotion) { el.textContent = target; return; }
    const start = performance.now(), duration = 1400;
    const tick = now => {
      const p = Math.min((now - start) / duration, 1);
      el.textContent = Math.round(target * (1 - Math.pow(1 - p, 3)));
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  });
}, { threshold: 0.5 });
$$(".counter").forEach(el => counterObserver.observe(el));

/* ===== لايت بوكس: اتجاه RTL صحيح + سحب باللمس + تركيز + تحميل مسبق ===== */
const lightbox = $("#lightbox"), lbImg = $("#lightboxImg"), lbCounter = $("#lbCounter");
const workItems = $$(".work-item");
let lbIndex = 0, lastFocus = null;
const preload = i => { const n = workItems[(i + workItems.length) % workItems.length]; if (n) new Image().src = n.dataset.full; };
function showLightbox(i) {
  lbIndex = (i + workItems.length) % workItems.length;
  const item = workItems[lbIndex], thumb = $("img", item);
  lbImg.src = item.dataset.full || thumb.currentSrc || thumb.src;
  lbImg.alt = thumb.alt || "";
  lbCounter.textContent = `${lbIndex + 1} / ${workItems.length}`;
  preload(lbIndex + 1); preload(lbIndex - 1);
}
function openLightbox(i) {
  lastFocus = document.activeElement;
  showLightbox(i);
  lightbox.classList.add("open");
  lightbox.setAttribute("aria-hidden", "false");
  document.body.style.overflow = "hidden";
  $("#closeLightbox").focus();
}
function closeLightbox() {
  lightbox.classList.remove("open");
  lightbox.setAttribute("aria-hidden", "true");
  document.body.style.overflow = "";
  lastFocus?.focus();
}
// في الواجهة العربية: الزر اليمين = السابق، اليسار = التالي
$("#lbPrev")?.addEventListener("click", () => showLightbox(lbIndex - 1));
$("#lbNext")?.addEventListener("click", () => showLightbox(lbIndex + 1));
$("#closeLightbox")?.addEventListener("click", closeLightbox);
workItems.forEach((item, i) => item.addEventListener("click", () => openLightbox(i)));
lightbox?.addEventListener("click", e => { if (e.target === lightbox) closeLightbox(); });
document.addEventListener("keydown", e => {
  if (!lightbox.classList.contains("open")) return;
  if (e.key === "Escape") closeLightbox();
  if (e.key === "ArrowRight") showLightbox(lbIndex - 1);
  if (e.key === "ArrowLeft") showLightbox(lbIndex + 1);
  if (e.key === "Tab") { // حبس التركيز داخل النافذة
    const f = $$("button", lightbox), first = f[0], last = f[f.length - 1];
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  }
});
let tx = 0, ty = 0;
lightbox?.addEventListener("touchstart", e => { tx = e.touches[0].clientX; ty = e.touches[0].clientY; }, { passive: true });
lightbox?.addEventListener("touchend", e => {
  const dx = e.changedTouches[0].clientX - tx, dy = e.changedTouches[0].clientY - ty;
  if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy) * 1.5) showLightbox(lbIndex + (dx < 0 ? 1 : -1));
  else if (dy > 90 && Math.abs(dy) > Math.abs(dx) * 1.5) closeLightbox(); // سحب للأسفل = إغلاق
}, { passive: true });

/* ===== نموذج واتساب: تحقق + معاينة حيّة + استعجال ===== */
const form = $("#whatsappForm"), preview = $("#waPreview"), errBox = $("#formError");
function buildMessage() {
  const name = $("#fName").value.trim(), service = $("#fService").value;
  const area = $("#fArea").value.trim(), msg = $("#fMsg").value.trim();
  const urgency = form.querySelector('input[name="urgency"]:checked')?.value || "عادي";
  let t = `مرحباً أستاذ حسين،\nأنا ${name || "…"}.\nالخدمة المطلوبة: ${service || "…"}`;
  if (area) t += `\nالمنطقة: ${area}`;
  t += `\nالاستعجال: ${urgency}`;
  if (msg) t += `\nتفاصيل: ${msg}`;
  return t;
}
const refresh = () => { if (preview) preview.textContent = buildMessage(); };
form?.addEventListener("input", () => { errBox.hidden = true; refresh(); });
form?.addEventListener("change", refresh);
refresh();
form?.addEventListener("submit", e => {
  e.preventDefault();
  const name = $("#fName").value.trim(), service = $("#fService").value;
  const missing = !name ? $("#fName") : !service ? $("#fService") : null;
  if (missing) {
    errBox.textContent = !name ? "من فضلك اكتب اسمك." : "من فضلك اختر نوع الخدمة.";
    errBox.hidden = false; missing.focus(); return;
  }
  const url = `https://wa.me/${WA}?text=` + encodeURIComponent(buildMessage());
  const w = window.open(url, "_blank", "noopener");
  if (!w) location.href = url; // لو المتصفح منع النافذة
});

/* ===== السنة ===== */
const yearEl = $("#year"); if (yearEl) yearEl.textContent = new Date().getFullYear();

/* ===== بريلودر: لا تأخير مصطنع — يختفي مباشرة بعد التحميل، ومرة واحدة في الجلسة ===== */
const pre = $("#preloader");
const seen = (() => { try { return sessionStorage.getItem("seen") === "1"; } catch { return false; } })();
const hidePre = () => { pre?.classList.add("done"); try { sessionStorage.setItem("seen", "1"); } catch {} };
if (seen) pre?.classList.add("done");
else { addEventListener("load", () => setTimeout(hidePre, 250)); setTimeout(hidePre, 1800); }

/* ===== العنوان حرف حرف (مع إبقاء النص مقروءًا لقارئات الشاشة) ===== */
const h1 = $(".split-title");
if (h1 && !reduceMotion) {
  h1.setAttribute("aria-label", h1.textContent.replace(/\s+/g, " ").trim());
  $$(".line", h1).forEach(line => {
    const text = line.textContent; line.textContent = ""; line.setAttribute("aria-hidden", "true");
    [...text].forEach((ch, i) => {
      const s = document.createElement("span");
      s.className = "char"; s.style.setProperty("--i", i);
      s.textContent = ch === " " ? "\u00A0" : ch; line.appendChild(s);
    });
  });
}

/* ===== كانفس الشرارات: DPR + يتوقف خارج الهيرو/عند إخفاء التبويب + أخف على الموبايل ===== */
(() => {
  const c = $("#fxCanvas");
  const saveData = navigator.connection?.saveData;
  if (!c || reduceMotion || saveData) { c?.remove(); return; }
  const ctx = c.getContext("2d");
  let W, H, dpr = Math.min(devicePixelRatio || 1, 2), running = true;
  const resize = () => { W = innerWidth; H = innerHeight; c.width = W * dpr; c.height = H * dpr; ctx.setTransform(dpr, 0, 0, dpr, 0, 0); };
  resize(); addEventListener("resize", resize);
  const count = innerWidth < 768 ? 22 : 48;
  class Spark {
    constructor() { this.reset(true); }
    reset(init) {
      this.x = Math.random() * W; this.y = init ? Math.random() * H : -10;
      this.vx = (Math.random() - .5) * .4; this.vy = .3 + Math.random() * .7;
      this.r = .5 + Math.random() * 1.8; this.life = 0; this.max = 140 + Math.random() * 220;
      this.hue = Math.random() < .8 ? 46 : 200;
    }
    step() {
      this.x += this.vx; this.y += this.vy; this.life++;
      if (this.life > this.max || this.y > H + 10) this.reset(false);
      const a = Math.sin((this.life / this.max) * Math.PI) * .5;
      ctx.beginPath(); ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
      ctx.fillStyle = `hsla(${this.hue},95%,60%,${a})`; ctx.fill();
    }
  }
  const sparks = Array.from({ length: count }, () => new Spark());
  (function loop() {
    requestAnimationFrame(loop);
    if (!running || document.hidden) return;
    ctx.clearRect(0, 0, W, H);
    sparks.forEach(s => s.step());
  })();
  // يتوقف بعد تجاوز أول شاشة (توفير بطارية)
  new IntersectionObserver(([e]) => { running = e.isIntersecting; c.style.visibility = running ? "visible" : "hidden"; }, { threshold: 0 })
    .observe($(".hero"));
})();

/* ===== ميلان 3D للأجهزة التي بها ماوس فقط ===== */
if (finePointer && !reduceMotion) {
  $$(".tilt").forEach(card => {
    let raf = 0;
    card.addEventListener("mousemove", e => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const r = card.getBoundingClientRect();
        const x = (e.clientX - r.left) / r.width - .5, y = (e.clientY - r.top) / r.height - .5;
        card.style.transform = `translateY(-6px) rotateX(${-y * 8}deg) rotateY(${x * 8}deg)`;
      });
    });
    card.addEventListener("mouseleave", () => { cancelAnimationFrame(raf); card.style.transform = ""; });
  });
} else {
  $$(".tilt").forEach(c => c.classList.remove("tilt"));
}
