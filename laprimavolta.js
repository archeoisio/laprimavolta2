let map; 

document.addEventListener('DOMContentLoaded', () => {
    // --- 1. CONFIGURAZIONI VIEWPORT & MAPPA ---
    const MOBILE_MAX_WIDTH = 1024;
    
    const isMobile = window.innerWidth <= MOBILE_MAX_WIDTH;
    const isLandscape = window.innerWidth > window.innerHeight;
    let initialView;
    
    if (isMobile) {
        if (isLandscape) {
            initialView = { center: [40.6766, 14.7923], zoom: 13 }; 
        } else {
            initialView = { center: [40.6766, 14.7923], zoom: 12 };
        }
    } else {
        initialView = { center: [40.6766, 14.7923], zoom: 13 };
    }

    map = L.map('map', {
        center: initialView.center,
        zoom: initialView.zoom,
        zoomSnap: 0.1,           
        zoomDelta: 1,           
        wheelPxPerZoomLevel: 150, 
        zoomControl: true,
        minZoom: 2.5,
        worldCopyJump: true,
        bounceAtZoomLimits: false,
        attributionControl: false
    });

    map.on('zoomstart', function() {
        map.getContainer().style.background = '#1a1a1a';
    });

    const satellite = L.tileLayer('https://mt1.google.com/vt/lyrs=s&x={x}&y={y}&z={z}', {
        attribution: 'Google',
        maxZoom: 20,
        updateWhenIdle: false, 
        updateWhenZooming: true,
        keepBuffer: 15
    }).addTo(map);

    const osm = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        updateWhenIdle: false,
        keepBuffer: 10,
        updateInterval: 100
    });
   
    let control = null; 

    // --- 2. GESTIONE ROUTING (CALCOLO PERCORSI) ---
    async function startRouting() {
        const startInput = document.getElementById('start');
        const endInput = document.getElementById('end');
        
        if (!startInput || !endInput) return;
        
        const startVal = startInput.value;
        const endVal = endInput.value;

        if (!startVal || !endVal) {
            alert("Inserisci sia partenza che destinazione");
            return;
        }

        try {
            const geocode = async (query) => {
                const r = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}`);
                const d = await r.json();
                if (d.length === 0) throw new Error("Località non trovata: " + query);
                return L.latLng(d[0].lat, d[0].lon);
            };

            const startCoords = await geocode(startVal);
            const endCoords = await geocode(endVal);

            if (typeof control !== 'undefined' && control) {
                map.removeControl(control);
            }

            control = L.Routing.control({
                waypoints: [startCoords, endCoords],
                language: 'it',
                collapsible: true,
                show: false,
                itineraryClassName: 'leaflet-routing-container',
                lineOptions: { styles: [{ color: '#4a90e2', weight: 5 }] }
            }).addTo(map);

            setTimeout(() => {
                const container = document.querySelector('.leaflet-routing-container');
                const toggleBtn = document.querySelector('.leaflet-routing-toggle');

                if (container && toggleBtn) {
                    container.classList.add('leaflet-routing-container-hide');
                    const newToggle = toggleBtn.cloneNode(true);
                    toggleBtn.parentNode.replaceChild(newToggle, toggleBtn);

                    newToggle.addEventListener('click', (e) => {
                        L.DomEvent.stopPropagation(e);
                        L.DomEvent.preventDefault(e);
                        
                        const isHidden = container.classList.contains('leaflet-routing-container-hide');
                        if (isHidden) {
                            container.classList.remove('leaflet-routing-container-hide');
                        } else {
                            container.classList.add('leaflet-routing-container-hide');
                        }
                    });
                }
            }, 600);

        } catch (e) {
            console.error("Errore Routing:", e);
            alert(e.message || "Errore nel calcolo del percorso.");
        }
    }
    
    // --- 3. CONTROLLI INTERFACCIA (BOTTONI E PANNELLI) ---
    const btnControl = L.control({ position: 'topright' });
    btnControl.onAdd = function(map) {
        const container = L.DomUtil.create('div', 'leaflet-bar');
        
        container.style.marginTop = '4px';
        container.style.marginRight = '4px';
        container.style.display = 'flex';
        container.style.flexDirection = 'column';
        container.style.gap = '5px';
        container.style.background = 'transparent';
        container.style.border = 'none';

        L.DomEvent.disableClickPropagation(container);
        L.DomEvent.on(container, 'mousewheel', L.DomEvent.stopPropagation);
        L.DomEvent.on(container, 'touchstart', L.DomEvent.stopPropagation);
        L.DomEvent.on(container, 'pointerdown', L.DomEvent.stopPropagation);

        const createBtn = (html, title, onClick, className) => {
            const btn = L.DomUtil.create('a', 'custom-home-button ' + (className || ''), container);
            btn.innerHTML = html;
            btn.title = title;
            btn.href = '#';
            L.DomEvent.on(btn, 'click', e => {
                L.DomEvent.stopPropagation(e);
                L.DomEvent.preventDefault(e);
                onClick();
            });
            return btn;
        };

        // Pulsante Home 🌍
        createBtn('🌍', "Torna alla vista iniziale", () => {
            map.flyTo(initialView.center, initialView.zoom, { animate: true, duration: 4, easeLinearity: 0.1 });
        }, 'btn-tutorial-home');
        
        // Pulsante Locate 📍
        const locateControl = L.control.locate({
            flyTo: { duration: 6 },
            strings: { title: "Posizione" }
        });
        const locBtn = locateControl.onAdd(map);
        locBtn.classList.add('btn-tutorial-locate');
        container.appendChild(locBtn);
        
        // Pulsante Routing 🗺️
        createBtn('🗺️', "Mostra/Nascondi indicazioni", () => {
            const rb = document.getElementById('route-box');
            if(rb) rb.style.display = (rb.style.display === 'none') ? 'flex' : 'none';
        }, 'btn-tutorial-route');

        return container;
    };
    btnControl.addTo(map);

    // --- 4. PANNELLI INFORMATIVI (BASSO SINISTRA) ---
    const sideInfoControl = L.control({ position: 'bottomleft' });
    sideInfoControl.onAdd = function(map) {
        const container = L.DomUtil.create('div', 'info-container-bottom');
        container.style.display = 'flex';
        container.style.flexDirection = 'column';
        container.style.alignItems = 'flex-start';
        container.style.marginBottom = '12px'; 
        container.style.marginLeft = '10px';   
        container.style.pointerEvents = 'auto';
        
        // Box Routing
        const routeBox = L.DomUtil.create('div', '', container);
        routeBox.id = 'route-box';
        L.DomEvent.disableClickPropagation(routeBox);
        L.DomEvent.disableScrollPropagation(routeBox);

        routeBox.style.display = 'none';
        routeBox.style.flexDirection = 'column';
        routeBox.style.background = 'rgba(0,0,0,0.5)';
        routeBox.style.color = 'white';
        routeBox.style.padding = '10px';
        routeBox.style.borderRadius = '8px';
        routeBox.style.width = '180px';
        routeBox.style.boxShadow = '0 0 10px rgba(0,0,0,0.5)';
        
        routeBox.innerHTML = `
            <input id="start" placeholder="Partenza" style="width:100%; margin-bottom:5px; padding:4px;">
            <input id="end" placeholder="Destinazione" style="width:100%; margin-bottom:8px; padding:4px;">
            <div style="display:flex; gap:5px;">
                <button id="route-btn" style="flex:1; cursor:pointer; padding:5px; border-radius:4px; border:none; background:white; font-weight:bold;">Calcola</button>
                <button id="clear-btn" style="flex:1; cursor:pointer; padding:5px; border-radius:4px; border:none; background:#ff5252; color:white;">Reset</button>
            </div>
        `;

        setTimeout(() => {
            const rb = document.getElementById('route-btn');
            const cb = document.getElementById('clear-btn');
            if (rb) {
                L.DomEvent.on(rb, 'click', async (e) => {
                    L.DomEvent.stopPropagation(e);
                    await startRouting();
                });
            }
            if (cb) {
                L.DomEvent.on(cb, 'click', (e) => {
                    L.DomEvent.stopPropagation(e);
                    if (control) {
                        map.removeControl(control);
                        control = null;
                    }
                    document.getElementById('start').value = '';
                    document.getElementById('end').value = '';
                });
            }
        }, 100);

        return container;
    };
    sideInfoControl.addTo(map);

    function setVh() {
        const mapEl = document.getElementById('map');
        if (!mapEl || !map) return;
        const runResize = () => {
            mapEl.style.left = "0px";
            mapEl.style.top = "0px";
            mapEl.style.width = window.innerWidth + 'px';
            mapEl.style.height = window.innerHeight + 'px';
            map.invalidateSize({ animate: false });
        };
        runResize();
        setTimeout(runResize, 100);
        setTimeout(runResize, 500);
    }

    setVh();
    window.addEventListener('resize', setVh);
});

// --- SEZIONE TUTORIAL ---
const tutorialSteps = [
    { 
        id: ".btn-tutorial-home", 
        titolo: "Tasto Home", 
        testo: "Resetta la mappa alla vista zoom iniziale" 
    },
    { 
        id: ".btn-tutorial-locate", 
        titolo: "Geolocalizzazione", 
        testo: "Trova la tua posizione attuale sulla mappa." 
    },
    { 
        id: ".btn-tutorial-route", 
        titolo: "Percorsi", 
        testo: "Calcola itinerari tra due punti inserendo partenza e destinazione." 
    }
];

let currentStep = 0;

function closeModal() {
    const modal = document.getElementById('welcome-modal');
    if (modal) modal.style.display = 'none';
}

function startTutorial() {
    closeModal();
    currentStep = 0;
    
    if (typeof map === 'undefined') return;

    try {
        map.dragging.disable();
        map.touchZoom.disable();
        map.doubleClickZoom.disable();
        map.scrollWheelZoom.disable();
        if (map.tap) map.tap.disable();
    } catch (e) { console.warn(e); }
    
    setTimeout(showStep, 20);
}

function showStep() {
    const step = tutorialSteps[currentStep];
    const target = document.querySelector(step.id);
    const isLast = currentStep === tutorialSteps.length - 1;

    let popupPoint;
    if (target) {
        const rect = target.getBoundingClientRect();
        popupPoint = map.containerPointToLayerPoint([rect.left - 100, rect.top + 110]);
    }

    const popupLatLng = map.layerPointToLatLng(popupPoint);

    L.popup({ 
        closeButton: false, 
        closeOnClick: false,
        autoPan: false,
        className: 'tutorial-pointer',
        offset: L.point(-10, 0) 
    })
    .setLatLng(popupLatLng)
    .setContent(`
        <div style="width: 180px; font-family: sans-serif; display: flex; flex-direction: column; gap: 4px;">
            <div style="display: flex; justify-content: space-between; align-items: center; width: 100%;">
                <b style="color:#3498db; font-size: 12px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; flex-grow: 1;">
                    ${step.titolo}
                </b>
                <button onclick="nextTutorialStep()" style="background:#3498db; color:white; border:none; padding:3px 8px; border-radius:4px; cursor:pointer; font-size: 9px; font-weight: bold; flex-shrink: 0; margin-left: 6px;">
                    ${isLast ? 'INIZIA' : 'AVANTI'}
                </button>
            </div>
            <div style="font-size: 12px; line-height: 1.2; border-top: 1px solid
