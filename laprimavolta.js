let map; 
let highlightLayer;

// Iniezione di stili CSS corretti per allineare perfettamente a sinistra il pannello layer nativo
const customStyleTag = document.createElement('style');
customStyleTag.innerHTML = `
    .leaflet-control-layers-toggle {
        width: 44px !important;
        height: 44px !important;
    }
    .leaflet-control-layers-expanded {
        min-width: 250px !important;
        max-width: 290px !important;
        padding: 8px 10px !important;
        background: rgba(255, 255, 255, 0.96) !important;
        backdrop-filter: blur(6px);
        border-radius: 10px;
        box-shadow: 0 6px 20px rgba(0,0,0,0.25);
        text-align: left !important;
        direction: ltr !important;
        font-size: 12px !important;
    }
    
    /* CORREZIONE RADICALE DEL LAYOUT DELLE VOCI NEL PANNELLO NATIVO */
    .leaflet-control-layers-overlays label,
    .leaflet-control-layers-base label {
        display: flex !important;
        align-items: center !important;
        justify-content: flex-start !important;
        gap: 6px !important;
        cursor: pointer;
        font-size: 12px !important;
        line-height: 1.3 !important;
        margin: 3px 0 !important;
        padding: 0 !important;
        /* Annulla qualsiasi indentazione o padding ereditato */
        text-indent: 0 !important;
    }

    /* Azzeramento dei margini della checkbox nativa */
    .leaflet-control-layers-selector {
        margin: 0 !important;
        position: static !important;
        flex-shrink: 0 !important;
    }

    /* Assicura che il testo e il pallino colorato si dispongano subito dopo la checkbox senza spazi */
    .leaflet-control-layers span {
        display: inline-flex !important;
        align-items: center !important;
        gap: 4px !important;
    }

    /* Stile etichette quartieri con sfondo bianco e bordo nero sottile */
    .quartiere-label {
        background: rgba(255, 255, 255, 0.9);
        border: 1px solid #000;
        padding: 2px 6px;
        border-radius: 4px;
        font-weight: bold;
        font-size: 11px;
        color: #000;
        box-shadow: 0 2px 4px rgba(0,0,0,0.2);
        white-space: nowrap;
    }
`;
document.head.appendChild(customStyleTag);

// Palette di colori distinti per i Tavoli / Categorie
const tavoloColors = {
    'ambiente': '#2ecc71',
    'cultura': '#e67e22',
    'sociale': '#3498db',
    'urbanistica': '#9b59b6',
    'economia': '#f1c40f',
    'mobilità': '#e74c3c',
    'altro': '#1abc9c'
};

