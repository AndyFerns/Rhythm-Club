/* audio.js
   Responsibilities:
   - Handle "Enter"/Start button click (start music, open curtain)
   - Create AudioContext + AnalyserNode
   - Connect analyser output to tsParticles (audio-reactive particle update loop)
   - Safe & robust: waits for tsParticles to exist, stores original particle values,
     clamps updates, avoids duplicate RAF loops.
*/

document.addEventListener("DOMContentLoaded", () => {
    const startBtn = document.getElementById("startMusicBtn");
    const curtain = document.getElementById("curtain");

    if (!startBtn) {
        console.warn("startMusicBtn not found. Add a button with id='startMusicBtn' to start audio.");
        return;
    }

    startBtn.addEventListener("click", async function handleStart() {
        // prevent double clicks
        startBtn.disabled = true;

        // Create or reuse an <audio id="bgMusic"> element if present
        let audioEl = document.getElementById("bgMusic");
        if (!audioEl) {
            audioEl = new Audio("assets/audio/so-what.mp3"); // update path as needed
            audioEl.id = "bgMusic";
            audioEl.crossOrigin = "anonymous";
            audioEl.preload = "auto";
            // NOTE: if you already have an <audio> tag in HTML you can omit creating it here.
        }
        audioEl.loop = true;
        audioEl.volume = 0.6;

        // Create AudioContext & analyser
        let audioCtx;
        try {
            audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        } catch (e) {
            console.error("Web Audio API not supported:", e);
            return;
        }

        const sourceNode = audioCtx.createMediaElementSource(audioEl);
        const analyser = audioCtx.createAnalyser();
        analyser.fftSize = 256;
        const bufferLength = analyser.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);

        sourceNode.connect(analyser);
        analyser.connect(audioCtx.destination);

        try {
            // resume context (required in many browsers)
            await audioCtx.resume();
            await audioEl.play();
        } catch (err) {
            console.error("Failed to play audio:", err);
            startBtn.disabled = false;
            return;
        }

        // open curtain (animation/CSS assumed in your stylesheet)
        if (curtain) {
            curtain.classList.add("open");
            setTimeout(() => {
                curtain.style.display = "none";
            }, 2000);
        }

        // Helper: find tsParticles container (wait for it if necessary)
        function getParticlesContainer() {
            try {
                if (window.tsParticles && typeof tsParticles.domItem === "function") {
                    return tsParticles.domItem(0);
                }
            } catch (e) {
                // ignore
            }
            // fallback: tsParticles.domItems (older/alternate)
            if (window.tsParticles && tsParticles.domItems && tsParticles.domItems.length) {
                return tsParticles.domItems[0];
            }
            return null;
        }

        // Wait for tsParticles container to be ready (tries for ~2 seconds)
        let container = getParticlesContainer();
        let attempts = 0;
        while (!container && attempts < 20) {
            await new Promise(r => setTimeout(r, 100));
            container = getParticlesContainer();
            attempts++;
        }
        if (!container) {
            console.warn("tsParticles container not found; audio-reactive particles disabled.");
            startBtn.disabled = false;
            return;
        }

        // Cache particle originals (size, opacity, velocity) to scale relative to original
        const particleArray = container.particles.array || [];
        particleArray.forEach(p => {
            if (!p) return;
            // store originals only once
            if (p._origSize == null && p.size && p.size.value != null) p._origSize = p.size.value;
            if (p._origOpacity == null && p.opacity && p.opacity.value != null) p._origOpacity = p.opacity.value;
            if (p._origVel == null) {
                p._origVel = {
                    h: p.velocity && p.velocity.horizontal != null ? p.velocity.horizontal : 0,
                    v: p.velocity && p.velocity.vertical != null ? p.velocity.vertical : 0
                };
            }
        });

        let rafRunning = true;
        function avg(arr) { return arr.reduce((a, b) => a + b, 0) / arr.length; }

        // RAF loop that updates particles per analyser data
        function audioLoop() {
            if (!rafRunning) return;
            analyser.getByteFrequencyData(dataArray);

            // bass: lower quarter of bins; treble: upper half
            const bassBins = dataArray.slice(0, Math.max(1, Math.floor(bufferLength / 4)));
            const trebleBins = dataArray.slice(Math.floor(bufferLength / 2));

            const bassVal = avg(bassBins) / 255;   // normalize 0..1
            const trebleVal = avg(trebleBins) / 255;

            // tune multipliers to taste:
            const sizeMultiplier = 0.9 + bassVal * 1.8;   // 0.9 -> 2.7
            const opacityAdd = trebleVal * 0.9;          // up to +0.9

            // update particles
            particleArray.forEach(p => {
                if (!p) return;
                // size (clamped)
                const base = p._origSize ?? 16;
                let newSize = base * sizeMultiplier;
                newSize = Math.max(6, Math.min(newSize, 80));
                if (p.size && p.size.value != null) p.size.value = newSize;

                // opacity (clamped)
                const baseOp = p._origOpacity ?? 0.6;
                let newOp = baseOp + opacityAdd;
                newOp = Math.max(0.1, Math.min(newOp, 1));
                if (p.opacity && p.opacity.value != null) p.opacity.value = newOp;

                // gentle velocity jitter related to freq content
                const hv = (Math.random() - 0.5) * (0.2 + bassVal * 2.0);
                const vv = (Math.random() - 0.5) * (0.2 + trebleVal * 2.0);
                if (p.velocity) {
                    p.velocity.horizontal = hv;
                    p.velocity.vertical = vv;
                }
            });

            requestAnimationFrame(audioLoop);
        }

        // Start the loop
        audioLoop();

        // cleanup: disable button and remove handler so it's not triggered twice
        startBtn.removeEventListener("click", handleStart);
        startBtn.disabled = true;

        // Optional: expose stop function (not used now)
        window._rhythmStopAudio = () => {
            rafRunning = false;
            try { audioEl.pause(); } catch (e) {}
            try { audioCtx.close(); } catch (e) {}
        };
    }); // end startBtn listener
});
