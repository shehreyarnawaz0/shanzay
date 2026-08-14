/* ==========================================================================
   THREE.JS 3D SCENE & INTERACTIVE GRAPHICS ENGINE
   ========================================================================== */

import * as THREE from 'three';
import gsap from 'gsap';

export class BirthdayThreeScene {
  constructor(containerId) {
    this.container = document.getElementById(containerId);
    this.candles = [];
    this.flames = [];
    this.flameLights = [];
    this.balloons = [];
    this.skyLanterns = [];
    this.cursorParticles = [];
    this.candlesBlown = false;
    this.giftBox = null;
    this.giftLid = null;
    this.giftOpened = false;

    this.onGiftClick = null;
    this.onCakeClick = null;

    // Mobile Device Performance Profiling
    this.isMobile = (window.innerWidth < 768) || ('ontouchstart' in window) || /Android|iPhone|iPad|iPod|BlackBerry/i.test(navigator.userAgent);
    this.lastParticleSpawn = 0;

    this.init();
    this.createLighting();
    this.createParticles();
    this.createCake();
    this.createGiftBox();
    this.createBalloons();
    this.createSkyLanterns();
    this.createFloatingEmblems();
    this.setupInteractions();
    this.animate();

    window.addEventListener('resize', () => this.onWindowResize());
  }

  init() {
    this.scene = new THREE.Scene();
    this.scene.fog = new THREE.FogExp2(0x070913, 0.03);

    this.camera = new THREE.PerspectiveCamera(
      50,
      window.innerWidth / window.innerHeight,
      0.1,
      100
    );
    this.camera.position.set(0, 3.5, 9);

    // Highly Optimized WebGL Renderer for Mobile & Desktop
    this.renderer = new THREE.WebGLRenderer({
      antialias: !this.isMobile, // Disable MSAA on mobile GPUs to prevent thermal throttling
      alpha: true,
      powerPreference: "high-performance",
      precision: "mediump"
    });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(this.isMobile ? 1.0 : Math.min(window.devicePixelRatio, 1.5));
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.15;

    this.container.appendChild(this.renderer.domElement);

    // Mouse parallax variables
    this.mouseX = 0;
    this.mouseY = 0;
    this.targetRotationY = 0;
    this.targetRotationX = 0;

    // Shared geometry for cursor particles (prevents memory leaks/lag)
    this.cursorParticleGeo = new THREE.SphereGeometry(0.04, 6, 6);
  }

  createLighting() {
    // Ambient Light
    const ambientLight = new THREE.AmbientLight(0x3a2b5e, 2.0);
    this.scene.add(ambientLight);

    // Main Warm Gold Directional Light (Fast & Lightweight)
    const dirLight = new THREE.DirectionalLight(0xffd700, 3.5);
    dirLight.position.set(4, 10, 5);
    this.scene.add(dirLight);

    // Purple & Cyan Accent Point Lights (limited distance for speed)
    const rimLight1 = new THREE.PointLight(0xff2a8d, 2.5, 12);
    rimLight1.position.set(-5, 4, -3);
    this.scene.add(rimLight1);

    const rimLight2 = new THREE.PointLight(0x00f0ff, 2.5, 12);
    rimLight2.position.set(5, 4, -3);
    this.scene.add(rimLight2);
  }

  createParticles() {
    // Starry Galaxy Particle Cloud (Optimized for Mobile)
    const particleCount = this.isMobile ? 350 : 1200;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);

    const colorPalette = [
      new THREE.Color(0xffd700), // Gold
      new THREE.Color(0xff2a8d), // Pink
      new THREE.Color(0x00f0ff), // Cyan
      new THREE.Color(0x9d4edd)  // Purple
    ];

    for (let i = 0; i < particleCount; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 30;
      positions[i * 3 + 1] = (Math.random() - 0.2) * 20;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 30;

      const randomColor = colorPalette[Math.floor(Math.random() * colorPalette.length)];
      colors[i * 3] = randomColor.r;
      colors[i * 3 + 1] = randomColor.g;
      colors[i * 3 + 2] = randomColor.b;
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    const material = new THREE.PointsMaterial({
      size: 0.12,
      vertexColors: true,
      transparent: true,
      opacity: 0.8,
      blending: THREE.AdditiveBlending
    });

    this.particleCloud = new THREE.Points(geometry, material);
    this.scene.add(this.particleCloud);
  }

