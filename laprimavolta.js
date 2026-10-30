let map; 
let highlightLayer;
let selectedLayer = null;
let allTavoloLayers = [];
let layer_iconaquartieri_0;
let currentActiveTab = null;

const MIN_ZOOM_VISIBLE = 13;

const customStyleTag = document.createElement('style');
customStyleTag.innerHTML = `
    * {
        touch-action: manipulation;
    }

    .leaflet-control-layers-toggle { width: 44px !important; height: 44px !important; }
    #custom-bottom-panel {
        position: fixed;
        bottom: 0;
        left: 10px;
        transform: none;
        width: max-content;
        min-width: 220px;
        padding: 8px 12px;
        display: flex;
        flex-direction: column;
        z-index: 2000;
        background: rgba(255, 255, 255, 0.98);
        backdrop-filter: blur(10px);
        box-shadow: 0 -5px 25px rgba(0,0,0,0.3);
        border-top-left-radius: 14px;
        border-top-right-radius: 14px;
        border: 1px solid rgba(0,0,0,0.1);
        box-sizing: border-box;
    }
  @media (min-width: 768px) {
        #custom-bottom-panel {
            position: fixed;
            bottom: 0;
            left: 10px;
            transform: none;
            width: max-content;
            min-width: 220px;
            padding: 8px 12px;
            display: flex;
            flex-direction: column;
            z-index: 2000;
            background: rgba(255, 255, 255, 0.98);
            backdrop-filter: blur(10px);
            box-shadow: 0 -5px 25px rgba(0,0,0,0.3);
            border-top-left-radius: 14px;
            border-top-right-radius: 14px;
            border: 1px solid rgba(0,0,0,0.1);
            box-sizing: border-box;
            transition: width 0.25s ease-in-out;
        }
        
        #custom-bottom-panel.open {
            width: 1000px !important;
        }

        #custom-bottom-panel .panel-three-columns {
            grid-template-columns: 180px 120px 1fr !important;
            overflow-y: auto;
            display: grid !important;
            width: 100%;
            box-sizing: border-box;
        }

        #feature-detail-panel {
            position: fixed; bottom: 0; left: 1025px; width: 320px;
            height: 220px;
            border-top-left-radius: 14px; border-top-right-radius: 14px; overflow-y: auto;
            background: rgba(255, 255, 255, 0.98); backdrop-filter: blur(10px);
            box-shadow: 0 -5px 25px rgba(0,0,0,0.3); z-index: 2100;
            padding: 8px 12px; box-sizing: border-box; font-family: sans-serif;
            font-size: 13px; color: #333; display: none; flex-direction: column;
            border: 1px solid rgba(0,0,0,0.1);
        }

        .col-left .base-map-vertical {
            display: grid !important;
            grid-template-columns: 1fr 1fr;
            gap: 4px;
        }
        .col-left .desktop-grid-altro {
            display: grid !important;
            grid-template-columns: 1fr 1fr;
            gap: 4px;
        }
    }
  /* Pannello Dettaglio Feature - MOBILE (altezza fissa 310px, pari al Centro di Controllo) */
    @media (max-width: 767px) {
        #feature-detail-panel {
            position: fixed; bottom: 0; left: 50%; transform: translateX(-50%);
            width: 98%; max-width: 1000px; height: 230px !important;
            background: rgba(255, 255, 255, 0.99); backdrop-filter: blur(10px);
            box-shadow: 0 -5px 25px rgba(0,0,0,0.4); z-index: 2100;
            padding: 10px 14px; box-sizing: border-box; font-family: sans-serif;
            font-size: 12px; color: #333; display: none; flex-direction: column;
            border-top-left-radius: 14px; border-top-right-radius: 14px;
            border: 1px solid rgba(0,0,0,0.1);
            overflow-y: auto;
        }
    }

    #custom-bottom-panel:not(.open) .panel-three-columns { display: none !important; }
    #custom-bottom-panel:not(.open) { max-height: 44px !important; height: 44px !important; }
    
    .panel-main-header { flex-shrink: 0; display: flex; justify-content: space-between; align-items: center; padding-bottom: 4px; border-bottom: 1px solid #e1e1e1; margin-bottom: 6px; cursor: pointer; user-select: none; width: 100%; }
    #custom-bottom-panel:not(.open) .panel-main-header { border-bottom: none; margin-bottom: 0; padding-bottom: 0; }

    .panel-three-columns { display: grid; grid-template-columns: 90px 120px 1fr; gap: 8px; flex-grow: 1; overflow: hidden; height: calc(100% - 30px); }
    
    .col-left { display: flex; flex-direction: column; gap: 6px; border-right: 1px solid #e1e1e1; padding-right: 6px; overflow: hidden; }
    .col-left .base-map-vertical { display: flex; flex-direction: column; gap: 3px; flex-shrink: 0; }
    .col-left-scrollable { display: flex; flex-direction: column; gap: 2px; overflow-y: auto; flex-grow: 1; border-top: 1px solid #e1e1e1; padding-top: 4px; }
    
    .col-middle { display: flex; flex-direction: column; gap: 4px; border-right: 1px solid #e1e1e1; padding-right: 6px; overflow-y: auto; }
    .sidebar-tabs-vertical { display: flex; flex-direction: column; gap: 4px; }
    
    .col-right { display: flex; flex-direction: column; overflow: hidden; }
    
    .sub-section-title { font-weight: bold; color: #555; margin-bottom: 3px; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px; }
    .sidebar-tab-btn { background: #f1f2f6; border: 1px solid #dcdde1; border-radius: 4px; padding: 6px 8px; font-size: 13px; cursor: pointer; font-weight: bold; color: #57606f; text-align: left; transition: all 0.2s ease; touch-action: manipulation; }
    .sidebar-tab-content { display: none; flex-direction: column; flex-grow: 1; overflow: hidden; }
    .sidebar-tab-content.active { display: flex; }
    .cluster-counter-fixed { flex-shrink: 0; font-size: 12px; color: #666; margin-bottom: 4px; }
    
    .panel-scrollable-grid { flex-grow: 1; overflow-x: auto; overflow-y: hidden; display: flex; gap: 8px; padding-bottom: 4px; align-items: flex-start; }
    .feature-vertical-column { display: flex; flex-direction: column; gap: 4px; min-width: 100px; flex-shrink: 0; }
    
    .quartiere-label { background: rgba(255, 255, 255, 0.9); border: 1px solid #000; padding: 2px 6px; border-radius: 4px; font-weight: bold; font-size: 11px; color: #000; box-shadow: 0 2px 4px rgba(0,0,0,0.2); white-space: nowrap; }

    .feature-detail-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        border-bottom: 2px solid #3498db;
        padding-bottom: 6px;
        margin-bottom: 4px;
    }

    .close-feature-btn {
        background: #e74c3c;
        color: white;
        border: none;
        border-radius: 50%;
        width: 22px;
        height: 22px;
        font-weight: bold;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 11px;
    }

    .detail-table {
        width: 100%;
        border-collapse: collapse;
        margin-top: 2px;
    }

    .detail-table tr {
        border-bottom: 1px solid #e1e1e1;
    }

    .detail-table tr:last-child {
        border-bottom: none;
    }

    .detail-table th, .detail-table td {
        padding: 5px 4px;
        text-align: left;
        vertical-align: top;
    }

    .detail-table th {
        width: 30%;
        color: #555;
        font-weight: 600;
        background-color: #f8f9fa;
        border-right: 1px solid #e1e1e1;
    }

    .detail-table td {
        width: 70%;
        color: #2c3e50;
    }
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

function checkZoomVisibility() {
    if (!map) return;
    const currentZoom = map.getZoom();
    
    if (currentZoom >= MIN_ZOOM_VISIBLE) {
        if (layer_iconaquartieri_0 && !map.hasLayer(layer_iconaquartieri_0)) {
            map.addLayer(layer_iconaquartieri_0);
        }
        allTavoloLayers.forEach(l => {
            if (!map.hasLayer(l)) map.addLayer(l);
        });
    } else {
        if (layer_iconaquartieri_0 && map.hasLayer(layer_iconaquartieri_0)) {
            map.removeLayer(layer_iconaquartieri_0);
        }
        allTavoloLayers.forEach(l => {
            if (map.hasLayer(l)) map.removeLayer(l);
        });
        map.closePopup();
        if (selectedLayer) {
            resetFeatureStyle({ target: selectedLayer });
            selectedLayer = null;
        }
    }
}

function showFeatureDetailsOnly(layer, tavoloName) {
    if (selectedLayer && selectedLayer !== layer) {
        resetFeatureStyle({ target: selectedLayer });
    }
    selectedLayer = layer;
    map.closePopup();

    highlightFeature({ target: layer });

    const props = layer.feature.properties;
    const standardKeys = ['Nome', 'Criticità', 'Proposta', 'Stato', 'Tavolo', 'Tavolo di', 'Tavolo di '];
    
    const extraFields = [];
    for (const [key, value] of Object.entries(props)) {
        if (!standardKeys.includes(key) && value !== null && value !== '') {
            extraFields.push({ key, value });
        }
    }

    const totalPages = extraFields.length > 0 ? 2 : 1;
    window.currentDetailSlide = 1;
    window.currentDetailExtraFields = extraFields;
    window.currentDetailTableData = { props, tavoloName };

    renderDetailSlide();
}

window.renderDetailSlide = function() {
    const detailPanel = document.getElementById('feature-detail-panel');
    if (!detailPanel) return;

    const { props, tavoloName } = window.currentDetailTableData;
    const totalPages = window.currentDetailExtraFields.length > 0 ? 2 : 1;
    const slide = window.currentDetailSlide;

    let contentHtml = '';

    if (slide === 1) {
        contentHtml = `
            <table class="detail-table">
                <tr><th>Nome</th><td>${props['Nome'] || 'N/D'}</td></tr>
                <tr><th>Criticità</th><td>${props['Criticità'] || 'N/D'}</td></tr>
                <tr><th>Proposta</th><td>${props['Proposta'] || 'N/D'}</td></tr>
                <tr><th>Stato</th><td>${props['Stato'] || 'N/D'}</td></tr>
                <tr><th>Tavolo</th><td>${props['Tavolo'] || tavoloName}</td></tr>
            </table>
        `;
    } else {
        contentHtml = `<table class="detail-table">`;
        window.currentDetailExtraFields.forEach(item => {
            contentHtml += `<tr><th>${item.key}</th><td>${item.value}</td></tr>`;
        });
        contentHtml += `</table>`;
    }

    let leftArrowStyle = (slide > 1) ? "cursor:pointer; opacity:1;" : "cursor:default; opacity:0.3;";
    let rightArrowStyle = (slide < totalPages) ? "cursor:pointer; opacity:1;" : "cursor:default; opacity:0.3;";
    
    let leftAction = (slide > 1) ? `onclick="window.changeDetailSlide(${slide - 1})"` : "";
    let rightAction = (slide < totalPages) ? `onclick="window.changeDetailSlide(${slide + 1})"` : "";

    let navControls = `
        <div style="display:flex; align-items:center; gap:6px; font-weight:bold;">
            <span ${leftAction} title="Pagina precedente" style="${leftArrowStyle} font-size:12px;">⬅️</span>
            <span style="font-size:11px; color:#666; font-weight:normal;">${slide}/${totalPages}</span>
            <span ${rightAction} title="Pagina successiva" style="${rightArrowStyle} font-size:12px;">➡️</span>
        </div>
    `;

    let detailHtml = `
        <div class="feature-detail-header">
            <b style="font-size:13px; color:#2c3e50;">📋 Dettaglio Elemento</b>
            ${navControls}
            <button class="close-feature-btn" onclick="closeFeaturePanel()">✕</button>
        </div>
        ${contentHtml}
    `;

    detailPanel.innerHTML = detailHtml;
    detailPanel.style.display = 'flex';
};

window.changeDetailSlide = function(targetSlide) {
    window.currentDetailSlide = targetSlide;
    renderDetailSlide();
};

document.addEventListener('DOMContentLoaded', () => {
    map = L.map('map', { 
        zoomControl: false, 
        maxZoom: 28, 
        minZoom: 1, 
        zoomSnap: 0.25, 
        zoomDelta: 0.25  
    }).fitBounds([[40.656620229112676,14.746602424093645],[40.696732601759756,14.837955878058532]]);
    
    map.attributionControl.setPrefix('<a href="https://github.com/qgis2web/qgis2web" target="_blank">qgis2web</a> &middot; <a href="https://leafletjs.com" title="A JS library for interactive maps">Leaflet</a> &middot; <a href="https://qgis.org">QGIS</a>');
    var autolinker = new Autolinker({truncate: {length: 30, location: 'smart'}});

    map.on('zoomend', checkZoomVisibility);

    function pop_iconaquartieri_0(feature, layer) {
        var nomeQuartiere = feature.properties['nome'] || '';
        if (nomeQuartiere) { layer.bindTooltip(nomeQuartiere, { permanent: true, direction: 'center', className: 'quartiere-label' }); }
    }
    map.createPane('pane_iconaquartieri_0'); map.getPane('pane_iconaquartieri_0').style.zIndex = 400;
    layer_iconaquartieri_0 = new L.geoJson(json_iconaquartieri_0, { interactive: true, pane: 'pane_iconaquartieri_0', onEachFeature: pop_iconaquartieri_0, pointToLayer: function (feature, latlng) { return L.circleMarker(latlng, { radius: 0.1, stroke: false, fill: false, opacity: 0 }); } });

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
    var layer_GoogleSatellite_3 = L.tileLayer('https://mt1.google.com/vt/lyrs=s&x={x}&y={y}&z={z}', { pane: 'pane_GoogleSatellite_3', minZoom: 1, maxZoom: 28, keepBuffer: 6 });

    map.createPane('pane_OpenStreetMap_4'); map.getPane('pane_OpenStreetMap_4').style.zIndex = 404;
    var layer_OpenStreetMap_4 = L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', { pane: 'pane_OpenStreetMap_4', minZoom: 1, maxZoom: 28, keepBuffer: 6 });
    map.addLayer(layer_OpenStreetMap_4);

    window.atlasCategories = {};
    function registerItem(feature, layer) {
        const tavolo = feature.properties['Tavolo'] || feature.properties['Tavolo di '] || feature.properties['Tavolo di'] || 'Altro';
        const name = feature.properties['Nome'] || 'Elemento';
        if (!atlasCategories[tavolo]) { atlasCategories[tavolo] = []; }
        atlasCategories[tavolo].push({ name, layer });
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
                        }
                    }, 
                    mouseover: highlightFeature,
                    click: function(e) {
                        L.DomEvent.stopPropagation(e);
                        showFeatureDetailsOnly(layer, tavolo);
                    }
                });
            },
            pointToLayer: function (feature, latlng) { 
                return L.circleMarker(latlng, { radius: 6.0, opacity: 1, color: 'rgba(35,35,35,1.0)', weight: 1, fill: true, fillOpacity: 1, fillColor: catColor }); 
            }
        });
        allTavoloLayers.push(layerPuntiTavolo);
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
                        }
                    }, 
                    mouseover: highlightFeature,
                    click: function(e) {
                        L.DomEvent.stopPropagation(e);
                        showFeatureDetailsOnly(layer, tavolo);
                    }
                });
            }
        });
        allTavoloLayers.push(layerPoligoniTavolo);
    }

    checkZoomVisibility();

    map.on('click', () => {
        if (selectedLayer) {
            resetFeatureStyle({ target: selectedLayer });
            selectedLayer = null;
        }
        map.closePopup();
        const detailPanel = document.getElementById('feature-detail-panel');
        if (detailPanel) detailPanel.style.display = 'none';
    });

    const bottomPanel = document.createElement('div');
    bottomPanel.id = 'custom-bottom-panel';
    document.body.appendChild(bottomPanel);

    const featureDetailPanel = document.createElement('div');
    featureDetailPanel.id = 'feature-detail-panel';
    document.body.appendChild(featureDetailPanel);

    window.closeFeaturePanel = function() {
        featureDetailPanel.style.display = 'none';
        if (selectedLayer) {
            resetFeatureStyle({ target: selectedLayer });
            selectedLayer = null;
        }
    };

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
                        <div class="desktop-grid-altro" style="display:flex; flex-direction:column; gap:2px;">
        `;
        const contextLayers = [{ name: 'Stazioni', layer: layer_iconestazioni_2 }, { name: 'Ospedali', layer: layer_hospital_1 }, { name: 'Quartieri', layer: layer_iconaquartieri_0 }];
        contextLayers.forEach((ctx, idx) => {
            const isChecked = map.hasLayer(ctx.layer);
            html += `<label style="display:flex; align-items:center; gap:4px; margin:2px 0; cursor:pointer;"><input type="checkbox" class="custom-context-chk" data-index="${idx}" ${isChecked ? 'checked' : ''}> ${ctx.name}</label>`;
        });
        html += `</div></div></div>`;

        // COLONNA 2: CLUSTER TEMATICI
        html += `
            <div class="col-middle">
                <div class="sub-section-title">Tematiche</div>
                <div class="sidebar-tabs-vertical">
        `;

        const tavoloKeys = Object.keys(atlasCategories);
        if (!currentActiveTab || !atlasCategories[currentActiveTab]) {
            currentActiveTab = tavoloKeys[0];
        }

        tavoloKeys.forEach(tavolo => {
            const cleanKey = tavolo.replace(/\s+/g, '');
            const catColor = getTavoloColor(tavolo);
            const isActive = (tavolo === currentActiveTab);
            const activeStyle = isActive ? `background:${catColor}; color:${['#f1c40f', '#2ecc71'].includes(catColor) ? '#333' : 'white'}; border-color:${catColor};` : '';
            
            html += `<button class="sidebar-tab-btn ${isActive ? 'active' : ''}" data-tab="tab-${cleanKey}" data-tavolo-name="${tavolo}" data-color="${catColor}" style="${activeStyle}">${tavolo.toUpperCase()}</button>`;
        });
        html += `</div></div>`;

        // COLONNA 3: ELENCO PROPOSTE (5 ELEMENTI FISSI PER COLONNA)
        html += `<div class="col-right">`;
        tavoloKeys.forEach(tavolo => {
            const cleanKey = tavolo.replace(/\s+/g, '');
            const items = atlasCategories[tavolo];
            const isActive = (tavolo === currentActiveTab);
            
            const itemsPerColumn = 5;
            const columns = [];
            for (let i = 0; i < items.length; i += itemsPerColumn) {
                columns.push(items.slice(i, i + itemsPerColumn));
            }

            html += `
                <div id="tab-${cleanKey}" class="sidebar-tab-content ${isActive ? 'active' : ''}">
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
        });
        html += `</div></div>`; bottomPanel.innerHTML = html;

        const tabBtns = bottomPanel.querySelectorAll('.sidebar-tab-btn');
        const tabContents = bottomPanel.querySelectorAll('.sidebar-tab-content');
        tabBtns.forEach(btn => {
            btn.onclick = () => {
                tabBtns.forEach(b => { b.classList.remove('active'); b.style.background = '#f1f2f6'; b.style.color = '#57606f'; b.style.borderColor = '#dcdde1'; });
                tabContents.forEach(c => c.classList.remove('active'));
                btn.classList.add('active');
                
                currentActiveTab = btn.getAttribute('data-tavolo-name');

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

                let latlng;
                const geom = targetItem.layer.feature.geometry;
                if (geom.type === 'Point') {
                    latlng = [geom.coordinates[1], geom.coordinates[0]];
                } else {
                    const c = targetItem.layer.getBounds().getCenter();
                    latlng = [c.lat, c.lng];
                }

                if (latlng) {
                    map.setView(latlng, 17.5, { animate: false });
                    map.panBy([0, 120], { animate: false });

                    highlightFeature({ target: targetItem.layer });
                    showFeatureDetailsOnly(targetItem.layer, tavolo);
                }
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

function closeModal() {
    const modal = document.getElementById('welcome-modal');
    if (modal) modal.style.display = 'none';
}
function startTutorial() { closeModal(); }
function nextTutorialStep() {}

window.closeModal = closeModal;
window.startTutorial = startTutorial;
window.nextTutorialStep = nextTutorialStep;
