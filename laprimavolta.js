let map; 
let highlightLayer;

// Iniezione di stili CSS per il pannello inferiore a due colonne + stili tutorial
const customStyleTag = document.createElement('style');
customStyleTag.innerHTML = `
    .leaflet-control-layers-toggle {
        width: 44px !important;
        height: 44px !important;
    }
    
    /* Pannello inferiore a scomparsa (Bottom Sheet) */
    #custom-bottom-panel {
        position: fixed;
        bottom: -380px; /* Nascosto sotto lo schermo */
        left: 50%;
        transform: translateX(-50%);
        width: 95%;
        max-width: 950px;
        max-height: 360px;
        background: rgba(255, 255, 255, 0.98);
        backdrop-filter: blur(10px);
        box-shadow: 0 -5px 25px rgba(0,0,0,0.3);
        transition: bottom 0.3s ease-in-out;
        z-index: 2000;
        padding: 15px;
        box-sizing: border-box;
        text-align: left;
        font-family: sans-serif;
        font-size: 12px;
        color: #333;
        border-top-left-radius: 14px;
        border-top-right-radius: 14px;
        border: 1px solid rgba(0,0,0,0.1);
        display: flex;
        flex-direction: column;
    }

    #custom-bottom-panel.open {
        bottom: 0; /* Sale dal basso */
    }

    .panel-close-btn {
        background: none;
        border: none;
        font-size: 16px;
        cursor: pointer;
        float: right;
        color: #666;
    }

    .panel-close-btn:hover {
        color: #000;
    }

    /* Intestazione fissa in alto con titolo e chiusura */
    .panel-main-header {
        flex-shrink: 0;
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding-bottom: 8px;
        border-bottom: 1px solid #e1e1e1;
        margin-bottom: 10px;
    }

    /* Layout principale a 2 Colonne */
    .panel-two-columns {
        display: grid;
        grid-template-columns: 280px 1fr;
        gap: 15px;
        flex-grow: 1;
        overflow: hidden;
    }

    @media (max-width: 768px) {
        .panel-two-columns {
            grid-template-columns: 1fr;
            overflow-y: auto;
        }
    }

    /* Colonna di sinistra (Mappa Base + Altri Layer) */
    .left-column {
        display: flex;
        flex-direction: column;
        gap: 10px;
        border-right: 1px solid #e1e1e1;
        padding-right: 12px;
    }

    .sub-section-title {
        font-weight: bold;
        color: #555;
        margin-bottom: 4px;
        font-size: 11px;
        text-transform: uppercase;
        letter-spacing: 0.5px;
    }

    /* Colonna di destra (Cluster Tematici) */
    .right-column {
        display: flex;
        flex-direction: column;
        overflow: hidden;
    }

    /* Stile per le schede (Tabs) dei cluster tematici (Fisse) */
    .sidebar-tabs {
        display: flex;
        flex-wrap: wrap;
        gap: 6px;
        margin-bottom: 6px;
        flex-shrink: 0;
    }

    .sidebar-tab-btn {
        background: #f1f2f6;
        border: 1px solid #dcdde1;
        border-radius: 4px;
        padding: 4px 8px;
        font-size: 11px;
        cursor: pointer;
        font-weight: bold;
        color: #57606f;
        display: flex;
        align-items: center;
        gap: 4px;
        transition: all 0.2s ease;
    }

    /* Contenitore della scheda attiva */
    .sidebar-tab-content {
        display: none;
        flex-direction: column;
        flex-grow: 1;
        overflow: hidden;
    }

    .sidebar-tab-content.active {
        display: flex;
    }

    /* Conteggio proposte fisso (fuori dallo scroll) */
    .cluster-counter-fixed {
        flex-shrink: 0;
        font-size: 11px;
        color: #666;
        margin-bottom: 6px;
    }

    /* Area SCORREVOLE interna limitata ESCLUSIVAMENTE alla griglia a 3 colonne */
    .panel-scrollable-grid {
        flex-grow: 1;
        overflow-y: auto;
        padding-right: 4px;
    }

    /* Layout a 3 Colonne per le feature */
    .features-grid-3col {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 8px;
    }

    @media (max-width: 900px) {
        .features-grid-3col {
            grid-template-columns: repeat(2, 1fr);
        }
    }

    /* Stile etichette quartieri */
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

    map.createPane('pane_GoogleSatellite_3');
    map.getPane('pane_GoogleSatellite_3').style.zIndex = 403;
    var layer_GoogleSatellite_3 = L.tileLayer('https://mt1.google.com/vt/lyrs=s&x={x}&y={y}&z={z}', { pane: 'pane_GoogleSatellite_3', minZoom: 1, maxZoom: 28 });

    map.createPane('pane_OpenStreetMap_4');
    map.getPane('pane_OpenStreetMap_4').style.zIndex = 404;
    var layer_OpenStreetMap_4 = L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', { pane: 'pane_OpenStreetMap_4', minZoom: 1, maxZoom: 28 });
    map.addLayer(layer_OpenStreetMap_4);

    // --- 3. COSTRUZIONE ELEMENTI E RACCOLTA DATI PER I TAVOLI ---
    window.atlasCategories = {};

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

    const puntiPerTavolo = {};
    json_puntiprimavolta_5.features.forEach(f => {
        const t = f.properties['Tavolo'] || f.properties['Tavolo di '] || f.properties['Tavolo di'] || 'Altro';
        if (!puntiPerTavolo[t]) puntiPerTavolo[t] = [];
        puntiPerTavolo[t].push(f);
    });

    map.createPane('pane_puntiprimavolta_5');
    map.getPane('pane_puntiprimavolta_5').style.zIndex = 405;

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
    }

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
    }

    // --- 4. CREAZIONE PANNELLO INFERIORE A 2 COLONNE ---
    const bottomPanel = document.createElement('div');
    bottomPanel.id = 'custom-bottom-panel';
    document.body.appendChild(bottomPanel);

    window.renderPanelContent = function() {
        let html = `
            <!-- Intestazione principale fissa -->
            <div class="panel-main-header">
                <b style="font-size:13px; color:#2c3e50;">🗂️ Centro di Controllo</b>
                <button class="panel-close-btn">&times;</button>
            </div>

            <!-- Layout a 2 Colonne -->
            <div class="panel-two-columns">
                
                <!-- COLONNA DI SINISTRA: Mappa Base + Altri Layer -->
                <div class="left-column">
                    <div>
                        <div class="sub-section-title">Mappa Base</div>
                        <div style="display:flex; gap:12px;">
                            <label style="display:flex; align-items:center; gap:5px; cursor:pointer;">
                                <input type="radio" name="baseMapChoice" value="osm" ${map.hasLayer(layer_OpenStreetMap_4) ? 'checked' : ''}> OSM
                            </label>
                            <label style="display:flex; align-items:center; gap:5px; cursor:pointer;">
                                <input type="radio" name="baseMapChoice" value="sat" ${map.hasLayer(layer_GoogleSatellite_3) ? 'checked' : ''}> Satellite
                            </label>
                        </div>
                    </div>

                    <div style="border-top:1px solid #e1e1e1; padding-top:8px;">
                        <div class="sub-section-title">Altri Layer</div>
        `;

        const contextLayers = [
            { name: 'Stazioni', layer: layer_iconestazioni_2 },
            { name: 'Ospedali', layer: layer_hospital_1 },
            { name: 'Quartieri', layer: layer_iconaquartieri_0 }
        ];

        contextLayers.forEach((ctx, idx) => {
            const isChecked = map.hasLayer(ctx.layer);
            html += `<label style="display:flex; align-items:center; gap:6px; margin:4px 0; cursor:pointer;">
                <input type="checkbox" class="custom-context-chk" data-index="${idx}" ${isChecked ? 'checked' : ''}>
                ${ctx.name}
            </label>`;
        });

        html += `</div></div>`; // Chiusura left-column

        // COLONNA DI DESTRA: Cluster Tematici
        html += `
            <div class="right-column">
                <div class="sub-section-title">Cluster Tematici</div>
                <div class="sidebar-tabs">
        `;

        let firstTab = true;
        for (const tavolo of Object.keys(atlasCategories)) {
            const cleanKey = tavolo.replace(/\s+/g, '');
            const catColor = getTavoloColor(tavolo);
            const activeStyle = firstTab ? `background:${catColor}; color:${['#f1c40f', '#2ecc71'].includes(catColor) ? '#333' : 'white'}; border-color:${catColor};` : '';
            
            html += `
                <button class="sidebar-tab-btn ${firstTab ? 'active' : ''}" 
                        data-tab="tab-${cleanKey}" 
                        data-color="${catColor}"
                        style="${activeStyle}">
                    ${tavolo.toUpperCase()}
                </button>
            `;
            firstTab = false;
        }
        html += `</div>`; // Chiusura sidebar-tabs

        // Contenuti delle schede
        firstTab = true;
        for (const [tavolo, items] of Object.entries(atlasCategories)) {
            const cleanKey = tavolo.replace(/\s+/g, '');
            const catColor = getTavoloColor(tavolo);
            html += `
                <div id="tab-${cleanKey}" class="sidebar-tab-content ${firstTab ? 'active' : ''}">
                    <!-- Conteggio proposte FISSO -->
                    <div class="cluster-counter-fixed">Proposte registrate: <b>${items.length}</b></div>
                    
                    <!-- Area SCORREVOLE -->
                    <div class="panel-scrollable-grid">
                        <div class="features-grid-3col">
            `;

            items.forEach((item, itemIdx) => {
                html += `
                    <div style="display:flex; justify-content:space-between; align-items:center; padding:5px 7px; background:#f8f9fa; border:1px solid #e9ecef; border-radius:5px;">
                        <span style="font-size:11px; color:#333; flex-grow:1; margin-right:4px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;" title="${item.name}">${item.name}</span>
                        <button class="vola-btn" data-tavolo="${tavolo}" data-index="${itemIdx}" style="font-weight:bold; font-size:9px; padding:2px 5px; cursor:pointer; background:${catColor}; color:${['#f1c40f', '#2ecc71'].includes(catColor) ? '#333' : 'white'}; border:none; border-radius:3px; flex-shrink:0;">VOLA</button>
                    </div>
                `;
            });

            html += `</div></div></div>`; // Chiusura features-grid-3col, panel-scrollable-grid, sidebar-tab-content
            firstTab = false;
        }

        html += `</div></div>`; // Chiusura right-column, panel-two-columns
        bottomPanel.innerHTML = html;

        // Chiusura pannello
        bottomPanel.querySelector('.panel-close-btn').onclick = () => {
            bottomPanel.classList.remove('open');
        };

        // Logica di interazione tra le schede (Tabs)
        const tabBtns = bottomPanel.querySelectorAll('.sidebar-tab-btn');
        const tabContents = bottomPanel.querySelectorAll('.sidebar-tab-content');

        tabBtns.forEach(btn => {
            btn.onclick = () => {
                tabBtns.forEach(b => {
                    b.classList.remove('active');
                    b.style.background = '#f1f2f6';
                    b.style.color = '#57606f';
                    b.style.borderColor = '#dcdde1';
                });

                tabContents.forEach(c => c.classList.remove('active'));

                btn.classList.add('active');
                const catColor = btn.getAttribute('data-color');
                const textColor = ['#f1c40f', '#2ecc71'].includes(catColor) ? '#333' : 'white';
                
                btn.style.background = catColor;
                btn.style.color = textColor;
                btn.style.borderColor = catColor;

                const targetTabId = btn.getAttribute('data-tab');
                bottomPanel.querySelector(`#${targetTabId}`).classList.add('active');
            };
        });

        // Eventi pulsanti VOLA
        bottomPanel.querySelectorAll('.vola-btn').forEach(btn => {
            btn.onclick = (e) => {
                const tavolo = e.target.getAttribute('data-tavolo');
                const idx = parseInt(e.target.getAttribute('data-index'));
                const targetItem = atlasCategories[tavolo][idx];
                map.flyTo(targetItem.latlng, 16, { animate: true, duration: 3 });
                targetItem.layer.openPopup();
            };
        });

        // Eventi Mappe Base
        bottomPanel.querySelectorAll('input[name="baseMapChoice"]').forEach(radio => {
            radio.onchange = (e) => {
                if (e.target.value === 'osm') {
                    map.addLayer(layer_OpenStreetMap_4);
                    map.removeLayer(layer_GoogleSatellite_3);
                } else {
                    map.addLayer(layer_GoogleSatellite_3);
                    map.removeLayer(layer_OpenStreetMap_4);
                }
            };
        });

        // Eventi Altri Layer
        bottomPanel.querySelectorAll('.custom-context-chk').forEach(chk => {
            chk.onchange = (e) => {
                const index = parseInt(e.target.getAttribute('data-index'));
                const targetLayer = [layer_iconestazioni_2, layer_hospital_1, layer_iconaquartieri_0][index];
                if (e.target.checked) {
                    map.addLayer(targetLayer);
                } else {
                    map.removeLayer(targetLayer);
                }
            };
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

    // --- 6. PULSANTI IN ALTO A DESTRA CON CLASSI PER IL TUTORIAL ---
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

        // 0. Pulsante Centro di Controllo (con classe btn-tutorial-layers)
        createBtn('🗂️', "Centro di Controllo", () => {
            renderPanelContent();
            bottomPanel.classList.toggle('open');
        }, 'btn-tutorial-layers');

        // 1. Home (con classe btn-tutorial-home)
        createBtn('🌍', "Torna alla vista iniziale", () => {
            map.fitBounds([[40.656620229112676,14.746602424093645],[40.696732601759756,14.837955878058532]]);
        }, 'btn-tutorial-home');

        // 2. Geolocalizzazione (con classe btn-tutorial-locate)
        createBtn('📍', "Posizione", () => {
            map.locate({setView: true, maxZoom: 16});
        }, 'btn-tutorial-locate');

        return container;
    };
    btnControl.addTo(map);
});

