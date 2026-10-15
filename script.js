/* ===== القائمة للموبايل ===== */
const menuBtn = document.getElementById("menuBtn");
const nav = document.getElementById("nav");
menuBtn?.addEventListener("click", () => {
  const isOpen = nav.classList.toggle("open");
  menuBtn.classList.toggle("open", isOpen);
  menuBtn.setAttribute("aria-expanded", isOpen);
  document.body.style.overflow = isOpen ? "hidden" : "";
});
document.querySelectorAll(".nav a").forEach(a =>
  a.addEventListener("click", () => {
    nav.classList.remove("open");
    menuBtn.classList.remove("open");
    menuBtn.setAttribute("aria-expanded", "false");
    document.body.style.overflow = "";
  })
);

/* ===== الهيدر + شريط التقدم + زر الأعلى ===== */
const header = document.getElementById("siteHeader");
const progress = document.getElementById("scrollProgress");
const backToTop = document.getElementById("backToTop");
window.addEventListener("scroll", () => {
  const y = window.scrollY;
  header.classList.toggle("scrolled", y > 40);
  backToTop.classList.toggle("show", y > 600);
  const h = document.documentElement.scrollHeight - innerHeight;
  if (progress) progress.style.width = (h > 0 ? (y / h) * 100 : 0) + "%";
}, { passive: true });
backToTop?.addEventListener("click", () => window.scrollTo({ top: 0, behavior: "smooth" }));

/* ===== تفعيل اللينك الحالي ===== */
const sections = document.querySelectorAll("main section[id]");
const navLinks = document.querySelectorAll(".nav-link");
const sectionObserver = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      navLinks.forEach(l => l.classList.toggle("active", l.getAttribute("href") === "#" + e.target.id));
    }
  });
}, { rootMargin: "-40% 0px -55% 0px" });
sections.forEach(s => sectionObserver.observe(s));

/* ===== أنيميشن الظهور ===== */
const revealObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add("visible");
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.08 });
document.querySelectorAll(".reveal").forEach(el => revealObserver.observe(el));

/* ===== عدّادات الأرقام ===== */
const counterObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (!entry.isIntersecting) return;
    const el = entry.target;
    const target = +el.dataset.target;
    const duration = 1400;
    const start = performance.now();
    const tick = now => {
      const p = Math.min((now - start) / duration, 1);
      el.textContent = Math.round(target * (1 - Math.pow(1 - p, 3)));
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
    counterObserver.unobserve(el);
  });
}, { threshold: 0.5 });
document.querySelectorAll(".counter").forEach(el => counterObserver.observe(el));

/* ===== لايت بوكس ===== */
const lightbox = document.getElementById("lightbox");
const lightboxImg = document.getElementById("lightboxImg");
const lbCounter = document.getElementById("lbCounter");
const workItems = [...document.querySelectorAll(".work-item")];
let lbIndex = 0;

function openLightbox(i) {
  lbIndex = i;
  const item = workItems[i];
  lightboxImg.src = item.dataset.full || item.querySelector("img").src;
  lightboxImg.alt = item.querySelector("img").alt || "";
  if (lbCounter) lbCounter.textContent = `${i + 1} / ${workItems.length}`;
  lightbox.classList.add("open");
  lightbox.setAttribute("aria-hidden", "false");
  document.body.style.overflow = "hidden";
}
function closeLightbox() {
  lightbox.classList.remove("open");
  lightbox.setAttribute("aria-hidden", "true");
  document.body.style.overflow = "";
}
function stepLightbox(dir) {
  lbIndex = (lbIndex + dir + workItems.length) % workItems.length;
  openLightbox(lbIndex);
}
workItems.forEach((item, i) => item.addEventListener("click", () => openLightbox(i)));
document.getElementById("closeLightbox")?.addEventListener("click", closeLightbox);
document.getElementById("lbPrev")?.addEventListener("click", () => stepLightbox(1));
document.getElementById("lbNext")?.addEventListener("click", () => stepLightbox(-1));
lightbox?.addEventListener("click", e => { if (e.target === lightbox) closeLightbox(); });
document.addEventListener("keydown", e => {
  if (!lightbox.classList.contains("open")) return;
  if (e.key === "Escape") closeLightbox();
  if (e.key === "ArrowLeft") stepLightbox(1);
  if (e.key === "ArrowRight") stepLightbox(-1);
});

