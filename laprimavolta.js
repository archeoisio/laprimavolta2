let map; 
let highlightLayer;

function highlightFeature(e) {
    var layer = e.target;
    layer.setStyle({
        fillColor: '#ffff00',
        color: '#ff0000',
        fillOpacity: 0.9,
        weight: 2
    });
    if (!L.Browser.ie && !L.Browser.opera && !L.Browser.edge) {
        layer.bringToFront();
    }
}

function resetFeatureStyle(e) {
    var layer = e.target;
    if (layer.feature.geometry.type === 'Point') {
        layer.setStyle({
            radius: 6.0,
            opacity: 1,
            color: 'rgba(35,35,35,1.0)',
            weight: 1,
            fill: true,
            fillOpacity: 1,
            fillColor: 'rgba(59,113,230,1.0)'
        });
    } else {
        layer.setStyle({
            opacity: 1,
            color: 'rgba(35,35,35,1.0)',
            weight: 1.0,
            fill: true,
            fillOpacity: 0.6,
            fillColor: 'rgba(140,83,231,1.0)'
        });
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

    // --- 2. CARICAMENTO LAYER DI BASE E CONTESTO ---
    // iconaquartieri_0
    function pop_iconaquartieri_0(feature, layer) {
        layer.on({
            mouseout: function(e) { resetFeatureStyle(e); layer.closePopup(); },
            mouseover: highlightFeature,
        });
        var popupContent = '<table><tr><td colspan="2">' + (feature.properties['nome'] !== null ? autolinker.link(String(feature.properties['nome']).replace(/'/g, '\'').toLocaleString()) : '') + '</td></tr></table>';
        layer.bindPopup(removeEmptyRowsFromPopupContent(popupContent, feature), { maxHeight: 400 });
    }
    map.createPane('pane_iconaquartieri_0');
    map.getPane('pane_iconaquartieri_0').style.zIndex = 400;
    var layer_iconaquartieri_0 = new L.geoJson(json_iconaquartieri_0, {
        interactive: false, pane: 'pane_iconaquartieri_0', onEachFeature: pop_iconaquartieri_0,
        pointToLayer: function (feature, latlng) { return L.circleMarker(latlng, { radius: 4.0, stroke: false, fill: true, fillOpacity: 1, fillColor: 'rgba(190,178,151,0.0)' }); },
    });
    map.addLayer(layer_iconaquartieri_0);

    // hospital_1
    function pop_hospital_1(feature, layer) {
        layer.on({ mouseout: function(e) { resetFeatureStyle(e); layer.closePopup(); }, mouseover: highlightFeature });
        var popupContent = '<table><tr><td colspan="2">' + (feature.properties['nome'] !== null ? autolinker.link(String(feature.properties['nome']).replace(/'/g, '\'').toLocaleString()) : '') + '</td></tr></table>';
        layer.bindPopup(removeEmptyRowsFromPopupContent(popupContent, feature), { maxHeight: 400 });
    }
    map.createPane('pane_hospital_1');
    map.getPane('pane_hospital_1').style.zIndex = 401;
    var layer_hospital_1 = new L.geoJson(json_hospital_1, {
        interactive: false, pane: 'pane_hospital_1', onEachFeature: pop_hospital_1,
        pointToLayer: function (feature, latlng) { return L.marker(latlng, { icon: L.icon({ iconUrl: 'markers/hospital_1.svg', iconSize: [16.72, 16.72] }) }); },
    });
    map.addLayer(layer_hospital_1);

    // iconestazioni_2
    function pop_iconestazioni_2(feature, layer) {
        layer.on({ mouseout: function(e) { resetFeatureStyle(e); layer.closePopup(); }, mouseover: highlightFeature });
        var popupContent = '<table><tr><td colspan="2">' + (feature.properties['nome'] !== null ? autolinker.link(String(feature.properties['nome']).replace(/'/g, '\'').toLocaleString()) : '') + '</td></tr></table>';
        layer.bindPopup(removeEmptyRowsFromPopupContent(popupContent, feature), { maxHeight: 400 });
    }
    map.createPane('pane_iconestazioni_2');
    map.getPane('pane_iconestazioni_2').style.zIndex = 402;
    var layer_iconestazioni_2 = new L.geoJson.multiStyle(json_iconestazioni_2, {
        interactive: false, pane: 'pane_iconestazioni_2', onEachFeature: pop_iconestazioni_2,
        pointToLayers: [
            function (feature, latlng) { return L.marker(latlng, { radius: 12.0, opacity: 1, color: 'rgba(35,35,35,1.0)', fill: true, fillOpacity: 1, fillColor: 'rgba(255,255,255,1.0)' }); },
            function (feature, latlng) { return L.marker(latlng, { icon: L.icon({ iconUrl: 'markers/iconestazioni_2.svg', iconSize: [19.0, 19.0] }) }); }
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

    // --- 3. SUDDIVISIONE DINAMICA PER TAVOLI (PUNTI E POLIGONI) ---
    const atlasCategories = {};
    const tavoliPuntiLayers = {};
    const tavoliPoligoniLayers = {};

    function registerItem(feature, layer) {
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

    // Organizzazione Punti per Tavolo
    const puntiPerTavolo = {};
    json_puntiprimavolta_5.features.forEach(f => {
        const t = f.properties['Tavolo'] || f.properties['Tavolo di '] || f.properties['Tavolo di'] || 'Altro';
        if (!puntiPerTavolo[t]) puntiPerTavolo[t] = [];
        puntiPerTavolo[t].push(f);
    });

    map.createPane('pane_puntiprimavolta_5');
    map.getPane('pane_puntiprimavolta_5').style.zIndex = 405;
    
    const overlays = {
        "Stazioni": layer_iconestazioni_2,
        "Ospedali": layer_hospital_1,
        "Quartieri": layer_iconaquartieri_0
    };

    for (const [tavolo, features] of Object.entries(puntiPerTavolo)) {
        const layerPuntiTavolo = new L.geoJson({ type: "FeatureCollection", features: features }, {
            interactive: true,
            pane: 'pane_puntiprimavolta_5',
            onEachFeature: function(feature, layer) {
                registerItem(feature, layer);
                layer.on({
                    mouseout: function(e) { resetFeatureStyle(e); layer.closePopup(); },
                    mouseover: highlightFeature
                });
                var popupContent = '<table>\
                    <tr><th scope="row">Nome</th><td>' + (feature.properties['Nome'] !== null ? autolinker.link(String(feature.properties['Nome']).replace(/'/g, '\'').toLocaleString()) : '') + '</td></tr>\
                    <tr><th scope="row">Criticità</th><td>' + (feature.properties['Criticità'] !== null ? autolinker.link(String(feature.properties['Criticità']).replace(/'/g, '\'').toLocaleString()) : '') + '</td></tr>\
                    <tr><th scope="row">Proposta</th><td>' + (feature.properties['Proposta'] !== null ? autolinker.link(String(feature.properties['Proposta']).replace(/'/g, '\'').toLocaleString()) : '') + '</td></tr>\
                    <tr><th scope="row">Stato</th><td>' + (feature.properties['Stato'] !== null ? autolinker.link(String(feature.properties['Stato']).replace(/'/g, '\'').toLocaleString()) : '') + '</td></tr>\
                    <tr><th scope="row">Tavolo</th><td>' + (feature.properties['Tavolo'] !== null ? autolinker.link(String(feature.properties['Tavolo']).replace(/'/g, '\'').toLocaleString()) : '') + '</td></tr>\
                </table>';
                layer.bindPopup(removeEmptyRowsFromPopupContent(popupContent, feature), { maxHeight: 400 });
            },
            pointToLayer: function (feature, latlng) {
                return L.circleMarker(latlng, { radius: 6.0, opacity: 1, color: 'rgba(35,35,35,1.0)', weight: 1, fill: true, fillOpacity: 1, fillColor: 'rgba(59,113,230,1.0)' });
            }
        });
        map.addLayer(layerPuntiTavolo);
        overlays["📍 Punti: " + tavolo] = layerPuntiTavolo;
    }

    // Organizzazione Poligoni per Tavolo
    const poligoniPerTavolo = {};
    json_poligoniprimavolta_6.features.forEach(f => {
        const t = f.properties['Tavolo'] || f.properties['Tavolo di '] || f.properties['Tavolo di'] || 'Altro';
        if (!poligoniPerTavolo[t]) poligoniPerTavolo[t] = [];
        poligoniPerTavolo[t].push(f);
    });

    map.createPane('pane_poligoniprimavolta_6');
    map.getPane('pane_poligoniprimavolta_6').style.zIndex = 406;

    for (const [tavolo, features] of Object.entries(poligoniPerTavolo)) {
        const layerPoligoniTavolo = new L.geoJson({ type: "FeatureCollection", features: features }, {
            interactive: true,
            pane: 'pane_poligoniprimavolta_6',
            style: function(feature) {
                return { opacity: 1, color: 'rgba(35,35,35,1.0)', weight: 1.0, fill: true, fillOpacity: 0.6, fillColor: 'rgba(140,83,231,1.0)' };
            },
            onEachFeature: function(feature, layer) {
                registerItem(feature, layer);
                layer.on({
                    mouseout: function(e) { resetFeatureStyle(e); layer.closePopup(); },
                    mouseover: highlightFeature
                });
                var popupContent = '<table>\
                    <tr><th scope="row">Nome</th><td>' + (feature.properties['Nome'] !== null ? autolinker.link(String(feature.properties['Nome']).replace(/'/g, '\'').toLocaleString()) : '') + '</td></tr>\
                    <tr><th scope="row">Criticità</th><td>' + (feature.properties['Criticità'] !== null ? autolinker.link(String(feature.properties['Criticità']).replace(/'/g, '\'').toLocaleString()) : '') + '</td></tr>\
                    <tr><th scope="row">Proposta</th><td>' + (feature.properties['Proposta'] !== null ? autolinker.link(String(feature.properties['Proposta']).replace(/'/g, '\'').toLocaleString()) : '') + '</td></tr>\
                </table>';
                layer.bindPopup(removeEmptyRowsFromPopupContent(popupContent, feature), { maxHeight: 400 });
            }
        });
        map.addLayer(layerPoligoniTavolo);
        overlays["🗺️ Poligoni: " + tavolo] = layerPoligoniTavolo;
    }

    // --- 4. CONTROLLO LAYER E SATELLITE (ALTO A DESTRA) ---
    var baseLayers = {
        "OpenStreetMap": layer_OpenStreetMap_4,
        "Google Satellite": layer_GoogleSatellite_3
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

    // --- 5. PULSANTI IN ALTO A DESTRA (DIMENSIONI UNIFICATE) ---
    const btnControl = L.control({ position: 'topright' });
    btnControl.onAdd = function(map) {
        const container = L.DomUtil.create('div', 'leaflet-bar');
        container.style.marginTop = '4px';
        container.style.marginRight = '4px';
        container.style.display = 'flex';
        container.style.flexDirection = 'column';
        container.style.background = 'transparent';
        container.style.border = 'none';

        L.DomEvent.disableClickPropagation(container);
        L.DomEvent.on(container, 'mousewheel', L.DomEvent.stopPropagation);
        L.DomEvent.on(container, 'touchstart', L.DomEvent.stopPropagation);
        L.DomEvent.on(container, 'pointerdown', L.DomEvent.stopPropagation);

        const createBtn = (html, title, onClick, className) => {
            const btn = L.DomUtil.create('a', className || '', container);
            btn.innerHTML = html;
            btn.title = title;
            btn.href = '#';
            btn.style.width = '34px';
            btn.style.height = '34px';
            btn.style.lineHeight = '34px';
            btn.style.textAlign = 'center';
            btn.style.display = 'flex';
            btn.style.alignItems = 'center';
            btn.style.justifyContent = 'center';
            btn.style.fontSize = '16px';
            btn.style.backgroundColor = 'white';
            btn.style.color = '#333';
            btn.style.borderBottom = '1px solid #ccc';
            btn.style.textDecoration = 'none';

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

        // Atlas Layers ❤️
        createBtn('❤️', "Atlas Layers", () => {
            const hb = document.getElementById('hearts-list-box');
            if(hb) hb.style.display = (hb.style.display === 'none') ? 'block' : 'none';
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
        locContainer.style.width = '34px';
        locContainer.style.height = '34px';
    }

    // --- 6. PANNELLO ATLAS LAYERS (BASSO SINISTRA - FORMATO ORIGINALE ATLAS) ---
    const sideInfoControl = L.control({ position: 'bottomleft' });
    sideInfoControl.onAdd = function(map) {
        const container = L.DomUtil.create('div', 'info-container-bottom');
        container.style.display = 'flex';
        container.style.flexDirection = 'column';
        container.style.alignItems = 'flex-start';
        container.style.marginBottom = '12px'; 
        container.style.marginLeft = '10px';   
        container.style.pointerEvents = 'auto';
        
        const heartsListBox = L.DomUtil.create('div', '', container);
        heartsListBox.id = 'hearts-list-box';
        heartsListBox.style.display = 'none';
        heartsListBox.style.marginTop = '5px';
        heartsListBox.style.backgroundColor = 'rgba(20, 20, 20, 0.9)';
        heartsListBox.style.backdropFilter = 'blur(10px)';
        heartsListBox.style.border = '1px solid rgba(255, 255, 255, 0.2)';
        heartsListBox.style.boxShadow = '0 8px 32px rgba(0, 0, 0, 0.5)';
        heartsListBox.style.padding = '15px';
        heartsListBox.style.borderRadius = '12px';
        heartsListBox.style.width = '300px';
        heartsListBox.style.maxHeight = '420px';
        heartsListBox.style.overflowY = 'auto';
        heartsListBox.style.color = 'white';

        L.DomEvent.disableScrollPropagation(heartsListBox);
        L.DomEvent.disableClickPropagation(heartsListBox);

        setTimeout(() => {
            for (const [tavolo, items] of Object.entries(atlasCategories)) {
                const wrapper = document.createElement('div');
                wrapper.style.marginBottom = '10px';
                wrapper.innerHTML = `
                    <div class="header" style="cursor:pointer; display:flex; justify-content:space-between; align-items:center; padding:8px 10px; background:rgba(255,255,255,0.1); border-radius:6px;">
                        <span style="color:#ffeb3b; font-size:13px; font-weight:bold;">📋 ${tavolo.toUpperCase()} (${items.length})</span>
                        <span class="arrow" style="color:white; font-size:12px;">►</span>
                    </div>
                    <div class="content" style="display:none; padding:8px 0 0 5px;"></div>
                `;
                const header = wrapper.querySelector('.header');
                const content = wrapper.querySelector('.content');

                items.forEach(item => {
                    const row = document.createElement('div');
                    row.style.display = 'flex';
                    row.style.justifyContent = 'space-between';
                    row.style.alignItems = 'center';
                    row.style.marginBottom = '6px';
                    row.style.paddingBottom = '4px';
                    row.style.borderBottom = '1px solid rgba(255,255,255,0.05)';
                    
                    row.innerHTML = '<span style="font-size:12px; font-weight:500; color:#f1f1f1; flex-grow:1; margin-right:8px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;">' + item.name + '</span>';

                    const vBtn = document.createElement('button');
                    vBtn.innerText = 'VOLA';
                    vBtn.style.fontWeight = 'bold';
                    vBtn.style.fontSize = '10px';
                    vBtn.style.padding = '4px 8px';
                    vBtn.style.cursor = 'pointer';
                    vBtn.style.backgroundColor = '#e74c3c';
                    vBtn.style.color = 'white';
                    vBtn.style.border = 'none';
                    vBtn.style.borderRadius = '4px';
                    vBtn.style.flexShrink = '0';

                    vBtn.onclick = () => {
                        map.flyTo(item.latlng, 16, { animate: true, duration: 3 });
                        item.layer.openPopup();
                    };

                    row.appendChild(vBtn);
                    content.appendChild(row);
                });

                header.onclick = () => {
                    const isHidden = content.style.display === 'none';
                    content.style.display = isHidden ? 'block' : 'none';
                    const arrowEl = wrapper.querySelector('.arrow');
                    if (arrowEl) {
                        arrowEl.innerHTML = isHidden ? '▼' : '►';
                    }
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
        id: ".btn-tutorial-hearts", 
        titolo: "Atlas Layers ❤️", 
        testo: "Apri il pannello dei tavoli per esplorare le proposte e volare direttamente su di esse." 
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
        popupPoint = map.containerPointToLayerPoint([rect.left - 120, rect.top + 110]);
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

// --- Funzione globale per far avanzare il tutorial ---
window.nextTutorialStep = function() {
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
