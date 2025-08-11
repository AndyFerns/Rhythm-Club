// audio-reactive-particles.js
const audio = document.getElementById("bgMusic");
audio.volume = 0.3; // softer by default

const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
const analyser = audioCtx.createAnalyser();
const source = audioCtx.createMediaElementSource(audio);

source.connect(analyser);
analyser.connect(audioCtx.destination);
analyser.fftSize = 256;

const dataArray = new Uint8Array(analyser.frequencyBinCount);

// // Particle config
// tsParticles.load("tsparticles", {
//     background: { color: "transparent" },
//     particles: {
//         number: { value: 60, density: { enable: true, area: 800 } },
//         color: { value: "#a89ff2" },
//         shape: { type: "image", image: [{ src: "quarter-note.svg", width: 20, height: 20 }] },
//         opacity: { value: 0.5, anim: { enable: false } },
//         size: { value: 4 },
//         move: { enable: true, speed: 1 },
//         links: { enable: true, color: "#a89ff2", opacity: 0.4, distance: 150 }
//     }
// });