function getTavoloColor(tavoloName) {
    if (!tavoloName) return '#3b71e6';
    const key = tavoloName.toLowerCase().trim();
    for (const [k, color] of Object.entries(tavoloColors)) {
        if (key.includes(k)) return color;
    }
    let hash = 0;
    for (let i = 0; i < tavoloName.length; i++) {
        hash = tavoloName.charCodeAt(i) + ((hash << 5) - hash);
    }
    const palette = ['#3b71e6', '#2ecc71', '#e74c3c', '#f39c12', '#9b59b6', '#1abc9c', '#e67e22', '#34495e'];
    return palette[Math.abs(hash) % palette.length];
}

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
    const prop = layer.feature.properties;
    const tavolo = prop['Tavolo'] || prop['Tavolo di '] || prop['Tavolo di'] || 'Altro';
    const catColor = getTavoloColor(tavolo);

    if (layer.feature.geometry.type === 'Point') {
        layer.setStyle({
            radius: 6.0,
            opacity: 1,
            color: 'rgba(35,35,35,1.0)',
            weight: 1,
            fill: true,
            fillOpacity: 1,
            fillColor: catColor
        });
    } else {
        layer.setStyle({
            opacity: 1,
            color: 'rgba(35,35,35,1.0)',
            weight: 1.0,
            fill: true,
            fillOpacity: 0.6,
            fillColor: catColor
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

    // --- 2. CARICAMENTO LAYER DI CONTESTO ---
    
    // Quartieri (Solo etichetta con riquadro bianco e bordo nero)
    function pop_iconaquartieri_0(feature, layer) {
        var nomeQuartiere = feature.properties['nome'] || '';
        if (nomeQuartiere) {
            layer.bindTooltip(nomeQuartiere, {
                permanent: true,
                direction: 'center',
                className: 'quartiere-label'
            });
        }
    }
    map.createPane('pane_iconaquartieri_0');
    map.getPane('pane_iconaquartieri_0').style.zIndex = 400;
    var layer_iconaquartieri_0 = new L.geoJson(json_iconaquartieri_0, {
        interactive: true, pane: 'pane_iconaquartieri_0', onEachFeature: pop_iconaquartieri_0,
        pointToLayer: function (feature, latlng) { 
            return L.circleMarker(latlng, { radius: 0.1, stroke: false, fill: false, opacity: 0 }); 
        },
    });
    map.addLayer(layer_iconaquartieri_0);

    // Ospedali
    function pop_hospital_1(feature, layer) {
        layer.on({ mouseout: function(e) { layer.closePopup(); }, mouseover: highlightFeature });
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

    // Stazioni (Con icona SVG corretta)
    function pop_iconestazioni_2(feature, layer) {
        layer.on({ mouseout: function(e) { layer.closePopup(); }, mouseover: highlightFeature });
        var popupContent = '<table><tr><td colspan="2">' + (feature.properties['nome'] !== null ? autolinker.link(String(feature.properties['nome']).replace(/'/g, '\'').toLocaleString()) : '') + '</td></tr></table>';
        layer.bindPopup(removeEmptyRowsFromPopupContent(popupContent, feature), { maxHeight: 400 });
    }
    map.createPane('pane_iconestazioni_2');
    map.getPane('pane_iconestazioni_2').style.zIndex = 402;
    var layer_iconestazioni_2 = new L.geoJson(json_iconestazioni_2, {
        interactive: true, pane: 'pane_iconestazioni_2', onEachFeature: pop_iconestazioni_2,
        pointToLayer: function (feature, latlng) { 
            return L.marker(latlng, { 
                icon: L.icon({ 
                    iconUrl: 'markers/iconestazioni_2.svg', 
                    iconSize: [22.0, 22.0],
                    iconAnchor: [11, 11]
                }) 
            }); 
        }
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

    // --- 3. COSTRUZIONE ELEMENTI PER IL PANNELLO NATIVO ---
    const atlasCategories = {};

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

    // Punti per Tavolo
    const puntiPerTavolo = {};
    json_puntiprimavolta_5.features.forEach(f => {
        const t = f.properties['Tavolo'] || f.properties['Tavolo di '] || f.properties['Tavolo di'] || 'Altro';
        if (!puntiPerTavolo[t]) puntiPerTavolo[t] = [];
        puntiPerTavolo[t].push(f);
    });

    map.createPane('pane_puntiprimavolta_5');
    map.getPane('pane_puntiprimavolta_5').style.zIndex = 405;

    const overlayMaps = {};

    for (const [tavolo, features] of Object.entries(puntiPerTavolo)) {
        const catColor = getTavoloColor(tavolo);
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
                return L.circleMarker(latlng, { radius: 6.0, opacity: 1, color: 'rgba(35,35,35,1.0)', weight: 1, fill: true, fillOpacity: 1, fillColor: catColor });
            }
        });
        map.addLayer(layerPuntiTavolo);
        
        const iconHtml = '<span style="display:inline-block; width:10px; height:10px; background-color:' + catColor + '; border-radius:50%; margin-right:6px; border:1px solid #333; vertical-align:middle;"></span>';
        overlayMaps[iconHtml + 'Punti: ' + tavolo.toUpperCase()] = layerPuntiTavolo;
    }

    // Poligoni per Tavolo
    const poligoniPerTavolo = {};
    json_poligoniprimavolta_6.features.forEach(f => {
        const t = f.properties['Tavolo'] || f.properties['Tavolo di '] || f.properties['Tavolo di'] || 'Altro';
        if (!poligoniPerTavolo[t]) poligoniPerTavolo[t] = [];
        poligoniPerTavolo[t].push(f);
    });

    map.createPane('pane_poligoniprimavolta_6');
    map.getPane('pane_poligoniprimavolta_6').style.zIndex = 406;

    for (const [tavolo, features] of Object.entries(poligoniPerTavolo)) {
        const catColor = getTavoloColor(tavolo);
        const layerPoligoniTavolo = new L.geoJson({ type: "FeatureCollection", features: features }, {
            interactive: true,
            pane: 'pane_poligoniprimavolta_6',
            style: function(feature) {
                return { opacity: 1, color: 'rgba(35,35,35,1.0)', weight: 1.0, fill: true, fillOpacity: 0.6, fillColor: catColor };
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
        
        const iconHtml = '<span style="display:inline-block; width:10px; height:10px; background-color:' + catColor + '; margin-right:6px; border:1px solid #333; vertical-align:middle;"></span>';
        overlayMaps[iconHtml + 'Aree: ' + tavolo.toUpperCase()] = layerPoligoniTavolo;
    }

    // Aggiunta layer di contesto al pannello nativo
    overlayMaps["Stazioni"] = layer_iconestazioni_2;
    overlayMaps["Ospedali"] = layer_hospital_1;
    overlayMaps["Quartieri"] = layer_iconaquartieri_0;

    // Basemaps per il controllo nativo
    var baseMaps = {
        "OpenStreetMap": layer_OpenStreetMap_4,
        "Google Satellite": layer_GoogleSatellite_3
    };

    // --- 4. CONTROLLO LAYER NATIVO STANDARD ---
    const layersControl = L.control.layers(baseMaps, overlayMaps, {
        collapsed: true,
        position: 'topright'
    }).addTo(map);

    const layersContainer = layersControl.getContainer();
    layersContainer.style.marginRight = '2px';

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

    // --- 5. GESTIONE EVENTI GEOLOCALIZZAZIONE ---
    map.on('locationfound', function(e) {
        var radius = e.accuracy / 2;
        L.marker(e.latlng).addTo(map)
            .bindPopup("Ti trovi qui (entro " + Math.round(radius) + " metri)").openPopup();
        L.circle(e.latlng, radius).addTo(map);
    });

    map.on('locationerror', function(e) {
        alert("Impossibile determinare la posizione: " + e.message);
    });

    // --- 6. PULSANTI IN ALTO A DESTRA ---
    const btnControl = L.control({ position: 'topright' });
    btnControl.onAdd = function(map) {
        const container = L.DomUtil.create('div', 'leaflet-bar');
        
        container.style.marginTop = '4px';
        container.style.marginRight = '10px';
        
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
            btn.style.width = '44px';
            btn.style.height = '44px';
            btn.style.lineHeight = '44px';
            btn.style.textAlign = 'center';
            btn.style.display = 'flex';
            btn.style.alignItems = 'center';
            btn.style.justifyContent = 'center';
            btn.style.fontSize = '18px';
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

        // 1. Home
        createBtn('🌍', "Torna alla vista iniziale", () => {
            map.fitBounds([[40.656620229112676,14.746602424093645],[40.696732601759756,14.837955878058532]]);
        }, 'btn-tutorial-home');

        // 2. Geolocalizzazione
        createBtn('📍', "Posizione", () => {
            map.locate({setView: true, maxZoom: 16});
        }, 'btn-tutorial-locate');

        // 3. Cluster tematici ❤️
        createBtn('❤️', "Cluster tematici", () => {
            const hb = document.getElementById('hearts-list-box');
            if(hb) hb.style.display = (hb.style.display === 'none') ? 'block' : 'none';
        }, 'btn-tutorial-hearts');

        return container;
    };
    btnControl.addTo(map);

    // --- 7. PANNELLO CLUSTER TEMATICI (BASSO SINISTRA) ---
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
        id: ".leaflet-control-layers", 
        titolo: "Layer e Mappe", 
        testo: "Scegli la mappa base e attiva o disattiva i layer tematici e il contesto urbano." 
    },
    { 
        id: ".btn-tutorial-home", 
        titolo: "Tasto Home", 
        testo: "Resetta la mappa alla vista zoom iniziale su Salerno." 
    },
    { 
        id: ".btn-tutorial-locate", 
        titolo: "Geolocalizzazione", 
        testo: "Trova la tua posizione attuale sulla mappa." 
    },
    { 
        id: ".btn-tutorial-hearts", 
        titolo: "Cluster Tematici", 
        testo: "Clicca qui per aprire il pannello di riepilogo dei tavoli tematici." 
    },
    { 
        id: "#hearts-list-box", 
        titolo: "Esplora Proposte", 
        testo: "Elenco delle proposte divise per tavolo. Clicca su 'VOLA' per raggiungere direttamente la destinazione.",
        action: "openHearts" 
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
    const isHeartBox = step.id === "#hearts-list-box";

    if (step.action === "openHearts") {
        const hb = document.getElementById('hearts-list-box');
        if (hb) hb.style.display = 'block';
    }

    let popupPoint;
    if (target) {
        const rect = target.getBoundingClientRect();
        if (isHeartBox) {
            popupPoint = map.containerPointToLayerPoint([rect.left + 120, rect.top - 10]);
        } else {
            popupPoint = map.containerPointToLayerPoint([rect.left - 130, rect.top + (rect.height / 2)]);
        }
    } else {
        popupPoint = map.containerPointToLayerPoint([100, 100]);
    }

    const popupLatLng = map.layerPointToLatLng(popupPoint);
    const btnText = isLast ? 'INIZIA' : 'AVANTI';

    L.popup({ 
        closeButton: false, 
        closeOnClick: false,
        autoPan: false,
        className: 'tutorial-pointer' + (isHeartBox ? ' heart-box-popup' : ''),
        offset: isHeartBox ? L.point(0, -15) : L.point(0, 0) 
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
        const hb = document.getElementById('hearts-list-box');
        if (hb) hb.style.display = 'none';
    }
}
