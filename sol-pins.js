(function(D){
  if(Array.isArray(D)) D={missions:D,loot:[],ups:[],lt:[],lc:[]};
  if (window.__gtaPins) { window.__gtaPins.update(D); return; }
  function ready(cb){
    var n=0;(function t(){var m=window.mapManager&&window.mapManager.currentMap;
      if(m&&window.L){cb(m)}else if(n++<120){setTimeout(t,250)}})();
  }
  ready(function(map){
    var css=document.createElement('style');
    css.textContent='.gtap{width:30px;height:30px;border-radius:50%;border:3px solid #fff;color:#fff;font:700 14px/24px sans-serif;text-align:center;box-shadow:0 1px 5px rgba(0,0,0,.5)}'+
      '.gtap.todo{background:#e8573f}.gtap.done{background:#2b7a3d}.gtap.skip{background:#8b8f92}.gtap.ap{outline:2px dashed #fff;outline-offset:3px}.gtap.up{background:#2b7a3d}'+
      '.gtal{width:14px;height:14px;border:2px solid #fff;border-radius:3px;transform:rotate(45deg);box-shadow:0 1px 3px rgba(0,0,0,.5)}.gtal.f{opacity:.35}'+
      '.gtapop h4{margin:0 0 4px;font:700 16px sans-serif}.gtapop p{margin:0 0 6px;font:13px sans-serif;opacity:.8}.gtapop label{display:flex;gap:8px;align-items:center;font:14px/1.3 sans-serif;padding:5px 0;cursor:pointer}.gtapop input{width:20px;height:20px;flex:none}.gtapop label.sk{opacity:.5}.gtapop .note{white-space:pre-wrap;font:14px sans-serif;margin:0}'+
      '.gtab{position:fixed;left:12px;z-index:100000;color:#fff;border:0;border-radius:24px;padding:11px 16px;font:700 14px sans-serif;box-shadow:0 2px 8px rgba(0,0,0,.4)}'+
      '#gtaBack{bottom:84px;background:#0e5e66}#gtaToggle{bottom:134px;background:#e8573f}#gtaLoot{bottom:184px;background:#8a3fc0}';
    document.head.appendChild(css);
    if(!map.getPane('gtaPane')){map.createPane('gtaPane').style.zIndex=650}
    if(!map.getPane('gtaLootPane')){map.createPane('gtaLootPane').style.zIndex=640}
    var hide=document.createElement('style');hide.textContent='.leaflet-marker-pane,.leaflet-shadow-pane{display:none!important}';document.head.appendChild(hide);
    var layer=L.layerGroup().addTo(map), lootLayer=L.layerGroup().addTo(map), siteOn=false, lootOn=true, DATA=D;
    function esc(s){return String(s==null?'':s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/"/g,'&quot;')}
    function setDone(key,id,done){try{if(window.Bridge&&Bridge.setDone)Bridge.setDone(key,id,!!done)}catch(e){}}
    function mState(p){var live=p.items.filter(function(i){return !i.sk});if(!live.length)return 'skip';return live.every(function(i){return i.d})?'done':'todo'}
    function mIcon(p){var s=mState(p),left=p.items.filter(function(i){return !i.d&&!i.sk}).length;
      return L.divIcon({className:'',html:'<div class="gtap '+s+(p.a?' ap':'')+'">'+(s==='done'?'✓':left)+'</div>',iconSize:[30,30],iconAnchor:[15,15]})}
    function mHtml(p,pi){return '<div class="gtapop"><h4>'+esc(p.name)+'</h4>'+(p.a?'<p>Rough spot: check your in-game map.</p>':'')+
      p.items.map(function(i,ii){return '<label class="'+(i.sk?'sk':'')+'"><input type="checkbox" data-m="'+pi+'" data-i="'+ii+'"'+(i.d?' checked':'')+(i.sk?' disabled':'')+'>'+esc(i.t)+(i.sk?' (skipped)':'')+'</label>'}).join('')+'</div>'}
    function lIcon(l){return L.divIcon({className:'',html:'<div class="gtal'+(l.d?' f':'')+'" style="background:'+((DATA.lc||[])[l.t]||'#d99a00')+'"></div>',iconSize:[18,18],iconAnchor:[9,9]})}
    function lHtml(l,li){return '<div class="gtapop"><h4>'+esc(l.n)+'</h4><p>'+esc((DATA.lt||[])[l.t]||'')+(l.c&&l.c!==l.n?' · '+esc(l.c):'')+'</p><label><input type="checkbox" data-l="'+li+'"'+(l.d?' checked':'')+'>Found it</label></div>'}
    var mMarkers=[],lMarkers=[];
    function draw(P){
      DATA=P;layer.clearLayers();lootLayer.clearLayers();mMarkers=[];lMarkers=[];
      (P.loot||[]).forEach(function(l,li){var m=L.marker([l.y,l.x],{icon:lIcon(l),pane:'gtaLootPane'}).bindPopup(lHtml(l,li)).addTo(lootLayer);lMarkers[li]=m});
      (P.missions||[]).forEach(function(p,pi){var m=L.marker([p.y,p.x],{icon:mIcon(p),pane:'gtaPane'}).bindPopup(mHtml(p,pi)).addTo(layer);mMarkers[pi]=m});
      (P.ups||[]).forEach(function(u){L.marker([u.y,u.x],{icon:L.divIcon({className:'',html:'<div class="gtap up">★</div>',iconSize:[30,30],iconAnchor:[15,15]}),pane:'gtaPane'}).bindPopup('<div class="gtapop"><h4>★ '+esc(u.t)+'</h4><p>Your own pin</p>'+(u.n?'<p class="note">'+esc(u.n)+'</p>':'')+'</div>').addTo(layer)});
    }
    document.addEventListener('change',function(e){var t=e.target;if(!t||t.type!=='checkbox')return;
      if(t.dataset.m!=null){var p=DATA.missions[+t.dataset.m],it=p.items[+t.dataset.i];it.d=t.checked?1:0;setDone(DATA.K,it.id,t.checked);mMarkers[+t.dataset.m].setIcon(mIcon(p))}
      else if(t.dataset.l!=null){var l=DATA.loot[+t.dataset.l];l.d=t.checked?1:0;setDone(DATA.K+'loot',l.id,t.checked);lMarkers[+t.dataset.l].setIcon(lIcon(l))}
    },true);
    draw(D);
    function btn(id,txt,fn){var b=document.createElement('button');b.id=id;b.className='gtab';b.textContent=txt;b.onclick=fn;document.body.appendChild(b);return b}
    btn('gtaBack','← My checklist',function(){if(window.Bridge&&Bridge.back){Bridge.back()}else{history.back()}});
    var tog=btn('gtaToggle','Show site markers',function(){siteOn=!siteOn;hide.disabled=siteOn;tog.textContent=siteOn?'Only my pins':'Show site markers'});
    var lt=btn('gtaLoot','Hide loot',function(){lootOn=!lootOn;if(lootOn){lootLayer.addTo(map)}else{map.removeLayer(lootLayer)}lt.textContent=lootOn?'Hide loot':'Show loot'});
    if(!(D.loot||[]).length)lt.style.display='none';
    window.__gtaPins={update:draw};
  });
})
