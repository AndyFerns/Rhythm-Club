// Import club data from data.js
import { teamData, eventsData } from './data.js';

// Import Three.js and the GLTFLoader
// This works because of the 'importmap' in index.html
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { OBJLoader } from 'three/addons/loaders/OBJLoader.js'; 
import { MTLLoader } from 'three/addons/loaders/MTLLoader.js'; 

// Wait for the DOM to be fully loaded before running any script
document.addEventListener('DOMContentLoaded', () => {

    // ===================================================================
    //  WEBSITE LOGIC
    // ===================================================================

    // --- DOM Elements ---
    const teamGrid = document.getElementById('team-grid');
    const eventsGrid = document.getElementById('events-grid');
    const footerContacts = document.getElementById('footer-contacts');

    // --- Event Modal Elements ---
    const eventModal = document.getElementById('event-modal');
    const modalCloseBtn = document.getElementById('modal-close-btn');
    const modalTitle = document.getElementById('modal-title');
    const modalDate = document.getElementById('modal-date');
    const modalDescription = document.getElementById('modal-description');
    const modalImage = document.getElementById('modal-image');

    // --- Helper to prevent XSS ---
    function escapeHTML(str) {
        if (!str) return '';
        return str.replace(/[&<>"']/g, function(m) {
            return {
                '&': '&amp;',
                '<': '&lt;',
                '>': '&gt;',
                '"': '&quot;',
                "'": '&#039;'
            }[m];
        });
    }

    // --- Render Functions ---
    function renderTeam(team) {
        // Check if the grid exists before trying to modify it
        if (!teamGrid) {
            console.warn("Team grid not found. Skipping team render.");
            return;
        }
        
        teamGrid.innerHTML = ''; // Clear existing
        
        // --- NEW: Updated roles list based on your request ---
        const roles = [
            { key: 'president', title: 'President' },
            { key: 'vicePresident', title: 'Vice President' },
            { key: 'secretary', title: 'Secretary' },
            { key: 'operationsLead', title: 'Operations Lead' },
            { key: 'docHead', title: 'Documentation Head' },
            { key: 'prHead1', title: 'PR Head' },
            { key: 'prHead2', title: 'PR Head' },
            { key: 'eventCoordinator1', title: 'Event Coordinator' },
            { key: 'eventCoordinator2', title: 'Event Coordinator' },
            { key: 'creativeLead', title: 'Creative Lead' }
        ];

        roles.forEach(role => {
            const member = team[role.key];
            if (member) {
                const memberHtml = `
                  <div class="bg-white/5 backdrop-blur-sm p-6 rounded-2xl shadow-lg transform transition duration-300 hover:scale-105 hover:shadow-purple-400/30">
                    <img src="${escapeHTML(member.imageUrl) || 'https://placehold.co/400x400/5e4b8b/FFFFFF?text=?'}" alt="${escapeHTML(member.name)}" class="w-40 h-40 object-cover rounded-full mx-auto mb-4 border-4 border-white/20">
                    <h3 class="text-xl font-bold text-center">${escapeHTML(member.name) || 'Position Open'}</h3>
                    <p class="text-center text-purple-300">${escapeHTML(role.title)}</p>
                  </div>
                `;
                teamGrid.innerHTML += memberHtml;
            }
        });

        // Also populate footer contacts
        if (footerContacts) {
            if (team.president) {
                footerContacts.innerHTML += `<p>President: ${escapeHTML(team.president.name)}</p>`;
            }
            if (team.vicePresident) {
                footerContacts.innerHTML += `<p>Vice-President: ${escapeHTML(team.vicePresident.name)}</p>`;
            }
        }
    }

    function renderEvents(events) {
        // Check if the grid exists
        if (!eventsGrid) {
            console.warn("Events grid not found. Skipping events render.");
            return;
        }
        
        eventsGrid.innerHTML = ''; // Clear existing
        if (events.length === 0) {
            eventsGrid.innerHTML = `<p class="text-center text-gray-400 col-span-full">No events found. Check back soon!</p>`;
            return;
        }
        
        events.forEach(event => {
            const eventCardHtml = `
            <div class="event-card bg-white/5 backdrop-blur-sm rounded-2xl shadow-lg overflow-hidden cursor-pointer transform transition duration-300 hover:scale-105 hover:shadow-purple-400/30"
                 data-title="${escapeHTML(event.title)}"
                 data-date="${escapeHTML(event.date)}"
                 data-description="${escapeHTML(event.description)}"
                 data-image="${escapeHTML(event.imageUrl)}">
              <img src="${escapeHTML(event.imageUrl) || 'https://placehold.co/600x400/5e4b8b/FFFFFF?text=Rhythm+Event'}" alt="${escapeHTML(event.title)}" class="w-full h-48 object-cover">
              <div class="p-6">
                <h3 class="text-xl font-bold mb-2 truncate">${escapeHTML(event.title)}</h3>
                <p class="text-purple-300 text-sm mb-4">${escapeHTML(event.date)}</p>
                <p class="text-gray-300 text-sm h-20 overflow-hidden text-ellipsis">${escapeHTML(event.description.substring(0, 100))}...</p>
              </div>
            </div>
            `;
            eventsGrid.innerHTML += eventCardHtml;
        });
    }

    // --- Modal Logic ---
    function openModal(data) {
        if (!eventModal) return;
        modalTitle.textContent = data.title;
        modalDate.textContent = data.date;
        // Use innerHTML for description to render newlines (\n)
        modalDescription.innerHTML = escapeHTML(data.description).replace(/\n/g, '<br>');
        modalImage.src = data.image || 'https://placehold.co/600x400/5e4b8b/FFFFFF?text=Rhythm+Event';
        eventModal.classList.remove('hidden');
    }

    function closeModal() {
        if (!eventModal) return;
        eventModal.classList.add('hidden');
    }

    // Add listeners only if modal elements exist
    if (modalCloseBtn && eventModal && eventsGrid) {
        modalCloseBtn.addEventListener('click', closeModal);
        eventModal.addEventListener('click', (e) => {
            if (e.target === eventModal) {
                closeModal();
            }
        });

        eventsGrid.addEventListener('click', (e) => {
            const card = e.target.closest('.event-card');
            if (card) {
                const data = {
                    title: card.dataset.title,
                    date: card.dataset.date,
                    description: card.dataset.description,
                    image: card.dataset.image,
                };
                openModal(data);
            }
        });
    }

    // --- Initial Renders ---
    // The data is now coming from the import!
    renderTeam(teamData);
    renderEvents(eventsData);
    
    // --- GSAP Animations (from your script.js) ---
    gsap.registerPlugin(ScrollTrigger);
    gsap.from(".hero-content", { duration: 1.5, opacity: 0, y: 50, delay: 1.5 });
    gsap.utils.toArray(".section").forEach(section => {
        gsap.from(section, {
            scrollTrigger: {
                trigger: section,
                start: "top 80%",
                toggleActions: "play none none reverse"
            },
            duration: 1,
            opacity: 0,
            y: 50,
            ease: "power1.out"
        });
    });
    
    // --- tsParticles (from your script.js) ---
    tsParticles.load("tsparticles", {
        background: { color: "transparent" },
        particles: {
            number: { value: 60, density: { enable: true, area: 800 } },
            color: { value: "#a89ff2" },
            shape: {
                type: "character",
                character: {
                    value: ["♪", "♫", "♬", "𝄞", "♩", "♭", "♯", "♮"],
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
                animation: { enable: true, speed: 2, sync: false }
            },
            move: { enable: true, speed: 1 },
            links: { enable: false }
        },
        interactivity: {
            events: {
                onHover: { enable: true, mode: "repulse" },
                onClick: { enable: true, mode: "push" }
            },
            modes: { repulse: { distance: 40 }, push: { quantity: 4 } }
        }
    });

    // --- Audio Logic (from your audio.js) ---
    const logo = document.querySelector(".curtain-logo");
    const curtain = document.getElementById("curtain");

    if (logo && curtain) {
        logo.addEventListener("click", async function handleStart() {
            
            // --- FIX: Open curtain FIRST ---
            curtain.classList.add("open");
            setTimeout(() => {
                curtain.style.display = "none";
            }, 2000); // 2-second animation
            
            // --- Now, try to play audio (it can fail gracefully) ---
            let audioEl = document.getElementById("bgMusic");
            if (audioEl) {
                audioEl.src = "../../assets/music/So What - Miles Davis (1959).mp3";
                audioEl.loop = true;
                audioEl.volume = 0.6;
            } else {
                console.warn("Audio element not found");
                return;
            }

            let audioCtx;
            try {
                audioCtx = new (window.AudioContext || window.webkitAudioContext)();
            } catch (e) {
                console.error("Web Audio API not supported:", e);
                return; // Exit if web audio isn't supported
            }

            const sourceNode = audioCtx.createMediaElementSource(audioEl);
            const analyser = audioCtx.createAnalyser();
            analyser.fftSize = 256;
            const bufferLength = analyser.frequencyBinCount;
            const dataArray = new Uint8Array(bufferLength);

            sourceNode.connect(analyser);
            analyser.connect(audioCtx.destination);

            try {
                await audioCtx.resume();
                await audioEl.play();
            } catch (err) {
                console.error("Failed to play audio (this is common):", err);
                // Do NOT return here. The curtain is already opening.
            }

            // --- Find particles (can also fail gracefully) ---
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

            let container = getParticlesContainer();
            let attempts = 0;
            while (!container && attempts < 20) {
                await new Promise(r => setTimeout(r, 100));
                container = getParticlesContainer();
                attempts++;
            }
            if (!container) {
                console.warn("tsParticles container not found; audio-reactive particles disabled.");
                return; // Exit if particles aren't found
            }

            const particleArray = container.particles.array || [];
            particleArray.forEach(p => {
                if (!p) return;
                if (p._origSize == null && p.size?.value != null) p._origSize = p.size.value;
                if (p._origOpacity == null && p.opacity?.value != null) p._origOpacity = p.opacity.value;
            });

            const avg = arr => arr.reduce((a, b) => a + b, 0) / arr.length;

            function audioLoop() {
                analyser.getByteFrequencyData(dataArray);

                const bassBins = dataArray.slice(0, Math.max(1, Math.floor(bufferLength / 4)));
                const trebleBins = dataArray.slice(Math.floor(bufferLength / 2));

                const bassVal = avg(bassBins) / 255;
                const trebleVal = avg(trebleBins) / 255;

                const sizeMultiplier = 0.5 + bassVal * 4.0;
                const opacityAdd = trebleVal * 1.5;

                particleArray.forEach(p => {
                    if (!p) return;
                    let newSize = (p._origSize ?? 16) * sizeMultiplier;
                    newSize = Math.max(6, Math.min(newSize, 80));
                    if (p.size?.value != null) p.size.value = newSize;

                    let newOp = (p._origOpacity ?? 0.6) + opacityAdd;
                    newOp = Math.max(0.1, Math.min(newOp, 1));
                    if (p.opacity?.value != null) p.opacity.value = newOp;
                });

                requestAnimationFrame(audioLoop);
            }
            
            audioLoop(); // Start the loop
            logo.removeEventListener("click", handleStart); // Prevent double-clicks
        }, { once: true }); // Use 'once: true' as another safety
    } else {
        console.warn("Curtain or logo not found. Curtain animation disabled.");
    }

    // -----------------------------------
    // 3D Background Rendering Section
    // -----------------------------------

    // --- Three.js 3D Background (NEW: Now loads your model) ---
    let scene, camera, renderer, model;
    const canvas = document.getElementById('guitarCanvas');

    if (canvas && THREE) {
        
        function init3DModel() {
            scene = new THREE.Scene();
            camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
            renderer = new THREE.WebGLRenderer({ canvas: canvas, alpha: true });
            renderer.setSize(window.innerWidth, window.innerHeight);
            renderer.setPixelRatio(window.devicePixelRatio); // For sharp images
            renderer.toneMapping = THREE.ACESFilmicToneMapping;
            renderer.outputEncoding = THREE.sRGBEncoding;

            const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
            scene.add(ambientLight);
            const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
            directionalLight.position.set(5, 5, 5);
            scene.add(directionalLight);

            camera.position.z = 5;

            // --- Load your 3D Model ---
            const loader = new GLTFLoader();

            // // Set the base path for the helmet's assets
            // loader.setPath('../../assets/3D Models/Damaged Helmet/');

            // loader.load(
            //     'DamagedHelmet.gltf', // <-- Correct path
            //     function (gltf) {
            //         model = gltf.scene;
            //         model.scale.set(1.5, 1.5, 1.5); // Adjust scale as needed
            //         model.position.set(0, -1, 0); // Adjust position
            //         scene.add(model);
            //     },
            //     undefined, // 'onProgress' callback (optional)
            //     function (error) {
            //         console.error('An error happened loading the 3D model:', error);
            //     }
            // );

        
            // NOTE: This uses OBJLoader and MTLLoader, not GLTFLoader
            
            const mtlLoader = new MTLLoader();
            const objLoader = new OBJLoader();
            
            // Set the path to the folder containing the .obj and .mtl files
            const guitarPath = '../../assets/3D Models/27-gibson_335/Gibson 335/';
            mtlLoader.setPath(guitarPath);
            objLoader.setPath(guitarPath);
            
            // Set path for textures (which are in the 'Texturas' subfolder)
            mtlLoader.setResourcePath(guitarPath + 'Texturas/');

            // 1. Load the Material (.mtl file)
            mtlLoader.load(
                'Gibson 335_Low_Poly.mtl', // Or 'Gibson 335_High_Poly.mtl'
                function (materials) {
                    materials.preload();
                    
                    // 2. Set materials and load the Object (.obj file)
                    objLoader.setMaterials(materials);
                    objLoader.load(
                        'Gibson 335_Low_Poly.obj', // Or 'Gibson 335_High_Poly.obj'
                        function (object) {
                            // Scale and position your guitar
                            object.scale.set(0.5, 0.5, 0.5); // <-- Adjust scale as needed!
                            object.position.x = -5
                            object.position.y = -1; // <-- Adjust position
                            
                            // Add the guitar to the scene
                            scene.add(object); 
                            
                            // If you use the guitar, assign it to the 'model' variable
                            model = object; 
                        },
                        undefined,
                        function (error) {
                            console.error('An error happened loading the OBJ:', error);
                        }
                    );
                },
                undefined,
                function (error) {
                    console.error('An error happened loading the MTL:', error);
                }
            );
            
            
            animate3D();
        }

        function animate3D() {
            requestAnimationFrame(animate3D);
            if (model) {
                // Gently rotate the model
                model.rotation.y += 0.003;
            }
            renderer.render(scene, camera);
        }

        function onWindowResize() {
            camera.aspect = window.innerWidth / window.innerHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(window.innerWidth, window.innerHeight);
        }

        window.addEventListener('resize', onWindowResize, false);
        
        // Call the new function
        init3DModel();

    } else {
        console.warn("Three.js canvas or library not found. 3D background disabled.");
    }
    
});