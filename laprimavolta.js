let map; 
let highlightLayer;
let selectedLayer = null;

const customStyleTag = document.createElement('style');
customStyleTag.innerHTML = `
    .leaflet-control-layers-toggle { width: 44px !important; height: 44px !important; }
    #custom-bottom-panel {
        position: fixed; bottom: 0; left: 50%; transform: translateX(-50%);
        width: 98%; max-width: 1000px; max-height: 310px;
        background: rgba(255, 255, 255, 0.98); backdrop-filter: blur(10px);
        box-shadow: 0 -5px 25px rgba(0,0,0,0.3); transition: all 0.3s ease-in-out;
        z-index: 2000; padding: 8px 10px; box-sizing: border-box; text-align: left;
        font-family: sans-serif; font-size: 12px; color: #333;
        border-top-left-radius: 14px; border-top-right-radius: 14px;
        border: 1px solid rgba(0,0,0,0.1); display: flex; flex-direction: column;
    }
    #custom-bottom-panel:not(.open) .panel-three-columns { display: none !important; }
    #custom-bottom-panel:not(.open) { max-height: 44px !important; }
    
    .panel-main-header { flex-shrink: 0; display: flex; justify-content: space-between; align-items: center; padding-bottom: 4px; border-bottom: 1px solid #e1e1e1; margin-bottom: 6px; cursor: pointer; user-select: none; }
    #custom-bottom-panel:not(.open) .panel-main-header { border-bottom: none; margin-bottom: 0; padding-bottom: 0; }

    /* Layout Principale a 3 Colonne */
    .panel-three-columns { display: grid; grid-template-columns: 90px 120px 1fr; gap: 8px; flex-grow: 1; overflow: hidden; }
    
    /* Colonna 1: Sinistra (Mappa Base fissa + Altro scrollabile) */
    .col-left { display: flex; flex-direction: column; gap: 6px; border-right: 1px solid #e1e1e1; padding-right: 6px; overflow: hidden; }
    .col-left .base-map-vertical { display: flex; flex-direction: column; gap: 3px; flex-shrink: 0; }
    .col-left-scrollable { display: flex; flex-direction: column; gap: 2px; overflow-y: auto; flex-grow: 1; border-top: 1px solid #e1e1e1; padding-top: 4px; }
    
    /* Colonna 2: Centrale (Pulsanti Cluster con scorrimento proprio) */
    .col-middle { display: flex; flex-direction: column; gap: 4px; border-right: 1px solid #e1e1e1; padding-right: 6px; overflow-y: auto; }
    .sidebar-tabs-vertical { display: flex; flex-direction: column; gap: 4px; }
    
    /* Colonna 3: Destra (Contenuto Cluster Selezionato con scorrimento proprio) */
    .col-right { display: flex; flex-direction: column; overflow: hidden; }
    
    .sub-section-title { font-weight: bold; color: #555; margin-bottom: 3px; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px; }
    .sidebar-tab-btn { background: #f1f2f6; border: 1px solid #dcdde1; border-radius: 4px; padding: 4px 6px; font-size: 12px; cursor: pointer; font-weight: bold; color: #57606f; text-align: left; transition: all 0.2s ease; }
    .sidebar-tab-content { display: none; flex-direction: column; flex-grow: 1; overflow: hidden; }
    .sidebar-tab-content.active { display: flex; }
    .cluster-counter-fixed { flex-shrink: 0; font-size: 12px; color: #666; margin-bottom: 4px; }
    
    /* Contenitore con scorrimento orizzontale per le colonne verticali */
    .panel-scrollable-grid { flex-grow: 1; overflow-x: auto; overflow-y: hidden; display: flex; gap: 8px; padding-bottom: 4px; align-items: flex-start; }
    
    /* Singola colonna verticale (5 elementi fissi) */
    .feature-vertical-column { display: flex; flex-direction: column; gap: 4px; min-width: 100px; flex-shrink: 0; }
    
    .quartiere-label { background: rgba(255, 255, 255, 0.9); border: 1px solid #000; padding: 2px 6px; border-radius: 4px; font-weight: bold; font-size: 11px; color: #000; box-shadow: 0 2px 4px rgba(0,0,0,0.2); white-space: nowrap; }
`;
document.head.appendChild(customStyleTag);

const tavoloColors = { 'ambiente': '#2ecc71', 'cultura': '#e67e22', 'sociale': '#3498db', 'urbanistica': '#9b59b6', 'economia': '#f1c40f', 'mobilità': '#e74c3c', 'altro': '#1abc9c' };

