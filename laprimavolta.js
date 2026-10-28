let map; 
let highlightLayer;

function highlightFeature(e) {
    highlightLayer = e.target;
    if (e.target.feature.geometry.type === 'LineString' || e.target.feature.geometry.type === 'MultiLineString') {
      highlightLayer.setStyle({ color: 'rgba(255, 255, 0, 1.00)' });
    } else {
      highlightLayer.setStyle({ fillColor: 'rgba(255, 255, 0, 1.00)', fillOpacity: 1 });
    }
}

document.addEventListener('DOMContentLoaded', () => {
    // --- 1. INIZIALIZZAZIONE MAPPA E VIEWPORT ---
    map = L.map('map', {
        zoomControl: false,
        maxZoom: 28,
        minZoom: 1
    }).fitBounds([[40.656620229112676,14.746602424093645],[40.696732601759756,14.837955878058532]]);

    var hash = new L.Hash(map);
    map.attributionControl.setPrefix('<a href="https://github.com/qgis2web/qgis2web" target="_blank">qgis2web</a> &middot; <a href="https://leafletjs.com" title="A JS library for interactive maps">Leaflet</a> &middot; <a href="https://qgis.org">QGIS</a>');
    var autolinker = new Autolinker({truncate: {length: 30, location: 'smart'}});

    function removeEmptyRowsFromPopupContent(content, feature) {
         var tempDiv = document.createElement('div');
         tempDiv.innerHTML = content;
         var rows = tempDiv.querySelectorAll('tr');
         for (var i = 0; i < rows.length; i++) {
             var td = rows[i].querySelector('td.visible-with-data');
             var key = td ? td.id : '';
             if (td && td.classList.contains('visible-with-data') && feature.properties[key] == null) {
                 rows[i].parentNode.removeChild(rows[i]);
             }
         }
         return tempDiv.innerHTML;
    }

    // --- 2. CARICAMENTO LAYER QGIS ---
    // iconaquartieri_0
    function pop_iconaquartieri_0(feature, layer) {
        layer.on({
            mouseout: function(e) { layer.closePopup(); },
            mouseover: highlightFeature,
        });
        var popupContent = '<table><tr><td colspan="2">' + (feature.properties['nome'] !== null ? autolinker.link(String(feature.properties['nome']).replace(/'/g, '\'').toLocaleString()) : '') + '</td></tr></table>';
        var content = removeEmptyRowsFromPopupContent(popupContent, feature);
        layer.bindPopup(content, { maxHeight: 400 });
    }
    function style_iconaquartieri_0_0() {
        return { pane: 'pane_iconaquartieri_0', radius: 4.0, stroke: false, fill: true, fillOpacity: 1, fillColor: 'rgba(190,178,151,0.0)', interactive: false };
    }
    map.createPane('pane_iconaquartieri_0');
    map.getPane('pane_iconaquartieri_0').style.zIndex = 400;
    var layer_iconaquartieri_0 = new L.geoJson(json_iconaquartieri_0, {
        interactive: false, pane: 'pane_iconaquartieri_0', onEachFeature: pop_iconaquartieri_0,
        pointToLayer: function (feature, latlng) { return L.circleMarker(latlng, style_iconaquartieri_0_0(feature)); },
    });
    map.addLayer(layer_iconaquartieri_0);

    // hospital_1
    function pop_hospital_1(feature, layer) {
        layer.on({ mouseout: function(e) { layer.closePopup(); }, mouseover: highlightFeature });
        var popupContent = '<table><tr><td colspan="2">' + (feature.properties['nome'] !== null ? autolinker.link(String(feature.properties['nome']).replace(/'/g, '\'').toLocaleString()) : '') + '</td></tr></table>';
        var content = removeEmptyRowsFromPopupContent(popupContent, feature);
        layer.bindPopup(content, { maxHeight: 400 });
    }
    function style_hospital_1_0() {
        return { pane: 'pane_hospital_1', icon: L.icon({ iconUrl: 'markers/hospital_1.svg', iconSize: [16.72, 16.72] }), interactive: false };
    }
    map.createPane('pane_hospital_1');
    map.getPane('pane_hospital_1').style.zIndex = 401;
    var layer_hospital_1 = new L.geoJson(json_hospital_1, {
        interactive: false, pane: 'pane_hospital_1', onEachFeature: pop_hospital_1,
        pointToLayer: function (feature, latlng) { return L.marker(latlng, style_hospital_1_0(feature)); },
    });
    map.addLayer(layer_hospital_1);

    // iconestazioni_2
    function pop_iconestazioni_2(feature, layer) {
        layer.on({ mouseout: function(e) { layer.closePopup(); }, mouseover: highlightFeature });
        var popupContent = '<table><tr><td colspan="2">' + (feature.properties['nome'] !== null ? autolinker.link(String(feature.properties['nome']).replace(/'/g, '\'').toLocaleString()) : '') + '</td></tr></table>';
        var content = removeEmptyRowsFromPopupContent(popupContent, feature);
        layer.bindPopup(content, { maxHeight: 400 });
    }
    function style_iconestazioni_2_0() {
        return { pane: 'pane_iconestazioni_2', radius: 12.0, opacity: 1, color: 'rgba(35,35,35,1.0)', fill: true, fillOpacity: 1, fillColor: 'rgba(255,255,255,1.0)', interactive: false };
    }
    function style_iconestazioni_2_1() {
        return { pane: 'pane_iconestazioni_2', icon: L.icon({ iconUrl: 'markers/iconestazioni_2.svg', iconSize: [19.0, 19.0] }), interactive: false };
    }
    map.createPane('pane_iconestazioni_2');
    map.getPane('pane_iconestazioni_2').style.zIndex = 402;
    var layer_iconestazioni_2 = new L.geoJson.multiStyle(json_iconestazioni_2, {
        interactive: false, pane: 'pane_iconestazioni_2', onEachFeature: pop_iconestazioni_2,
        pointToLayers: [
            function (feature, latlng) { return L.marker(latlng, style_iconestazioni_2_0(feature)); },
            function (feature, latlng) { return L.marker(latlng, style_iconestazioni_2_1(feature)); }
        ]
    });
    map.addLayer(layer_iconestazioni_2);

    // Basemaps
    map.createPane('pane_GoogleSatellite_3');
    map.getPane('pane_GoogleSatellite_3').style.zIndex = 403;
    var layer_GoogleSatellite_3 = L.tileLayer('https://mt1.google.com/vt/lyrs=s&x={x}&y={y}&z={z}', { pane: 'pane_GoogleSatellite_3', minZoom: 1, maxZoom: 28 });

    map.createPane('pane_OpenStreetMap_4');
    map.getPane('pane_OpenStreetMap_4').style.zIndex = 404;
    var layer_OpenStreetMap_4 = L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', { pane: 'pane_OpenStreetMap_4', minZoom: 1, maxZoom: 28 });
    map.addLayer(layer_OpenStreetMap_4);

    // Raccolta dati dinamica per gli Atlas Layers basati sui Tavoli
    const atlasCategories = {};

    function registerAtlasItem(feature, layer) {
        const tavolo = feature.properties['Tavolo'] || feature.properties['Tavolo di '] || feature.properties['Tavolo di'] || 'Altro';
        const name = feature.properties['Nome'] || 'Elemento';
        
        let latlng;
        if (feature.geometry.type === 'Point') {
            const coords = feature.geometry.coordinates;
            latlng = [coords[1], coords[0]];
        } else {
            latlng = layer.getBounds().getCenter();
        }

        if (!atlasCategories[tavolo]) {
            atlasCategories[tavolo] = [];
        }
        atlasCategories[tavolo].push({ name, latlng, layer });
    }

    // puntiprimavolta_5
    function pop_puntiprimavolta_5(feature, layer) {
        registerAtlasItem(feature, layer);
        layer.on({ mouseout: function(e) { layer.closePopup(); }, mouseover: highlightFeature });
        var popupContent = '<table>\
                <tr><th scope="row">Nome</th><td>' + (feature.properties['Nome'] !== null ? autolinker.link(String(feature.properties['Nome']).replace(/'/g, '\'').toLocaleString()) : '') + '</td></tr>\
                <tr><th scope="row">Criticità</th><td>' + (feature.properties['Criticità'] !== null ? autolinker.link(String(feature.properties['Criticità']).replace(/'/g, '\'').toLocaleString()) : '') + '</td></tr>\
                <tr><th scope="row">Proposta</th><td>' + (feature.properties['Proposta'] !== null ? autolinker.link(String(feature.properties['Proposta']).replace(/'/g, '\'').toLocaleString()) : '') + '</td></tr>\
                <tr><th scope="row">Stato</th><td>' + (feature.properties['Stato'] !== null ? autolinker.link(String(feature.properties['Stato']).replace(/'/g, '\'').toLocaleString()) : '') + '</td></tr>\
                <tr><th scope="row">Tavolo</th><td>' + (feature.properties['Tavolo'] !== null ? autolinker.link(String(feature.properties['Tavolo']).replace(/'/g, '\'').toLocaleString()) : '') + '</td></tr>\
            </table>';
        var content = removeEmptyRowsFromPopupContent(popupContent, feature);
        layer.bindPopup(content, { maxHeight: 400 });
    }
    function style_puntiprimavolta_5_0(feature) {
        return { pane: 'pane_puntiprimavolta_5', radius: 6.0, opacity: 1, color: 'rgba(35,35,35,1.0)', weight: 1, fill: true, fillOpacity: 1, fillColor: 'rgba(59,113,230,1.0)', interactive: true };
    }
    map.createPane('pane_puntiprimavolta_5');
    map.getPane('pane_puntiprimavolta_5').style.zIndex = 405;
    var layer_puntiprimavolta_5 = new L.geoJson(json_puntiprimavolta_5, {
        interactive: true, pane: 'pane_puntiprimavolta_5', onEachFeature: pop_puntiprimavolta_5,
        pointToLayer: function (feature, latlng) { return L.circleMarker(latlng, style_puntiprimavolta_5_0(feature)); },
    });
    map.addLayer(layer_puntiprimavolta_5);

    // poligoniprimavolta_6
    function pop_poligoniprimavolta_6(feature, layer) {
        registerAtlasItem(feature, layer);
        layer.on({ mouseout: function(e) { layer.closePopup(); }, mouseover: highlightFeature });
        var popupContent = '<table>\
                <tr><th scope="row">Nome</th><td>' + (feature.properties['Nome'] !== null ? autolinker.link(String(feature.properties['Nome']).replace(/'/g, '\'').toLocaleString()) : '') + '</td></tr>\
                <tr><th scope="row">Criticità</th><td>' + (feature.properties['Criticità'] !== null ? autolinker.link(String(feature.properties['Criticità']).replace(/'/g, '\'').toLocaleString()) : '') + '</td></tr>\
                <tr><th scope="row">Proposta</th><td>' + (feature.properties['Proposta'] !== null ? autolinker.link(String(feature.properties['Proposta']).replace(/'/g, '\'').toLocaleString()) : '') + '</td></tr>\
            </table>';
        var content = removeEmptyRowsFromPopupContent(popupContent, feature);
        layer.bindPopup(content, { maxHeight: 400 });
    }
    function style_poligoniprimavolta_6_0(feature) {
        return { pane: 'pane_poligoniprimavolta_6', opacity: 1, color: 'rgba(35,35,35,1.0)', weight: 1.0, fill: true, fillOpacity: 0.6, fillColor: 'rgba(140,83,231,1.0)', interactive: true };
    }
    map.createPane('pane_poligoniprimavolta_6');
    map.getPane('pane_poligoniprimavolta_6').style.zIndex = 406;
    var layer_poligoniprimavolta_6 = new L.geoJson(json_poligoniprimavolta_6, {
        interactive: true, pane: 'pane_poligoniprimavolta_6', onEachFeature: pop_poligoniprimavolta_6, style: style_poligoniprimavolta_6_0,
    });
    map.addLayer(layer_poligoniprimavolta_6);

    // --- 3. CONTROLLO LAYER E SATELLITE (ALTO A DESTRA) ---
    var baseLayers = {
        "OpenStreetMap": layer_OpenStreetMap_4,
        "Google Satellite": layer_GoogleSatellite_3
    };
    var overlays = {
        "Punti Prima Volta": layer_puntiprimavolta_5,
        "Poligoni Prima Volta": layer_poligoniprimavolta_6,
        "Stazioni": layer_iconestazioni_2,
        "Ospedali": layer_hospital_1,
        "Quartieri": layer_iconaquartieri_0
    };
    L.control.layers(baseLayers, overlays, { collapsed: true, position: 'topright' }).addTo(map);

    // Photon Search Control
    const photonUrl = {"Nominatim OSM": "https://nominatim.openstreetmap.org/search?format=geojson&addressdetails=1&"};
    var photonControl = L.control.photon({
        url: photonUrl["Nominatim OSM"],
        feedbackLabel: '',
        position: 'topleft',
        includePosition: true,
        initial: true,
    }).addTo(map);
    photonControl._container.childNodes[0].style.borderRadius="10px";

    var searchMarker = null;
    var searchGeoJson = null;
    photonControl.on('selected', function(e) {
        if (searchGeoJson != null) {
            map.removeLayer(searchMarker);
            map.removeLayer(searchGeoJson);
        }
        var gcd = e.choice;
        searchGeoJson = L.geoJSON(gcd).addTo(map);
        var label = typeof gcd.properties.label === 'undefined' ? gcd.properties.display_name : gcd.properties.label;
        searchMarker = L.marker(searchGeoJson.getLayers()[0].getLatLng()).bindPopup(label).addTo(map);
        map.setView(searchGeoJson.getLayers()[0].getLatLng(), 17);
        var z = typeof e.choice.properties.label === 'undefined'? e.choice.properties.display_name : e.choice.properties.label;
        e.target.input.value = z;
    });
    var searchEl = document.getElementsByClassName("leaflet-photon leaflet-control")[0];
    if (searchEl) {
        searchEl.classList.add("leaflet-control-search");
        searchEl.style.display = "flex";
        searchEl.style.backgroundColor="rgba(255,255,255,0.5)";

        var button = document.createElement("div");
        button.id = "gcd-button-control";
        button.className = "gcd-gl-btn fa fa-search search-button";
        searchEl.insertBefore(button, searchEl.firstChild);
        var last = searchEl.lastChild;
        last.style.display = "none";
        button.addEventListener("click", function () {
            if (last.style.display === "none") {
                last.style.display = "block";
            } else {
                last.style.display = "none";
            }
        });
    }

    // --- 4. GESTIONE ROUTING E PULSANTI (ALTO A DESTRA) ---
    let control = null; 
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
                const r = await fetch("https://nominatim.openstreetmap.org/search?format=json&q=" + encodeURIComponent(query));
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

        // Home
        createBtn('🌍', "Torna alla vista iniziale", () => {
            map.fitBounds([[40.656620229112676,14.746602424093645],[40.696732601759756,14.837955878058532]]);
        }, 'btn-tutorial-home');

        // Routing
        createBtn('🗺️', "Mostra/Nascondi indicazioni", () => {
            const rb = document.getElementById('route-box');
            const hb = document.getElementById('hearts-list-box');
            if(hb) hb.style.display = 'none';
            if(rb) rb.style.display = (rb.style.display === 'none') ? 'flex' : 'none';
        }, 'btn-tutorial-route');

        // Atlas Layers ❤️
        createBtn('❤️', "Atlas Layers", () => {
            const rb = document.getElementById('route-box');
            const hb = document.getElementById('hearts-list-box');
            if(rb) rb.style.display = 'none';
            if(hb) hb.style.display = (hb.style.display === 'none') ? 'flex' : 'none';
        }, 'btn-tutorial-hearts');

        return container;
    };
    btnControl.addTo(map);

    // Locate control
    const locateControl = L.control.locate({
        position: 'topright',
        flyTo: { duration: 6 },
        strings: { title: "Posizione" }
    }).addTo(map);

    const locContainer = locateControl.getContainer();
    if (locContainer) {
        locContainer.classList.add('btn-tutorial-locate');
    }

    // --- 5. PANNELLI INFORMATIVI E ATLAS LAYERS DINAMICI (BASSO SINISTRA) ---
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
        
        routeBox.innerHTML = '<input id="start" placeholder="Partenza" style="width:100%; margin-bottom:5px; padding:4px;">' +
            '<input id="end" placeholder="Destinazione" style="width:100%; margin-bottom:8px; padding:4px;">' +
            '<div style="display:flex; gap:5px;">' +
            '<button id="route-btn" style="flex:1; cursor:pointer; padding:5px; border-radius:4px; border:none; background:white; font-weight:bold;">Calcola</button>' +
            '<button id="clear-btn" style="flex:1; cursor:pointer; padding:5px; border-radius:4px; border:none; background:#ff5252; color:white;">Reset</button>' +
            '</div>';

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

        // Box Atlas Layers ❤️ (Generato dinamicamente dai Tavoli)
        const heartsListBox = L.DomUtil.create('div', '', container);
        heartsListBox.id = 'hearts-list-box';
        heartsListBox.style.display = 'none';
        heartsListBox.style.marginTop = '5px';
        heartsListBox.style.background = 'rgba(0,0,0,0.7)';
        heartsListBox.style.backdropFilter = 'blur(5px)';
        heartsListBox.style.padding = '10px';
        heartsListBox.style.borderRadius = '8px';
        heartsListBox.style.width = '220px';
        heartsListBox.style.maxHeight = '300px';
        heartsListBox.style.overflowY = 'auto';
        heartsListBox.style.color = 'white';

        L.DomEvent.disableScrollPropagation(heartsListBox);
        L.DomEvent.disableClickPropagation(heartsListBox);

        // Popolamento dinamico delle categorie in base ai Tavoli
        setTimeout(() => {
            for (const [tavolo, items] of Object.entries(atlasCategories)) {
                const wrapper = document.createElement('div');
                wrapper.style.marginBottom = '8px';
                wrapper.innerHTML = `
                    <div class="header" style="cursor:pointer; display:flex; justify-content:space-between; padding:5px; background:rgba(255,255,255,0.1); border-radius:4px;">
                        <span style="color:#ffeb3b; font-size:12px; font-weight:bold;">📋 ${tavolo.toUpperCase()}</span>
                        <span class="arrow" style="color:white;">►</span>
                    </div>
                    <div class="content" style="display:none; padding:5px 0 0 10px;"></div>
                `;
                const header = wrapper.querySelector('.header');
                const content = wrapper.querySelector('.content');

                items.forEach(item => {
                    const row = document.createElement('div');
                    row.style.display = 'flex';
                    row.style.justifyName = 'space-between';
                    row.style.alignItems = 'center';
                    row.style.marginBottom = '5px';
                    row.innerHTML = `<span style="font-size:12px; font-weight:bold; color:white; flex-grow:1; margin-right:5px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;">${item.name}</span>`;

                    const vBtn = document.createElement('button');
                    vBtn.innerText = 'VOLA';
                    vBtn.style.fontWeight = 'bold';
                    vBtn.style.fontSize = '11px';
                    vBtn.style.padding = '2px 6px';
                    vBtn.style.cursor = 'pointer';
                    vBtn.style.backgroundColor = '#e74c3c';
                    vBtn.style.color = 'white';
                    vBtn.style.border = 'none';
                    vBtn.style.borderRadius = '4px';
                    vBtn.style.flexShrink = '0';

                    vBtn.onclick = () => {
                        map.flyTo(item.latlng, 16, { animate: true, duration: 4 });
                        item.layer.openPopup();
                    };

                    row.appendChild(vBtn);
                    content.appendChild(row);
                });

                header.onclick = () => {
                    const isHidden = content.style.display === 'none';
                    content.style.display = isHidden ? 'block' : 'none';
                    wrapper.querySelector('.arrowinnerHTML = isHidden ? '▼' : '►';
                };

                heartsListBox.appendChild(wrapper);
            }
        }, 200);

        return container;
    };
    sideInfoControl.addTo(map);
});

