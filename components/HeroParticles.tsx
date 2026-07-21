"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";

/**
 * Slow, drifting particle field for the hero background (inspired by
 * particle-love.com). Particles flow along a smooth pseudo-noise field in
 * obsidian / muted-steel tones — calm, low-contrast, gentle motion. The
 * loop pauses when the hero is off screen and honors reduced-motion.
 */
export default function HeroParticles() {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const w = () => mount.clientWidth || 1;
    const h = () => mount.clientHeight || 1;
    const small = w() < 640;

    const SPAN_X = 40;
    const SPAN_Y = 24;
    const COUNT = small ? 700 : 1500; // deliberately sparse

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(70, w() / h(), 0.1, 100);
    camera.position.z = 19;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(w(), h());
    renderer.setClearColor(0x000000, 0);
    mount.appendChild(renderer.domElement);

    const positions = new Float32Array(COUNT * 3);
    for (let i = 0; i < COUNT; i++) {
      positions[i * 3] = (Math.random() - 0.5) * SPAN_X;
      positions[i * 3 + 1] = (Math.random() - 0.5) * SPAN_Y;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 8;
    }
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));

    const material = new THREE.ShaderMaterial({
      uniforms: { uColor: { value: new THREE.Color(0x6b7d9c) } }, // muted steel
      vertexShader: `
        void main() {
          vec4 mv = modelViewMatrix * vec4(position, 1.0);
          gl_PointSize = 2.4 * (300.0 / -mv.z);
          gl_Position = projectionMatrix * mv;
        }
      `,
      fragmentShader: `
        uniform vec3 uColor;
        void main() {
          float d = distance(gl_PointCoord, vec2(0.5));
          if (d > 0.5) discard;
          float a = smoothstep(0.5, 0.0, d) * 0.42;
          gl_FragColor = vec4(uColor, a);
        }
      `,
      transparent: true,
      depthWrite: false,
      blending: THREE.NormalBlending,
    });

    const points = new THREE.Points(geometry, material);
    scene.add(points);
    const posAttr = geometry.attributes.position as THREE.BufferAttribute;

    // smooth flow-field angle from summed sines — no library, organic swirl
    const flow = (x: number, y: number, t: number) =>
      (Math.sin(x * 0.16 + t) +
        Math.sin(y * 0.19 - t * 0.8) +
        Math.sin((x + y) * 0.1 + t * 0.5)) *
      (Math.PI * 0.6);

    const mouse = { x: 0, y: 0 };
    const onMove = (e: MouseEvent) => {
      const r = mount.getBoundingClientRect();
      mouse.x = ((e.clientX - r.left) / r.width) * 2 - 1;
      mouse.y = -(((e.clientY - r.top) / r.height) * 2 - 1);
    };
    window.addEventListener("mousemove", onMove, { passive: true });

    let raf = 0;
    let t = 0;
    let running = false;
    const step = () => {
      if (!running) return;
      t += 0.0016; // slow drift
      for (let i = 0; i < COUNT; i++) {
        let x = posAttr.getX(i);
        let y = posAttr.getY(i);
        const a = flow(x, y, t);
        x += Math.cos(a) * 0.011 + mouse.x * 0.0016;
        y += Math.sin(a) * 0.011 + mouse.y * 0.0016;
        if (x > SPAN_X / 2) x = -SPAN_X / 2;
        else if (x < -SPAN_X / 2) x = SPAN_X / 2;
        if (y > SPAN_Y / 2) y = -SPAN_Y / 2;
        else if (y < -SPAN_Y / 2) y = SPAN_Y / 2;
        posAttr.setX(i, x);
        posAttr.setY(i, y);
      }
      posAttr.needsUpdate = true;
      points.rotation.z += (mouse.x * 0.03 - points.rotation.z) * 0.02;
      renderer.render(scene, camera);
      raf = requestAnimationFrame(step);
    };
    const start = () => {
      if (running || reduce) return;
      running = true;
      raf = requestAnimationFrame(step);
    };
    const stop = () => {
      running = false;
      cancelAnimationFrame(raf);
    };

    const io = new IntersectionObserver(
      ([entry]) => (entry.isIntersecting ? start() : stop()),
      { threshold: 0.01 }
    );
    io.observe(mount);
    if (reduce) renderer.render(scene, camera);

    const onResize = () => {
      if (!mount.clientWidth) return;
      camera.aspect = w() / h();
      camera.updateProjectionMatrix();
      renderer.setSize(w(), h());
    };
    window.addEventListener("resize", onResize);

    return () => {
      io.disconnect();
      cancelAnimationFrame(raf);
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("resize", onResize);
      geometry.dispose();
      material.dispose();
      renderer.dispose();
      renderer.domElement.remove();
    };
  }, []);

  return <div ref={mountRef} className="hero-particles" aria-hidden="true" />;
}