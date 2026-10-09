/* ===== القائمة للموبايل ===== */
const menuBtn = document.getElementById("menuBtn");
const nav = document.getElementById("nav");
menuBtn?.addEventListener("click", () => {
  const isOpen = nav.classList.toggle("open");
  menuBtn.classList.toggle("open", isOpen);
  menuBtn.setAttribute("aria-expanded", isOpen);
});
document.querySelectorAll(".nav a").forEach(a =>
  a.addEventListener("click", () => {
    nav.classList.remove("open");
    menuBtn.classList.remove("open");
    menuBtn.setAttribute("aria-expanded", "false");
  })
);

/* ===== الهيدر عند السكرول + شريط التقدم + زر الأعلى ===== */
const header = document.getElementById("siteHeader");
const progress = document.getElementById("scrollProgress");
const backToTop = document.getElementById("backToTop");
window.addEventListener("scroll", () => {
  const y = window.scrollY;
  header.classList.toggle("scrolled", y > 40);
  backToTop.classList.toggle("show", y > 600);
  const h = document.documentElement.scrollHeight - innerHeight;
  progress.style.width = (h > 0 ? (y / h) * 100 : 0) + "%";
}, { passive: true });
backToTop.addEventListener("click", () => window.scrollTo({ top: 0, behavior: "smooth" }));

/* ===== تفعيل اللينك الحالي في القائمة ===== */
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

/* ===== اللايت بوكس مع تنقل ===== */
const lightbox = document.getElementById("lightbox");
const lightboxImg = document.getElementById("lightboxImg");
const galleryItems = [...document.querySelectorAll(".gallery-item")];
let currentIndex = 0;

function openLightbox(i) {
  currentIndex = i;
  const item = galleryItems[i];
  lightboxImg.src = item.dataset.full;
  lightboxImg.alt = item.querySelector("img")?.alt || "";
  lightbox.classList.add("open");
  lightbox.setAttribute("aria-hidden", "false");
  document.body.style.overflow = "hidden";
}
function closeLightbox() {
  lightbox.classList.remove("open");
  lightbox.setAttribute("aria-hidden", "true");
  lightboxImg.src = "";
  document.body.style.overflow = "";
}
function stepLightbox(dir) {
  openLightbox((currentIndex + dir + galleryItems.length) % galleryItems.length);
}
galleryItems.forEach((item, i) => item.addEventListener("click", () => openLightbox(i)));
document.getElementById("closeLightbox").addEventListener("click", closeLightbox);
document.getElementById("lbPrev").addEventListener("click", e => { e.stopPropagation(); stepLightbox(-1); });
document.getElementById("lbNext").addEventListener("click", e => { e.stopPropagation(); stepLightbox(1); });
lightbox.addEventListener("click", e => { if (e.target === lightbox) closeLightbox(); });
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
  let text = `مرحباً أستاذ حسين،\nأنا ${name}.\nالخدمة المطلوبة: ${service}`;
  if (area) text += `\nالمنطقة: ${area}`;
  if (msg) text += `\nتفاصيل: ${msg}`;
  window.open("https://wa.me/201120964345?text=" + encodeURIComponent(text), "_blank", "noopener");
});

/* ===== السنة الحالية ===== */
document.getElementById("year").textContent = new Date().getFullYear();
