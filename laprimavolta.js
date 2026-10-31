window.renderPanelContent = function() {
        const isOpen = bottomPanel.classList.contains('open');
        const arrowSymbol = isOpen ? '▼' : '▲';
        const checkMobile = window.innerWidth < 768;

        let html = `
            <div class="panel-main-header" onclick="document.getElementById('custom-bottom-panel').classList.toggle('open'); renderPanelContent();">
                <b style="font-size:13px; color:#2c3e50;">🗂️ Centro di Controllo</b>
                <div style="display:flex; align-items:center; gap:8px;">
                    <span style="font-size:13px; font-weight:bold; color:#3498db; padding:0 4px;">${arrowSymbol}</span>
                </div>
            </div>
        `;

        const tavoloKeys = Object.keys(atlasCategories);
        if (!currentActiveTab || !atlasCategories[currentActiveTab]) {
            currentActiveTab = tavoloKeys[0];
        }

        if (checkMobile) {
            // ==================== LAYOUT MOBILE CORRETTO ====================
            html += `<div class="panel-three-columns" style="display: flex; flex-direction: column; gap: 6px; flex-grow: 1; overflow: hidden; height: 210px;">`;
            
            // Riga superiore: Base Map e Altro
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

            // Sezione inferiore mobile: Tabs delle tematiche ed elementi
            html += `
                <div style="display: flex; gap: 6px; flex-grow: 1; overflow: hidden; min-height: 0;">
                    <div style="display: flex; flex-direction: column; gap: 3px; width: 110px; flex-shrink: 0; overflow-y: auto; border-right: 1px solid #e1e1e1; padding-right: 4px;">
            `;

            tavoloKeys.forEach(tavolo => {
                const catColor = getTavoloColor(tavolo);
                const isActive = (tavolo === currentActiveTab);
                const activeStyle = isActive ? `background:${catColor}; color:${['#f1c40f'].includes(catColor) ? '#333' : 'white'}; border-color:${catColor};` : 'background:#f1f2f6; color:#57606f;';
                html += `<button class="sidebar-tab-btn" data-tavolo-name="${tavolo}" style="font-size:10px; padding:3px 4px; border-radius:4px; border:1px solid #dcdde1; text-align:left; cursor:pointer; font-weight:bold; ${activeStyle}">${tavolo.toUpperCase()}</button>`;
            });

            html += `</div><div style="display: flex; flex-direction: column; flex-grow: 1; overflow: hidden; min-width: 0;">`;

            if (currentActiveTab && atlasCategories[currentActiveTab]) {
                const items = atlasCategories[currentActiveTab];
                html += `
                    <div style="font-size:11px; font-weight:bold; color:#555; margin-bottom:4px;">Elementi (${items.length}):</div>
                    <div style="flex-grow: 1; overflow-y: auto; display: flex; flex-direction: column; gap: 3px; padding-right: 2px;">
                `;
                items.forEach((item, globalIdx) => {
                    html += `
                        <div style="display:flex; justify-content:space-between; align-items:center; padding:2px 4px; background:#f8f9fa; border:1px solid #e9ecef; border-radius:4px; flex-shrink:0;">
                            <span style="font-size:11px; color:#333; flex-grow:1; margin-right:4px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;">${item.name}</span>
                            <button class="vola-btn" data-tavolo="${currentActiveTab}" data-index="${globalIdx}" style="font-size:10px; padding:2px 5px; cursor:pointer; background:white; border:1px solid #333; border-radius:3px; flex-shrink:0;">🔍</button>
                        </div>
                    `;
                });
                html += `</div>`;
            }

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

        // Ricollegamento eventi click per i tab su mobile e desktop
        const tabBtns = bottomPanel.querySelectorAll('.sidebar-tab-btn');
        tabBtns.forEach(btn => {
            btn.onclick = () => {
                currentActiveTab = btn.getAttribute('data-tavolo-name');
                renderPanelContent();
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
