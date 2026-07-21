"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";

/**
 * Interactive 3D particle wave (Three.js) used as the backdrop of the work grid.
 * A grid of glowing points ripples continuously and parallax-tilts toward the
 * cursor. Transparent canvas so the section background shows through; pointer
 * events pass through to the cards on top.
 */
export default function ParticleWave() {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const small = mount.clientWidth < 640;

    const COLS = small ? 34 : 54;
    const ROWS = small ? 18 : 27;
    const SEP = 0.5;
    const count = COLS * ROWS;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(62, mount.clientWidth / mount.clientHeight, 1, 300);
    camera.position.set(0, 7, 15);
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(mount.clientWidth, mount.clientHeight);
    renderer.setClearColor(0x000000, 0);
    mount.appendChild(renderer.domElement);

    // base grid on the XZ plane; y is driven by the wave each frame
    const positions = new Float32Array(count * 3);
    const scales = new Float32Array(count);
    const baseX = new Float32Array(count);
    const baseZ = new Float32Array(count);
    let idx = 0;
    for (let ix = 0; ix < COLS; ix++) {
      for (let iz = 0; iz < ROWS; iz++) {
        const x = ix * SEP - (COLS * SEP) / 2;
        const z = iz * SEP - (ROWS * SEP) / 2;
        positions[idx * 3] = x;
        positions[idx * 3 + 1] = 0;
        positions[idx * 3 + 2] = z;
        baseX[idx] = x;
        baseZ[idx] = z;
        scales[idx] = 1;
        idx++;
      }
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute("scale", new THREE.BufferAttribute(scales, 1));

    const material = new THREE.ShaderMaterial({
      uniforms: {
        uHi: { value: new THREE.Color(0x63769b) },
        uLo: { value: new THREE.Color(0x232e44) },
      },
      vertexShader: `
        attribute float scale;
        varying float vH;
        void main() {
          vH = position.y;
          vec4 mv = modelViewMatrix * vec4(position, 1.0);
          gl_PointSize = scale * (200.0 / -mv.z);
          gl_Position = projectionMatrix * mv;
        }
      `,
      fragmentShader: `
        uniform vec3 uHi;
        uniform vec3 uLo;
        varying float vH;
        void main() {
          float d = distance(gl_PointCoord, vec2(0.5));
          if (d > 0.5) discard;
          float alpha = smoothstep(0.5, 0.05, d) * 0.85;
          vec3 col = mix(uLo, uHi, clamp(vH * 0.35 + 0.5, 0.0, 1.0));
          gl_FragColor = vec4(col, alpha);
        }
      `,
      transparent: true,
      depthWrite: false,
      blending: THREE.NormalBlending,
    });

    const points = new THREE.Points(geometry, material);
    scene.add(points);

    const posAttr = geometry.attributes.position as THREE.BufferAttribute;
    const scaleAttr = geometry.attributes.scale as THREE.BufferAttribute;

    const target = { x: 0, y: 0 };
    const eased = { x: 0, y: 0 };
    const onMove = (e: MouseEvent) => {
      const r = mount.getBoundingClientRect();
      target.x = ((e.clientX - r.left) / r.width) * 2 - 1;
      target.y = ((e.clientY - r.top) / r.height) * 2 - 1;
    };
    window.addEventListener("mousemove", onMove, { passive: true });

    const wave = (t: number) => {
      for (let k = 0; k < count; k++) {
        const x = baseX[k];
        const z = baseZ[k];
        const y =
          Math.sin(x * 0.3 + t) * 0.55 +
          Math.sin(z * 0.42 + t * 1.1) * 0.55 +
          Math.sin((x + z) * 0.2 + t * 0.7) * 0.28;
        posAttr.setY(k, y);
        scaleAttr.setX(k, (Math.sin(x * 0.3 + t) + 1.8) * 0.8);
      }
      posAttr.needsUpdate = true;
      scaleAttr.needsUpdate = true;
    };

    let raf = 0;
    let t = 0;
    let running = false;
    const render = () => {
      if (!running) return;
      t += 0.010;
      wave(t);
      eased.x += (target.x - eased.x) * 0.045;
      eased.y += (target.y - eased.y) * 0.045;
      points.rotation.z = eased.x * 0.18;
      points.rotation.x = eased.y * 0.12;
      camera.position.x += (eased.x * 4 - camera.position.x) * 0.03;
      camera.lookAt(0, 0, 0);
      renderer.render(scene, camera);
      raf = requestAnimationFrame(render);
    };
    const start = () => {
      if (running || reduce) return;
      running = true;
      raf = requestAnimationFrame(render);
    };
    const stop = () => {
      running = false;
      cancelAnimationFrame(raf);
    };

    // Only animate while the section is on screen.
    const io = new IntersectionObserver(
      ([entry]) => (entry.isIntersecting ? start() : stop()),
      { threshold: 0.01 }
    );
    io.observe(mount);

    if (reduce) {
      wave(0.6);
      renderer.render(scene, camera);
    }

    const onResize = () => {
      if (!mount.clientWidth) return;
      camera.aspect = mount.clientWidth / mount.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(mount.clientWidth, mount.clientHeight);
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

  return <div ref={mountRef} className="work-canvas" aria-hidden="true" />;
}