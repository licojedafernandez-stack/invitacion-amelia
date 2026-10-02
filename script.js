const EVENT = Object.freeze({
  name: "Amelia",
  invitation: "Los invito a celebrar mi primer añito",
  dateTime: "2026-10-24T16:00:00-03:00",
  displayDate: "24 · 10 · 2026",
  longDate: "Sábado 24 de octubre de 2026",
  time: "16:00",
  venue: "La Chacra",
  location: "Parcela A77 · Camino 1.2B, Viedma, Río Negro",
  rsvpDeadline: "22 de octubre",
  whatsappNumber: "542920483904",
  whatsappMessage: "Hola, confirmo mi asistencia al primer cumpleaños de Amelia",
  mapUrl: "https://www.google.com/maps?q=-40.81933292868327,-63.089263321043006",
});

const setText = (id, value) => {
  const element = document.getElementById(id);
  if (element) element.textContent = value;
};

function populateEventDetails() {
  setText("event-name", EVENT.name);
  setText("invitation-copy", EVENT.invitation);
  setText("hero-date", EVENT.displayDate);
  setText("hero-time", EVENT.time);
  setText("detail-date", EVENT.longDate);
  setText("detail-time", `${EVENT.time} hs`);
  setText("venue-name", EVENT.venue);
  setText("location-label", EVENT.location);
  setText("map-location-label", EVENT.location);
  setText("rsvp-deadline", EVENT.rsvpDeadline);

  document.getElementById("map-link").href = EVENT.mapUrl;
  document.getElementById("whatsapp-link").href =
    `https://wa.me/${EVENT.whatsappNumber}?text=${encodeURIComponent(EVENT.whatsappMessage)}`;
}

function getCountdownState(now = Date.now()) {
  const eventTime = new Date(EVENT.dateTime).getTime();
  const distance = eventTime - now;

  if (distance <= 0) return { status: "celebrating" };

  return {
    status: "upcoming",
    days: Math.floor(distance / 86_400_000),
    hours: Math.floor((distance % 86_400_000) / 3_600_000),
    minutes: Math.floor((distance % 3_600_000) / 60_000),
    seconds: Math.floor((distance % 60_000) / 1_000),
  };
}

function updateCountdown() {
  const state = getCountdownState();
  const countdown = document.getElementById("countdown");
  const celebration = document.getElementById("celebration-message");

  if (state.status === "celebrating") {
    countdown.hidden = true;
    celebration.hidden = false;
    return false;
  }

  setText("days", String(state.days).padStart(2, "0"));
  setText("hours", String(state.hours).padStart(2, "0"));
  setText("minutes", String(state.minutes).padStart(2, "0"));
  setText("seconds", String(state.seconds).padStart(2, "0"));
  return true;
}

function enableScrollReveals() {
  const items = document.querySelectorAll(".reveal-on-scroll");

  if (!("IntersectionObserver" in window)) {
    items.forEach((item) => item.classList.add("is-visible"));
    return;
  }

  const observer = new IntersectionObserver(
    (entries, currentObserver) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-visible");
        currentObserver.unobserve(entry.target);
      });
    },
    { threshold: 0.14, rootMargin: "0px 0px -8% 0px" },
  );

  items.forEach((item) => observer.observe(item));
}

function enableScrollScenes() {
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const scenes = document.querySelectorAll(
    ".hero, .countdown-section, .details-section, .rsvp-section",
  );
  const parallaxItems = document.querySelectorAll("[data-parallax]");

  if (reduceMotion.matches || !scenes.length) return;

  document.body.classList.add("scroll-scenes");
  document.querySelectorAll(".reveal").forEach((element) => {
    element.addEventListener("animationend", () => element.classList.remove("reveal"), {
      once: true,
    });
  });
  let frameRequested = false;

  const clamp = (value) => Math.min(1, Math.max(0, value));
  const clampSigned = (value) => Math.min(1, Math.max(-1, value));

  const paintScenes = () => {
    const viewportHeight = window.innerHeight;
    const fadeDistance = Math.max(240, viewportHeight * 0.42);
    const maxTravel = window.innerWidth <= 600 ? 40 : 70;
    const sceneProgress = new Map();

    scenes.forEach((scene) => {
      const bounds = scene.getBoundingClientRect();
      const entering = clamp((viewportHeight - bounds.top) / fadeDistance);
      const leaving = clamp(bounds.bottom / fadeDistance);
      const visibility = Math.min(entering, leaving);
      const hiddenAmount = 1 - visibility;
      const isApproaching = bounds.top > viewportHeight * 0.46;
      const shift = hiddenAmount * (isApproaching ? 28 : -20);
      const sceneCenter = bounds.top + bounds.height / 2;
      const progressRange = (viewportHeight + bounds.height) / 2;
      const progress = clampSigned((viewportHeight / 2 - sceneCenter) / progressRange);

      scene.style.setProperty("--scene-opacity", visibility.toFixed(3));
      scene.style.setProperty("--scene-blur", `${(hiddenAmount * 4.5).toFixed(2)}px`);
      scene.style.setProperty("--scene-shift", `${shift.toFixed(2)}px`);
      scene.style.setProperty("--scene-scale", (1 - hiddenAmount * 0.018).toFixed(4));
      sceneProgress.set(scene, progress);
    });

    parallaxItems.forEach((item) => {
      const scene = item.closest("section");
      const progress = sceneProgress.get(scene) ?? 0;
      const depth = Number.parseFloat(item.dataset.parallax) || 0;
      const rotationDepth = Number.parseFloat(item.dataset.parallaxRotate) || 0;
      const offset = progress * maxTravel * depth;
      const rotation = progress * rotationDepth;

      item.style.setProperty("--parallax-y", `${offset.toFixed(2)}px`);
      item.style.setProperty("--parallax-rotate", `${rotation.toFixed(3)}deg`);
    });

    frameRequested = false;
  };

  const requestPaint = () => {
    if (frameRequested) return;
    frameRequested = true;
    window.requestAnimationFrame(paintScenes);
  };

  window.addEventListener("scroll", requestPaint, { passive: true });
  window.addEventListener("resize", requestPaint);
  paintScenes();
}

populateEventDetails();
enableScrollReveals();
enableScrollScenes();

if (updateCountdown()) {
  const countdownTimer = window.setInterval(() => {
    if (!updateCountdown()) window.clearInterval(countdownTimer);
  }, 1000);
}
