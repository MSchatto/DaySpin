(() => {
  const languageButtons = [...document.querySelectorAll("[data-language]")];
  const languageBlocks = [...document.querySelectorAll("[data-content-language]")];
  const requested = new URLSearchParams(location.search).get("lang");
  const stored = localStorage.getItem("dayspin-language");
  const system = (navigator.languages?.[0] || navigator.language || "en").toLowerCase();
  const initial = ["de", "en"].includes(requested) ? requested : (["de", "en"].includes(stored) ? stored : (system.startsWith("de") ? "de" : "en"));

  const setLanguage = (language, updateAddress = false) => {
    const selected = language === "en" ? "en" : "de";
    document.documentElement.lang = selected;
    languageBlocks.forEach((block) => { block.hidden = block.dataset.contentLanguage !== selected; });
    languageButtons.forEach((button) => button.setAttribute("aria-pressed", String(button.dataset.language === selected)));
    document.querySelectorAll("[data-title-de]").forEach((element) => {
      element.textContent = selected === "de" ? element.dataset.titleDe : element.dataset.titleEn;
    });
    localStorage.setItem("dayspin-language", selected);
    if (updateAddress) {
      const url = new URL(location.href);
      url.searchParams.set("lang", selected);
      history.replaceState({}, "", url);
    }
  };

  languageButtons.forEach((button) => button.addEventListener("click", () => setLanguage(button.dataset.language, true)));
  setLanguage(initial);

  const reducedMotion = matchMedia("(prefers-reduced-motion: reduce)");
  document.querySelectorAll("[data-demo-loop]").forEach((video) => {
    if (reducedMotion.matches) {
      video.pause();
      return;
    }

    let restarting = false;
    video.addEventListener("ended", () => {
      if (restarting) return;
      restarting = true;
      video.classList.add("is-fading-out");

      window.setTimeout(() => {
        const revealAndPlay = () => {
          window.setTimeout(() => {
            video.classList.remove("is-fading-out");
            video.play().catch(() => {});
            restarting = false;
          }, 320);
        };

        video.currentTime = 0;
        if (video.readyState >= 2) revealAndPlay();
        else video.addEventListener("canplay", revealAndPlay, { once: true });
      }, 1150);
    });
  });

  const shareButton = document.querySelector("[data-share]");
  if (shareButton) {
    shareButton.addEventListener("click", async () => {
      const isGerman = document.documentElement.lang === "de";
      const data = {
        title: "DaySpin",
        text: isGerman ? "Entdecke DaySpin – den Apple-Kalender zum Drehen." : "Discover DaySpin – the Apple calendar with a spin.",
        url: location.href.split("?")[0]
      };
      try {
        if (navigator.share) await navigator.share(data);
        else {
          await navigator.clipboard.writeText(data.url);
          shareButton.textContent = isGerman ? "Link kopiert" : "Link copied";
          setTimeout(() => { shareButton.textContent = isGerman ? "DaySpin teilen" : "Share DaySpin"; }, 1600);
        }
      } catch (_) {}
    });
  }
})();