function getTavoloColor(tavoloName) {
    if (!tavoloName) return '#3b71e6';
    const key = tavoloName.toLowerCase().trim();
    for (const [k, color] of Object.entries(tavoloColors)) { if (key.includes(k)) return color; }
    let hash = 0;
    for (let i = 0; i < tavoloName.length; i++) { hash = tavoloName.charCodeAt(i) + ((hash << 5) - hash); }
    const palette = ['#3b71e6', '#2ecc71', '#e74c3c', '#f39c12', '#9b59b6', '#1abc9c', '#e67e22', '#34495e'];
    return palette[Math.abs(hash) % palette.length];
}

function highlightFeature(e) {
    var layer = e.target;
    if (layer.setStyle) {
        layer.setStyle({ fillColor: '#ffff00', color: '#ff0000', fillOpacity: 0.9, weight: 2 });
    }
    if (!L.Browser.ie && !L.Browser.opera && !L.Browser.edge && layer.bringToFront) { layer.bringToFront(); }
}

function resetFeatureStyle(e) {
    var layer = e.target;
    if (!layer.feature) return;
    const prop = layer.feature.properties;
    const tavolo = prop['Tavolo'] || prop['Tavolo di '] || prop['Tavolo di'] || 'Altro';
    const catColor = getTavoloColor(tavolo);
    if (layer.feature.geometry.type === 'Point') {
        layer.setStyle({ radius: 6.0, opacity: 1, color: 'rgba(35,35,35,1.0)', weight: 1, fill: true, fillOpacity: 1, fillColor: catColor });
    } else {
        layer.setStyle({ opacity: 1, color: 'rgba(35,35,35,1.0)', weight: 1.0, fill: true, fillOpacity: 0.6, fillColor: catColor });
    }
}

