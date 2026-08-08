"use client";

import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import graph from "@/data/codebase-graph.json";
import { colorFor } from "@/lib/graphColors";

type Hover = { label: string; degree: number; x: number; y: number } | null;

/**
 * The knowledge graph as a slowly rotating 3D point cloud — additive glow on
 * the nodes, faint filaments on the edges, hover to name a node. Coordinates
 * are baked (scripts/bake-graph.py), so there is no physics at runtime.
 * Mounted only on capable devices; everyone else keeps the SVG.
 */
export default function GraphCanvas() {
  const mountRef = useRef<HTMLDivElement>(null);
  const [hover, setHover] = useState<Hover>(null);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const w = () => mount.clientWidth || 1;
    const h = () => mount.clientHeight || 1;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(50, w() / h(), 0.1, 100);
    camera.position.z = 3.35;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(w(), h());
    renderer.setClearColor(0x000000, 0);
    mount.appendChild(renderer.domElement);

    const group = new THREE.Group();
    scene.add(group);

    const N = graph.nodes.length;
    const positions = new Float32Array(N * 3);
    const colors = new Float32Array(N * 3);
    const sizes = new Float32Array(N);
    const phases = new Float32Array(N);
    const c = new THREE.Color();

    graph.nodes.forEach((n, i) => {
      positions[i * 3] = n.p[0] * 1.35;
      positions[i * 3 + 1] = n.p[1] * 1.35;
      positions[i * 3 + 2] = n.p[2] * 1.35;
      c.set(colorFor(n.c));
      colors[i * 3] = c.r;
      colors[i * 3 + 1] = c.g;
      colors[i * 3 + 2] = c.b;
      sizes[i] = Math.min(15 + n.d * 3.0, 58);
      // Deterministic per-node offset so the twinkle never marches in step.
      phases[i] = (i * 12.9898) % (Math.PI * 2);
    });

    const nodeGeo = new THREE.BufferGeometry();
    nodeGeo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    nodeGeo.setAttribute("color", new THREE.BufferAttribute(colors, 3));
    nodeGeo.setAttribute("size", new THREE.BufferAttribute(sizes, 1));
    nodeGeo.setAttribute("phase", new THREE.BufferAttribute(phases, 1));

    // Tight core + wide falloff halo under additive blending gives the bloom
    // without a post-processing pass. Depth fade sells the far side of the shell.
    const nodeMat = new THREE.ShaderMaterial({
      uniforms: { uTime: { value: 0 } },
      vertexShader: `
        attribute float size;
        attribute float phase;
        uniform float uTime;
        varying vec3 vColor;
        varying float vDepth;
        varying float vTwinkle;
        void main() {
          vColor = color;
          vTwinkle = 0.72 + 0.28 * sin(uTime * 1.6 + phase);
          vec4 mv = modelViewMatrix * vec4(position, 1.0);
          // 0 at the near face of the shell, 1 at the far face.
          vDepth = clamp((-mv.z - 2.1) / 2.6, 0.0, 1.0);
          gl_PointSize = size * (1.0 / -mv.z) * 2.4 * (0.75 + 0.25 * vTwinkle);
          gl_Position = projectionMatrix * mv;
        }
      `,
      fragmentShader: `
        varying vec3 vColor;
        varying float vDepth;
        varying float vTwinkle;
        void main() {
          float d = distance(gl_PointCoord, vec2(0.5));
          if (d > 0.5) discard;
          float core = pow(smoothstep(0.5, 0.0, d), 3.0);
          float halo = smoothstep(0.5, 0.0, d) * 0.55;
          float far = mix(1.0, 0.4, vDepth);
          vec3 col = mix(vColor, vec3(1.0), core * 0.65);
          gl_FragColor = vec4(col, (core + halo) * far * vTwinkle);
        }
      `,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      vertexColors: true,
    });

    const points = new THREE.Points(nodeGeo, nodeMat);
    group.add(points);

    // Edges — one segment pair per link, coloured from the source node.
    const linkPos = new Float32Array(graph.links.length * 6);
    const linkCol = new Float32Array(graph.links.length * 6);
    graph.links.forEach(([a, b], i) => {
      const na = graph.nodes[a];
      const nb = graph.nodes[b];
      linkPos.set(
        [
          na.p[0] * 1.35, na.p[1] * 1.35, na.p[2] * 1.35,
          nb.p[0] * 1.35, nb.p[1] * 1.35, nb.p[2] * 1.35,
        ],
        i * 6
      );
      c.set(colorFor(na.c));
      linkCol.set([c.r, c.g, c.b, c.r, c.g, c.b], i * 6);
    });
    const linkGeo = new THREE.BufferGeometry();
    linkGeo.setAttribute("position", new THREE.BufferAttribute(linkPos, 3));
    linkGeo.setAttribute("color", new THREE.BufferAttribute(linkCol, 3));
    const linkMat = new THREE.LineBasicMaterial({
      vertexColors: true,
      transparent: true,
      opacity: 0.16, // filaments, not scaffolding — the nodes carry the image
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });
    group.add(new THREE.LineSegments(linkGeo, linkMat));

    // Hover: raycast the point cloud, report the nearest node to React.
    const ray = new THREE.Raycaster();
    ray.params.Points = { threshold: 0.055 };
    const ndc = new THREE.Vector2();
    let pointer: { x: number; y: number } | null = null;
    let tilt = 0;

    const onMove = (e: PointerEvent) => {
      const r = mount.getBoundingClientRect();
      pointer = { x: e.clientX - r.left, y: e.clientY - r.top };
      ndc.x = (pointer.x / r.width) * 2 - 1;
      ndc.y = -((pointer.y / r.height) * 2 - 1);
      tilt = ndc.x;
    };
    const onLeave = () => {
      pointer = null;
      setHover(null);
    };
    mount.addEventListener("pointermove", onMove, { passive: true });
    mount.addEventListener("pointerleave", onLeave, { passive: true });

    let raf = 0;
    let running = false;
    let lastPick = 0;

    const step = (time: number) => {
      if (!running) return;
      nodeMat.uniforms.uTime.value = time * 0.001;
      group.rotation.y += 0.0016;
      group.rotation.x += (tilt * 0.16 - group.rotation.x) * 0.03;

      // Throttle picking; raycasting every frame is wasted work.
      if (pointer && time - lastPick > 90) {
        lastPick = time;
        ray.setFromCamera(ndc, camera);
        const hit = ray.intersectObject(points, false)[0];
        if (hit && hit.index != null) {
          const n = graph.nodes[hit.index];
          setHover({ label: n.l, degree: n.d, x: pointer.x, y: pointer.y });
        } else {
          setHover(null);
        }
      }

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
    if (reduce) {
      group.rotation.y = 0.5;
      nodeMat.uniforms.uTime.value = 0;
      renderer.render(scene, camera);
    }

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
      mount.removeEventListener("pointermove", onMove);
      mount.removeEventListener("pointerleave", onLeave);
      window.removeEventListener("resize", onResize);
      nodeGeo.dispose();
      nodeMat.dispose();
      linkGeo.dispose();
      linkMat.dispose();
      renderer.dispose();
      renderer.domElement.remove();
    };
  }, []);

  return (
    <div className="graph-canvas" ref={mountRef} aria-hidden="true">
      {hover && (
        <div className="graph-tip caption" style={{ left: hover.x, top: hover.y }}>
          <strong>{hover.label}</strong>
          <span>
            {hover.degree} connection{hover.degree === 1 ? "" : "s"}
          </span>
        </div>
      )}
    </div>
  );
}
