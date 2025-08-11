gsap.registerPlugin(ScrollTrigger);

// Particle Background
tsParticles.load("tsparticles", {
    background: { color: "transparent" },
    particles: {
        number: { value: 60, density: { enable: true, area: 800 } },
        color: { value: "#a89ff2" },
        shape: { 
            type: "character",
            character: {
                value: ["♪", "♫", "♬", "𝄞", "♩", "♭", "♯", "♮", "𝅘𝅥𝅯", "𝅘𝅥𝅰"],
                font: "Poppins",
                style: "",
                weight: "400",
                fill: true
            } 
        },
        opacity: { value: 0.5 },
        size: { value: 20, random: { enable: true, minimumValue: 15 }},
        rotate: {
            value: { min: 0, max: 360 },
            direction: "random",
            animation: {
                enable: true,
                speed: 2, // smaller = slower
                sync: false
            }
        },
        move: { enable: true, speed: 1 },
        // links: { enable: true, color: "#a89ff2", opacity: 0.4, distance: 150 }
        links: {enable: false}
    },
    interactivity: {
        events: { 
            onHover: { enable: true, mode: "repulse" }, 
            onClick: { enable: true, mode: "push" } 
        },
        modes: { 
            repulse: { distance: 40 }, 
            push: { quantity: 4 } 
        }
    }
});

// Hero fade-in
gsap.from(".hero-content", { duration: 1.5, opacity: 0, y: 50 });

// Scroll animations for sections
gsap.utils.toArray(".section").forEach(section => {
    gsap.from(section, {
        scrollTrigger: {
            trigger: section,
            start: "top 80%",
            toggleActions: "play none none reverse"
        },
        duration: 1,
        opacity: 0,
        y: 50
    });
});

// Team members stagger
gsap.from(".team-member", {
    scrollTrigger: {
        trigger: ".team-grid",
        start: "top 80%",
    },
    y: 50,
    opacity: 0,
    duration: 0.5,
    stagger: 0.2
});

// Cinematic Parallax with fade
[".layer-back", ".layer-mid"].forEach(layer => {
    gsap.fromTo(layer,
        { opacity: 0, yPercent: 0 },
        {
            opacity: 0.4,
            yPercent: layer.includes("back") ? -30 : -15,
            ease: "none",
            scrollTrigger: {
                trigger: layer.includes("back") ? ".about" : ".team",
                start: "top bottom",
                end: "bottom top",
                scrub: true
            }
        }
    );
});

// THREE.JS Guitar Scene
let scene = new THREE.Scene();
let camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
let renderer = new THREE.WebGLRenderer({ canvas: document.getElementById("guitarCanvas"), alpha: true });
renderer.setSize(window.innerWidth, window.innerHeight);

let light = new THREE.DirectionalLight(0xffffff, 1);
light.position.set(5, 5, 5);
scene.add(light);

let guitar;

// ✅ Make sure GLTFLoader is available
console.log("GLTFLoader available?", THREE.GLTFLoader);

let loader = new THREE.GLTFLoader();
loader.load(
    "https://threejs.org/examples/models/gltf/DamagedHelmet/glTF/DamagedHelmet.gltf",
    function (gltf) {
        guitar = gltf.scene;
        guitar.scale.set(2, 2, 2);
        guitar.position.set(0, -1, -5);
        scene.add(guitar);
    },
    undefined,
    function (err) {
        console.error("Error loading model:", err);
    }
);

// Scroll-driven camera movement
ScrollTrigger.create({
    trigger: "body",
    start: "top top",
    end: "bottom bottom",
    scrub: true,
    onUpdate: self => {
        let progress = self.progress; // 0 to 1
        if (guitar) {
            guitar.rotation.y = progress * Math.PI * 2;
            guitar.position.z = -5 + Math.sin(progress * Math.PI) * 1.5;
        }
    }
});

function animate() {
    requestAnimationFrame(animate);
    renderer.render(scene, camera);
}
animate();

// Handle resize
window.addEventListener("resize", () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});
