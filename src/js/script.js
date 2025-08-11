/* script.js
   Responsibilities:
   - Initialize tsParticles (musical-character particles + slow spin)
   - Initialize GSAP / ScrollTrigger animations (hero, sections, team, cinematic parallax)
   NOTE: Audio (play + analyser) and curtain logic moved to audio.js
*/

// Register GSAP plugin
gsap.registerPlugin(ScrollTrigger);

/* -------------------------
   tsParticles initialization
   ------------------------- */
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
        opacity: { value: 0.6 },
        size: { value: 18, random: { enable: true, minimumValue: 12 } },
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
        links: { enable: false }
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

/* -------------------------
   GSAP Animations / ScrollTrigger
   ------------------------- */

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

// Team members staggered reveal
gsap.from(".team-member", {
    scrollTrigger: {
        trigger: ".team-grid",
        start: "top 80%",
    },
    y: 50,
    opacity: 0,
    duration: 0.5,
    stagger: 0.18
});

// Cinematic parallax fade for background layers
[".layer-back", ".layer-mid"].forEach(layer => {
    gsap.fromTo(layer,
        { opacity: 0, yPercent: 0 },
        {
            opacity: 0.25,
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

/* -------------------------
   THREE.js / 3D code
   -------------------------
   NOTE: 3D guitar code removed from this file to avoid
   GLTFLoader / version conflicts. Re-add later in a dedicated module
   (preferably with ES modules and examples/jsm loaders).
*/
