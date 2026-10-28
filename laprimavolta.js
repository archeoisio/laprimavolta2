let map; 
let highlightLayer;

// Iniezione di stili CSS per la barra laterale a scomparsa (destra)
const customStyleTag = document.createElement('style');
customStyleTag.innerHTML = `
    .leaflet-control-layers-toggle {
        width: 44px !important;
        height: 44px !important;
    }
    
    /* Stile della barra laterale a scomparsa da destra */
    #custom-sidebar-layers {
        position: fixed;
        top: 0;
        right: -320px; /* Nascosta fuori dallo schermo */
        width: 300px;
        height: 100vh;
        background: rgba(255, 255, 255, 0.97);
        backdrop-filter: blur(10px);
        box-shadow: -5px 0 25px rgba(0,0,0,0.3);
        transition: right 0.3s ease-in-out;
        z-index: 2000;
        padding: 20px;
        box-sizing: border-box;
        overflow-y: auto;
        text-align: left;
        font-family: sans-serif;
        font-size: 13px;
        color: #333;
    }

    #custom-sidebar-layers.open {
        right: 0; /* Mostra la barra */
    }

    .sidebar-close-btn {
        background: none;
        border: none;
        font-size: 20px;
        cursor: pointer;
        float: right;
        color: #666;
    }

    .sidebar-close-btn:hover {
        color: #000;
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

    // --- 3. COSTRUZIONE ELEMENTI E RACCOLTA DATI ---
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

    const puntiLayersGroup = [];
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
        puntiLayersGroup.push({ name: tavolo.toUpperCase(), color: catColor, layer: layerPuntiTavolo });
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

    const areeLayersGroup = [];
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
        areeLayersGroup.push({ name: tavolo.toUpperCase(), color: catColor, layer: layerPoligoniTavolo });
    }

    // --- 4. CREAZIONE BARRA LATERALE A SCOMPARSA (DESTRA) ---
    // Creiamo il contenitore HTML fisso nel DOM per la barra laterale
    const sidebar = document.createElement('div');
    sidebar.id = 'custom-sidebar-layers';
    document.body.appendChild(sidebar);

    function renderSidebarContent() {
        let html = `
            <div style="display:flex; justify-content:space-between; align-items:center; border-bottom:2px solid #ddd; padding-bottom:8px; margin-bottom:12px;">
                <b style="font-size:15px; color:#2c3e50;">🗂️ Gestione Layer</b>
                <button class="sidebar-close-btn">&times;</button>
            </div>
        `;

        html += '<div style="font-weight:bold; margin-bottom:6px; color:#555;">Mappe Base</div>';
        html += `<label style="display:flex; align-items:center; gap:6px; margin:6px 0; cursor:pointer;">
            <input type="radio" name="baseMapChoice" value="osm" ${map.hasLayer(layer_OpenStreetMap_4) ? 'checked' : ''}> OpenStreetMap
        </label>`;
        html += `<label style="display:flex; align-items:center; gap:6px; margin:6px 0; cursor:pointer;">
            <input type="radio" name="baseMapChoice" value="sat" ${map.hasLayer(layer_GoogleSatellite_3) ? 'checked' : ''}> Google Satellite
        </label>`;

        html += '<div style="font-weight:bold; margin:16px 0 6px 0; color:#555;">Layer Tematici</div>';

        // Ramo 1: Punti (Accordion)
        html += `
            <div style="margin-bottom:8px; border:1px solid #eee; border-radius:6px; overflow:hidden;">
                <div class="tree-header-punti" style="cursor:pointer; display:flex; justify-content:space-between; align-items:center; padding:8px 10px; background:#f8f9fa; font-weight:bold;">
                    <span>📍 Punti di interesse</span>
                    <span class="arrow-punti">►</span>
                </div>
                <div class="tree-content-punti" style="display:none; padding:8px 10px; background:#fff; border-top:1px solid #eee;">
        `;
        puntiLayersGroup.forEach((item, idx) => {
            const isChecked = map.hasLayer(item.layer);
            html += `<label style="display:flex; align-items:center; gap:6px; margin:6px 0; cursor:pointer;">
                <input type="checkbox" class="custom-layer-chk" data-type="punti" data-index="${idx}" ${isChecked ? 'checked' : ''}>
                <span style="display:inline-block; width:10px; height:10px; background-color:${item.color}; border-radius:50%; border:1px solid #333; flex-shrink:0;"></span>
                ${item.name}
            </label>`;
        });
        html += `</div></div>`;

        // Ramo 2: Aree (Accordion)
        html += `
            <div style="margin-bottom:8px; border:1px solid #eee; border-radius:6px; overflow:hidden;">
                <div class="tree-header-aree" style="cursor:pointer; display:flex; justify-content:space-between; align-items:center; padding:8px 10px; background:#f8f9fa; font-weight:bold;">
                    <span>🗺️ Aree di interesse</span>
                    <span class="arrow-aree">►</span>
                </div>
                <div class="tree-content-aree" style="display:none; padding:8px 10px; background:#fff; border-top:1px solid #eee;">
        `;
        areeLayersGroup.forEach((item, idx) => {
            const isChecked = map.hasLayer(item.layer);
            html += `<label style="display:flex; align-items:center; gap:6px; margin:6px 0; cursor:pointer;">
                <input type="checkbox" class="custom-layer-chk" data-type="aree" data-index="${idx}" ${isChecked ? 'checked' : ''}>
                <span style="display:inline-block; width:10px; height:10px; background-color:${item.color}; border:1px solid #333; flex-shrink:0;"></span>
                ${item.name}
            </label>`;
        });
        html += `</div></div>`;

        // Ramo 3: Contesto (Accordion)
        html += `
            <div style="margin-bottom:8px; border:1px solid #eee; border-radius:6px; overflow:hidden;">
                <div class="tree-header-contesto" style="cursor:pointer; display:flex; justify-content:space-between; align-items:center; padding:8px 10px; background:#f8f9fa; font-weight:bold;">
                    <span>🏛️ Contesto Urbano</span>
                    <span class="arrow-contesto">►</span>
                </div>
                <div class="tree-content-contesto" style="display:none; padding:8px 10px; background:#fff; border-top:1px solid #eee;">
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
        html += `</div></div>`;

        sidebar.innerHTML = html;

        // Evento chiusura
        sidebar.querySelector('.sidebar-close-btn').onclick = () => {
            sidebar.classList.remove('open');
        };

        // Eventi Accordion
        sidebar.querySelector('.tree-header-punti').onclick = () => {
            const content = sidebar.querySelector('.tree-content-punti');
            const arrow = sidebar.querySelector('.arrow-punti');
            const isHidden = content.style.display === 'none';
            content.style.display = isHidden ? 'block' : 'none';
            arrow.innerHTML = isHidden ? '▼' : '►';
        };

        sidebar.querySelector('.tree-header-aree').onclick = () => {
            const content = sidebar.querySelector('.tree-content-aree');
            const arrow = sidebar.querySelector('.arrow-aree');
            const isHidden = content.style.display === 'none';
            content.style.display = isHidden ? 'block' : 'none';
            arrow.innerHTML = isHidden ? '▼' : '►';
        };

        sidebar.querySelector('.tree-header-contesto').onclick = () => {
            const content = sidebar.querySelector('.tree-content-contesto');
            const arrow = sidebar.querySelector('.arrow-contesto');
            const isHidden = content.style.display === 'none';
            content.style.display = isHidden ? 'block' : 'none';
            arrow.innerHTML = isHidden ? '▼' : '►';
        };

        // Eventi modifica layer
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

        sidebar.querySelectorAll('.custom-layer-chk').forEach(chk => {
            chk.onchange = (e) => {
                const type = e.target.getAttribute('data-type');
                const index = parseInt(e.target.getAttribute('data-index'));
                const targetLayer = (type === 'punti') ? puntiLayersGroup[index].layer : areeLayersGroup[index].layer;
                if (e.target.checked) {
                    map.addLayer(targetLayer);
                } else {
                    map.removeLayer(targetLayer);
                }
            };
        });

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

    // --- 6. PULSANTI IN ALTO A DESTRA (Incluso il pulsante Layer) ---
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

        // 0. Pulsante Gestione Layer (apre la barra laterale)
        createBtn('🗂️', "Gestione Layer", () => {
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
        id: ".btn-tutorial-layers", 
        titolo: "Gestione Layer", 
        testo: "Clicca qui per aprire la barra laterale e scegliere mappe base, punti, aree e contesto.",
        action: "openSidebar" 
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
    const isHeartBox = step.id === "#hearts-list-box";

    if (step.action === "openHearts") {
        const hb = document.getElementById('hearts-list-box');
        if (hb) hb.style.display = 'block';
    }
    if (step.action === "openSidebar") {
        const sb = document.getElementById('custom-sidebar-layers');
        if (sb) {
            renderSidebarContent(); // Rigenera al volo se necessario
            sb.classList.add('open');
        }
    }

    const target = document.querySelector(step.id);
    const isLast = currentStep === tutorialSteps.length - 1;

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
        const sb = document.getElementById('custom-sidebar-layers');
        if (sb) sb.classList.remove('open');
    }
}
