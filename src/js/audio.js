/* audio.js
   Responsibilities:
   - Handle Rhythm Club logo click (start music, open curtain)
   - Create AudioContext + AnalyserNode
   - Connect analyser output to tsParticles (audio-reactive particle update loop)
   - Safe & robust: waits for tsParticles to exist, stores original particle values,
     clamps updates, avoids duplicate RAF loops.
*/

document.addEventListener("DOMContentLoaded", () => {
    const logo = document.querySelector(".curtain-logo");
    const curtain = document.getElementById("curtain");

    if (!logo) {
        console.warn("Rhythm Club logo not found. Add an element with class='curtain-logo' to start audio.");
        return;
    }

    logo.addEventListener("click", async function handleStart() {
        // Create or reuse an <audio id="bgMusic"> element if present
        let audioEl = document.getElementById("bgMusic");
        if (!audioEl) {
            audioEl = new Audio("assets/audio/so-what.mp3"); // update path if needed
            audioEl.id = "bgMusic";
            audioEl.crossOrigin = "anonymous";
            audioEl.preload = "auto";
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
            await audioCtx.resume(); // required by many browsers
            await audioEl.play();
        } catch (err) {
            console.error("Failed to play audio:", err);
            return;
        }

        // Open curtain
        if (curtain) {
            curtain.classList.add("open");
            setTimeout(() => {
                curtain.style.display = "none";
            }, 2000);
        }

        // Helper: find tsParticles container (wait if necessary)
        function getParticlesContainer() {
            try {
                if (window.tsParticles && typeof tsParticles.domItem === "function") {
                    return tsParticles.domItem(0);
                }
            } catch (e) { /* ignore */ }
            if (window.tsParticles && tsParticles.domItems && tsParticles.domItems.length) {
                return tsParticles.domItems[0];
            }
            return null;
        }

        // Wait for tsParticles container (~2 seconds)
        let container = getParticlesContainer();
        let attempts = 0;
        while (!container && attempts < 20) {
            await new Promise(r => setTimeout(r, 100));
            container = getParticlesContainer();
            attempts++;
        }
        if (!container) {
            console.warn("tsParticles container not found; audio-reactive particles disabled.");
            return;
        }

        // Cache particle originals
        const particleArray = container.particles.array || [];
        particleArray.forEach(p => {
            if (!p) return;
            if (p._origSize == null && p.size?.value != null) p._origSize = p.size.value;
            if (p._origOpacity == null && p.opacity?.value != null) p._origOpacity = p.opacity.value;
            if (p._origVel == null) {
                p._origVel = {
                    h: p.velocity?.horizontal ?? 0,
                    v: p.velocity?.vertical ?? 0
                };
            }
        });

        let rafRunning = true;
        const avg = arr => arr.reduce((a, b) => a + b, 0) / arr.length;

        // Animation loop
        function audioLoop() {
            if (!rafRunning) return;
            analyser.getByteFrequencyData(dataArray);

            const bassBins = dataArray.slice(0, Math.max(1, Math.floor(bufferLength / 4)));
            const trebleBins = dataArray.slice(Math.floor(bufferLength / 2));

            const bassVal = avg(bassBins) / 255;
            const trebleVal = avg(trebleBins) / 255;

            const sizeMultiplier = 0.9 + bassVal * 1.8;
            const opacityAdd = trebleVal * 0.9;

            particleArray.forEach(p => {
                if (!p) return;
                let newSize = (p._origSize ?? 16) * sizeMultiplier;
                newSize = Math.max(6, Math.min(newSize, 80));
                if (p.size?.value != null) p.size.value = newSize;

                let newOp = (p._origOpacity ?? 0.6) + opacityAdd;
                newOp = Math.max(0.1, Math.min(newOp, 1));
                if (p.opacity?.value != null) p.opacity.value = newOp;

                const hv = (Math.random() - 0.5) * (0.2 + bassVal * 2.0);
                const vv = (Math.random() - 0.5) * (0.2 + trebleVal * 2.0);
                if (p.velocity) {
                    p.velocity.horizontal = hv;
                    p.velocity.vertical = vv;
                }
            });

            requestAnimationFrame(audioLoop);
        }

        audioLoop();

        // Remove listener so it can't trigger twice
        logo.removeEventListener("click", handleStart);

        // Optional stop function
        window._rhythmStopAudio = () => {
            rafRunning = false;
            try { audioEl.pause(); } catch (e) {}
            try { audioCtx.close(); } catch (e) {}
        };
    });
});
