let map; 
let highlightLayer;

// Iniezione di stili CSS per la barra laterale a scomparsa (destra)
const customStyleTag = document.createElement('style');
customStyleTag.innerHTML = `
    .leaflet-control-layers-toggle {
        width: 44px !important;
        height: 44px !important;
    }
    
    /* Barra/Pannello laterale con altezza massima a 300px e scroll interno */
    #custom-sidebar-layers {
        position: fixed;
        top: 60px; /* Posizionato subito sotto i pulsanti in alto a destra */
        right: -280px; /* Nascosto fuori dallo schermo */
        width: 260px;
        max-height: 300px; /* Altezza massima bloccata a 300px */
        overflow-y: auto; /* Attiva la barra di scorrimento verticale */
        background: rgba(255, 255, 255, 0.97);
        backdrop-filter: blur(10px);
        box-shadow: -5px 0 25px rgba(0,0,0,0.3);
        transition: right 0.3s ease-in-out;
        z-index: 2000;
        padding: 12px;
        box-sizing: border-box;
        text-align: left;
        font-family: sans-serif;
        font-size: 12px;
        color: #333;
        border-radius: 10px;
    }

    #custom-sidebar-layers.open {
        right: 0; /* Mostra la barra */
    }

    .sidebar-close-btn {
        background: none;
        border: none;
        font-size: 16px;
        cursor: pointer;
        float: right;
        color: #666;
    }

    .sidebar-close-btn:hover {
        color: #000;
    }

    /* Stile per le schede (Tabs) superiori */
    .sidebar-tabs {
        display: flex;
        flex-wrap: wrap;
        gap: 4px;
        border-bottom: 1px solid #ddd;
        padding-bottom: 8px;
        margin-bottom: 8px;
    }

    .sidebar-tab-btn {
        background: #f1f2f6;
        border: 1px solid #dcdde1;
        border-radius: 4px;
        padding: 4px 8px;
        font-size: 11px;
        cursor: pointer;
        font-weight: 600;
        color: #57606f;
        display: flex;
        align-items: center;
        gap: 4px;
        transition: all 0.2s;
    }

    .sidebar-tab-btn.active {
        background: #2f3542;
        color: white;
        border-color: #2f3542;
    }

    .sidebar-tab-content {
        display: none;
    }

    .sidebar-tab-content.active {
        display: block;
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

    // --- 4. CREAZIONE BARRA LATERALE A SCHEDE (TABS) ---
    const sidebar = document.createElement('div');
    sidebar.id = 'custom-sidebar-layers';
    document.body.appendChild(sidebar);

    function renderSidebarContent() {
        let html = `
            <div style="display:flex; justify-content:space-between; align-items:center; border-bottom:1px solid #ddd; padding-bottom:6px; margin-bottom:8px;">
                <b style="font-size:13px; color:#2c3e50;">🗂️ Centro di Controllo</b>
                <button class="sidebar-close-btn">&times;</button>
            </div>
            <div class="sidebar-tabs">
                <button class="sidebar-tab-btn active" data-tab="tab-mappe">🗺️ Mappe</button>
        `;

        // Pulsanti delle schede per ogni Tavolo
        for (const tavolo of Object.keys(atlasCategories)) {
            html += `<button class="sidebar-tab-btn" data-tab="tab-${tavolo.replace(/\s+/g, '')}">${tavolo.charAt(0).toUpperCase() + tavolo.slice(1)}</button>`;
        }
        html += `<button class="sidebar-tab-btn" data-tab="tab-contesto">🏙️ Contesto</button>`;
        html += `</div>`;

        // Contenuto Scheda Mappe Base
        html += `
            <div id="tab-mappe" class="sidebar-tab-content active">
                <div style="font-weight:bold; margin-bottom:6px; color:#555;">Scegli Mappa Base</div>
                <label style="display:flex; align-items:center; gap:6px; margin:6px 0; cursor:pointer;">
                    <input type="radio" name="baseMapChoice" value="osm" ${map.hasLayer(layer_OpenStreetMap_4) ? 'checked' : ''}> OpenStreetMap
                </label>
                <label style="display:flex; align-items:center; gap:6px; margin:6px 0; cursor:pointer;">
                    <input type="radio" name="baseMapChoice" value="sat" ${map.hasLayer(layer_GoogleSatellite_3) ? 'checked' : ''}> Google Satellite
                </label>
            </div>
        `;

        // Contenuto Schede per ciascun Tavolo Tematico
        for (const [tavolo, items] of Object.entries(atlasCategories)) {
            const cleanKey = tavolo.replace(/\s+/g, '');
            const catColor = getTavoloColor(tavolo);
            html += `
                <div id="tab-${cleanKey}" class="sidebar-tab-content">
                    <div style="font-weight:bold; margin-bottom:6px; color:#555; display:flex; align-items:center; gap:6px;">
                        <span style="display:inline-block; width:10px; height:10px; background-color:${catColor}; border:1px solid #333; flex-shrink:0;"></span>
                        Proposte: ${tavolo.toUpperCase()} (${items.length})
                    </div>
            `;

            items.forEach((item, itemIdx) => {
                html += `
                    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:6px; padding-bottom:4px; border-bottom:1px solid rgba(0,0,0,0.05);">
                        <span style="font-size:11px; color:#333; flex-grow:1; margin-right:6px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;" title="${item.name}">${item.name}</span>
                        <button class="vola-btn" data-tavolo="${tavolo}" data-index="${itemIdx}" style="font-weight:bold; font-size:9px; padding:3px 6px; cursor:pointer; background:#e74c3c; color:white; border:none; border-radius:3px; flex-shrink:0;">VOLA</button>
                    </div>
                `;
            });

            html += `</div>`;
        }

        // Contenuto Scheda Contesto Urbano
        html += `
            <div id="tab-contesto" class="sidebar-tab-content">
                <div style="font-weight:bold; margin-bottom:6px; color:#555;">Elementi di Contesto</div>
        `;
        const contextLayers = [
            { name: 'Stazioni', layer: layer_iconestazioni_2 },
            { name: 'Ospedali', layer: layer_hospital_1 },
            { name: 'Quartieri', layer: layer_iconaquartieri_0 }
        ];
        contextLayers.forEach((ctx, idx) => {
            const isChecked = map.hasLayer(ctx.layer);
            html += `<label style="display:flex; align-items:center; gap:6px; margin:6px 0; cursor:pointer;">
                <input type="checkbox" class="custom-context-chk" data-index="${idx}" ${isChecked ? 'checked' : ''}>
                ${ctx.name}
            </label>`;
        });
        html += `</div>`;

        sidebar.innerHTML = html;

        // Chiusura barra
        sidebar.querySelector('.sidebar-close-btn').onclick = () => {
            sidebar.classList.remove('open');
        };

        // Logica di interazione tra le schede (Tabs)
        const tabBtns = sidebar.querySelectorAll('.sidebar-tab-btn');
        const tabContents = sidebar.querySelectorAll('.sidebar-tab-content');

        tabBtns.forEach(btn => {
            btn.onclick = () => {
                tabBtns.forEach(b => b.classList.remove('active'));
                tabContents.forEach(c => c.classList.remove('active'));

                btn.classList.add('active');
                const targetTabId = btn.getAttribute('data-tab');
                sidebar.querySelector(`#${targetTabId}`).classList.add('active');
            };
        });

        // Eventi pulsanti VOLA
        sidebar.querySelectorAll('.vola-btn').forEach(btn => {
            btn.onclick = (e) => {
                const tavolo = e.target.getAttribute('data-tavolo');
                const idx = parseInt(e.target.getAttribute('data-index'));
                const targetItem = atlasCategories[tavolo][idx];
                map.flyTo(targetItem.latlng, 16, { animate: true, duration: 3 });
                targetItem.layer.openPopup();
            };
        });

        // Eventi Mappe Base
        sidebar.querySelectorAll('input[name="baseMapChoice"]').forEach(radio => {
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

        // Eventi Contesto
        sidebar.querySelectorAll('.custom-context-chk').forEach(chk => {
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

        // 0. Pulsante Gestione Layer / Tavoli (apre la barra a schede)
        createBtn('🗂️', "Centro di Controllo", () => {
            renderSidebarContent();
            sidebar.classList.toggle('open');
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
