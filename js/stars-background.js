const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 2000);
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.getElementById('three-background').appendChild(renderer.domElement);

// Estrellas
const starsGeometry = new THREE.BufferGeometry();
const starVertices = [];
for (let i = 0; i < 2000; i++) {
    starVertices.push(
        (Math.random() - 0.5) * 2000,
        (Math.random() - 0.5) * 2000,
        -Math.random() * 1000
    );
}
starsGeometry.setAttribute('position', new THREE.Float32BufferAttribute(starVertices, 3));
const starsMaterial = new THREE.PointsMaterial({ color: 0xaaaaaa, size: 1.5, sizeAttenuation: true });
const stars = new THREE.Points(starsGeometry, starsMaterial);
scene.add(stars);

// Luz ambiente y puntual
scene.add(new THREE.AmbientLight(0x404040));
const pointLight = new THREE.PointLight(0xffffff, 1);
pointLight.position.set(0, 0, 200);
scene.add(pointLight);

// Flares (destellos aleatorios)
const flareGeometry = new THREE.BufferGeometry();
const flareVertices = [];
for (let i = 0; i < 10; i++) {
    flareVertices.push(
        (Math.random() - 0.5) * 2000,
        (Math.random() - 0.5) * 2000,
        -Math.random() * 1000
    );
}
flareGeometry.setAttribute('position', new THREE.Float32BufferAttribute(flareVertices, 3));
const flareColors = [0xffffff, 0xffa500, 0x00ffff];
const flares = new THREE.Points(flareGeometry, new THREE.PointsMaterial({
    color: flareColors[Math.floor(Math.random() * flareColors.length)],
    size: 2,
    transparent: true,
    opacity: 0.8
}));
scene.add(flares);

// Cometas con rastro
const createGlowTexture = () => {
    const size = 128;
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');
    const gradient = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
    gradient.addColorStop(0, 'rgba(255,255,255,1)');
    gradient.addColorStop(0.4, 'rgba(0,255,255,0.6)');
    gradient.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, size, size);
    return new THREE.CanvasTexture(canvas);
};
const glowTexture = createGlowTexture();
const comets = [];
for (let i = 0; i < 5; i++) {
    const comet = new THREE.Mesh(
        new THREE.SphereGeometry(2, 8, 8),
        new THREE.MeshBasicMaterial({ color: 0xffffff })
    );
    comet.position.set((Math.random() - 0.5) * 1000, (Math.random() - 0.5) * 1000, -1000);
    scene.add(comet);
    comets.push({
        mesh: comet,
        velocity: new THREE.Vector3(1 + Math.random() * 0.5, (Math.random() - 0.5) * 0.5, 1.5 + Math.random() * 0.5),
        trailSprites: []
    });
}
function addTrail(comet) {
    const spriteMaterial = new THREE.SpriteMaterial({
        map: glowTexture,
        transparent: true,
        opacity: 0.5,
        depthWrite: false
    });
    const sprite = new THREE.Sprite(spriteMaterial);
    sprite.scale.set(12, 12, 1);
    sprite.position.copy(comet.mesh.position);
    scene.add(sprite);
    comet.trailSprites.push({ sprite, life: 1 });
}

// Cámara
camera.position.z = 500;

let t = 0;
function animate() {
    requestAnimationFrame(animate);
    t += 0.005;

    stars.position.z = t * 10;
    stars.geometry.attributes.position.needsUpdate = true;
    flares.geometry.attributes.position.needsUpdate = true;
    flares.material.opacity = 0.6 + Math.sin(t * 5) * 0.2;

    comets.forEach(comet => {
        comet.mesh.position.add(comet.velocity);
        addTrail(comet);
        comet.trailSprites.forEach((trail, i) => {
            trail.life -= 0.02;
            trail.sprite.material.opacity = trail.life * 0.5;
            if (trail.life <= 0) {
                scene.remove(trail.sprite);
                comet.trailSprites.splice(i, 1);
            }
        });
        if (comet.mesh.position.z > camera.position.z + 200) {
            comet.mesh.position.set((Math.random() - 0.5) * 1000, (Math.random() - 0.5) * 1000, -1000);
            comet.trailSprites.forEach(trail => scene.remove(trail.sprite));
            comet.trailSprites = [];
        }
    });

    renderer.render(scene, camera);
}
animate();

window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});
