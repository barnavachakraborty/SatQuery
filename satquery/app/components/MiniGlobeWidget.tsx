"use client";

import React, { useEffect, useRef } from "react";
import * as THREE from "three";
import { Globe, Maximize2 } from "lucide-react";

interface MiniGlobeWidgetProps {
  lat?: string;
  lon?: string;
  locationName?: string;
  onExpand?: () => void;
}

export const MiniGlobeWidget: React.FC<MiniGlobeWidgetProps> = ({
  lat = "12°58'N",
  lon = "77°35'E",
  locationName = "Target AOI",
  onExpand,
}) => {
  const mountRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!mountRef.current) return;
    const container = mountRef.current;
    const size = 120; // Fixed square dimension to guarantee perfect 1:1 spherical aspect ratio

    // Scene & Camera
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(38, 1, 0.1, 50);
    camera.position.set(0, 0, 2.9);

    // Renderer
    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: "high-performance",
    });
    renderer.setSize(size, size, false);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;

    // Force strict 1:1 square canvas styles to prevent any flex/CSS stretching
    renderer.domElement.style.width = "100%";
    renderer.domElement.style.height = "100%";
    renderer.domElement.style.display = "block";
    renderer.domElement.style.borderRadius = "50%";
    container.innerHTML = "";
    container.appendChild(renderer.domElement);

    // Group for 23.4° Earth axial tilt
    const earthTiltGroup = new THREE.Group();
    earthTiltGroup.rotation.z = -THREE.MathUtils.degToRad(23.4);
    scene.add(earthTiltGroup);

    // Texture Loader
    const textureLoader = new THREE.TextureLoader();

    // 1. Photorealistic NASA Satellite Day Map
    const earthDayMap = textureLoader.load("/earth_day.jpg");
    earthDayMap.colorSpace = THREE.SRGBColorSpace;

    // 2. High-resolution Ocean Specular Map
    const earthSpecularMap = textureLoader.load("/earth_specular.jpg");

    // 3. High-resolution Topographic Normal Map
    const earthNormalMap = textureLoader.load("/earth_normal.jpg");

    // 4. Real Cloud Satellite Map
    const earthCloudsMap = textureLoader.load("/earth_clouds.jpg");

    // Base Earth Sphere
    const earthGeo = new THREE.SphereGeometry(0.92, 48, 48);
    const earthMat = new THREE.MeshStandardMaterial({
      map: earthDayMap,
      normalMap: earthNormalMap,
      normalScale: new THREE.Vector2(0.65, 0.65),
      roughnessMap: earthSpecularMap,
      roughness: 0.6,
      metalness: 0.1,
    });
    const earth = new THREE.Mesh(earthGeo, earthMat);
    earthTiltGroup.add(earth);

    // Real Cloud Overlay Layer
    const cloudGeo = new THREE.SphereGeometry(0.932, 48, 48);
    const cloudMat = new THREE.MeshStandardMaterial({
      map: earthCloudsMap,
      transparent: true,
      opacity: 0.45,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    const clouds = new THREE.Mesh(cloudGeo, cloudMat);
    earthTiltGroup.add(clouds);

    // Photorealistic Atmosphere Edge Glow (Fresnel Limb Glow)
    const atmosGeo = new THREE.SphereGeometry(0.948, 48, 48);
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
          float intensity = pow(0.65 - dot(vNormal, vec3(0.0, 0.0, 1.0)), 2.0);
          gl_FragColor = vec4(0.18, 0.68, 1.0, 1.0) * intensity * 1.5;
        }
      `,
      blending: THREE.AdditiveBlending,
      side: THREE.BackSide,
      transparent: true,
    });
    const atmosphere = new THREE.Mesh(atmosGeo, atmosMat);
    scene.add(atmosphere);

    // Sleek Orbit Track Ring
    const orbitGeo = new THREE.RingGeometry(1.08, 1.09, 64);
    const orbitMat = new THREE.MeshBasicMaterial({
      color: 0x0ea5e9,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.35,
    });
    const orbit = new THREE.Mesh(orbitGeo, orbitMat);
    orbit.rotation.x = Math.PI / 2.2;
    scene.add(orbit);

    // Orbiting Satellite Beacon Dot
    const beaconGeo = new THREE.SphereGeometry(0.025, 16, 16);
    const beaconMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8 });
    const beacon = new THREE.Mesh(beaconGeo, beaconMat);
    scene.add(beacon);

    // Natural Sunlight Lighting (Directional + Space Ambient)
    const sunLight = new THREE.DirectionalLight(0xfffaed, 2.2);
    sunLight.position.set(3.5, 2.0, 3.0);
    scene.add(sunLight);

    const spaceAmbient = new THREE.AmbientLight(0x2a3b4c, 1.2);
    scene.add(spaceAmbient);

    // Soft Blue Rim Fill Light
    const fillLight = new THREE.DirectionalLight(0x38bdf8, 0.6);
    fillLight.position.set(-3.0, -1.0, -2.0);
    scene.add(fillLight);

    // Animation Loop
    let animId: number;
    let clock = new THREE.Clock();

    const animate = () => {
      animId = requestAnimationFrame(animate);
      const elapsed = clock.getElapsedTime();

      // Earth & Cloud smooth rotation along tilted axis
      earth.rotation.y += 0.0035;
      clouds.rotation.y += 0.0045;

      // Orbiting beacon position
      const orbitAngle = elapsed * 0.7;
      beacon.position.x = Math.cos(orbitAngle) * 1.085;
      beacon.position.y = Math.sin(orbitAngle) * 1.085 * Math.cos(Math.PI / 2.2);
      beacon.position.z = Math.sin(orbitAngle) * 1.085 * Math.sin(Math.PI / 2.2);

      renderer.render(scene, camera);
    };
    animate();

    return () => {
      cancelAnimationFrame(animId);
      if (renderer.domElement.parentNode) {
        renderer.domElement.parentNode.removeChild(renderer.domElement);
      }
      renderer.dispose();
      earthGeo.dispose();
      earthMat.dispose();
      cloudGeo.dispose();
      cloudMat.dispose();
      atmosGeo.dispose();
      atmosMat.dispose();
      orbitGeo.dispose();
      orbitMat.dispose();
      beaconGeo.dispose();
      beaconMat.dispose();
    };
  }, []);

  return (
    <div
      onClick={onExpand}
      className="group relative flex flex-col items-center p-2.5 rounded-xl bg-[#ffffff]/90 border border-[#ded6c5] hover:border-[#b24316] hover:shadow-md transition-all duration-200 cursor-pointer"
      title="Click to switch to full 3D Earth Orbit View"
    >
      {/* Globe Canvas Container: Explicit 1:1 Aspect Ratio */}
      <div className="relative w-28 h-28 aspect-square flex items-center justify-center rounded-full overflow-hidden bg-[#030712] shadow-inner border border-[#0ea5e9]/20 group-hover:border-[#0ea5e9]/50 transition-colors">
        <div ref={mountRef} className="w-full h-full aspect-square" />
        
        {/* Subtle hover expand icon */}
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity rounded-full backdrop-blur-[1px]">
          <span className="flex items-center gap-1 text-[10px] font-mono text-cyan-200 bg-black/70 px-2 py-0.5 rounded-full border border-cyan-400/40">
            <Maximize2 className="w-2.5 h-2.5" /> 3D View
          </span>
        </div>
      </div>

      {/* Telemetry Labels */}
      <div className="w-full mt-2 pt-2 border-t border-[#ded6c5]/70 flex flex-col items-center">
        <div className="flex items-center justify-between w-full text-[10px] font-mono text-[#5f5b55]">
          <span className="flex items-center gap-1 font-semibold text-[#232220]">
            <Globe className="w-3 h-3 text-[#b24316]" />
            <span>Sub-Sat Nadir</span>
          </span>
          <span className="inline-flex items-center gap-1 text-[9px] text-emerald-600 font-bold bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-200">
            <span className="w-1 h-1 rounded-full bg-emerald-500 animate-ping" />
            TRACK
          </span>
        </div>
        <div className="w-full flex items-center justify-between text-[9px] font-mono text-[#8c867c] mt-0.5">
          <span className="truncate max-w-[95px] font-medium text-[#474440]">{locationName}</span>
          <span className="text-[#b24316] font-semibold">{lat}, {lon}</span>
        </div>
      </div>
    </div>
  );
};