document.addEventListener('DOMContentLoaded', () => {
    map = L.map('map', { zoomControl: false, maxZoom: 28, minZoom: 1 }).fitBounds([[40.656620229112676,14.746602424093645],[40.696732601759756,14.837955878058532]]);
    map.attributionControl.setPrefix('<a href="https://github.com/qgis2web/qgis2web" target="_blank">qgis2web</a> &middot; <a href="https://leafletjs.com" title="A JS library for interactive maps">Leaflet</a> &middot; <a href="https://qgis.org">QGIS</a>');
    var autolinker = new Autolinker({truncate: {length: 30, location: 'smart'}});

    function pop_iconaquartieri_0(feature, layer) {
        var nomeQuartiere = feature.properties['nome'] || '';
        if (nomeQuartiere) { layer.bindTooltip(nomeQuartiere, { permanent: true, direction: 'center', className: 'quartiere-label' }); }
    }
    map.createPane('pane_iconaquartieri_0'); map.getPane('pane_iconaquartieri_0').style.zIndex = 400;
    var layer_iconaquartieri_0 = new L.geoJson(json_iconaquartieri_0, { interactive: true, pane: 'pane_iconaquartieri_0', onEachFeature: pop_iconaquartieri_0, pointToLayer: function (feature, latlng) { return L.circleMarker(latlng, { radius: 0.1, stroke: false, fill: false, opacity: 0 }); } });
    map.addLayer(layer_iconaquartieri_0);

    function pop_hospital_1(feature, layer) {
        layer.on({ mouseout: function(e) { layer.closePopup(); }, mouseover: highlightFeature });
        var popupContent = '<table><tr><td colspan="2">' + (feature.properties['nome'] !== null ? autolinker.link(String(feature.properties['nome']).replace(/'/g, '\'').toLocaleString()) : '') + '</td></tr></table>';
        layer.bindPopup(popupContent, { maxHeight: 400 });
    }
    map.createPane('pane_hospital_1'); map.getPane('pane_hospital_1').style.zIndex = 401;
    var layer_hospital_1 = new L.geoJson(json_hospital_1, { interactive: false, pane: 'pane_hospital_1', onEachFeature: pop_hospital_1, pointToLayer: function (feature, latlng) { return L.marker(latlng, { icon: L.icon({ iconUrl: 'markers/hospital_1.svg', iconSize: [16.72, 16.72] }) }); } });
    map.addLayer(layer_hospital_1);

    function pop_iconestazioni_2(feature, layer) {
        layer.on({ mouseout: function(e) { layer.closePopup(); }, mouseover: highlightFeature });
        var popupContent = '<table><tr><td colspan="2">' + (feature.properties['nome'] !== null ? autolinker.link(String(feature.properties['nome']).replace(/'/g, '\'').toLocaleString()) : '') + '</td></tr></table>';
        layer.bindPopup(popupContent, { maxHeight: 400 });
    }
    map.createPane('pane_iconestazioni_2'); map.getPane('pane_iconestazioni_2').style.zIndex = 402;
    var layer_iconestazioni_2 = new L.geoJson(json_iconestazioni_2, { interactive: true, pane: 'pane_iconestazioni_2', onEachFeature: pop_iconestazioni_2, pointToLayer: function (feature, latlng) { return L.marker(latlng, { icon: L.icon({ iconUrl: 'markers/iconestazioni_2.svg', iconSize: [22.0, 22.0], iconAnchor: [11, 11] }) }); } });
    map.addLayer(layer_iconestazioni_2);

    map.createPane('pane_GoogleSatellite_3'); map.getPane('pane_GoogleSatellite_3').style.zIndex = 403;
    var layer_GoogleSatellite_3 = L.tileLayer('https://mt1.google.com/vt/lyrs=s&x={x}&y={y}&z={z}', { pane: 'pane_GoogleSatellite_3', minZoom: 1, maxZoom: 28 });

    map.createPane('pane_OpenStreetMap_4'); map.getPane('pane_OpenStreetMap_4').style.zIndex = 404;
    var layer_OpenStreetMap_4 = L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', { pane: 'pane_OpenStreetMap_4', minZoom: 1, maxZoom: 28 });
    map.addLayer(layer_OpenStreetMap_4);

    window.atlasCategories = {};
    function registerItem(feature, layer) {
        const tavolo = feature.properties['Tavolo'] || feature.properties['Tavolo di '] || feature.properties['Tavolo di'] || 'Altro';
        const name = feature.properties['Nome'] || 'Elemento';
        let latlng = (feature.geometry.type === 'Point') ? [feature.geometry.coordinates[1], feature.geometry.coordinates[0]] : layer.getBounds().getCenter();
        if (!atlasCategories[tavolo]) { atlasCategories[tavolo] = []; }
        atlasCategories[tavolo].push({ name, latlng, layer });
    }

    const puntiPerTavolo = {};
    json_puntiprimavolta_5.features.forEach(f => {
        const t = f.properties['Tavolo'] || f.properties['Tavolo di '] || f.properties['Tavolo di'] || 'Altro';
        if (!puntiPerTavolo[t]) puntiPerTavolo[t] = [];
        puntiPerTavolo[t].push(f);
    });

    map.createPane('pane_puntiprimavolta_5'); map.getPane('pane_puntiprimavolta_5').style.zIndex = 405;
    for (const [tavolo, features] of Object.entries(puntiPerTavolo)) {
        const catColor = getTavoloColor(tavolo);
        const layerPuntiTavolo = new L.geoJson({ type: "FeatureCollection", features: features }, {
            interactive: true, pane: 'pane_puntiprimavolta_5',
            onEachFeature: function(feature, layer) {
                registerItem(feature, layer);
                layer.on({ 
                    mouseout: function(e) { 
                        if (selectedLayer !== layer) {
                            resetFeatureStyle(e); 
                            layer.closePopup(); 
                        }
                    }, 
                    mouseover: highlightFeature,
                    click: function(e) {
                        if (selectedLayer && selectedLayer !== layer) {
                            resetFeatureStyle({ target: selectedLayer });
                        }
                        selectedLayer = layer;
                        highlightFeature(e);
                        layer.openPopup();
                    }
                });
                var popupContent = '<table><tr><th scope="row">Nome</th><td>' + (feature.properties['Nome'] !== null ? autolinker.link(String(feature.properties['Nome']).replace(/'/g, '\'').toLocaleString()) : '') + '</td></tr><tr><th scope="row">Criticità</th><td>' + (feature.properties['Criticità'] !== null ? autolinker.link(String(feature.properties['Criticità']).replace(/'/g, '\'').toLocaleString()) : '') + '</td></tr><tr><th scope="row">Proposta</th><td>' + (feature.properties['Proposta'] !== null ? autolinker.link(String(feature.properties['Proposta']).replace(/'/g, '\'').toLocaleString()) : '') + '</td></tr><tr><th scope="row">Stato</th><td>' + (feature.properties['Stato'] !== null ? autolinker.link(String(feature.properties['Stato']).replace(/'/g, '\'').toLocaleString()) : '') + '</td></tr><tr><th scope="row">Tavolo</th><td>' + (feature.properties['Tavolo'] !== null ? autolinker.link(String(feature.properties['Tavolo']).replace(/'/g, '\'').toLocaleString()) : '') + '</td></tr></table>';
                layer.bindPopup(popupContent, { maxHeight: 400 });
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

    map.createPane('pane_poligoniprimavolta_6'); map.getPane('pane_poligoniprimavolta_6').style.zIndex = 406;
    for (const [tavolo, features] of Object.entries(poligoniPerTavolo)) {
        const catColor = getTavoloColor(tavolo);
        const layerPoligoniTavolo = new L.geoJson({ type: "FeatureCollection", features: features }, {
            interactive: true, pane: 'pane_poligoniprimavolta_6',
            style: function(feature) { return { opacity: 1, color: 'rgba(35,35,35,1.0)', weight: 1.0, fill: true, fillOpacity: 0.6, fillColor: catColor }; },
            onEachFeature: function(feature, layer) {
                registerItem(feature, layer);
                layer.on({ 
                    mouseout: function(e) { 
                        if (selectedLayer !== layer) {
                            resetFeatureStyle(e); 
                            layer.closePopup(); 
                        }
                    }, 
                    mouseover: highlightFeature,
                    click: function(e) {
                        if (selectedLayer && selectedLayer !== layer) {
                            resetFeatureStyle({ target: selectedLayer });
                        }
                        selectedLayer = layer;
                        highlightFeature(e);
                        layer.openPopup();
                    }
                });
                var popupContent = '<table><tr><th scope="row">Nome</th><td>' + (feature.properties['Nome'] !== null ? autolinker.link(String(feature.properties['Nome']).replace(/'/g, '\'').toLocaleString()) : '') + '</td></tr><tr><th scope="row">Criticità</th><td>' + (feature.properties['Criticità'] !== null ? autolinker.link(String(feature.properties['Criticità']).replace(/'/g, '\'').toLocaleString()) : '') + '</td></tr><tr><th scope="row">Proposta</th><td>' + (feature.properties['Proposta'] !== null ? autolinker.link(String(feature.properties['Proposta']).replace(/'/g, '\'').toLocaleString()) : '') + '</td></tr></table>';
                layer.bindPopup(popupContent, { maxHeight: 400 });
            }
        });
        map.addLayer(layerPoligoniTavolo);
    }

    // Deseleziona quando si clicca sulla mappa vuota
    map.on('click', () => {
        if (selectedLayer) {
            resetFeatureStyle({ target: selectedLayer });
            selectedLayer = null;
        }
        map.closePopup();
    });

    const bottomPanel = document.createElement('div');
    bottomPanel.id = 'custom-bottom-panel';
    document.body.appendChild(bottomPanel);

    window.renderPanelContent = function() {
        const isOpen = bottomPanel.classList.contains('open');
        const arrowSymbol = isOpen ? '▼' : '▲';

        let html = `
            <div class="panel-main-header" onclick="document.getElementById('custom-bottom-panel').classList.toggle('open'); renderPanelContent();">
                <b style="font-size:13px; color:#2c3e50;">🗂️ Centro di Controllo</b>
                <div style="display:flex; align-items:center; gap:8px;">
                    <span style="font-size:13px; font-weight:bold; color:#3498db; padding:0 4px;">${arrowSymbol}</span>
                </div>
            </div>
            <div class="panel-three-columns">
                <!-- COLONNA 1: MAPPA BASE + ALTRO SCORRIBILE -->
                <div class="col-left">
                    <div>
                        <div class="sub-section-title">Base map</div>
                        <div class="base-map-vertical">
                            <label style="display:flex; align-items:center; gap:4px; cursor:pointer;">
                                <input type="radio" name="baseMapChoice" value="osm" ${map.hasLayer(layer_OpenStreetMap_4) ? 'checked' : ''}> OSM
                            </label>
                            <label style="display:flex; align-items:center; gap:4px; cursor:pointer;">
                                <input type="radio" name="baseMapChoice" value="Satellite" ${map.hasLayer(layer_GoogleSatellite_3) ? 'checked' : ''}> Satellite
                            </label>
                        </div>
                    </div>
                    <div class="col-left-scrollable">
                        <div class="sub-section-title">Altro</div>
        `;
        const contextLayers = [{ name: 'Stazioni', layer: layer_iconestazioni_2 }, { name: 'Ospedali', layer: layer_hospital_1 }, { name: 'Quartieri', layer: layer_iconaquartieri_0 }];
        contextLayers.forEach((ctx, idx) => {
            const isChecked = map.hasLayer(ctx.layer);
            html += `<label style="display:flex; align-items:center; gap:4px; margin:2px 0; cursor:pointer;"><input type="checkbox" class="custom-context-chk" data-index="${idx}" ${isChecked ? 'checked' : ''}> ${ctx.name}</label>`;
        });
        html += `</div></div>`;

        // COLONNA 2: CLUSTER TEMATICI
        html += `
            <div class="col-middle">
                <div class="sub-section-title">Tematiche</div>
                <div class="sidebar-tabs-vertical">
        `;
        let firstTab = true;
        for (const tavolo of Object.keys(atlasCategories)) {
            const cleanKey = tavolo.replace(/\s+/g, '');
            const catColor = getTavoloColor(tavolo);
            const activeStyle = firstTab ? `background:${catColor}; color:${['#f1c40f', '#2ecc71'].includes(catColor) ? '#333' : 'white'}; border-color:${catColor};` : '';
            html += `<button class="sidebar-tab-btn ${firstTab ? 'active' : ''}" data-tab="tab-${cleanKey}" data-color="${catColor}" style="${activeStyle}">${tavolo.toUpperCase()}</button>`;
            firstTab = false;
        }
        html += `</div></div>`;

        // COLONNA 3: ELENCO PROPOSTE (5 ELEMENTI FISSI PER COLONNA)
        html += `<div class="col-right">`;
        firstTab = true;
        for (const [tavolo, items] of Object.entries(atlasCategories)) {
            const cleanKey = tavolo.replace(/\s+/g, '');
            const catColor = getTavoloColor(tavolo);
            
            const itemsPerColumn = 5;
            const columns = [];
            for (let i = 0; i < items.length; i += itemsPerColumn) {
                columns.push(items.slice(i, i + itemsPerColumn));
            }

            html += `
                <div id="tab-${cleanKey}" class="sidebar-tab-content ${firstTab ? 'active' : ''}">
                    <div class="cluster-counter-fixed">Elementi mappati: <b>${items.length}</b></div>
                    <div class="panel-scrollable-grid">
            `;

            columns.forEach(colItems => {
                html += `<div class="feature-vertical-column">`;
                colItems.forEach((item) => {
                    const globalIdx = items.indexOf(item);
                    html += `
                        <div style="display:flex; justify-content:space-between; align-items:center; padding:2px 4px; background:#f8f9fa; border:1px solid #e9ecef; border-radius:4px;">
                            <span style="font-size:12px; color:#333; flex-grow:1; margin-right:4px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;">${item.name}</span>
                            <button class="vola-btn" data-tavolo="${tavolo}" data-index="${globalIdx}" style="font-size:11px; padding:2px 4px; cursor:pointer; background:white; border:1px solid #333; border-radius:3px; flex-shrink:0;">🔍</button>
                        </div>
                    `;
                });
                html += `</div>`;
            });

            html += `</div></div>`;
            firstTab = false;
        }
        html += `</div></div>`; bottomPanel.innerHTML = html;

        const tabBtns = bottomPanel.querySelectorAll('.sidebar-tab-btn');
        const tabContents = bottomPanel.querySelectorAll('.sidebar-tab-content');
        tabBtns.forEach(btn => {
            btn.onclick = () => {
                tabBtns.forEach(b => { b.classList.remove('active'); b.style.background = '#f1f2f6'; b.style.color = '#57606f'; b.style.borderColor = '#dcdde1'; });
                tabContents.forEach(c => c.classList.remove('active'));
                btn.classList.add('active');
                const catColor = btn.getAttribute('data-color');
                const textColor = ['#f1c40f', '#2ecc71'].includes(catColor) ? '#333' : 'white';
                btn.style.background = catColor; btn.style.color = textColor; btn.style.borderColor = catColor;
                bottomPanel.querySelector(`#${btn.getAttribute('data-tab')}`).classList.add('active');
            };
        });

     bottomPanel.querySelectorAll('.vola-btn').forEach(btn => {
            btn.onclick = (e) => {
                e.stopPropagation();
                const tavolo = e.target.getAttribute('data-tavolo');
                const idx = parseInt(e.target.getAttribute('data-index'));
                const targetItem = atlasCategories[tavolo][idx];
                
                if (!targetItem || !targetItem.layer) return;

                if (selectedLayer && selectedLayer !== targetItem.layer) {
                    resetFeatureStyle({ target: selectedLayer });
                }
                
                selectedLayer = targetItem.layer;
                map.closePopup();
                
                // Estrazione unificata e sicura delle coordinate per punti e poligoni
                let latlng;
                const geom = targetItem.layer.feature.geometry;
                
                if (geom.type === 'Point') {
                    latlng = [geom.coordinates[1], geom.coordinates[0]];
                } else {
                    const bounds = targetItem.layer.getBounds();
                    latlng = bounds.getCenter();
                }
                
                // Centratura istantanea
                map.setView(latlng, 16);
                
                highlightFeature({ target: targetItem.layer });
                targetItem.layer.openPopup();
            };
        });

        bottomPanel.querySelectorAll('input[name="baseMapChoice"]').forEach(radio => {
            radio.onchange = (e) => {
                if (e.target.value === 'osm') { map.addLayer(layer_OpenStreetMap_4); map.removeLayer(layer_GoogleSatellite_3); } 
                else { map.addLayer(layer_GoogleSatellite_3); map.removeLayer(layer_OpenStreetMap_4); }
            };
        });

        bottomPanel.querySelectorAll('.custom-context-chk').forEach(chk => {
            chk.onchange = (e) => {
                const index = parseInt(e.target.getAttribute('data-index'));
                const targetLayer = [layer_iconestazioni_2, layer_hospital_1, layer_iconaquartieri_0][index];
                if (e.target.checked) { map.addLayer(targetLayer); } else { map.removeLayer(targetLayer); }
            };
        });
    }

    renderPanelContent();

    map.on('locationfound', function(e) {
        var radius = e.accuracy / 2;
        L.marker(e.latlng).addTo(map).bindPopup("Ti trovi qui (entro " + Math.round(radius) + " metri)").openPopup();
        L.circle(e.latlng, radius).addTo(map);
    });
    map.on('locationerror', function(e) { alert("Impossibile determinare la posizione: " + e.message); });

    const btnControl = L.control({ position: 'topright' });
    btnControl.onAdd = function(map) {
        const container = L.DomUtil.create('div', 'leaflet-bar');
        container.style.marginTop = '4px'; container.style.marginRight = '10px'; container.style.display = 'flex'; container.style.flexDirection = 'column'; container.style.background = 'transparent'; container.style.border = 'none';
        L.DomEvent.disableClickPropagation(container);
        L.DomEvent.on(container, 'mousewheel', L.DomEvent.stopPropagation);
        L.DomEvent.on(container, 'touchstart', L.DomEvent.stopPropagation);
        L.DomEvent.on(container, 'pointerdown', L.DomEvent.stopPropagation);

        const createBtn = (html, title, onClick, className) => {
            const btn = L.DomUtil.create('a', className || '', container);
            btn.innerHTML = html; btn.title = title; btn.href = '#'; btn.style.width = '44px'; btn.style.height = '44px'; btn.style.lineHeight = '44px'; btn.style.textAlign = 'center'; btn.style.display = 'flex'; btn.style.alignItems = 'center'; btn.style.justifyContent = 'center'; btn.style.fontSize = '18px'; btn.style.backgroundColor = 'white'; btn.style.color = '#333'; btn.style.borderBottom = '1px solid #ccc'; btn.style.textDecoration = 'none';
            L.DomEvent.on(btn, 'click', e => { L.DomEvent.stopPropagation(e); L.DomEvent.preventDefault(e); onClick(); });
            return btn;
        };

        createBtn('🌍', "Torna alla vista iniziale", () => { map.fitBounds([[40.656620229112676,14.746602424093645],[40.696732601759756,14.837955878058532]]); }, 'btn-tutorial-home');
        createBtn('📍', "Posizione", () => { map.locate({setView: true, maxZoom: 16}); }, 'btn-tutorial-locate');
        return container;
    };
    btnControl.addTo(map);
});

// Funzioni di sicurezza
function closeModal() {
    const modal = document.getElementById('welcome-modal');
    if (modal) modal.style.display = 'none';
}
function startTutorial() { closeModal(); }
function nextTutorialStep() {}

window.closeModal = closeModal;
window.startTutorial = startTutorial;
window.nextTutorialStep = nextTutorialStep;
