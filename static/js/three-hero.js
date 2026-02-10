/* =============================================
   TOMATO AI — Three.js Hero Scene
   Floating 3D Tomato with particle aura
   Mobile-optimized with adaptive quality
   ============================================= */

(function initThreeHero() {
    if (typeof THREE === 'undefined') return;

    const container = document.getElementById('three-container');
    if (!container) return;

    const isMobile = window.innerWidth < 769;
    const isLowEnd = isMobile && navigator.hardwareConcurrency && navigator.hardwareConcurrency <= 4;

    // ---- Setup ----
    const scene = new THREE.Scene();

    const camera = new THREE.PerspectiveCamera(
        isMobile ? 50 : 45,
        container.clientWidth / container.clientHeight,
        0.1,
        1000
    );
    camera.position.z = isMobile ? 5.5 : 5;

    const renderer = new THREE.WebGLRenderer({
        antialias: !isMobile,
        alpha: true,
        powerPreference: isMobile ? 'low-power' : 'high-performance'
    });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, isMobile ? 1.5 : 2));
    renderer.setClearColor(0x000000, 0);
    container.appendChild(renderer.domElement);

    // ---- Lighting ----
    const ambientLight = new THREE.AmbientLight(0x404040, isMobile ? 0.8 : 0.6);
    scene.add(ambientLight);

    const mainLight = new THREE.DirectionalLight(0xff6b6b, 1.2);
    mainLight.position.set(3, 4, 5);
    scene.add(mainLight);

    const fillLight = new THREE.DirectionalLight(0x6366f1, 0.5);
    fillLight.position.set(-3, 2, -3);
    scene.add(fillLight);

    const rimLight = new THREE.PointLight(0xff453a, 0.8, 15);
    rimLight.position.set(0, 3, -3);
    scene.add(rimLight);

    // ---- Tomato Body (Sphere) — adaptive segments ----
    const segments = isMobile ? (isLowEnd ? 24 : 36) : 64;
    const tomatoGeometry = new THREE.SphereGeometry(1.2, segments, segments);

    const tomatoMaterial = new THREE.MeshPhysicalMaterial({
        color: 0xff3b30,
        metalness: 0.1,
        roughness: 0.3,
        clearcoat: isMobile ? 0.5 : 0.8,
        clearcoatRoughness: 0.2,
        envMapIntensity: 1.0,
        emissive: 0x330000,
        emissiveIntensity: 0.15,
    });

    const tomato = new THREE.Mesh(tomatoGeometry, tomatoMaterial);
    tomato.scale.set(1.0, 0.85, 1.0);
    scene.add(tomato);

    // ---- Tomato Dimple ----
    const dimpleGeometry = new THREE.SphereGeometry(0.35, isMobile ? 16 : 32, isMobile ? 16 : 32);
    const dimpleMaterial = new THREE.MeshPhysicalMaterial({
        color: 0xcc2200,
        metalness: 0.05,
        roughness: 0.5,
        clearcoat: 0.3,
    });
    const dimple = new THREE.Mesh(dimpleGeometry, dimpleMaterial);
    dimple.position.y = 0.75;
    dimple.scale.set(1, 0.3, 1);
    tomato.add(dimple);

    // ---- Stem ----
    const stemGeometry = new THREE.CylinderGeometry(0.06, 0.08, 0.4, isMobile ? 8 : 12);
    const stemMaterial = new THREE.MeshPhysicalMaterial({
        color: 0x2d7a2d,
        metalness: 0.05,
        roughness: 0.6,
    });
    const stem = new THREE.Mesh(stemGeometry, stemMaterial);
    stem.position.y = 0.95;
    tomato.add(stem);

    // ---- Leaves (Sepals) — fewer on mobile ----
    function createSepal(rotY) {
        const shape = new THREE.Shape();
        shape.moveTo(0, 0);
        shape.quadraticCurveTo(0.08, 0.15, 0, 0.4);
        shape.quadraticCurveTo(-0.08, 0.15, 0, 0);

        const extrudeSettings = {
            depth: 0.02,
            bevelEnabled: !isMobile,
            bevelThickness: 0.01,
            bevelSize: 0.01,
            bevelSegments: isMobile ? 1 : 3
        };

        const leafGeo = new THREE.ExtrudeGeometry(shape, extrudeSettings);
        const leafMat = new THREE.MeshPhysicalMaterial({
            color: 0x228B22,
            metalness: 0.05,
            roughness: 0.5,
            side: THREE.DoubleSide,
        });

        const leaf = new THREE.Mesh(leafGeo, leafMat);
        leaf.position.y = 0.78;
        leaf.rotation.x = -Math.PI * 0.35;
        leaf.rotation.y = rotY;
        leaf.scale.set(1.2, 1.2, 1.2);
        return leaf;
    }

    const sepalCount = isMobile ? 4 : 5;
    for (let i = 0; i < sepalCount; i++) {
        const sepal = createSepal((Math.PI * 2 / sepalCount) * i);
        tomato.add(sepal);
    }

    // ---- Orbiting Particles — fewer on mobile ----
    const particlesCount = isMobile ? (isLowEnd ? 40 : 60) : 120;
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
        size: isMobile ? 0.05 : 0.04,
        vertexColors: true,
        transparent: true,
        opacity: 0.7,
        sizeAttenuation: true,
    });

    const particles = new THREE.Points(particlesGeometry, particlesMaterial);
    scene.add(particles);

    // ---- Outer Glow Ring ----
    const ringGeometry = new THREE.RingGeometry(2.0, 2.05, isMobile ? 32 : 64);
    const ringMaterial = new THREE.MeshBasicMaterial({
        color: 0xff453a,
        transparent: true,
        opacity: 0.1,
        side: THREE.DoubleSide,
    });
    const ring = new THREE.Mesh(ringGeometry, ringMaterial);
    ring.rotation.x = Math.PI * 0.5;
    scene.add(ring);

    // ---- Mouse/Touch Interaction — smooth lerp ----
    let mouseX = 0, mouseY = 0;
    let targetRotX = 0, targetRotY = 0;
    const lerpFactor = isMobile ? 0.015 : 0.025;

    if (!isMobile) {
        document.addEventListener('mousemove', (e) => {
            mouseX = (e.clientX / window.innerWidth) * 2 - 1;
            mouseY = (e.clientY / window.innerHeight) * 2 - 1;
        }, { passive: true });
    }

    // Mobile: gentle gyroscope-based rotation
    if (isMobile && window.DeviceOrientationEvent) {
        window.addEventListener('deviceorientation', (e) => {
            if (e.gamma !== null) mouseX = (e.gamma / 45) * 0.5;
            if (e.beta !== null) mouseY = ((e.beta - 45) / 45) * 0.3;
        }, { passive: true });
    }

    // ---- Animation Loop — adaptive framerate ----
    const clock = new THREE.Clock();
    let frameCount = 0;
    // On very low-end mobile, skip every other frame for particles
    const particleUpdateFreq = isLowEnd ? 3 : 1;

    function animate() {
        requestAnimationFrame(animate);
        frameCount++;

        const time = clock.getElapsedTime();

        // Tomato rotation — smooth lerp
        targetRotY = mouseX * (isMobile ? 0.15 : 0.25);
        targetRotX = mouseY * (isMobile ? 0.1 : 0.15);
        tomato.rotation.y += (targetRotY - tomato.rotation.y) * lerpFactor;
        tomato.rotation.x += (targetRotX - tomato.rotation.x) * lerpFactor;
        tomato.rotation.y += isMobile ? 0.002 : 0.003; // constant slow spin

        // Float animation — gentle
        tomato.position.y = Math.sin(time * (isMobile ? 0.6 : 0.8)) * (isMobile ? 0.1 : 0.15);

        // Particle ring rotation
        particles.rotation.y = time * (isMobile ? 0.1 : 0.15);
        particles.rotation.x = Math.sin(time * 0.3) * 0.1;

        // Animate particle positions (skip frames on low-end)
        if (frameCount % particleUpdateFreq === 0) {
            const pos = particlesGeometry.attributes.position.array;
            for (let i = 0; i < particlesCount; i++) {
                const angle = (i / particlesCount) * Math.PI * 2 + time * 0.15;
                const radius = 2.2 + Math.sin(i * 0.3 + time * 0.8) * 0.25;
                pos[i * 3] = Math.cos(angle) * radius;
                pos[i * 3 + 1] = Math.sin(angle * 3 + time * 0.4) * 0.4;
                pos[i * 3 + 2] = Math.sin(angle) * radius;
            }
            particlesGeometry.attributes.position.needsUpdate = true;
        }

        // Ring pulse — subtle
        const pulse = Math.sin(time * 1.2) * 0.03;
        ring.scale.set(1 + pulse, 1 + pulse, 1);
        ring.material.opacity = 0.04 + Math.sin(time * 1.5) * 0.04;

        // Rim light orbit — slower on mobile
        const orbitSpeed = isMobile ? 0.3 : 0.5;
        rimLight.position.x = Math.sin(time * orbitSpeed) * 4;
        rimLight.position.z = Math.cos(time * orbitSpeed) * 4;

        renderer.render(scene, camera);
    }

    animate();

    // ---- Resize ----
    window.addEventListener('resize', () => {
        camera.aspect = container.clientWidth / container.clientHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(container.clientWidth, container.clientHeight);
    });

})();
