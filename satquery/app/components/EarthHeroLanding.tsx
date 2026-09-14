"use client";

import React, { useEffect, useRef } from "react";
import * as THREE from "three";
import {
  ArrowRight,
  Radio,
  Shield,
  Globe2,
  Eye,
  Satellite,
  Move
} from "lucide-react";

interface EarthHeroLandingProps {
  onEnterApp: () => void;
}

export const EarthHeroLanding: React.FC<EarthHeroLandingProps> = ({ onEnterApp }) => {
  const mountRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!mountRef.current) return;
    const container = mountRef.current;
    const width = container.clientWidth || window.innerWidth;
    const height = container.clientHeight || window.innerHeight;

    // --- Three.js Scene Setup ---
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x020408, 0.0018);

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: "high-performance",
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;
    container.innerHTML = "";
    container.appendChild(renderer.domElement);

    // Dynamic Camera Distance Calculation (Ensures Earth fits on all phones & screens)
    const updateCameraDistance = (w: number, h: number) => {
      const aspect = w / h;
      camera.aspect = aspect;
      if (aspect < 1.0) {
        // Mobile / Portrait: calculate distance so Earth (r=1.0) + satellite orbits (r=1.35) fit inside screen
        // Visible half-width at distance Z is Z * tan(vFov / 2) * aspect
        // Required half-width >= 1.55 units for ample breathing room on phones
        const vFovRad = THREE.MathUtils.degToRad(camera.fov);
        const requiredZ = 1.55 / (Math.tan(vFovRad / 2) * aspect);
        camera.position.set(0, -0.05, Math.max(3.2, requiredZ));
      } else {
        // Desktop landscape
        camera.position.set(0, 0, 3.2);
      }
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };

    updateCameraDistance(width, height);

    // --- REAL NASA SATELLITE EARTH SPHERE ---
    const textureLoader = new THREE.TextureLoader();

    const earthDayMap = textureLoader.load("/earth_day.jpg");
    earthDayMap.colorSpace = THREE.SRGBColorSpace;

    const earthSpecularMap = textureLoader.load("/earth_specular.jpg");
    const earthNormalMap = textureLoader.load("/earth_normal.jpg");
    const earthCloudsMap = textureLoader.load("/earth_clouds.jpg");

    // Earth tilt group for natural 23.4° tilt
    const earthTiltGroup = new THREE.Group();
    earthTiltGroup.rotation.z = -THREE.MathUtils.degToRad(23.4);
    scene.add(earthTiltGroup);

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
    earthTiltGroup.add(earth);

    // Atmospheric Halo / Glow
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
    earthTiltGroup.add(atmosphere);

    // Real Cloud Layer Mesh
    const cloudGeo = new THREE.SphereGeometry(1.016, 64, 64);
    const cloudMat = new THREE.MeshStandardMaterial({
      map: earthCloudsMap,
      transparent: true,
      opacity: 0.42,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    const clouds = new THREE.Mesh(cloudGeo, cloudMat);
    earthTiltGroup.add(clouds);

    // Sentinel Orbiting Rings
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

    // Orbiting Satellites
    const sat1Geo = new THREE.BoxGeometry(0.05, 0.03, 0.09);
    const sat1Mat = new THREE.MeshStandardMaterial({ color: 0x00f0ff, roughness: 0.2, metalness: 0.9 });
    const sat1 = new THREE.Mesh(sat1Geo, sat1Mat);
    scene.add(sat1);

    const sat2Geo = new THREE.BoxGeometry(0.06, 0.03, 0.07);
    const sat2Mat = new THREE.MeshStandardMaterial({ color: 0xffaa00, roughness: 0.2, metalness: 0.9 });
    const sat2 = new THREE.Mesh(sat2Geo, sat2Mat);
    scene.add(sat2);

    // Target Ground Marker
    const targetGeo = new THREE.SphereGeometry(0.02, 16, 16);
    const targetMat = new THREE.MeshBasicMaterial({ color: 0x22c55e });
    const targetMarker = new THREE.Mesh(targetGeo, targetMat);
    earth.add(targetMarker);

    // Realistic Space Sunlight & Ambient
    const sunLight = new THREE.DirectionalLight(0xfffaed, 2.6);
    sunLight.position.set(5, 3, 5);
    scene.add(sunLight);

    const ambientLight = new THREE.AmbientLight(0x162232, 1.2);
    scene.add(ambientLight);

    const backRimLight = new THREE.DirectionalLight(0x00f0ff, 0.8);
    backRimLight.position.set(-5, -2, -3);
    scene.add(backRimLight);

    // Falling Snow / Cosmic Dust Particle System
    const particleCount = 280;
    const particleGeo = new THREE.BufferGeometry();
    const particleCoords = new Float32Array(particleCount * 3);
    const speedArray = new Float32Array(particleCount);

    for (let i = 0; i < particleCount; i++) {
      particleCoords[i * 3 + 0] = (Math.random() - 0.5) * 12;
      particleCoords[i * 3 + 1] = Math.random() * 8 - 4;
      particleCoords[i * 3 + 2] = (Math.random() - 0.5) * 6 + 1.5;
      speedArray[i] = Math.random() * 0.004 + 0.002;
    }
    particleGeo.setAttribute("position", new THREE.BufferAttribute(particleCoords, 3));

    const particleMat = new THREE.PointsMaterial({
      color: 0xffffff,
      size: 0.035,
      transparent: true,
      opacity: 0.45,
      blending: THREE.AdditiveBlending,
    });
    const particles = new THREE.Points(particleGeo, particleMat);
    scene.add(particles);

    // --- ROTATION MECHANICS (ANYWHERE ON SCREEN & TOUCH) ---
    let isDragging = false;
    let prevX = 0;
    let prevY = 0;
    let velocityX = 0;
    let velocityY = 0;
    let mouseX = 0;
    let mouseY = 0;

    // Helper: Check if click is on an interactive UI control (button, link, input)
    const isInteractiveElement = (target: EventTarget | null): boolean => {
      if (!target || !(target instanceof Element)) return false;
      return Boolean(
        target.closest("button") ||
        target.closest("a") ||
        target.closest("input") ||
        target.closest(".interactive-control")
      );
    };

    const handlePointerDown = (clientX: number, clientY: number, target: EventTarget | null) => {
      if (isInteractiveElement(target)) return;
      isDragging = true;
      prevX = clientX;
      prevY = clientY;
      velocityX = 0;
      velocityY = 0;
    };

    const handlePointerMove = (clientX: number, clientY: number, e?: Event) => {
      mouseX = (clientX / window.innerWidth) * 2 - 1;
      mouseY = -(clientY / window.innerHeight) * 2 + 1;

      if (isDragging) {
        if (e && e.cancelable) {
          e.preventDefault();
        }
        const deltaX = clientX - prevX;
        const deltaY = clientY - prevY;

        earth.rotation.y += deltaX * 0.005;
        earth.rotation.x += deltaY * 0.003;
        // Limit pitch so Earth doesn't flip upside down
        earth.rotation.x = Math.max(-1.1, Math.min(1.1, earth.rotation.x));

        clouds.rotation.y += deltaX * 0.005;

        velocityX = deltaX * 0.005;
        velocityY = deltaY * 0.003;

        prevX = clientX;
        prevY = clientY;
      }
    };

    const handlePointerUp = () => {
      isDragging = false;
    };

    // Mouse Listeners attached to window so clicking ANYWHERE rotates
    const onMouseDown = (e: MouseEvent) => handlePointerDown(e.clientX, e.clientY, e.target);
    const onMouseMove = (e: MouseEvent) => handlePointerMove(e.clientX, e.clientY);
    const onMouseUp = () => handlePointerUp();

    window.addEventListener("mousedown", onMouseDown);
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);

    // Touch Listeners for Mobile Compatibility
    const onTouchStart = (e: TouchEvent) => {
      if (e.touches.length > 0) {
        handlePointerDown(e.touches[0].clientX, e.touches[0].clientY, e.target);
      }
    };
    const onTouchMove = (e: TouchEvent) => {
      if (isDragging && e.touches.length > 0) {
        handlePointerMove(e.touches[0].clientX, e.touches[0].clientY, e);
      }
    };
    const onTouchEnd = () => handlePointerUp();

    window.addEventListener("touchstart", onTouchStart, { passive: true });
    window.addEventListener("touchmove", onTouchMove, { passive: false });
    window.addEventListener("touchend", onTouchEnd);



    // --- Animation Loop ---
    let clock = new THREE.Clock();
    let animFrameId: number;

    const animate = () => {
      animFrameId = requestAnimationFrame(animate);
      const elapsed = clock.getElapsedTime();

      // Earth & Cloud continuous rotation with inertia damping
      if (!isDragging) {
        if (Math.abs(velocityX) > 0.0001 || Math.abs(velocityY) > 0.0001) {
          earth.rotation.y += velocityX;
          earth.rotation.x += velocityY;
          earth.rotation.x = Math.max(-1.1, Math.min(1.1, earth.rotation.x));
          clouds.rotation.y += velocityX;
          velocityX *= 0.94;
          velocityY *= 0.94;
        } else {
          earth.rotation.y += 0.0016;
          clouds.rotation.y += 0.0021;
        }
      }

      // Parallax smooth reaction to mouse
      camera.position.x += (mouseX * 0.2 - camera.position.x) * 0.02;

      // Satellite 1 Polar Orbit
      const angle1 = elapsed * 0.55;
      sat1.position.x = Math.cos(angle1) * 1.22;
      sat1.position.y = Math.sin(angle1) * 1.22 * Math.cos(Math.PI / 2.3);
      sat1.position.z = Math.sin(angle1) * 1.22 * Math.sin(Math.PI / 2.3);

      // Satellite 2 Sun-Sync Orbit
      const angle2 = -elapsed * 0.42 + 1.5;
      sat2.position.x = Math.cos(angle2) * 1.35;
      sat2.position.y = Math.sin(angle2) * 1.35 * Math.cos(Math.PI / 1.7);
      sat2.position.z = Math.sin(angle2) * 1.35 * Math.sin(Math.PI / 1.7);

      // Continuous falling cosmic snow particles
      const positions = particleGeo.attributes.position.array as Float32Array;
      for (let i = 0; i < particleCount; i++) {
        positions[i * 3 + 1] -= speedArray[i];
        positions[i * 3 + 0] += Math.sin(elapsed * 0.8 + i) * 0.0008;

        if (positions[i * 3 + 1] < -4.0) {
          positions[i * 3 + 1] = 6.0;
          positions[i * 3 + 0] = (Math.random() - 0.5) * 12;
        }
      }
      particleGeo.attributes.position.needsUpdate = true;

      renderer.render(scene, camera);
    };

    animate();

    // Responsive Resize Handler
    const handleResize = () => {
      if (!mountRef.current) return;
      const w = mountRef.current.clientWidth || window.innerWidth;
      const h = mountRef.current.clientHeight || window.innerHeight;
      updateCameraDistance(w, h);
    };
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("mousedown", onMouseDown);
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
      window.removeEventListener("touchstart", onTouchStart);
      window.removeEventListener("touchmove", onTouchMove);
      window.removeEventListener("touchend", onTouchEnd);
      window.removeEventListener("resize", handleResize);
      cancelAnimationFrame(animFrameId);
      if (renderer.domElement.parentNode) {
        renderer.domElement.parentNode.removeChild(renderer.domElement);
      }
      renderer.dispose();
      earthGeo.dispose();
      earthMat.dispose();
      atmosGeo.dispose();
      atmosMat.dispose();
      cloudGeo.dispose();
      cloudMat.dispose();
      orbit1Geo.dispose();
      orbit1Mat.dispose();
      orbit2Geo.dispose();
      orbit2Mat.dispose();
      sat1Geo.dispose();
      sat1Mat.dispose();
      sat2Geo.dispose();
      sat2Mat.dispose();
      particleGeo.dispose();
      particleMat.dispose();
    };
  }, []);

  return (
    <div className="relative w-full h-full min-h-screen bg-[#020408] text-white flex flex-col justify-between overflow-x-hidden overflow-y-auto select-none touch-none">
      
      {/* Three.js Canvas Container (Full Background) */}
      <div
        ref={mountRef}
        className="fixed inset-0 w-full h-full z-0 cursor-grab active:cursor-grabbing"
      />

      {/* Atmospheric Vignette & Top Tint */}
      <div className="fixed inset-0 pointer-events-none bg-gradient-to-b from-[#020408]/80 via-transparent to-[#020408]/90 z-10" />

      {/* TOP MISSION CONTROL HEADER (Mobile Responsive) */}
      <header className="relative z-20 px-4 sm:px-6 lg:px-10 py-3 sm:py-4 flex items-center justify-between border-b border-white/10 backdrop-blur-xl bg-slate-950/50 shadow-2xl flex-shrink-0">
        
        {/* Brand & Project Identity */}
        <div className="flex items-center gap-2.5 sm:gap-3.5">
          <div className="relative w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-tr from-cyan-500 via-sky-600 to-indigo-600 p-[1px] shadow-lg shadow-cyan-500/25 flex-shrink-0">
            <div className="w-full h-full bg-[#030712] rounded-[11px] flex items-center justify-center">
              <Globe2 className="w-4 h-4 sm:w-5 sm:h-5 text-cyan-400 animate-spin" style={{ animationDuration: "20s" }} />
            </div>
            <span className="absolute -bottom-0.5 -right-0.5 w-2 sm:w-2.5 h-2 sm:h-2.5 rounded-full bg-emerald-400 border-2 border-[#030712]" />
          </div>

          <div>
            <div className="flex items-center gap-1.5 sm:gap-2">
              <span className="text-sm sm:text-base font-extrabold text-white tracking-tight">
                SatQuery<span className="text-cyan-400">.AI</span>
              </span>
              <span className="inline-flex items-center px-1.5 py-0.2 sm:px-2 sm:py-0.5 rounded-full text-[9px] sm:text-[10px] font-mono bg-cyan-500/10 text-cyan-300 border border-cyan-500/25">
                SIH 26167
              </span>
            </div>
            <p className="text-[10px] sm:text-[11px] font-mono text-slate-400 hidden sm:block">
              Earth Observation & Radar Intelligence Platform
            </p>
          </div>
        </div>

        {/* Constellation Feeds Ticker (Desktop only) */}
        <nav className="hidden xl:flex items-center gap-6 text-xs font-mono text-slate-300 bg-white/[0.03] border border-white/10 px-5 py-2 rounded-full backdrop-blur-md">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-cyan-400 shadow-sm shadow-cyan-400" />
            <span className="text-slate-400">Sentinel-1:</span>
            <span className="text-cyan-300 font-semibold">C-Band SAR</span>
          </div>
          <span className="text-white/20">/</span>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-amber-400 shadow-sm shadow-amber-400" />
            <span className="text-slate-400">Sentinel-2:</span>
            <span className="text-amber-300 font-semibold">13 MSI Bands</span>
          </div>
          <span className="text-white/20">/</span>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-sm shadow-emerald-400" />
            <span className="text-slate-400">RISAT & EOS-04:</span>
            <span className="text-emerald-300 font-semibold">Polarimetric</span>
          </div>
        </nav>

        {/* Orbit Telemetry & Launch Action */}
        <div className="flex items-center gap-2 sm:gap-4">
          <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/[0.04] border border-white/10 text-xs font-mono text-slate-300">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-slate-400">Orbit:</span>
            <span className="text-emerald-300 font-semibold">LEO 693 km</span>
          </div>

          <button
            onClick={onEnterApp}
            className="group relative px-3.5 sm:px-5 py-2 sm:py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 via-sky-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-slate-950 font-bold text-xs tracking-wide transition-all duration-200 shadow-lg shadow-cyan-500/30 flex items-center gap-1.5 sm:gap-2 cursor-pointer hover:shadow-cyan-400/50 active:scale-95"
          >
            <span>Launch Workspace</span>
            <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 transition-transform group-hover:translate-x-0.5" />
          </button>
        </div>
      </header>

      {/* CENTER HERO COPY (pointer-events-none allows Earth rotation by clicking anywhere) */}
      <main className="relative z-20 w-full max-w-4xl min-w-0 overflow-hidden mx-auto px-4 sm:px-6 text-center my-auto py-4 sm:py-10 pointer-events-none flex-1 flex flex-col justify-center">
        
        {/* Capability Pill */}
        <div className="inline-flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1 sm:py-1.5 rounded-full bg-white/[0.06] border border-cyan-500/30 backdrop-blur-xl mb-3 sm:mb-6 shadow-2xl mx-auto pointer-events-auto">
          <Satellite className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-cyan-400 flex-shrink-0" />
          <span className="text-[10px] sm:text-xs font-medium text-slate-200 truncate">
            Synthetic Aperture Radar & Satellite Analytics
          </span>
          <span className="text-[9px] sm:text-[10px] font-mono text-cyan-300 bg-cyan-500/15 px-1.5 sm:px-2 py-0.2 rounded-full border border-cyan-400/30 flex-shrink-0">
            ISRO
          </span>
        </div>

        {/* Main Display Headline (Responsive Mobile Sizing with word break safety) */}
        <h2 className="text-2xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-tight mb-2.5 sm:mb-5 px-1">
          Query the Earth with{" "}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-sky-300 to-indigo-300">
            Natural Language
          </span>
        </h2>

        <p className="text-[11px] sm:text-base text-slate-300 max-w-xl mx-auto mb-4 sm:mb-8 leading-relaxed font-normal px-2">
          Interrogate complex synthetic aperture radar backscatter, optical satellite imagery, and temporal change pairs with auditable geospatial bounding boxes and radar physics metrics.
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-2.5 sm:gap-4 mb-4 sm:mb-8 pointer-events-auto w-full px-2">
          <button
            onClick={onEnterApp}
            className="w-full sm:w-auto px-5 py-2.5 sm:px-6 sm:py-3 rounded-xl sm:rounded-2xl bg-white text-slate-950 font-bold text-xs sm:text-sm hover:bg-slate-100 transition-all shadow-xl shadow-cyan-500/20 flex items-center justify-center gap-2 cursor-pointer transform hover:-translate-y-0.5 active:translate-y-0"
          >
            <Radio className="w-4 h-4 text-cyan-600 flex-shrink-0" />
            <span className="truncate">Open Interactive SAR & Optical Console</span>
            <ArrowRight className="w-4 h-4 text-slate-900 flex-shrink-0" />
          </button>

          {/* Earth Drag Hint */}
          <div className="hidden sm:flex px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 backdrop-blur-lg text-xs font-mono text-slate-300 items-center gap-2">
            <Move className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
            <span>Click & drag anywhere to rotate Earth</span>
          </div>
        </div>

        {/* Feature Cards: Compact horizontal swipe on mobile, 3-col grid on desktop */}
        <div className="flex md:grid md:grid-cols-3 gap-2 sm:gap-3.5 text-left max-w-3xl mx-auto pointer-events-auto w-full overflow-x-auto pb-1 sm:pb-0 scrollbar-none snap-x">
          <div className="flex-none w-[230px] md:w-auto p-2.5 sm:p-3.5 rounded-xl bg-slate-950/70 border border-white/10 backdrop-blur-md hover:border-cyan-500/40 transition-colors snap-center">
            <div className="text-xs font-bold text-cyan-400 mb-0.5 sm:mb-1 flex items-center gap-1.5 font-mono">
              <Shield className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
              01 · Optical–SAR Fusion
            </div>
            <p className="text-[10px] sm:text-[11px] text-slate-400 leading-normal">
              Cross-attention matching radar backscatter with multispectral NDVI channels.
            </p>
          </div>

          <div className="flex-none w-[230px] md:w-auto p-2.5 sm:p-3.5 rounded-xl bg-slate-950/70 border border-white/10 backdrop-blur-md hover:border-amber-500/40 transition-colors snap-center">
            <div className="text-xs font-bold text-amber-400 mb-0.5 sm:mb-1 flex items-center gap-1.5 font-mono">
              <Eye className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
              02 · Spatial Grounding
            </div>
            <p className="text-[10px] sm:text-[11px] text-slate-400 leading-normal">
              Pixel-precise bounding boxes, radar cross-section (RCS) profiling, and polygons.
            </p>
          </div>

          <div className="flex-none w-[230px] md:w-auto p-2.5 sm:p-3.5 rounded-xl bg-slate-950/70 border border-white/10 backdrop-blur-md hover:border-emerald-500/40 transition-colors snap-center">
            <div className="text-xs font-bold text-emerald-400 mb-0.5 sm:mb-1 flex items-center gap-1.5 font-mono">
              <Globe2 className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
              03 · Bi-Temporal Change
            </div>
            <p className="text-[10px] sm:text-[11px] text-slate-400 leading-normal">
              Siamese feature subtraction for automated flood and deforestation tracking.
            </p>
          </div>
        </div>

      </main>



      {/* REDESIGNED AEROSPACE FOOTER (Mobile Stack) */}
      <footer className="relative z-20 px-4 sm:px-6 lg:px-10 py-3 sm:py-4 border-t border-white/10 backdrop-blur-xl bg-slate-950/70 text-[10px] sm:text-xs font-mono text-slate-400 flex-shrink-0">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2 sm:gap-4 text-center sm:text-left">
          
          {/* Organization & Project */}
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-1.5 sm:gap-3">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            <span className="text-slate-200 font-semibold">SatQuery AI</span>
            <span className="text-slate-600 hidden sm:inline">|</span>
            <span>SIH 2026 · PS-26167</span>
            <span className="text-slate-600 hidden sm:inline">|</span>
            <span className="hidden sm:inline">Space Applications Centre (ISRO)</span>
          </div>

          {/* Status info */}
          <div className="flex items-center gap-3 text-[10px] sm:text-[11px]">
            <span className="text-cyan-400 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
              Touch / Drag Anywhere to Orbit Earth
            </span>
          </div>

        </div>
      </footer>

    </div>
  );
};