  createCake() {
    this.cakeGroup = new THREE.Group();
    this.cakeGroup.position.set(0, -1.2, 0);

    // Cake Tray / Plate
    const plateGeo = new THREE.CylinderGeometry(2.4, 2.6, 0.15, 64);
    const plateMat = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      metalness: 0.9,
      roughness: 0.1
    });
    const plate = new THREE.Mesh(plateGeo, plateMat);
    plate.position.y = 0.075;
    plate.receiveShadow = true;
    this.cakeGroup.add(plate);

    // Cake Tier 1 (Bottom Tier)
    const tier1Geo = new THREE.CylinderGeometry(1.8, 1.8, 0.9, 64);
    const cakeMat1 = new THREE.MeshStandardMaterial({
      color: 0x1f1a3a,
      roughness: 0.3,
      metalness: 0.1
    });
    const tier1 = new THREE.Mesh(tier1Geo, cakeMat1);
    tier1.position.y = 0.6;
    tier1.castShadow = true;
    tier1.receiveShadow = true;
    this.cakeGroup.add(tier1);

    // Gold Cream Trim Tier 1
    const trim1Geo = new THREE.TorusGeometry(1.82, 0.06, 16, 64);
    const goldMat = new THREE.MeshStandardMaterial({
      color: 0xffd700,
      metalness: 0.8,
      roughness: 0.2
    });
    const trim1 = new THREE.Mesh(trim1Geo, goldMat);
    trim1.rotation.x = Math.PI / 2;
    trim1.position.y = 1.05;
    this.cakeGroup.add(trim1);

    // Cake Tier 2 (Top Tier)
    const tier2Geo = new THREE.CylinderGeometry(1.2, 1.2, 0.8, 64);
    const cakeMat2 = new THREE.MeshStandardMaterial({
      color: 0xff2a8d,
      roughness: 0.25
    });
    const tier2 = new THREE.Mesh(tier2Geo, cakeMat2);
    tier2.position.y = 1.45;
    tier2.castShadow = true;
    tier2.receiveShadow = true;
    this.cakeGroup.add(tier2);

    // Frosting Cream Top Layer
    const frostingGeo = new THREE.CylinderGeometry(1.22, 1.22, 0.08, 64);
    const frostingMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.2 });
    const frosting = new THREE.Mesh(frostingGeo, frostingMat);
    frosting.position.y = 1.87;
    this.cakeGroup.add(frosting);

    // Add Candles on Top Tier
    const candleCount = 5;
    const radius = 0.65;
    for (let i = 0; i < candleCount; i++) {
      const angle = (i / candleCount) * Math.PI * 2;
      const cx = Math.cos(angle) * radius;
      const cz = Math.sin(angle) * radius;

      // Candle Stick
      const candleGeo = new THREE.CylinderGeometry(0.04, 0.04, 0.5, 32);
      const candleMat = new THREE.MeshStandardMaterial({ color: 0xffffff, metalness: 0.2 });
      const candle = new THREE.Mesh(candleGeo, candleMat);
      candle.position.set(cx, 2.15, cz);
      candle.castShadow = true;
      this.cakeGroup.add(candle);
      this.candles.push(candle);

      // Flame Geometry
      const flameGeo = new THREE.SphereGeometry(0.07, 16, 16);
      flameGeo.scale(1, 1.8, 1);
      const flameMat = new THREE.MeshBasicMaterial({ color: 0xffae00 });
      const flame = new THREE.Mesh(flameGeo, flameMat);
      flame.position.set(cx, 2.45, cz);
      this.cakeGroup.add(flame);
      this.flames.push(flame);

      // Flame Point Light
      const flameLight = new THREE.PointLight(0xffae00, 1.5, 2.5);
      flameLight.position.set(cx, 2.5, cz);
      this.cakeGroup.add(flameLight);
      this.flameLights.push(flameLight);
    }

    // 3D Cake Slice (hidden initially, flies out when candles blown)
    const sliceGeo = new THREE.CylinderGeometry(1.2, 1.8, 1.6, 64, 1, false, 0, Math.PI * 0.35);
    const sliceMat = new THREE.MeshStandardMaterial({ color: 0xff2a8d, roughness: 0.25 });
    this.cakeSlice = new THREE.Mesh(sliceGeo, sliceMat);
    this.cakeSlice.position.set(1.0, 1.0, 0.6);
    this.cakeSlice.rotation.y = Math.PI / 3;
    this.cakeSlice.castShadow = true;
    this.cakeSlice.scale.set(0, 0, 0); // hidden initially
    this.cakeGroup.add(this.cakeSlice);

    this.cakeGroup.name = "CakeGroup";
    this.scene.add(this.cakeGroup);
  }

  createGiftBox() {
    this.giftGroup = new THREE.Group();
    this.giftGroup.position.set(2.8, -1.0, 1.2);

    // Box Body
    const boxGeo = new THREE.BoxGeometry(1.2, 1.0, 1.2);
    const boxMat = new THREE.MeshStandardMaterial({
      color: 0x9d4edd,
      roughness: 0.2,
      metalness: 0.3
    });
    this.giftBox = new THREE.Mesh(boxGeo, boxMat);
    this.giftBox.position.y = 0.5;
    this.giftBox.castShadow = true;
    this.giftGroup.add(this.giftBox);

    // Box Ribbon (Horizontal & Vertical cross)
    const ribbonMat = new THREE.MeshStandardMaterial({ color: 0xffd700, metalness: 0.8, roughness: 0.2 });
    const ribbon1 = new THREE.Mesh(new THREE.BoxGeometry(1.22, 1.02, 0.2), ribbonMat);
    ribbon1.position.y = 0.5;
    this.giftGroup.add(ribbon1);

    const ribbon2 = new THREE.Mesh(new THREE.BoxGeometry(0.2, 1.02, 1.22), ribbonMat);
    ribbon2.position.y = 0.5;
    this.giftGroup.add(ribbon2);

    // Box Lid
    const lidGeo = new THREE.BoxGeometry(1.28, 0.25, 1.28);
    this.giftLid = new THREE.Mesh(lidGeo, boxMat);
    this.giftLid.position.y = 1.05;
    this.giftLid.castShadow = true;
    this.giftGroup.add(this.giftLid);

    // Lid Ribbon Bow
    const bowGeo = new THREE.TorusGeometry(0.2, 0.05, 16, 32);
    const bow1 = new THREE.Mesh(bowGeo, ribbonMat);
    bow1.rotation.x = Math.PI / 2;
    bow1.position.set(-0.15, 1.22, 0);
    this.giftGroup.add(bow1);

    const bow2 = new THREE.Mesh(bowGeo, ribbonMat);
    bow2.rotation.x = Math.PI / 2;
    bow2.position.set(0.15, 1.22, 0);
    this.giftGroup.add(bow2);

    this.giftGroup.name = "GiftGroup";
    this.scene.add(this.giftGroup);
  }

  createBalloons() {
    const balloonColors = [0xff2a8d, 0xffd700, 0x00f0ff, 0x9d4edd, 0xff7b00];
    const balloonCount = 8;

    for (let i = 0; i < balloonCount; i++) {
      const group = new THREE.Group();
      const color = balloonColors[i % balloonColors.length];

      // Sphere Balloon Shape
      const balloonGeo = new THREE.SphereGeometry(0.65, 32, 32);
      balloonGeo.scale(1, 1.25, 1);
      const balloonMat = new THREE.MeshStandardMaterial({
        color: color,
        roughness: 0.15,
        metalness: 0.2
      });
      const balloon = new THREE.Mesh(balloonGeo, balloonMat);
      balloon.castShadow = true;
      group.add(balloon);

      // Balloon Knot
      const knotGeo = new THREE.ConeGeometry(0.08, 0.1, 16);
      const knot = new THREE.Mesh(knotGeo, balloonMat);
      knot.position.y = -0.8;
      group.add(knot);

      // Position scattered around stage
      const posX = (Math.random() - 0.5) * 10;
      const posY = 1.0 + Math.random() * 3.5;
      const posZ = -1.5 - Math.random() * 4;

      group.position.set(posX, posY, posZ);
      group.userData = {
        baseY: posY,
        speed: 1 + Math.random() * 1.5,
        offset: Math.random() * Math.PI * 2
      };

      this.scene.add(group);
      this.balloons.push(group);
    }
  }

  createSkyLanterns() {
    const lanternCount = 6;
    for (let i = 0; i < lanternCount; i++) {
      const group = new THREE.Group();

      // Outer Paper Mesh (Glowing Golden Amber)
      const lanternGeo = new THREE.CylinderGeometry(0.35, 0.42, 0.8, 16);
      const lanternMat = new THREE.MeshStandardMaterial({
        color: 0xffae00,
        emissive: 0xff6600,
        emissiveIntensity: 0.8,
        roughness: 0.3,
        transparent: true,
        opacity: 0.9
      });
      const paper = new THREE.Mesh(lanternGeo, lanternMat);
      group.add(paper);

      // Inner Light Source
      const light = new THREE.PointLight(0xffae00, 1.2, 4);
      light.position.set(0, 0, 0);
      group.add(light);

      // Position scattered around background sky
      const posX = (Math.random() - 0.5) * 14;
      const posY = Math.random() * 4;
      const posZ = -3 - Math.random() * 5;

      group.position.set(posX, posY, posZ);
      group.userData = {
        speedY: 0.004 + Math.random() * 0.003,
        offset: Math.random() * Math.PI * 2,
        resetZ: posZ
      };

      this.scene.add(group);
      this.skyLanterns.push(group);
    }
  }

  releaseNewLantern() {
    const group = new THREE.Group();
    const lanternGeo = new THREE.CylinderGeometry(0.38, 0.45, 0.85, 16);
    const lanternMat = new THREE.MeshStandardMaterial({
      color: 0xffd700,
      emissive: 0xff8800,
      emissiveIntensity: 1.0,
      roughness: 0.2,
      transparent: true,
      opacity: 0.95
    });
    const paper = new THREE.Mesh(lanternGeo, lanternMat);
    group.add(paper);

    const light = new THREE.PointLight(0xffd700, 1.8, 5);
    light.position.set(0, 0, 0);
    group.add(light);

    const posX = (Math.random() - 0.5) * 8;
    const posY = -2.5;
    const posZ = -1 - Math.random() * 3;

    group.position.set(posX, posY, posZ);
    group.userData = {
      speedY: 0.01 + Math.random() * 0.005,
      offset: Math.random() * Math.PI * 2,
      resetZ: posZ
    };

    this.scene.add(group);
    this.skyLanterns.push(group);

    // Pop scale animation
    gsap.fromTo(group.scale, { x: 0.1, y: 0.1, z: 0.1 }, { x: 1, y: 1, z: 1, duration: 1.2, ease: 'back.out(2)' });
  }

  createFloatingEmblems() {
    // Floating Golden 3D Crown / Star Emblem above cake
    const starShape = new THREE.Shape();
    const points = 5;
    const outerRadius = 0.4;
    const innerRadius = 0.2;
    for (let i = 0; i < points * 2; i++) {
      const r = (i % 2 === 0) ? outerRadius : innerRadius;
      const a = (i / (points * 2)) * Math.PI * 2;
      const x = Math.cos(a) * r;
      const y = Math.sin(a) * r;
      if (i === 0) starShape.moveTo(x, y);
      else starShape.lineTo(x, y);
    }
    starShape.closePath();

    const extrudeSettings = { depth: 0.15, bevelEnabled: true, bevelSegments: 3, steps: 1, bevelSize: 0.04, bevelThickness: 0.04 };
    const starGeo = new THREE.ExtrudeGeometry(starShape, extrudeSettings);
    const starMat = new THREE.MeshStandardMaterial({ color: 0xffd700, metalness: 0.9, roughness: 0.1 });
    
    this.floatingStar = new THREE.Mesh(starGeo, starMat);
    this.floatingStar.position.set(0, 2.2, 0);
    this.scene.add(this.floatingStar);
  }

  spawnCursorParticle(ndcX, ndcY) {
    if (this.isMobile) return; // Completely disable interactive particles on mobile to prevent garbage collection stalls
    const now = performance.now();
    if (now - this.lastParticleSpawn < 80) return; // Throttle particle creation
    this.lastParticleSpawn = now;

    if (this.cursorParticles.length > 12) return;

    const vector = new THREE.Vector3(ndcX, ndcY, 0.5);
    vector.unproject(this.camera);
    const dir = vector.sub(this.camera.position).normalize();
    const distance = 5.5;
    const pos = this.camera.position.clone().add(dir.multiplyScalar(distance));

    const palette = [0xffd700, 0x00f0ff, 0xff2a8d, 0xffffff, 0x9d4edd];
    const mat = new THREE.MeshBasicMaterial({
      color: palette[Math.floor(Math.random() * palette.length)],
      transparent: true,
      opacity: 0.9
    });
    const mesh = new THREE.Mesh(this.cursorParticleGeo, mat);
    mesh.position.copy(pos);
    this.scene.add(mesh);

    this.cursorParticles.push({
      mesh,
      mat,
      life: 1.0,
      decay: 0.05 + Math.random() * 0.03
    });
  }

  setupInteractions() {
    this.raycaster = new THREE.Raycaster();
    this.mouse = new THREE.Vector2();

    const handlePointerMove = (clientX, clientY) => {
      this.mouseX = (clientX / window.innerWidth - 0.5) * 2;
      this.mouseY = (clientY / window.innerHeight - 0.5) * 2;
      this.spawnCursorParticle(this.mouseX, -this.mouseY);
    };

    window.addEventListener('pointermove', (event) => {
      handlePointerMove(event.clientX, event.clientY);
    });

    window.addEventListener('touchmove', (event) => {
      if (event.touches.length > 0) {
        handlePointerMove(event.touches[0].clientX, event.touches[0].clientY);
      }
    });

    window.addEventListener('click', (event) => {
      this.mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
      this.mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

      this.raycaster.setFromCamera(this.mouse, this.camera);
      const intersects = this.raycaster.intersectObjects(this.scene.children, true);

      if (intersects.length > 0) {
        let obj = intersects[0].object;
        while (obj.parent && obj.parent !== this.scene) {
          if (obj.name === "CakeGroup") {
            if (this.onCakeClick) this.onCakeClick();
            break;
          }
          if (obj.name === "GiftGroup") {
            this.openGiftBox();
            if (this.onGiftClick) this.onGiftClick();
            break;
          }
          obj = obj.parent;
        }
      }
    });
  }

  blowOutCandles() {
    if (this.candlesBlown) return;
    this.candlesBlown = true;

    // Extinguish flames with GSAP scale animation
    this.flames.forEach((flame, index) => {
      gsap.to(flame.scale, {
        x: 0,
        y: 0,
        z: 0,
        duration: 0.6,
        ease: 'power2.out'
      });
      gsap.to(this.flameLights[index], {
        intensity: 0,
        duration: 0.6
      });
    });

    // 3D Cake Slice pop-out animation
    if (this.cakeSlice) {
      gsap.to(this.cakeSlice.scale, {
        x: 1, y: 1, z: 1,
        duration: 0.8,
        ease: 'back.out(2)',
        delay: 0.5
      });
      gsap.to(this.cakeSlice.position, {
        x: 2.6,
        y: 0.5,
        z: 1.5,
        duration: 1.2,
        ease: 'power3.out',
        delay: 0.5
      });
      gsap.to(this.cakeSlice.rotation, {
        y: Math.PI,
        z: 0.3,
        duration: 1.2,
        ease: 'power2.out',
        delay: 0.5
      });
    }

    // Spawn rising smoke effect
    this.spawnSmokeEffect();

    // Trigger callback after animation
    if (this.onCandlesBlown) {
      setTimeout(() => this.onCandlesBlown(), 1100);
    }
  }

  spawnSmokeEffect() {
    const smokeCount = 40;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(smokeCount * 3);

    this.flames.forEach((flame, fIdx) => {
      for (let i = 0; i < 8; i++) {
        const idx = (fIdx * 8 + i) * 3;
        positions[idx] = flame.position.x + (Math.random() - 0.5) * 0.1;
        positions[idx + 1] = flame.position.y + 1.2;
        positions[idx + 2] = flame.position.z + (Math.random() - 0.5) * 0.1;
      }
    });

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    const material = new THREE.PointsMaterial({
      color: 0xcccccc,
      size: 0.15,
      transparent: true,
      opacity: 0.6
    });

    const smokeParticles = new THREE.Points(geometry, material);
    this.scene.add(smokeParticles);

    gsap.to(smokeParticles.position, {
      y: 1.5,
      duration: 2.5,
      ease: 'power1.out'
    });
    gsap.to(material, {
      opacity: 0,
      duration: 2.5,
      onComplete: () => this.scene.remove(smokeParticles)
    });
  }

  openGiftBox() {
    if (this.giftOpened) return;
    this.giftOpened = true;

    // Rotate Lid Open
    gsap.to(this.giftLid.position, {
      y: 2.2,
      z: -0.6,
      duration: 1,
      ease: 'back.out(1.7)'
    });
    gsap.to(this.giftLid.rotation, {
      x: -Math.PI / 3,
      duration: 1,
      ease: 'back.out(1.7)'
    });
  }

  onWindowResize() {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    
    // Dynamic camera distance for mobile responsiveness
    if (window.innerWidth < 650) {
      this.camera.position.set(0, 3.8, 11.5);
    } else if (window.innerWidth < 900) {
      this.camera.position.set(0, 3.6, 10);
    } else {
      this.camera.position.set(0, 3.5, 9);
    }

    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  }

  animate() {
    requestAnimationFrame(() => this.animate());

    const delta = Math.min(clock.getDelta(), 0.1);
    const time = clock.getElapsedTime();
    const timeStep = delta * 60; // Normalize movement to 120 FPS / 60 FPS refresh rates

    // Smooth Mouse Camera Parallax
    this.targetRotationY = this.mouseX * 0.5;
    this.targetRotationX = -this.mouseY * 0.3;

    this.scene.rotation.y += (this.targetRotationY - this.scene.rotation.y) * (0.05 * timeStep);
    this.scene.rotation.x += (this.targetRotationX - this.scene.rotation.x) * (0.05 * timeStep);

    // Rotate particle cloud gently
    if (this.particleCloud) {
      this.particleCloud.rotation.y = time * 0.03;
    }

    // Candle flames flicker animation
    if (!this.candlesBlown) {
      this.flames.forEach((flame, i) => {
        flame.scale.x = 1 + Math.sin(time * 12 + i) * 0.15;
        flame.scale.z = 1 + Math.cos(time * 10 + i) * 0.15;
        this.flameLights[i].intensity = 1.5 + Math.sin(time * 15 + i) * 0.5;
      });
    }

    // Balloon floating animation
    this.balloons.forEach((b) => {
      b.position.y = b.userData.baseY + Math.sin(time * b.userData.speed + b.userData.offset) * 0.35;
      b.rotation.z = Math.sin(time * 0.8 + b.userData.offset) * 0.1;
    });

    // Sky Lanterns ascending animation
    this.skyLanterns.forEach((l) => {
      l.position.y += l.userData.speedY * timeStep;
      l.position.x += Math.sin(time + l.userData.offset) * 0.003 * timeStep;
      if (l.position.y > 7.5) {
        l.position.y = -2.5;
        l.position.x = (Math.random() - 0.5) * 14;
      }
    });

    // Cursor Magic Dust Particles animation
    for (let i = this.cursorParticles.length - 1; i >= 0; i--) {
      const p = this.cursorParticles[i];
      p.life -= p.decay * timeStep;
      p.mesh.position.y += 0.005 * timeStep;
      p.mesh.scale.multiplyScalar(Math.pow(0.96, timeStep));
      p.mat.opacity = Math.max(0, p.life);

      if (p.life <= 0) {
        this.scene.remove(p.mesh);
        p.mat.dispose();
        this.cursorParticles.splice(i, 1);
      }
    }

    // Floating star spin
    if (this.floatingStar) {
      this.floatingStar.rotation.y = time * 1.2;
      this.floatingStar.position.y = 1.3 + Math.sin(time * 2) * 0.15;
    }

    this.renderer.render(this.scene, this.camera);
  }
}

const clock = new THREE.Clock();
