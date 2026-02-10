/* =============================================
   TOMATO AI — Three.js Hero Scene
   Realistic 3D Tomato with Star-Shaped Calyx
   Mobile-optimized with adaptive quality
   ============================================= */

(function initThreeHero() {
    if (typeof THREE === 'undefined') return;

    const container = document.getElementById('three-container');
    if (!container) return;

    const isMobile = window.innerWidth < 769;
    const isLowEnd = isMobile && navigator.hardwareConcurrency && navigator.hardwareConcurrency <= 4;

    // ---- Wait for container to have dimensions ----
    function waitForSize(cb, retries) {
        if (retries <= 0) return;
        if (container.clientWidth > 0 && container.clientHeight > 0) {
            cb();
        } else {
            requestAnimationFrame(() => waitForSize(cb, retries - 1));
        }
    }

    waitForSize(function initScene() {

    // ---- Setup ----
    const scene = new THREE.Scene();

    const w = container.clientWidth;
    const h = container.clientHeight;

    const camera = new THREE.PerspectiveCamera(
        isMobile ? 50 : 45,
        w / h,
        0.1,
        1000
    );
    camera.position.z = isMobile ? 5.5 : 5;

    const renderer = new THREE.WebGLRenderer({
        antialias: !isLowEnd,
        alpha: true,
        powerPreference: isMobile ? 'low-power' : 'high-performance'
    });
    renderer.setSize(w, h);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, isMobile ? 1.5 : 2));
    renderer.setClearColor(0x000000, 0);
    container.appendChild(renderer.domElement);

    // ---- Lighting ----
    const ambientLight = new THREE.AmbientLight(0xffffff, isMobile ? 0.7 : 0.5);
    scene.add(ambientLight);

    const mainLight = new THREE.DirectionalLight(0xff8866, 1.4);
    mainLight.position.set(3, 4, 5);
    scene.add(mainLight);

    const fillLight = new THREE.DirectionalLight(0x6366f1, 0.4);
    fillLight.position.set(-3, 2, -3);
    scene.add(fillLight);

    const rimLight = new THREE.PointLight(0xff453a, 0.8, 15);
    rimLight.position.set(0, 3, -3);
    scene.add(rimLight);

    const topLight = new THREE.DirectionalLight(0xaaffaa, 0.3);
    topLight.position.set(0, 5, 2);
    scene.add(topLight);

    // ---- Segments based on device ----
    const seg = isLowEnd ? 24 : (isMobile ? 32 : 64);
    const segLow = isLowEnd ? 8 : (isMobile ? 12 : 16);

    // ---- Tomato Body ----
    const tomatoGeometry = new THREE.SphereGeometry(1.2, seg, seg);
    const tomatoMaterial = new THREE.MeshPhysicalMaterial({
        color: 0xff2d20,
        metalness: 0.05,
        roughness: 0.35,
        clearcoat: 0.9,
        clearcoatRoughness: 0.15,
        envMapIntensity: 1.0,
        emissive: 0x3a0000,
        emissiveIntensity: 0.12,
    });

    const tomato = new THREE.Mesh(tomatoGeometry, tomatoMaterial);
    tomato.scale.set(1.0, 0.82, 1.0); // Squash for realistic shape
    scene.add(tomato);

    // ---- Subtle grooves (creases on tomato) ----
    // Small indent lines radiating from top
    for (let i = 0; i < 6; i++) {
        const grooveGeo = new THREE.CylinderGeometry(0.008, 0.008, 1.8, 4);
        const grooveMat = new THREE.MeshBasicMaterial({
            color: 0xcc1a10,
            transparent: true,
            opacity: 0.3
        });
        const groove = new THREE.Mesh(grooveGeo, grooveMat);
        groove.rotation.z = Math.PI / 2;
        groove.rotation.y = (Math.PI / 3) * i;
        groove.position.y = -0.05;
        tomato.add(groove);
    }

    // ---- Top Dimple (where calyx sits) ----
    const dimpleGeo = new THREE.SphereGeometry(0.32, segLow, segLow);
    const dimpleMat = new THREE.MeshPhysicalMaterial({
        color: 0xaa1a08,
        metalness: 0.02,
        roughness: 0.6,
    });
    const dimple = new THREE.Mesh(dimpleGeo, dimpleMat);
    dimple.position.y = 0.72;
    dimple.scale.set(1, 0.25, 1);
    tomato.add(dimple);

    // ============================================
    //  CALYX — Green Star-Shaped Top
    // ============================================

    const calyxGroup = new THREE.Group();
    calyxGroup.position.y = 0.78;
    tomato.add(calyxGroup);

    // -- Central Stem (pedicel) --
    const stemGeo = new THREE.CylinderGeometry(0.04, 0.06, 0.5, segLow);
    const stemMat = new THREE.MeshPhysicalMaterial({
        color: 0x2a7d2a,
        metalness: 0.02,
        roughness: 0.65,
    });
    const stem = new THREE.Mesh(stemGeo, stemMat);
    stem.position.y = 0.35;
    calyxGroup.add(stem);

    // -- Small bulge at stem base --
    const stemBaseGeo = new THREE.SphereGeometry(0.08, segLow, segLow);
    const stemBase = new THREE.Mesh(stemBaseGeo, stemMat);
    stemBase.position.y = 0.08;
    stemBase.scale.set(1, 0.5, 1);
    calyxGroup.add(stemBase);

    // -- Star-shaped Sepals (5 pointed leaves spreading outward) --
    const sepalCount = 5;
    const sepalMat = new THREE.MeshPhysicalMaterial({
        color: 0x2d8a2d,
        metalness: 0.02,
        roughness: 0.55,
        side: THREE.DoubleSide,
        emissive: 0x0a2a0a,
        emissiveIntensity: 0.1,
    });

    for (let i = 0; i < sepalCount; i++) {
        // Create pointed leaf shape
        const shape = new THREE.Shape();
        shape.moveTo(0, 0);
        // Wider base, pointed tip — star arm
        shape.bezierCurveTo(0.1, 0.08, 0.12, 0.25, 0.03, 0.55);
        shape.lineTo(0, 0.6); // Pointed tip
        shape.lineTo(-0.03, 0.55);
        shape.bezierCurveTo(-0.12, 0.25, -0.1, 0.08, 0, 0);

        const extrudeSettings = {
            depth: 0.015,
            bevelEnabled: !isLowEnd,
            bevelThickness: 0.005,
            bevelSize: 0.005,
            bevelSegments: 1,
        };

        const sepalGeo = new THREE.ExtrudeGeometry(shape, extrudeSettings);
        const sepal = new THREE.Mesh(sepalGeo, sepalMat);

        // Position: radiate from center, curl outward and back
        const angle = (Math.PI * 2 / sepalCount) * i;
        sepal.position.set(0, 0.02, 0);
        sepal.rotation.x = -Math.PI * 0.5; // Lay flat
        sepal.rotation.z = angle; // Spread around
        // Tilt outward to curl over the tomato surface
        sepal.rotation.x += -0.3;

        // Create a group to handle the outward curl
        const sepalPivot = new THREE.Group();
        sepalPivot.rotation.y = angle;
        sepalPivot.rotation.x = -0.45; // Angle of curl
        sepalPivot.add(sepal);
        sepal.position.set(0, 0, 0);
        sepal.rotation.set(-Math.PI * 0.42, 0, 0);

        calyxGroup.add(sepalPivot);
    }

    // -- Small secondary sepals between main ones --
    for (let i = 0; i < sepalCount; i++) {
        const smallShape = new THREE.Shape();
        smallShape.moveTo(0, 0);
        smallShape.bezierCurveTo(0.05, 0.04, 0.06, 0.12, 0.015, 0.3);
        smallShape.lineTo(0, 0.33);
        smallShape.lineTo(-0.015, 0.3);
        smallShape.bezierCurveTo(-0.06, 0.12, -0.05, 0.04, 0, 0);

        const smallGeo = new THREE.ExtrudeGeometry(smallShape, {
            depth: 0.01,
            bevelEnabled: false
        });
        const smallSepal = new THREE.Mesh(smallGeo, sepalMat);

        const angle = (Math.PI * 2 / sepalCount) * i + (Math.PI / sepalCount);
        const pivot = new THREE.Group();
        pivot.rotation.y = angle;
        pivot.rotation.x = -0.55;
        smallSepal.rotation.set(-Math.PI * 0.4, 0, 0);
        pivot.add(smallSepal);
        calyxGroup.add(pivot);
    }

    // ---- Bottom highlight (subtle belly shine) ----
    const bellyGeo = new THREE.SphereGeometry(1.22, seg, seg, 0, Math.PI * 2, Math.PI * 0.6, Math.PI * 0.3);
    const bellyMat = new THREE.MeshBasicMaterial({
        color: 0xff5544,
        transparent: true,
        opacity: 0.06,
    });
    const belly = new THREE.Mesh(bellyGeo, bellyMat);
    belly.scale.set(1, 0.82, 1);
    tomato.add(belly);

    // ---- Orbiting Particles ----
    const particlesCount = isMobile ? (isLowEnd ? 30 : 50) : 100;
    const particlesGeometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particlesCount * 3);
    const colors = new Float32Array(particlesCount * 3);

    const colorPalette = [
        new THREE.Color(0xff453a),
        new THREE.Color(0xff9f0a),
        new THREE.Color(0xbf5af2),
        new THREE.Color(0x30d158),
        new THREE.Color(0x0a84ff),
    ];

    for (let i = 0; i < particlesCount; i++) {
        const angle = (i / particlesCount) * Math.PI * 2;
        const radius = 2.2 + Math.sin(i * 0.3) * 0.4;
        const height = Math.sin(angle * 3) * 0.5;
        positions[i * 3] = Math.cos(angle) * radius;
        positions[i * 3 + 1] = height;
        positions[i * 3 + 2] = Math.sin(angle) * radius;

        const col = colorPalette[i % colorPalette.length];
        colors[i * 3] = col.r;
        colors[i * 3 + 1] = col.g;
        colors[i * 3 + 2] = col.b;
    }

    particlesGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    particlesGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    const particlesMaterial = new THREE.PointsMaterial({
        size: isMobile ? 0.06 : 0.04,
        vertexColors: true,
        transparent: true,
        opacity: 0.7,
        sizeAttenuation: true,
    });

    const particles = new THREE.Points(particlesGeometry, particlesMaterial);
    scene.add(particles);

    // ---- Outer Glow Ring ----
    const ringGeo = new THREE.RingGeometry(2.0, 2.05, isMobile ? 32 : 64);
    const ringMat = new THREE.MeshBasicMaterial({
        color: 0xff453a,
        transparent: true,
        opacity: 0.1,
        side: THREE.DoubleSide,
    });
    const ring = new THREE.Mesh(ringGeo, ringMat);
    ring.rotation.x = Math.PI * 0.5;
    scene.add(ring);

    // ---- Mouse/Touch Interaction ----
    let mouseX = 0, mouseY = 0;
    let targetRotX = 0, targetRotY = 0;
    const lerpFactor = isMobile ? 0.015 : 0.025;

    if (!isMobile) {
        document.addEventListener('mousemove', (e) => {
            mouseX = (e.clientX / window.innerWidth) * 2 - 1;
            mouseY = (e.clientY / window.innerHeight) * 2 - 1;
        }, { passive: true });
    }

    // Mobile: gyroscope rotation
    if (isMobile && window.DeviceOrientationEvent) {
        window.addEventListener('deviceorientation', (e) => {
            if (e.gamma !== null) mouseX = (e.gamma / 45) * 0.5;
            if (e.beta !== null) mouseY = ((e.beta - 45) / 45) * 0.3;
        }, { passive: true });
    }

    // Mobile: touch drag for rotation
    if (isMobile) {
        let touchStartX = 0;
        container.addEventListener('touchstart', (e) => {
            touchStartX = e.touches[0].clientX;
        }, { passive: true });
        container.addEventListener('touchmove', (e) => {
            const dx = (e.touches[0].clientX - touchStartX) / window.innerWidth;
            mouseX = dx * 2;
        }, { passive: true });
        container.addEventListener('touchend', () => {
            mouseX *= 0.5; // Decay
        }, { passive: true });
    }

    // ---- Animation Loop ----
    const clock = new THREE.Clock();
    let frameCount = 0;
    const particleUpdateFreq = isLowEnd ? 3 : 1;

    function animate() {
        requestAnimationFrame(animate);
        frameCount++;

        const time = clock.getElapsedTime();

        // Tomato rotation
        targetRotY = mouseX * (isMobile ? 0.2 : 0.25);
        targetRotX = mouseY * (isMobile ? 0.12 : 0.15);
        tomato.rotation.y += (targetRotY - tomato.rotation.y) * lerpFactor;
        tomato.rotation.x += (targetRotX - tomato.rotation.x) * lerpFactor;
        tomato.rotation.y += isMobile ? 0.003 : 0.004;

        // Float animation
        tomato.position.y = Math.sin(time * (isMobile ? 0.6 : 0.8)) * (isMobile ? 0.08 : 0.12);

        // Particle ring rotation
        particles.rotation.y = time * (isMobile ? 0.1 : 0.15);
        particles.rotation.x = Math.sin(time * 0.3) * 0.08;

        // Animate particle positions
        if (frameCount % particleUpdateFreq === 0) {
            const pos = particlesGeometry.attributes.position.array;
            for (let i = 0; i < particlesCount; i++) {
                const angle = (i / particlesCount) * Math.PI * 2 + time * 0.12;
                const radius = 2.2 + Math.sin(i * 0.3 + time * 0.6) * 0.2;
                pos[i * 3] = Math.cos(angle) * radius;
                pos[i * 3 + 1] = Math.sin(angle * 3 + time * 0.35) * 0.35;
                pos[i * 3 + 2] = Math.sin(angle) * radius;
            }
            particlesGeometry.attributes.position.needsUpdate = true;
        }

        // Ring pulse
        const pulse = Math.sin(time * 1.2) * 0.03;
        ring.scale.set(1 + pulse, 1 + pulse, 1);
        ring.material.opacity = 0.04 + Math.sin(time * 1.5) * 0.04;

        // Rim light orbit
        const spd = isMobile ? 0.3 : 0.5;
        rimLight.position.x = Math.sin(time * spd) * 4;
        rimLight.position.z = Math.cos(time * spd) * 4;

        renderer.render(scene, camera);
    }

    animate();

    // ---- Resize ----
    window.addEventListener('resize', () => {
        const nw = container.clientWidth;
        const nh = container.clientHeight;
        if (nw === 0 || nh === 0) return;
        camera.aspect = nw / nh;
        camera.updateProjectionMatrix();
        renderer.setSize(nw, nh);
    });

    }, 60); // retries

})();
