"use client";

import React, { useEffect, useRef } from "react";
import * as THREE from "three";

interface MiniGlobeWidgetProps {
  lat?: string;
  lon?: string;
  onExpand?: () => void;
}

export const MiniGlobeWidget: React.FC<MiniGlobeWidgetProps> = ({ lat = "12°N", lon = "77°E", onExpand }) => {
  const mountRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!mountRef.current) return;
    const container = mountRef.current;
    const size = container.clientWidth || 160;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(40, 1, 0.1, 100);
    camera.position.z = 2.4;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(size, size);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    // Realistic NASA Satellite Earth Globe
    const textureLoader = new THREE.TextureLoader();
    const earthMap = textureLoader.load("/earth_day.jpg");
    earthMap.colorSpace = THREE.SRGBColorSpace;

    const geo = new THREE.SphereGeometry(0.85, 36, 36);
    const mat = new THREE.MeshStandardMaterial({
      map: earthMap,
      roughness: 0.6,
      metalness: 0.1,
    });
    const globe = new THREE.Mesh(geo, mat);
    scene.add(globe);

    // Orbit ring
    const ringGeo = new THREE.RingGeometry(1.08, 1.10, 48);
    const ringMat = new THREE.MeshBasicMaterial({ color: 0xb24316, side: THREE.DoubleSide, transparent: true, opacity: 0.8 });
    const ring = new THREE.Mesh(ringGeo, ringMat);
    ring.rotation.x = Math.PI / 2.5;
    scene.add(ring);

    // Nadir target dot
    const dotGeo = new THREE.SphereGeometry(0.04, 16, 16);
    const dotMat = new THREE.MeshBasicMaterial({ color: 0x00f0ff });
    const dot = new THREE.Mesh(dotGeo, dotMat);
    dot.position.set(0.4, 0.45, 0.65);
    scene.add(dot);

    // Lights
    const light = new THREE.DirectionalLight(0xffffff, 2.0);
    light.position.set(3, 2, 3);
    scene.add(light);
    scene.add(new THREE.AmbientLight(0x1a2e40, 1.5));

    let animId: number;
    const animate = () => {
      animId = requestAnimationFrame(animate);
      globe.rotation.y += 0.006;
      ring.rotation.z += 0.003;
      renderer.render(scene, camera);
    };
    animate();

    return () => {
      cancelAnimationFrame(animId);
      if (renderer.domElement.parentNode) {
        renderer.domElement.parentNode.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, []);

  return (
    <div
      onClick={onExpand}
      className="cursor-pointer group relative flex flex-col items-center p-2 rounded-lg bg-[#ffffff]/80 border border-[#ded6c5] hover:border-[#b24316] transition-all shadow-sm"
      title="Click to view full 3D Earth Globe"
    >
      <div ref={mountRef} className="w-24 h-24 relative flex items-center justify-center" />
      <div className="text-[10px] font-mono text-[#5f5b55] flex items-center gap-1 mt-1">
        <span className="w-1.5 h-1.5 rounded-full bg-[#b24316] animate-pulse" />
        <span>3D Sub-Sat Nadir</span>
      </div>
      <div className="text-[9px] text-[#8c867c] font-mono">{lat}, {lon}</div>
    </div>
  );
};
