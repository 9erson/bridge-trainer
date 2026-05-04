import "@testing-library/jest-dom/vitest";

// Polyfill window.matchMedia for libraries that use it (e.g., sonner's Toaster)
// jsdom does not implement this API natively.
if (typeof window !== "undefined" && !window.matchMedia) {
  Object.defineProperty(window, "matchMedia", {
    writable: true,
    value: (query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: () => {},
      removeListener: () => {},
      addEventListener: () => {},
      removeEventListener: () => {},
      dispatchEvent: () => false,
    }),
  });
}
