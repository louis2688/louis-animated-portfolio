// Lazy-loads gsap + ScrollTrigger once (registering the plugin) so the library
// stays out of the initial bundle and only downloads after first paint. All
// GSAP-driven components await this instead of importing gsap statically.
type GsapBundle = {
  gsap: typeof import("gsap").gsap;
  ScrollTrigger: typeof import("gsap/ScrollTrigger").ScrollTrigger;
};

let cache: Promise<GsapBundle> | null = null;

export function loadGsap(): Promise<GsapBundle> {
  if (!cache) {
    cache = Promise.all([import("gsap"), import("gsap/ScrollTrigger")]).then(
      ([core, st]) => {
        const gsap = core.gsap;
        const ScrollTrigger = st.ScrollTrigger;
        gsap.registerPlugin(ScrollTrigger);
        return { gsap, ScrollTrigger };
      }
    );
  }
  return cache;
}
