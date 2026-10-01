import { useEffect } from "react";

export function useScrollReveal(dependencies = []) {
  useEffect(() => {
    let observer;
    let mutationObserver;

    const revealElement = (el) => {
      if (!el.classList.contains("revealed")) {
        el.classList.add("revealed");
      }
    };

    const checkVisibleElements = () => {
      const elements = document.querySelectorAll(
        ".reveal, .reveal-left, .reveal-right, .reveal-scale"
      );
      const viewportHeight =
        window.innerHeight || document.documentElement.clientHeight;

      elements.forEach((el) => {
        const rect = el.getBoundingClientRect();
        // Reveal if element top has reached 92% of viewport or if it's already past it
        if (rect.top <= viewportHeight * 0.92 || rect.top < 0) {
          revealElement(el);
          if (observer) {
            observer.unobserve(el);
          }
        }
      });
    };

    const initObserver = () => {
      const elements = document.querySelectorAll(
        ".reveal, .reveal-left, .reveal-right, .reveal-scale"
      );

      if ("IntersectionObserver" in window) {
        if (observer) observer.disconnect();

        observer = new IntersectionObserver(
          (entries) => {
            entries.forEach((entry) => {
              if (entry.isIntersecting) {
                revealElement(entry.target);
                observer.unobserve(entry.target);
              }
            });
          },
          {
            root: null,
            rootMargin: "0px 0px -40px 0px", // Triggers when element is 40px inside the viewport so animation is clearly visible
            threshold: 0.12,
          }
        );

        elements.forEach((el) => {
          const rect = el.getBoundingClientRect();
          const viewportHeight =
            window.innerHeight || document.documentElement.clientHeight;

          // Only immediately reveal elements visible on the immediate initial hero viewport
          if (rect.top <= viewportHeight * 0.75 && rect.bottom >= 0) {
            revealElement(el);
          } else {
            observer.observe(el);
          }
        });
      } else {
        checkVisibleElements();
      }
    };

    // Watch for DOM mutations (new components mounted, tabs switched)
    if ("MutationObserver" in window) {
      mutationObserver = new MutationObserver(() => {
        initObserver();
        checkVisibleElements();
      });

      mutationObserver.observe(document.body, {
        childList: true,
        subtree: true,
      });
    }

    // Run scans at staggered intervals to guarantee elements are revealed
    initObserver();
    const t1 = setTimeout(() => {
      initObserver();
      checkVisibleElements();
    }, 50);

    const t2 = setTimeout(checkVisibleElements, 180);
    const t3 = setTimeout(checkVisibleElements, 400);
    const t4 = setTimeout(checkVisibleElements, 800);

    const handleScrollOrResize = () => {
      checkVisibleElements();
    };

    window.addEventListener("scroll", handleScrollOrResize, { passive: true });
    window.addEventListener("resize", handleScrollOrResize, { passive: true });

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
      window.removeEventListener("scroll", handleScrollOrResize);
      window.removeEventListener("resize", handleScrollOrResize);
      if (observer) observer.disconnect();
      if (mutationObserver) mutationObserver.disconnect();
    };
  }, dependencies);
}
