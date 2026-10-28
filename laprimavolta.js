let map; 
let highlightLayer;

// Iniezione di stili CSS per il pannello inferiore a scomparsa con separatori netti
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
        max-width: 800px;
        max-height: 200px;
        background: rgba(255, 255, 255, 0.98);
        backdrop-filter: blur(10px);
        box-shadow: 0 -5px 25px rgba(0,0,0,0.3);
        transition: bottom 0.3s ease-in-out;
        z-index: 2000;
        padding: 10px;
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

    /* Area fissa in alto (Intestazione + Mappe Base + Tabs dei Cluster) */
    .panel-fixed-header {
        flex-shrink: 0;
    }

    /* Linee divisorie pulite tra le sezioni fisse */
    .panel-section {
        padding-bottom: 8px;
        margin-bottom: 8px;
        border-bottom: 1px solid #e1e1e1; /* Linea di separazione */
    }

    .panel-section:last-child {
        border-bottom: none;
        margin-bottom: 4px;
        padding-bottom: 4px;
    }

    /* Area SCORREVOLE inferiore (SOLO l'elenco delle feature) */
    .panel-scrollable-features {
        flex-grow: 1;
        overflow-y: auto; /* Solo questa parte scorre! */
        padding-top: 8px;
        padding-right: 4px;
        border-top: 1px solid #e1e1e1; /* Linea che separa le tab dall'elenco scrollabile */
    }

    /* Stile per le schede (Tabs) dei cluster tematici */
    .sidebar-tabs {
        display: flex;
        flex-wrap: wrap;
        gap: 6px;
        padding-top: 4px;
    }

    .sidebar-tab-btn {
        background: #f1f2f6;
        border: 1px solid #dcdde1;
        border-radius: 4px;
        padding: 5px 10px;
        font-size: 11px;
        cursor: pointer;
        font-weight: bold;
        color: #57606f;
        display: flex;
        align-items: center;
        gap: 4px;
        transition: all 0.2s ease;
    }

    /* Layout a 3 Colonne per le feature del cluster attivo */
    .features-grid-3col {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 10px;
    }

    @media (max-width: 600px) {
        .features-grid-3col {
            grid-template-columns: repeat(1, 1fr);
        }
    }

    .sidebar-tab-content {
        display: none;
    }

    .sidebar-tab-content.active {
        display: block;
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

// Funzioni di sicurezza globali
window.closeModal = function() {
    const modal = document.getElementById('welcome-modal');
    if (modal) modal.style.display = 'none';
};

window.nextTutorialStep = function() {
    if (typeof map !== 'undefined') {
        map.eachLayer(l => { if (l instanceof L.Popup) map.removeLayer(l); });
    }
};

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

    // --- 4. CREAZIONE PANNELLO INFERIORE A SCOMPARSA ---
    const bottomPanel = document.createElement('div');
    bottomPanel.id = 'custom-bottom-panel';
    document.body.appendChild(bottomPanel);

    function renderPanelContent() {
        let html = `
            <!-- Area FISSA in alto con sezioni separate da linee -->
            <div class="panel-fixed-header">
                
                <!-- Sezione 1: Intestazione -->
                <div class="panel-section" style="display:flex; justify-content:space-between; align-items:center;">
                    <b style="font-size:13px; color:#2c3e50;">🗂️ Centro di Controllo</b>
                    <button class="panel-close-btn">&times;</button>
                </div>

                <!-- Sezione 2: Mappe Base -->
                <div class="panel-section">
                    <div style="font-weight:bold; margin-bottom:4px; color:#555;">Mappe Base</div>
                    <div style="display:flex; gap:15px;">
                        <label style="display:flex; align-items:center; gap:6px; cursor:pointer;">
                            <input type="radio" name="baseMapChoice" value="osm" ${map.hasLayer(layer_OpenStreetMap_4) ? 'checked' : ''}> OpenStreetMap
                        </label>
                        <label style="display:flex; align-items:center; gap:6px; cursor:pointer;">
                            <input type="radio" name="baseMapChoice" value="sat" ${map.hasLayer(layer_GoogleSatellite_3) ? 'checked' : ''}> Google Satellite
                        </label>
                    </div>
                </div>

                <!-- Sezione 3: Tabs Cluster Tematici -->
                <div class="panel-section">
                    <div style="font-weight:bold; margin-bottom:4px; color:#555;">Cluster Tematici</div>
                    <div class="sidebar-tabs">
        `;

        // Imposta colore iniziale per la prima tab attiva
        let firstTab = true;
        let firstColor = '';
        for (const [tavolo] of Object.entries(atlasCategories)) {
            if (firstTab) {
                firstColor = getTavoloColor(tavolo);
                break;
            }
        }

        firstTab = true;
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
        html += `</div></div></div>`; // Chiusura panel-fixed-header

        // Area SCORREVOLE inferiore (SOLO l'elenco delle feature)
        html += `<div class="panel-scrollable-features">`;

        firstTab = true;
        for (const [tavolo, items] of Object.entries(atlasCategories)) {
            const cleanKey = tavolo.replace(/\s+/g, '');
            const catColor = getTavoloColor(tavolo);
            html += `
                <div id="tab-${cleanKey}" class="sidebar-tab-content ${firstTab ? 'active' : ''}">
                    <div style="font-size:11px; color:#666; margin-bottom:8px;">Proposte registrate: <b>${items.length}</b></div>
                    <div class="features-grid-3col">
            `;

            items.forEach((item, itemIdx) => {
                html += `
                    <div style="display:flex; justify-content:space-between; align-items:center; padding:6px 8px; background:#f8f9fa; border:1px solid #e9ecef; border-radius:6px;">
                        <span style="font-size:11px; color:#333; flex-grow:1; margin-right:6px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;" title="${item.name}">${item.name}</span>
                        <button class="vola-btn" data-tavolo="${tavolo}" data-index="${itemIdx}" style="font-weight:bold; font-size:9px; padding:3px 6px; cursor:pointer; background:${catColor}; color:${['#f1c40f', '#2ecc71'].includes(catColor) ? '#333' : 'white'}; border:none; border-radius:3px; flex-shrink:0;">VOLA</button>
                    </div>
                `;
            });

            html += `</div></div>`;
            firstTab = false;
        }

        html += `</div>`; // Chiusura panel-scrollable-features
        bottomPanel.innerHTML = html;

        // Chiusura pannello
        bottomPanel.querySelector('.panel-close-btn').onclick = () => {
            bottomPanel.classList.remove('open');
        };

        // Logica di interazione tra le schede (Tabs) con cambio colore del pulsante
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

        // 0. Pulsante Centro di Controllo (apre il pannello dal basso)
        createBtn('🗂️', "Centro di Controllo", () => {
            renderPanelContent();
            bottomPanel.classList.toggle('open');
        }, 'btn-tutorial-layers');

        // 1. Home
        createBtn('🌍', "Torna alla vista iniziale", () => {
            map.fitBounds([[40.656620229112676,14.746602424093645],[40.696732601759756,14.837955878058532]]);
        }, 'btn-tutorial-home');

        // 2. Geolocalizzazione
        createBtn('📍', "Posizione", () => {
            map.locate({setView: true, maxZoom: 16});
        }, 'btn-tutorial-locate');

        return container;
    };
    btnControl.addTo(map);
});
