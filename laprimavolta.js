let map;
let highlightLayer;
let selectedLayer = null;
let allTavoloLayers = [];
let currentActiveTab = null;

const isMobile = window.innerWidth < 768; 
const MIN_ZOOM_VISIBLE = isMobile ? 2 : 13; 

const customStyleTag = document.createElement('style');
customStyleTag.innerHTML = `
    * {
        touch-action: manipulation;
    }
    .leaflet-pane svg path,
    .leaflet-tile-pane .leaflet-layer {
        transition: none !important;
    }
    .leaflet-control-layers-toggle { width: 44px !important; height: 44px !important; }
    .leaflet-zoom-animated {
        transition: none !important;
    }
    .leaflet-pane > svg {
        transition: none !important;
    }
    .leaflet-interactive {
        transition: none !important;
    }

    /* ==================== MOBILE STYLES (ORIGINALE) ==================== */
    #custom-bottom-panel { 
        position: fixed; bottom: 0; left: 50%; transform: translateX(-50%); 
        width: 100%; max-width: 1000px; max-height: 310px; 
        background: rgba(255, 255, 255, 0.98); backdrop-filter: blur(10px); 
        box-shadow: 0 -5px 25px rgba(0,0,0,0.3); transition: all 0.3s ease-in-out; 
        z-index: 2000; padding: 4px 5px; box-sizing: border-box; text-align: left; 
        font-family: sans-serif; font-size: 12px; color: #333; 
        border-top-left-radius: 14px; border-top-right-radius: 14px; 
        border: 1px solid rgba(0,0,0,0.1); display: flex; flex-direction: column; 
    }

    .comune-label {
        background: #ffffff;
        border: 1px solid #333333;
        padding: 3px 7px;
        font-weight: bold;
        font-size: 10px;
        text-transform: uppercase;
        color: #000000;
        white-space: nowrap;
        box-shadow: 0 1px 3px rgba(0,0,0,0.3);
        text-align: center;
        display: inline-block;
        box-sizing: border-box;
        pointer-events: none;
        transform: translate(-50%, -50%); 
    }

/* ==================== DESKTOP STYLES (LATO SINISTRO A SCOMPARSA) ==================== */
    @media (min-width: 768px) {
        #custom-bottom-panel {
            position: fixed;
            top: 0;
            left: -350px; /* Nascosto a sinistra di default */
            bottom: auto;
            transform: none;
            width: 350px !important;
            height: 100vh !important;
            max-height: 100vh !important;
            padding: 15px 12px;
            display: flex;
            flex-direction: column;
            z-index: 2000;
            background: rgba(255, 255, 255, 0.98);
            backdrop-filter: blur(10px);
            box-shadow: 2px 0 15px rgba(0,0,0,0.3);
            border-top-left-radius: 0;
            border-top-right-radius: 14px;
            border-bottom-right-radius: 14px;
            border-bottom-left-radius: 0;
            border: 1px solid rgba(0,0,0,0.1);
            box-sizing: border-box;
            transition: left 0.3s ease-in-out, width 0.3s ease-in-out;
        }
        
        #custom-bottom-panel.open {
            left: 0 !important; /* Apre il pannello a sinistra */
            width: 950px !important;
            height: 100vh !important;
            max-height: 100vh !important;
        }

        /* QUANDO IL PANNELLO È CHIUSO: Linguetta visibile sul bordo sinistro dello schermo */
        #custom-bottom-panel:not(.open) {
            left: 0 !important;
            width: 46px !important;
            height: 140px !important;
            top: 50% !important;
            transform: translateY(-50%) !important;
            border-radius: 0 8px 8px 0 !important;
            padding: 0 !important;
            display: flex !important;
            align-items: center;
            justify-content: center;
            background: #ffffff;
            box-shadow: 3px 0 10px rgba(0,0,0,0.2);
            cursor: pointer;
        }

        #custom-bottom-panel:not(.open) .panel-main-header {
            writing-mode: vertical-lr;
            transform: rotate(180deg);
            height: 100%;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 0;
            margin: 0;
            border: none;
        }

        #custom-bottom-panel:not(.open) .panel-main-header b {
            display: inline-block !important;
            font-size: 12px !important;
            color: #2c3e50 !important;
            letter-spacing: 1px;
        }

        #custom-bottom-panel:not(.open) .panel-main-header span {
            display: none !important; /* Nasconde la freccia temporaneamente per pulizia verticale */
        }
        
        #custom-bottom-panel .panel-three-columns {
            grid-template-columns: 180px 160px 1fr !important;
            overflow-y: auto;
            display: grid !important;
            width: 100%;
            box-sizing: border-box;
        }

        /* Pannello dettaglio elemento desktop */
        #feature-detail-panel {
            position: fixed; 
            top: auto;
            bottom: 10px; 
            left: 10px; 
            width: 350px;
            max-height: 230px !important;
            border-radius: 14px; 
            overflow-y: auto;
            background: rgba(255, 255, 255, 0.98); 
            backdrop-filter: blur(10px);
            box-shadow: 0 5px 25px rgba(0,0,0,0.3); 
            z-index: 2100;
            padding: 8px 8px; 
            box-sizing: border-box; 
            font-family: sans-serif;
            font-size: 13px; 
            color: #333; 
            display: none; 
            flex-direction: column;
            border: 1px solid rgba(0,0,0,0.1);
            transition: width 0.3s ease-in-out, left 0.3s ease-in-out;
        }

        #custom-bottom-panel.open ~ #feature-detail-panel,
        body:has(#custom-bottom-panel.open) #feature-detail-panel {
            width: 950px !important;
        }
    }
    @media (max-width: 767px) {
        #feature-detail-panel {
            position: fixed; bottom: 0; left: 50%; transform: translateX(-50%);
            width: 100%; max-width: 1000px; height: 240px !important;
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
    @media (min-width: 768px) {
        #custom-bottom-panel:not(.open) { width: 44px !important; height: 44px !important; border-radius: 50% !important; overflow: hidden; padding: 0 !important; display: flex; align-items: center; justify-content: center; }
        #custom-bottom-panel:not(.open) .panel-main-header { justify-content: center; padding: 0; margin: 0; }
        #custom-bottom-panel:not(.open) .panel-main-header b { display: none; }
    }
    @media (max-width: 767px) {
        #custom-bottom-panel:not(.open) { max-height: 44px !important; height: 44px !important; }
        #custom-bottom-panel:not(.open) .panel-main-header { border-bottom: none; margin-bottom: 0; padding-bottom: 0; }
    }
    
    .panel-main-header { flex-shrink: 0; display: flex; justify-content: space-between; align-items: center; padding-bottom: 4px; border-bottom: 1px solid #e1e1e1; margin-bottom: 6px; cursor: pointer; user-select: none; width: 100%; }

    .panel-three-columns { display: grid; grid-template-columns: 80px 120px 1fr; gap: 6px; flex-grow: 1; overflow: hidden; height: calc(100% - 30px); }
    
    .col-left { display: flex; flex-direction: column; gap: 6px; border-right: 1px solid #e1e1e1; padding-right: 6px; overflow: hidden; }
    .col-left .base-map-vertical { display: flex; flex-direction: column; gap: 3px; flex-shrink: 0; }
    .col-left-scrollable { display: flex; flex-direction: column; gap: 2px; overflow-y: auto; flex-grow: 1; border-top: 1px solid #e1e1e1; padding-top: 4px; }
    
    .col-middle { display: flex; flex-direction: column; gap: 4px; border-right: 1px solid #e1e1e1; padding-right: 6px; overflow-y: auto; }
    .sidebar-tabs-vertical { display: flex; flex-direction: column; gap: 4px; }
    
    .col-right { display: flex; flex-direction: column; overflow: hidden; }
    
    .sub-section-title { font-weight: bold; color: #555; margin-bottom: 3px; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px; }
    .sidebar-tab-btn { background: #f1f2f6; border: 1px solid #dcdde1; border-radius: 4px; padding: 3px 4px; font-size: 12px; cursor: pointer; font-weight: bold; color: #57606f; text-align: left; transition: all 0.2s ease; touch-action: manipulation; }
    .sidebar-tab-content { display: none; flex-direction: column; flex-grow: 1; overflow: hidden; }
    .sidebar-tab-content.active { display: flex; }
    
    .panel-scrollable-grid { flex-grow: 1; overflow-x: auto; overflow-y: hidden; display: flex; gap: 8px; padding-bottom: 4px; align-items: flex-start; }
    .feature-vertical-column { display: flex; flex-direction: column; gap: 4px; min-width: 100px; flex-shrink: 0; }
    
    .feature-detail-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        border-bottom: 1px solid #e1e1e1;
        padding-bottom: 4px;
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

const tavoloColors = { 
    'ambiente': '#2ecc71', 
    'cultura': '#e67e22',  
    'spazi pubblici': '#8e44ad',
    'salute': '#d63031',        
    'servizi urbani': '#0984e3',
};
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
        layer.setStyle({ color: '#ff0000', weight: 2 });
    }
    if (!L.Browser.ie && !L.Browser.opera && !L.Browser.edge && layer.bringToFront) { layer.bringToFront(); }
}

function resetFeatureStyle(e) {
    var layer = e.target;
    if (!layer.feature) return;
    const prop = layer.feature.properties;
    const tematica = prop['Tematica'] || 'Altro';
    const catColor = getTavoloColor(tematica);
    if (layer.feature.geometry.type === 'Point') {
        layer.setStyle({ radius: 8.0, opacity: 1, color: 'rgba(35,35,35,1.0)', weight: 1, fill: true, fillOpacity: 1, fillColor: catColor });
    } else {
        layer.setStyle({ opacity: 1, color: 'rgba(35,35,35,1.0)', weight: 1.0, fill: true, fillOpacity: 0.6, fillColor: catColor });
    }
}

function checkZoomVisibility() {
    if (!map) return;
    const currentZoom = map.getZoom();
    
    if (currentZoom >= MIN_ZOOM_VISIBLE) {
        allTavoloLayers.forEach(l => {
            if (!map.hasLayer(l)) map.addLayer(l);
        });
    } else {
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
    const standardKeys = ['Nome', 'Criticità', 'Proposta', 'Stato proposta', 'Tematica'];
    
    const extraFields = [];
    for (const [key, value] of Object.entries(props)) {
        if (!standardKeys.includes(key) && value !== null && value !== '') {
            extraFields.push({ key, value });
        }
    }

    window.currentDetailSlide = 1;
    window.currentDetailExtraFields = extraFields;
    window.currentDetailTableData = { props, tavoloName };

    renderDetailSlide();
}

window.renderDetailSlide = function() {
    const detailPanel = document.getElementById('feature-detail-panel');
    if (!detailPanel) return;

    const { props, tavoloName } = window.currentDetailTableData;

    const allFields = [];
    const mainKeys = ['Nome', 'Criticità', 'Proposta', 'Stato proposta'];
    
    mainKeys.forEach(k => {
        const val = props[k];
        allFields.push({ key: k, value: (val !== null && val !== undefined && val !== '') ? val : 'N/D' });
    });
    const tematicaVal = props['Tematica'] || tavoloName;
    allFields.push({ key: 'Tematica', value: (tematicaVal !== null && tematicaVal !== undefined && tematicaVal !== '') ? tematicaVal : 'N/D' });
    
    const excludedKeys = [...mainKeys, 'Tematica'];
    for (const [key, value] of Object.entries(props)) {
        if (!excludedKeys.includes(key)) {
            allFields.push({
                key: key, 
                value: (value !== null && value !== undefined && value !== '') ? value : 'N/D' 
            });
        }
    }

    if (allFields.length === 0) return;

    const slides = [];
    const testFieldsHeight = (fields) => {
        let testHtml = `<table class="detail-table" style="width:100%;">`;
        fields.forEach(item => {
            testHtml += `<tr><th style="width:30%;">${item.key}</th><td style="width:70%; word-break:break-word;">${item.value}</td></tr>`;
        });
        testHtml += `</table>`;
        
        const measureDiv = document.createElement('div');
        measureDiv.style.cssText = 'position:absolute; visibility:hidden; width:296px; font-family:sans-serif; font-size:13px; box-sizing:border-box;';
        measureDiv.innerHTML = testHtml;
        document.body.appendChild(measureDiv);
        const height = measureDiv.offsetHeight;
        document.body.removeChild(measureDiv);
        
        return height;
    };

    let tempFields = [];
    for (let i = 0; i < allFields.length; i++) {
        tempFields.push(allFields[i]);
        if (testFieldsHeight(tempFields) > 175) {
            if (tempFields.length > 1) {
                const lastItem = tempFields.pop();
                slides.push([...tempFields]);
                tempFields = [lastItem];
            } else {
                slides.push([...tempFields]);
                tempFields = [];
            }
        }
    }
    if (tempFields.length > 0) {
        slides.push(tempFields);
    }

    const totalPages = slides.length;
    if (!window.currentDetailSlide || window.currentDetailSlide > totalPages) {
        window.currentDetailSlide = 1;
    }
    const slide = window.currentDetailSlide;
    const activeSlideFields = slides[slide - 1] || slides[0];

    let contentHtml = `<table class="detail-table">`;
    activeSlideFields.forEach(item => {
        contentHtml += `<tr><th>${item.key}</th><td>${item.value}</td></tr>`;
    });
    contentHtml += `</table>`;

    let leftArrowStyle = (slide > 1) ? "cursor:pointer; opacity:1;" : "cursor:default; opacity:0.3;";
    let rightArrowStyle = (slide < totalPages) ? "cursor:pointer; opacity:1;" : "cursor:default; opacity:0.3;";
    
    let leftAction = (slide > 1) ? `onclick="window.changeDetailSlide(${slide - 1})"` : "";
    let rightAction = (slide < totalPages) ? `onclick="window.changeDetailSlide(${slide + 1})"` : "";

    let navControls = '';
    if (totalPages > 1) {
        navControls = `
            <div style="display:flex; justify-content:center; align-items:center; gap:8px; margin-top:auto; padding-top:2px;">
                <span ${leftAction} title="Pagina precedente" style="${leftArrowStyle} font-size:12px;">⬅️</span>
                <span style="font-size:11px; color:#666; font-weight:normal;">${slide}/${totalPages}</span>
                <span ${rightAction} title="Pagina successiva" style="${rightArrowStyle} font-size:12px;">➡️</span>
            </div>
        `;
    }

    detailPanel.innerHTML = `
        <div class="feature-detail-header">
            <b style="font-size:13px; color:#2c3e50;">📋 Dettaglio Elemento</b>
            <button class="close-feature-btn" onclick="closeFeaturePanel()">✕</button>
        </div>
        <div style="flex-grow:1; overflow:hidden;">
            ${contentHtml}
        </div>
        ${navControls}
    `;
    detailPanel.style.display = 'flex';
};

window.changeDetailSlide = function(targetSlide) {
    window.currentDetailSlide = targetSlide;
    renderDetailSlide();
};

const initialBounds = [
    [40.626, 14.771],
    [40.726, 14.873]
];

document.addEventListener('DOMContentLoaded', () => {
    const isMobileDevice = window.innerWidth < 768;

    map = L.map('map', { 
        zoomControl: false, 
        maxZoom: 28, 
        minZoom: 4, 
        zoomSnap: 0.20,  
        zoomDelta: 0.50,
        wheelDebounceTime: 80,
        wheelPxPerZoomLevel: 120, 
        worldCopyJump: false,
        maxBounds: L.latLngBounds(L.latLng(-85, -180), L.latLng(85, 180)),
        maxBoundsViscosity: 1.0,
        bounceAtZoomLimits: false,
        attributionControl: false
    });

   if (isMobileDevice) {
        map.setView([40.600, 14.805], 11.75);
    } else {
        map.fitBounds(initialBounds);
        if (map.getZoom() < 13) {
            map.setZoom(13);
        }
    }
       
    var autolinker = new Autolinker({truncate: {length: 30, location: 'smart'}});

    map.on('zoomend', checkZoomVisibility);

    map.createPane('pane_confini_amministrativi');
    map.getPane('pane_confini_amministrativi').style.zIndex = 404;

    var layer_confini_amministrativi = L.geoJson(null, {
        interactive: false,
        pane: 'pane_confini_amministrativi',
        style: function(feature) {
            return { 
                color: '#000000',      
                weight: 1.5,           
                fill: true,            
                fillColor: '#b2bec3',  
                fillOpacity: 0.0       
            };
        }
    });
    
    fetch('data/confiniamministrativi.geojson')
       .then(response => response.json())
       .then(data => {
           layer_confini_amministrativi.addData(data);
           map.addLayer(layer_confini_amministrativi); 
       });

    map.createPane('pane_comuniprovincia');
    map.getPane('pane_comuniprovincia').style.zIndex = 407;

    var layer_comuniprovincia = L.layerGroup();

    if (!map.getPane('pane_comuniprovincia_labels')) {
        map.createPane('pane_comuniprovincia_labels');
        map.getPane('pane_comuniprovincia_labels').style.zIndex = 650;
        map.getPane('pane_comuniprovincia_labels').style.pointerEvents = 'none';
    }

    let selectedComuneLayer = null; 
    let currentLabelMarker = null;  

    fetch('data/comuniprovincia.geojson')
       .then(response => response.json())
       .then(data => {
            const geoJsonLayer = L.geoJson(data, {
                interactive: true,
                pane: 'pane_comuniprovincia',
                style: function(feature) {
                    return { 
                        color: '#000000',      
                        weight: 1,            
                        fill: true,           
                        fillColor: '#e74c3c',  
                        fillOpacity: 0.0      
                    };
                },
                onEachFeature: function(feature, layer) {
                    layer_comuniprovincia.addLayer(layer);

                    const nomeComune = feature.properties['COMUNE'] || feature.properties['Comune'] || '';
                    
                    if (nomeComune) {
                        layer.on('click', function(e) {
                            if (selectedComuneLayer) {
                                selectedComuneLayer.setStyle({ 
                                    color: '#000000', 
                                    weight: 1, 
                                    fillOpacity: 0.0 
                                });
                            }

                            if (currentLabelMarker) {
                                layer_comuniprovincia.removeLayer(currentLabelMarker);
                            }

                            layer.setStyle({
                                color: '#e74c3c',     
                                weight: 2.5,          
                                fillOpacity: 0.15     
                            });

                            const center = layer.getBounds().getCenter();
                            const labelIcon = L.divIcon({
                                className: 'comune-label-container',
                                html: `<div class="comune-label">${nomeComune}</div>`,
                                iconSize: [0, 0],
                                iconAnchor: [0, 0]
                            });

                            currentLabelMarker = L.marker(center, { 
                                icon: labelIcon, 
                                interactive: false,
                                pane: 'pane_comuniprovincia_labels'
                            });
                            
                            layer_comuniprovincia.addLayer(currentLabelMarker);
                            selectedComuneLayer = layer;

                            L.DomEvent.stopPropagation(e);
                        });
                    }
                }
            });
       });

    const contextLayers = [
        { name: 'Confine Comune', layer: layer_confini_amministrativi }, 
        { name: 'Comuni Provincia', layer: layer_comuniprovincia }
    ];

    map.createPane('pane_GoogleSatellite_3'); map.getPane('pane_GoogleSatellite_3').style.zIndex = 402;
    var layer_GoogleSatellite_3 = L.tileLayer('https://mt1.google.com/vt/lyrs=s&x={x}&y={y}&z={z}', { pane: 'pane_GoogleSatellite_3', minZoom: 1, maxZoom: 28,noWrap: true, keepBuffer: 6, updateWhenIdle: false,
        updateInterval: 100 });

    map.createPane('pane_OpenStreetMap_4'); map.getPane('pane_OpenStreetMap_4').style.zIndex = 403;
    var layer_OpenStreetMap_4 = L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', { pane: 'pane_OpenStreetMap_4', minZoom: 1, maxZoom: 28,noWrap: true, keepBuffer: 6, updateWhenIdle: false,
        updateInterval: 100 });
    map.addLayer(layer_OpenStreetMap_4);

    window.atlasCategories = {};
    function registerItem(feature, layer) {
        const tematica = feature.properties['Tematica'] || 'Altro';
        const name = feature.properties['Nome'] || 'Elemento';
        if (!atlasCategories[tematica]) { atlasCategories[tematica] = []; }
        atlasCategories[tematica].push({ name, layer });
    }

    const puntiPerTavolo = {};
    json_puntiprimavolta_5.features.forEach(f => {
        const t = f.properties['Tematica'] || 'Altro';
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
                return L.circleMarker(latlng, { radius: 8.0, opacity: 1, color: 'rgba(35,35,35,1.0)', weight: 1, fill: true, fillOpacity: 1, fillColor: catColor }); 
            }
        });
        allTavoloLayers.push(layerPuntiTavolo);
    }

    const poligoniPerTavolo = {};
    json_poligoniprimavolta_6.features.forEach(f => {
        const t = f.properties['Tematica'] || 'Altro';
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
        const arrowSymbol = isOpen ? '◀' : '▶';
        const checkMobile = window.innerWidth < 768;

        let html = `
            <div class="panel-main-header" onclick="
                const panel = document.getElementById('custom-bottom-panel');
                const wasOpen = panel.classList.contains('open');
                panel.classList.toggle('open');
                renderPanelContent();
                
                // Spostamento dinamico della mappa su desktop
                if (window.innerWidth >= 768) {
                    if (!wasOpen) {
                        map.panBy([-475, 0], { animate: true });
                    } else {
                        map.setView([40.665, 14.805], map.getZoom(), { animate: true });
                    }
                    setTimeout(() => { map.invalidateSize(); }, 300);
                }
            ">
                <b style="font-size:13px; color:#2c3e50;">🗂️ Centro di Controllo</b>
                <div style="display:flex; align-items:center; gap:8px;">
                    <span style="font-size:13px; font-weight:bold; color:#3498db; padding:0 4px;">${checkMobile ? (isOpen ? '▼' : '▲') : arrowSymbol}</span>
                </div>
            </div>
        `;

        const tavoloKeys = Object.keys(atlasCategories);
        if (!currentActiveTab || !atlasCategories[currentActiveTab]) {
            currentActiveTab = tavoloKeys[0];
        }

        if (checkMobile) {
            // ==================== LAYOUT MOBILE (ORIGINALE) ====================
            html += `<div class="panel-three-columns" style="display: flex; flex-direction: column; gap: 6px; flex-grow: 1; overflow: hidden; height: 180px;">`;
            
            html += `
                <div style="display: flex; align-items: center; gap: 10px; border-bottom: 1px solid #e1e1e1; padding-bottom: 5px; margin-bottom: 2px; flex-shrink: 0; width: 100%; box-sizing: border-box;">
                    
                    <div style="display: flex; align-items: center; gap: 5px; flex-shrink: 0; white-space: nowrap;">
                        <span class="sub-section-title" style="margin:0; font-size:11px;">Base Map:</span>
                        <label style="display:inline-flex; align-items:center; gap:2px; cursor:pointer; font-size:11px;">
                            <input type="radio" name="baseMapChoice" value="osm" ${map.hasLayer(layer_OpenStreetMap_4) ? 'checked' : ''}> OSM
                        </label>
                        <label style="display:inline-flex; align-items:center; gap:2px; cursor:pointer; font-size:11px;">
                            <input type="radio" name="baseMapChoice" value="Satellite" ${map.hasLayer(layer_GoogleSatellite_3) ? 'checked' : ''}> Sat
                        </label>
                    </div>

                    <div style="width: 1px; height: 14px; background: #dcdde1; flex-shrink: 0;"></div>

                    <div style="display: flex; align-items: center; gap: 6px; flex-grow: 1; min-width: 0;">
                        <span class="sub-section-title" style="margin:0; flex-shrink:0; font-size:11px;">Altro:</span>
                        
                        <div style="display: flex; align-items: center; gap: 8px; overflow-x: auto; white-space: nowrap; flex-grow: 1; min-width: 0; padding-bottom: 2px; -webkit-overflow-scrolling: touch;">
            `;
            
            contextLayers.forEach((ctx, idx) => {
                const isChecked = map.hasLayer(ctx.layer);
                html += `<label style="display:inline-flex; align-items:center; gap:3px; cursor:pointer; font-size:11px; flex-shrink:0;"><input type="checkbox" class="custom-context-chk" data-index="${idx}" ${isChecked ? 'checked' : ''}> ${ctx.name}</label>`;
            });
            html += `</div></div></div>`;

        } else {
            // ==================== LAYOUT DESKTOP ====================
            html += `
                <div class="panel-three-columns">
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
            
            contextLayers.forEach((ctx, idx) => {
                const isChecked = map.hasLayer(ctx.layer);
                html += `<label style="display:flex; align-items:center; gap:4px; margin:2px 0; cursor:pointer;"><input type="checkbox" class="custom-context-chk" data-index="${idx}" ${isChecked ? 'checked' : ''}> ${ctx.name}</label>`;
            });
            html += `</div></div></div>`;

            html += `
                <div class="col-middle">
                    <div class="sub-section-title">Tematiche</div>
                    <div class="sidebar-tabs-vertical">
            `;

            tavoloKeys.forEach(tavolo => {
                const cleanKey = tavolo.replace(/\s+/g, '');
                const catColor = getTavoloColor(tavolo);
                const isActive = (tavolo === currentActiveTab);
                const activeStyle = isActive ? `background:${catColor}; color:${['#f1c40f'].includes(catColor) ? '#333' : 'white'}; border-color:${catColor};` : '';
                html += `<button class="sidebar-tab-btn ${isActive ? 'active' : ''}" data-tab="tab-${cleanKey}" data-tavolo-name="${tavolo}" data-color="${catColor}" style="${activeStyle}">${tavolo.toUpperCase()}</button>`;
            });
            html += `</div></div>`;

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
                        <div class="sub-section-title" style="margin-bottom: 6px;">Elementi mappati: ${items.length}</div>
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
            html += `</div></div>`;
        }

        bottomPanel.innerHTML = html;

        const tabBtns = bottomPanel.querySelectorAll('.sidebar-tab-btn');
        const tabContents = bottomPanel.querySelectorAll('.sidebar-tab-content');
        tabBtns.forEach(btn => {
            btn.onclick = () => {
                if (checkMobile) {
                    currentActiveTab = btn.getAttribute('data-tavolo-name');
                    renderPanelContent();
                } else {
                    tabBtns.forEach(b => { b.classList.remove('active'); b.style.background = '#f1f2f6'; b.style.color = '#57606f'; b.style.borderColor = '#dcdde1'; });
                    tabContents.forEach(c => c.classList.remove('active'));
                    btn.classList.add('active');
                    
                    currentActiveTab = btn.getAttribute('data-tavolo-name');

                    const catColor = btn.getAttribute('data-color');
                    const textColor = ['#f1c40f'].includes(catColor) ? '#333' : 'white';
                    btn.style.background = catColor; btn.style.color = textColor; btn.style.borderColor = catColor;
                    bottomPanel.querySelector(`#${btn.getAttribute('data-tab')}`).classList.add('active');
                }
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

                const layer = targetItem.layer;
                const geom = layer.feature.geometry;

                if (geom.type === 'Point') {
                    const latlng = [geom.coordinates[1], geom.coordinates[0]];
                    map.setView(latlng, 19, { animate: false });
                    
                    if (checkMobile) {
                        map.panBy([0, 150], { animate: false }); 
                    } else {
                        map.panBy([0, 120], { animate: false });
                    }
                } else {
                    const bounds = layer.getBounds();
                    
                    if (checkMobile) {
                        map.fitBounds(bounds, {
                            paddingTopLeft: [20, 20],
                            paddingBottomRight: [20, 260],
                            maxZoom: 18,
                            animate: false
                        });
                    } else {
                        map.fitBounds(bounds, {
                            paddingTopLeft: [50, 50],
                            paddingBottomRight: [50, 250],
                            maxZoom: 18,
                            animate: false
                        });
                    }
                }

                highlightFeature({ target: layer });
                showFeatureDetailsOnly(layer, tavolo);
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
                const targetLayer = contextLayers[index].layer;
                if (e.target.checked) { map.addLayer(targetLayer); } else { map.removeLayer(targetLayer); }
            };
        });
    };

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

        createBtn('🌍', "Torna alla vista iniziale", () => {
            const isMobileDevice = window.innerWidth < 768;
            if (isMobileDevice) {
                map.setView([40.500, 14.805], 11.75, { animate: true });
            } else {
                map.fitBounds([
                    [40.626, 14.771],
                    [40.726, 14.873]
                ], { padding: [20, 20], animate: true });
            }
        }, 'btn-tutorial-home');

        createBtn('📍', "Posizione", () => { map.locate({setView: true, maxZoom: 16}); }, 'btn-tutorial-locate');

        return container;
    };
    btnControl.addTo(map);

    L.DomEvent.disableClickPropagation(bottomPanel);
    L.DomEvent.disableScrollPropagation(bottomPanel);
    L.DomEvent.on(bottomPanel, 'mousewheel touchstart pointerdown', (e) => {
        L.DomEvent.stopPropagation(e);
    });
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
