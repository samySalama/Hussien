const menuBtn = document.getElementById("menuBtn");
const nav = document.getElementById("nav");
menuBtn?.addEventListener("click", () => nav.classList.toggle("open"));
document.querySelectorAll(".nav a").forEach(a => a.addEventListener("click", () => nav.classList.remove("open")));

const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add("visible");
      observer.unobserve(entry.target);
    }
  });
}, {threshold: 0.08});
document.querySelectorAll(".reveal").forEach(el => observer.observe(el));

const lightbox = document.getElementById("lightbox");
const lightboxImg = document.getElementById("lightboxImg");
document.querySelectorAll(".gallery-item").forEach(item => {
  item.addEventListener("click", () => {
    lightboxImg.src = item.dataset.full;
    lightboxImg.alt = item.querySelector("img")?.alt || "";
    lightbox.classList.add("open");
    lightbox.setAttribute("aria-hidden", "false");
  });
});
function closeLightbox(){
  lightbox.classList.remove("open");
  lightbox.setAttribute("aria-hidden", "true");
  lightboxImg.src = "";
}
document.getElementById("closeLightbox").addEventListener("click", closeLightbox);
lightbox.addEventListener("click", e => { if(e.target === lightbox) closeLightbox(); });
document.addEventListener("keydown", e => { if(e.key === "Escape") closeLightbox(); });
document.getElementById("year").textContent = new Date().getFullYear();