// --- TUTORIAL ---
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
    },
    { 
        id: ".btn-tutorial-hearts", 
        titolo: "Atlas Layers ❤️", 
        testo: "Apri il pannello dei tavoli per volare direttamente sulle proposte." 
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
    } else {
        popupPoint = map.containerPointToLayerPoint([100, 100]);
    }

    const popupLatLng = map.layerPointToLatLng(popupPoint);
    const btnText = isLast ? 'INIZIA' : 'AVANTI';

    L.popup({ 
        closeButton: false, 
        closeOnClick: false,
        autoPan: false,
        className: 'tutorial-pointer',
        offset: L.point(-10, 0) 
    })
    .setLatLng(popupLatLng)
    .setContent(
        '<div style="width: 180px; font-family: sans-serif; display: flex; flex-direction: column; gap: 4px;">' +
            '<div style="display: flex; justify-content: space-between; align-items: center; width: 100%;">' +
                '<b style="color:#3498db; font-size: 12px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; flex-grow: 1;">' +
                    step.titolo +
                '</b>' +
                '<button onclick="nextTutorialStep()" style="background:#3498db; color:white; border:none; padding:3px 8px; border-radius:4px; cursor:pointer; font-size: 9px; font-weight: bold; flex-shrink: 0; margin-left: 6px;">' +
                    btnText +
                '</button>' +
            '</div>' +
            '<div style="font-size: 12px; line-height: 1.2; border-top: 1px solid #eee; padding-top: 4px; color: #333;">' +
                step.testo +
            '</div>' +
        '</div>'
    )
    .openOn(map);
}

function nextTutorialStep() {
    currentStep++;
    if (currentStep < tutorialSteps.length) {
        showStep(); 
    } else {
        map.dragging.enable();
        map.touchZoom.enable();
        map.doubleClickZoom.enable();
        map.scrollWheelZoom.enable();
        map.eachLayer(l => { if (l instanceof L.Popup) map.removeLayer(l); });
    }
}
