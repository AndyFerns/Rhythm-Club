gsap.registerPlugin(ScrollTrigger);

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
