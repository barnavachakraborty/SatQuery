"use client";

import React, { useEffect, useRef } from "react";
import * as THREE from "three";
import { Sparkles, ArrowRight, Radio, Shield, Globe2, Eye } from "lucide-react";

interface EarthHeroLandingProps {
  onEnterApp: () => void;
}

export const EarthHeroLanding: React.FC<EarthHeroLandingProps> = ({ onEnterApp }) => {
  const mountRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!mountRef.current) return;
    const container = mountRef.current;
    const width = container.clientWidth;
    const height = container.clientHeight;

    // --- Three.js Scene Setup ---
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x020408, 0.0018);

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(0, 0, 3.2);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: "high-performance" });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;
    container.appendChild(renderer.domElement);

    // --- REAL NASA SATELLITE EARTH SPHERE ---
    const textureLoader = new THREE.TextureLoader();
    
    // Real Satellite Day Color Map
    const earthDayMap = textureLoader.load("/earth_day.jpg");
    earthDayMap.colorSpace = THREE.SRGBColorSpace;

    // Real Specular Map (ocean reflections)
    const earthSpecularMap = textureLoader.load("/earth_specular.jpg");

    // Real Normal Map (topographic mountain relief)
    const earthNormalMap = textureLoader.load("/earth_normal.jpg");

    // Real Cloud Satellite Overlay
    const earthCloudsMap = textureLoader.load("/earth_clouds.jpg");

    const earthGeo = new THREE.SphereGeometry(1.0, 64, 64);
    const earthMat = new THREE.MeshStandardMaterial({
      map: earthDayMap,
      normalMap: earthNormalMap,
      normalScale: new THREE.Vector2(0.85, 0.85),
      roughnessMap: earthSpecularMap,
      roughness: 0.65,
      metalness: 0.1,
    });
    const earth = new THREE.Mesh(earthGeo, earthMat);
    scene.add(earth);

    // --- Atmospheric Halo / Glow ---
    const atmosGeo = new THREE.SphereGeometry(1.035, 64, 64);
    const atmosMat = new THREE.ShaderMaterial({
      vertexShader: `
        varying vec3 vNormal;
        void main() {
          vNormal = normalize(normalMatrix * normal);
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        varying vec3 vNormal;
        void main() {
          float intensity = pow(0.7 - dot(vNormal, vec3(0.0, 0.0, 1.0)), 2.2);
          gl_FragColor = vec4(0.0, 0.72, 1.0, 1.0) * intensity * 1.6;
        }
      `,
      blending: THREE.AdditiveBlending,
      side: THREE.BackSide,
      transparent: true,
    });
    const atmosphere = new THREE.Mesh(atmosGeo, atmosMat);
    scene.add(atmosphere);

    // --- Real Cloud Layer Mesh ---
    const cloudGeo = new THREE.SphereGeometry(1.016, 64, 64);
    const cloudMat = new THREE.MeshStandardMaterial({
      map: earthCloudsMap,
      transparent: true,
      opacity: 0.42,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    const clouds = new THREE.Mesh(cloudGeo, cloudMat);
    scene.add(clouds);
    scene.add(clouds);

    // --- Sentinel Orbiting Rings ---
    // Sentinel-1 (SAR) Polar Orbit Ring
    const orbit1Geo = new THREE.RingGeometry(1.22, 1.23, 96);
    const orbit1Mat = new THREE.MeshBasicMaterial({
      color: 0x00f0ff,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.45,
    });
    const orbit1 = new THREE.Mesh(orbit1Geo, orbit1Mat);
    orbit1.rotation.x = Math.PI / 2.3;
    orbit1.rotation.y = 0.3;
    scene.add(orbit1);

    // Sentinel-2 (Optical) Sun-Synchronous Orbit Ring
    const orbit2Geo = new THREE.RingGeometry(1.35, 1.36, 96);
    const orbit2Mat = new THREE.MeshBasicMaterial({
      color: 0xffaa00,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.35,
    });
    const orbit2 = new THREE.Mesh(orbit2Geo, orbit2Mat);
    orbit2.rotation.x = Math.PI / 1.7;
    orbit2.rotation.y = -0.4;
    scene.add(orbit2);

    // Satellite Beacon Dots
    const sat1Geo = new THREE.SphereGeometry(0.022, 16, 16);
    const sat1Mat = new THREE.MeshBasicMaterial({ color: 0x00f0ff });
    const sat1 = new THREE.Mesh(sat1Geo, sat1Mat);
    scene.add(sat1);

    const sat2Geo = new THREE.SphereGeometry(0.022, 16, 16);
    const sat2Mat = new THREE.MeshBasicMaterial({ color: 0xffb703 });
    const sat2 = new THREE.Mesh(sat2Geo, sat2Mat);
    scene.add(sat2);

    // Indian Subcontinent Target Grounding Spot
    const targetGeo = new THREE.SphereGeometry(0.028, 16, 16);
    const targetMat = new THREE.MeshBasicMaterial({ color: 0x10b981 });
    const targetMarker = new THREE.Mesh(targetGeo, targetMat);
    scene.add(targetMarker);

    // --- CONTINUOUS FALLING SNOW / COSMIC PARTICLES ---
    const particleCount = 2200;
    const particleGeo = new THREE.BufferGeometry();
    const posArray = new Float32Array(particleCount * 3);
    const speedArray = new Float32Array(particleCount);

    for (let i = 0; i < particleCount; i++) {
      posArray[i * 3 + 0] = (Math.random() - 0.5) * 12; // X
      posArray[i * 3 + 1] = Math.random() * 10 - 2;      // Y
      posArray[i * 3 + 2] = (Math.random() - 0.5) * 8;  // Z
      speedArray[i] = Math.random() * 0.007 + 0.003;
    }
    particleGeo.setAttribute("position", new THREE.BufferAttribute(posArray, 3));

    // Snowflake particle texture
    const snowCanvas = document.createElement("canvas");
    snowCanvas.width = 32;
    snowCanvas.height = 32;
    const sCtx = snowCanvas.getContext("2d")!;
    const sGrad = sCtx.createRadialGradient(16, 16, 0, 16, 16, 16);
    sGrad.addColorStop(0, "rgba(255,255,255,1)");
    sGrad.addColorStop(0.3, "rgba(180,230,255,0.75)");
    sGrad.addColorStop(1, "rgba(0,0,0,0)");
    sCtx.fillStyle = sGrad;
    sCtx.fillRect(0, 0, 32, 32);

    const snowTexture = new THREE.CanvasTexture(snowCanvas);
    const particleMat = new THREE.PointsMaterial({
      size: 0.045,
      map: snowTexture,
      transparent: true,
      opacity: 0.85,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    const snowParticles = new THREE.Points(particleGeo, particleMat);
    scene.add(snowParticles);

    // --- Lighting ---
    const sunLight = new THREE.DirectionalLight(0xffffff, 2.2);
    sunLight.position.set(5, 3, 4);
    scene.add(sunLight);

    const ambientLight = new THREE.AmbientLight(0x0a1c38, 1.2);
    scene.add(ambientLight);

    const rimLight = new THREE.DirectionalLight(0x00f0ff, 1.5);
    rimLight.position.set(-4, 2, -2);
    scene.add(rimLight);

    // --- Mouse & Interactive Rotation ---
    let mouseX = 0;
    let mouseY = 0;
    let targetRotationX = 0;
    let targetRotationY = 0;
    let isDragging = false;
    let prevX = 0;
    let prevY = 0;

    const handlePointerMove = (e: MouseEvent) => {
      mouseX = (e.clientX / window.innerWidth) * 2 - 1;
      mouseY = -(e.clientY / window.innerHeight) * 2 + 1;
      if (isDragging) {
        const deltaX = e.clientX - prevX;
        const deltaY = e.clientY - prevY;
        earth.rotation.y += deltaX * 0.005;
        earth.rotation.x += deltaY * 0.003;
        prevX = e.clientX;
        prevY = e.clientY;
      }
    };

    const handleMouseDown = (e: MouseEvent) => {
      isDragging = true;
      prevX = e.clientX;
      prevY = e.clientY;
    };

    const handleMouseUp = () => {
      isDragging = false;
    };

    container.addEventListener("mousedown", handleMouseDown);
    window.addEventListener("mousemove", handlePointerMove);
    window.addEventListener("mouseup", handleMouseUp);

    // Touch support for mobile/trackpad
    const handleTouchStart = (e: TouchEvent) => {
      if (e.touches.length > 0) {
        isDragging = true;
        prevX = e.touches[0].clientX;
        prevY = e.touches[0].clientY;
      }
    };
    const handleTouchMove = (e: TouchEvent) => {
      if (isDragging && e.touches.length > 0) {
        const deltaX = e.touches[0].clientX - prevX;
        const deltaY = e.touches[0].clientY - prevY;
        earth.rotation.y += deltaX * 0.005;
        earth.rotation.x += deltaY * 0.003;
        prevX = e.touches[0].clientX;
        prevY = e.touches[0].clientY;
      }
    };
    const handleTouchEnd = () => {
      isDragging = false;
    };
    container.addEventListener("touchstart", handleTouchStart);
    window.addEventListener("touchmove", handleTouchMove);
    window.addEventListener("touchend", handleTouchEnd);

    // --- Animation Loop ---
    let clock = new THREE.Clock();
    let animFrameId: number;

    const animate = () => {
      animFrameId = requestAnimationFrame(animate);
      const elapsed = clock.getElapsedTime();

      // Earth & Cloud continuous rotation
      if (!isDragging) {
        earth.rotation.y += 0.0016;
        clouds.rotation.y += 0.0021;
      }

      // Parallax smooth reaction to mouse
      camera.position.x += (mouseX * 0.25 - camera.position.x) * 0.03;
      camera.position.y += (mouseY * 0.25 - camera.position.y) * 0.03;
      camera.lookAt(0, 0, 0);

      // Satellite 1 Orbiting motion
      const angle1 = elapsed * 0.55;
      sat1.position.x = Math.cos(angle1) * 1.22;
      sat1.position.y = Math.sin(angle1) * 1.22 * Math.cos(Math.PI / 2.3);
      sat1.position.z = Math.sin(angle1) * 1.22 * Math.sin(Math.PI / 2.3);

      // Satellite 2 Orbiting motion
      const angle2 = -elapsed * 0.42 + 1.5;
      sat2.position.x = Math.cos(angle2) * 1.35;
      sat2.position.y = Math.sin(angle2) * 1.35 * Math.cos(Math.PI / 1.7);
      sat2.position.z = Math.sin(angle2) * 1.35 * Math.sin(Math.PI / 1.7);

      // Indian Target point on rotating globe
      const targetAngle = earth.rotation.y + 0.8;
      targetMarker.position.set(
        Math.sin(targetAngle) * Math.cos(0.4) * 1.01,
        Math.sin(0.4) * 1.01,
        Math.cos(targetAngle) * Math.cos(0.4) * 1.01
      );

      // CONTINUOUS FALLING SNOW PHYSICS
      const positions = particleGeo.attributes.position.array as Float32Array;
      for (let i = 0; i < particleCount; i++) {
        positions[i * 3 + 1] -= speedArray[i]; // Fall downwards
        positions[i * 3 + 0] += Math.sin(elapsed * 0.8 + i) * 0.001; // Gentle wind sway

        // Reset to top when fell below floor
        if (positions[i * 3 + 1] < -3.5) {
          positions[i * 3 + 1] = 6.0;
          positions[i * 3 + 0] = (Math.random() - 0.5) * 12;
        }
      }
      particleGeo.attributes.position.needsUpdate = true;

      renderer.render(scene, camera);
    };

    animate();

    // Resize Handler
    const handleResize = () => {
      if (!mountRef.current) return;
      const w = mountRef.current.clientWidth;
      const h = mountRef.current.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("mousemove", handlePointerMove);
      window.removeEventListener("mouseup", handleMouseUp);
      window.removeEventListener("touchmove", handleTouchMove);
      window.removeEventListener("touchend", handleTouchEnd);
      container.removeEventListener("mousedown", handleMouseDown);
      container.removeEventListener("touchstart", handleTouchStart);
      window.removeEventListener("resize", handleResize);
      cancelAnimationFrame(animFrameId);
      if (renderer.domElement.parentNode) {
        renderer.domElement.parentNode.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, []);

  return (
    <div className="relative w-full h-full min-h-screen bg-[#020408] text-white flex flex-col justify-between overflow-hidden select-none">
      {/* Three.js Canvas Container (Full Background) */}
      <div ref={mountRef} className="absolute inset-0 w-full h-full z-0 cursor-grab active:cursor-grabbing" />

      {/* Atmospheric Vignette & Top Tint */}
      <div className="absolute inset-0 pointer-events-none bg-gradient-to-b from-[#020408]/70 via-transparent to-[#020408]/90 z-10" />

      {/* TOP MISSION CONTROL STRIP */}
      <header className="relative z-20 px-6 py-4 flex items-center justify-between border-b border-white/10 backdrop-blur-md bg-black/30">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-500 via-blue-600 to-amber-500 p-[1px] shadow-lg shadow-cyan-500/20">
            <div className="w-full h-full bg-[#030712] rounded-[11px] flex items-center justify-center">
              <Globe2 className="w-5 h-5 text-cyan-400 animate-spin" style={{ animationDuration: "16s" }} />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] uppercase font-mono tracking-widest text-cyan-400 font-semibold">
                ISRO // DEPT OF SPACE · SIH 26167
              </span>
              <span className="inline-flex items-center gap-1 px-2 py-0.2 rounded-full text-[9px] font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                CONSTELLATION ACTIVE
              </span>
            </div>
            <h1 className="text-sm font-bold text-white tracking-tight flex items-center gap-2">
              SatQuery AI <span className="text-slate-400 font-normal text-xs">· Team Sentinel</span>
            </h1>
          </div>
        </div>

        {/* Constellation Telemetry Ticker */}
        <div className="hidden lg:flex items-center gap-6 text-xs font-mono text-slate-300">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-cyan-400" />
            <span className="text-slate-400">Sentinel-1B (SAR):</span>
            <span className="text-cyan-300 font-bold">IW C-Band</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-amber-400" />
            <span className="text-slate-400">Sentinel-2A (Optical):</span>
            <span className="text-amber-300 font-bold">13 MSI Bands</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            <span className="text-slate-400">Cartosat-2S & RISAT:</span>
            <span className="text-emerald-300 font-bold">0.6m High-Res</span>
          </div>
        </div>

        {/* Enter Direct Button */}
        <button
          onClick={onEnterApp}
          className="px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-slate-950 font-bold text-xs tracking-wide transition shadow-lg shadow-cyan-500/30 flex items-center gap-1.5 cursor-pointer"
        >
          <span>Launch Workspace</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </header>

      {/* CENTER HERO COPY & CALL TO ACTION */}
      <main className="relative z-20 max-w-4xl mx-auto px-6 text-center my-auto py-12">
        
        {/* Floating Badge */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/5 border border-white/10 backdrop-blur-xl mb-6 shadow-2xl">
          <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
          <span className="text-xs font-medium text-slate-200">
            Next-Gen Multimodal Vision-Language Remote Sensing
          </span>
          <span className="text-[10px] font-mono text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded-full border border-cyan-500/20">
            BigEarthNet.txt Fine-Tuned
          </span>
        </div>

        {/* Main Display Headline */}
        <h2 className="text-4xl md:text-6xl font-extrabold tracking-tight text-white leading-tight md:leading-[1.12] mb-6">
          Query the Earth with{" "}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-sky-300 to-indigo-300">
            Natural Language
          </span>
        </h2>

        <p className="text-base md:text-lg text-slate-300 max-w-2xl mx-auto mb-8 leading-relaxed font-normal">
          An interactive vision-language assistant for satellite remote sensing. Grounding questions over{" "}
          <span className="text-cyan-300 font-semibold">Sentinel-1 SAR</span>,{" "}
          <span className="text-amber-300 font-semibold">Sentinel-2 Optical</span>, and{" "}
          <span className="text-emerald-300 font-semibold">Bi-Temporal change pairs</span> with auditable spatial evidence.
        </p>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-4 mb-10">
          <button
            onClick={onEnterApp}
            className="px-7 py-3.5 rounded-2xl bg-white text-slate-950 font-bold text-sm hover:bg-slate-200 transition-all shadow-xl shadow-cyan-500/20 flex items-center gap-2.5 cursor-pointer transform hover:-translate-y-0.5"
          >
            <Radio className="w-4 h-4 text-cyan-600" />
            <span>Open Interactive SAR & Optical Console</span>
            <ArrowRight className="w-4 h-4 text-slate-900" />
          </button>

          <div className="px-4 py-3 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-lg text-xs font-mono text-slate-300 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <span>Interactive 3D Earth: Drag to rotate</span>
          </div>
        </div>

        {/* Feature Cards Grid (Transparent Glass) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-left max-w-3xl mx-auto">
          <div className="p-3.5 rounded-xl bg-slate-950/60 border border-white/10 backdrop-blur-md">
            <div className="text-xs font-bold text-cyan-400 mb-1 flex items-center gap-1.5 font-mono">
              <Shield className="w-3.5 h-3.5" />
              01 · Optical–SAR Fusion
            </div>
            <p className="text-[11px] text-slate-400 leading-normal">
              Co-registered cross-attention matching radar dielectric backscatter with multispectral NDVI channels.
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-950/60 border border-white/10 backdrop-blur-md">
            <div className="text-xs font-bold text-amber-400 mb-1 flex items-center gap-1.5 font-mono">
              <Eye className="w-3.5 h-3.5" />
              02 · Spatial Grounding
            </div>
            <p className="text-[11px] text-slate-400 leading-normal">
              Instant pixel-precise bounding boxes, radar cross-section (RCS) profiling, and segmentation polygons.
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-950/60 border border-white/10 backdrop-blur-md">
            <div className="text-xs font-bold text-emerald-400 mb-1 flex items-center gap-1.5 font-mono">
              <Globe2 className="w-3.5 h-3.5" />
              03 · Bi-Temporal CD-VQA
            </div>
            <p className="text-[11px] text-slate-400 leading-normal">
              Siamese feature subtraction for automated flood inundation, deforestation, and urban development tracking.
            </p>
          </div>
        </div>

      </main>

      {/* FOOTER STATUS STRIP */}
      <footer className="relative z-20 px-6 py-3 border-t border-white/10 backdrop-blur-md bg-black/40 text-[11px] font-mono text-slate-400 flex flex-wrap items-center justify-between gap-4">
        <div>
          ISRO / SAC · SMART INDIA HACKATHON 2026 · PS 26167
        </div>
        <div className="flex items-center gap-6">
          <span className="text-slate-300">Continuous Cosmic Particle Engine Active</span>
          <span className="text-cyan-400">Click & Drag Earth to Orbit</span>
        </div>
      </footer>
    </div>
  );
};