// ==========================================
// --- SEZIONE TUTORIAL (GESTIONE COMPLETA) ---
// ==========================================

const tutorialSteps = [
    { 
        id: ".btn-tutorial-layers", 
        titolo: "Centro di Controllo", 
        testo: "Clicca qui per gestire le mappe base, i layer di contesto e accedere ai cluster tematici." 
    },
    { 
        id: ".btn-tutorial-home", 
        titolo: "Tasto Home", 
        testo: "Resetta la mappa alla vista panoramica iniziale di Salerno." 
    },
    { 
        id: ".btn-tutorial-locate", 
        titolo: "Geolocalizzazione", 
        testo: "Trova la tua posizione attuale sulla mappa. Necessario attivare il GPS su telefono/PC." 
    },
    { 
        id: "#custom-bottom-panel", 
        titolo: "Cluster e Proposte", 
        testo: "Apri il pannello per esplorare le proposte divise per tavoli e volare direttamente sui punti d'interesse.",
        action: "openPanel"
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
    
    if (typeof map === 'undefined') {
        console.error("Mappa non trovata! Assicurati che 'map' sia inizializzata.");
        return;
    }

    // BLOCCA INTERAZIONI MAPPA
    try {
        map.dragging.disable();
        map.touchZoom.disable();
        map.doubleClickZoom.disable();
        map.scrollWheelZoom.disable();
        if (map.tap) map.tap.disable();
    } catch (e) { 
        console.warn("Alcuni controlli non possono essere disabilitati", e); 
    }
    
    setTimeout(showStep, 50);
}

function showStep() {
    const step = tutorialSteps[currentStep];
    const target = document.querySelector(step.id);
    const isLast = currentStep === tutorialSteps.length - 1;
    const isPanel = step.id === "#custom-bottom-panel";

    if (step.action === "openPanel") {
        if (typeof renderPanelContent === 'function') renderPanelContent();
        const bp = document.getElementById('custom-bottom-panel');
        if (bp) bp.classList.add('open');
    }

    let popupPoint;
    if (target) {
        const rect = target.getBoundingClientRect();
        if (isPanel) {
            popupPoint = map.containerPointToLayerPoint([rect.left + rect.width / 2, rect.top - 20]);
        } else {
            popupPoint = map.containerPointToLayerPoint([rect.left - 110, rect.top + 20]);
        }
    } else {
        popupPoint = map.containerPointToLayerPoint([window.innerWidth / 2, window.innerHeight / 3]);
    }

    const popupLatLng = map.layerPointToLatLng(popupPoint);

    L.popup({ 
        closeButton: false, 
        closeOnClick: false,
        autoPan: false,
        className: 'tutorial-pointer' + (isPanel ? ' panel-tutorial-popup' : ''),
        offset: isPanel ? L.point(0, -15) : L.point(-10, 0) 
    })
    .setLatLng(popupLatLng)
    .setContent(`
    <div style="width: 190px; font-family: sans-serif; display: flex; flex-direction: column; gap: 5px;">
        <div style="display: flex; justify-content: space-between; align-items: center; width: 100%;">
            <b style="color:#3498db; font-size: 12px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; flex-grow: 1;">
                ${step.titolo}
            </b>
            <button onclick="nextTutorialStep()" style="background:#3498db; color:white; border:none; padding:4px 8px; border-radius:4px; cursor:pointer; font-size: 10px; font-weight: bold; flex-shrink: 0; margin-left: 6px;">
                ${isLast ? 'INIZIA' : 'AVANTI'}
            </button>
        </div>
        <div style="font-size: 11px; line-height: 1.3; border-top: 1px solid #eee; padding-top: 5px; color: #333;">
            ${step.testo}
        </div>
    </div>
    `)
    .openOn(map);
}

function nextTutorialStep() {
    currentStep++;
    
    if (currentStep < tutorialSteps.length) {
        showStep();
    } else {
        // SBLOCCA LA MAPPA
        if (typeof map !== 'undefined') {
            map.dragging.enable();
            map.touchZoom.enable();
            map.doubleClickZoom.enable();
            map.scrollWheelZoom.enable();
            if (map.tap) map.tap.enable();
            
            // Chiudi popup tutorial e pannello
            map.eachLayer(l => { if (l instanceof L.Popup) map.removeLayer(l); });
        }
        const bp = document.getElementById('custom-bottom-panel');
        if (bp) bp.classList.remove('open');
    }
}

// Esposizione funzioni globali per richiamo da HTML
window.startTutorial = startTutorial;
window.nextTutorialStep = nextTutorialStep;
window.closeModal = closeModal;
