gsap.registerPlugin(ScrollTrigger);

// Particle Background
tsParticles.load("tsparticles", {
    background: { color: "transparent" },
    particles: {
        number: { value: 60, density: { enable: true, area: 800 } },
        color: { value: "#a89ff2" },
        shape: { type: "circle" },
        opacity: { value: 0.5 },
        size: { value: 3 },
        move: { enable: true, speed: 1, direction: "none", outModes: "out" },
        links: { enable: true, color: "#a89ff2", opacity: 0.4, distance: 150 }
    },
    interactivity: {
        events: { onHover: { enable: true, mode: "repulse" }, onClick: { enable: true, mode: "push" } },
        modes: { repulse: { distance: 100 }, push: { quantity: 4 } }
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

// Parallax Effect
gsap.to(".layer-back", {
    yPercent: -30,
    ease: "none",
    scrollTrigger: {
        trigger: ".about",
        start: "top bottom",
        scrub: true
    }
});

gsap.to(".layer-mid", {
    yPercent: -15,
    ease: "none",
    scrollTrigger: {
        trigger: ".team",
        start: "top bottom",
        scrub: true
    }
});