/* ===== نموذج واتساب ===== */
document.getElementById("whatsappForm")?.addEventListener("submit", e => {
  e.preventDefault();
  const name = document.getElementById("fName").value.trim();
  const service = document.getElementById("fService").value;
  const area = document.getElementById("fArea").value.trim();
  const msg = document.getElementById("fMsg").value.trim();
  if (!name || !service) return;
  let text = `مرحباً أستاذ حسين،\nأنا ${name}.\nالخدمة المطلوبة: ${service}`;
  if (area) text += `\nالمنطقة: ${area}`;
  if (msg) text += `\nتفاصيل: ${msg}`;
  window.open("https://wa.me/201120964345?text=" + encodeURIComponent(text), "_blank", "noopener");
});

/* ===== السنة ===== */
const yearEl = document.getElementById("year");
if (yearEl) yearEl.textContent = new Date().getFullYear();

/* ===== بريلودر ===== */
window.addEventListener("load", () => {
  setTimeout(() => document.getElementById("preloader")?.classList.add("done"), 800);
});
setTimeout(() => document.getElementById("preloader")?.classList.add("done"), 3000);

/* ===== تكسير العنوان حرف حرف ===== */
document.querySelectorAll(".split-title .line").forEach(line => {
  const text = line.textContent;
  line.textContent = "";
  [...text].forEach((ch, i) => {
    const s = document.createElement("span");
    s.className = "char";
    s.style.setProperty("--i", i);
    s.textContent = ch === " " ? "\u00A0" : ch;
    line.appendChild(s);
  });
});

/* ===== كانفس الشرارات ===== */
(() => {
  const c = document.getElementById("fxCanvas");
  if (!c || matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  const ctx = c.getContext("2d");
  let W, H, sparks = [];
  const resize = () => { W = c.width = innerWidth; H = c.height = innerHeight; };
  resize();
  addEventListener("resize", resize);
  class Spark {
    constructor() { this.reset(true); }
    reset(init) {
      this.x = Math.random() * W;
      this.y = init ? Math.random() * H : -10;
      this.vx = (Math.random() - .5) * .4;
      this.vy = .3 + Math.random() * .7;
      this.r = .5 + Math.random() * 1.8;
      this.life = 0;
      this.max = 140 + Math.random() * 220;
      this.hue = Math.random() < .8 ? 46 : 200;
    }
    step() {
      this.x += this.vx;
      this.y += this.vy;
      this.life++;
      if (this.life > this.max || this.y > H + 10) this.reset(false);
      const a = Math.sin((this.life / this.max) * Math.PI) * .5;
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
      ctx.fillStyle = `hsla(${this.hue},95%,60%,${a})`;
      ctx.shadowColor = `hsla(${this.hue},95%,55%,.85)`;
      ctx.shadowBlur = 10;
      ctx.fill();
      ctx.shadowBlur = 0;
    }
  }
  for (let i = 0; i < 50; i++) sparks.push(new Spark());
  let visible = true;
  document.addEventListener("visibilitychange", () => { visible = !document.hidden; });
  (function loop() {
    requestAnimationFrame(loop);
    if (!visible) return;
    ctx.clearRect(0, 0, W, H);
    sparks.forEach(s => s.step());
  })();
})();

/* ===== ميلان ثلاثي الأبعاد ===== */
document.querySelectorAll(".tilt").forEach(card => {
  card.addEventListener("mousemove", e => {
    const r = card.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width - .5;
    const y = (e.clientY - r.top) / r.height - .5;
    card.style.transform = `translateY(-6px) rotateX(${-y * 8}deg) rotateY(${x * 8}deg)`;
  });
  card.addEventListener("mouseleave", () => { card.style.transform = ""; });
});

/* ===== دخول متتالٍ للمعرض ===== */
document.querySelectorAll(".work-item").forEach((item, i) => {
  item.style.setProperty("--d", (i % 4) * 80 + "ms");
});
