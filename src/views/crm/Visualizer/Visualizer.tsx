import React, { useEffect, useRef } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";

const ThreeJS360Viewer = () => {
    const imageUrl = '/Images/bi3.jpg'
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer();
    renderer.setSize(window.innerWidth, window.innerHeight);
    mountRef.current?.appendChild(renderer.domElement);

    // Load the 360° image as a texture
    const textureLoader = new THREE.TextureLoader();
    textureLoader.load(
      imageUrl,
      (texture) => {
        // Create a sphere geometry
        const sphereGeometry = new THREE.SphereGeometry(500, 60, 60); // A large sphere
        sphereGeometry.scale(-1, 1, 1); // Invert the sphere to view from the inside

        const sphereMaterial = new THREE.MeshBasicMaterial({ map: texture });
        const sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);

        scene.add(sphere);
      },
      undefined,
      (error:any) => {
        console.error("An error occurred while loading the texture:", error.message || error);
      }
    );

    // Set up the camera to be inside the sphere
    camera.position.set(0, 0, 0.1); // Slightly inside the sphere

    // Set up OrbitControls for camera movement
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true; // Enable smooth movement
    controls.dampingFactor = 0.25;
    controls.screenSpacePanning = false; // Prevent camera panning in screen space

    // Animation loop
    const animate = () => {
      requestAnimationFrame(animate);
      controls.update(); // Update controls for damping
      renderer.render(scene, camera);
    };
    animate();

    // Clean up on unmount
    return () => {
      mountRef.current?.removeChild(renderer.domElement);
    };
  }, [imageUrl]);

  return <div ref={mountRef} style={{ width: "100%", height: "100vh" }}></div>;
};

export default ThreeJS360Viewer;
