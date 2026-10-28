(() => {
  'use strict';
  const svg=document.querySelector('#map'), world=document.querySelector('#world');
  const label=document.querySelector('#label'), hint=document.querySelector('#hint');
  const NS='http://www.w3.org/2000/svg';
  const merc=lat=>Math.log(Math.tan(Math.PI/4+lat*Math.PI/360))*180/Math.PI;
  const project=([lon,lat])=>[600+(lon-140.25)*350,390+(merc(35.52)-merc(lat))*350];
  const path=geometry=>geometry.coordinates.map(poly=>poly.map(ring=>ring.map((p,i)=>`${i?'L':'M'}${project(p).map(v=>v.toFixed(2)).join(',')}`).join('')+'Z').join('')).join('');
  const data=window.JAPAN;
  if(!data){document.querySelector('#error').hidden=false;return;}
  for(const f of data.features){
    if(f.properties.id===12){document.querySelector('#chiba').setAttribute('d',path(f.geometry));continue;}
    const p=document.createElementNS(NS,'path');p.setAttribute('d',path(f.geometry));document.querySelector('#japan').append(p);
  }
  // Register the side-profile artwork to Chiba’s geographic extent. The two
  // silhouettes are intentionally distinct: the dotted coastline remains exact.
  const topLeft=project([139.7394,36.10413]), bottomRight=project([140.8709,34.89953]);
  const art=document.querySelector('#character');
  for(const [key,value] of Object.entries({x:topLeft[0],y:topLeft[1],width:bottomRight[0]-topLeft[0],height:bottomRight[1]-topLeft[1]}))art.setAttribute(key,value);
  // A small clockwise registration aligns the nose, eastern ear and southern foot
  // more closely with Noda, Choshi and the southern tip of the Boso peninsula.
  art.setAttribute('transform',`translate(14 7) translate(${topLeft[0]} ${topLeft[1]}) rotate(10) scale(.96) translate(${-topLeft[0]} ${-topLeft[1]})`);
  const alignment=document.querySelector('#alignment');
  alignment.addEventListener('input',()=>{
    const opacity=Number(alignment.value)/100;
    art.style.opacity=opacity;
    document.querySelector('#chiba').setAttribute('fill-opacity',String(.8-opacity*.275));
  });
  const cities=[
    ['野田市','Noda',139.862,35.955],['流山市','Nagareyama',139.903,35.856],
    ['柏市','Kashiwa',139.976,35.868],['我孫子市','Abiko',140.029,35.866],
    ['松戸市','Matsudo',139.903,35.787],['市川市','Ichikawa',139.931,35.722],
    ['浦安市','Urayasu',139.902,35.654],['船橋市','Funabashi',139.982,35.695],
    ['習志野市','Narashino',140.027,35.681],['八千代市','Yachiyo',140.100,35.723],
    ['印西市','Inzai',140.145,35.832],['成田市','Narita',140.318,35.777],
    ['佐倉市','Sakura',140.223,35.724],['四街道市','Yotsukaido',140.168,35.670],
    ['香取市','Katori',140.500,35.897],['銚子市','Choshi',140.827,35.735],
    ['旭市','Asahi',140.646,35.720],['匝瑳市','Sosa',140.564,35.707],
    ['千葉市','Chiba',140.106,35.608],['八街市','Yachimata',140.317,35.665],
    ['東金市','Togane',140.366,35.560],['山武市','Sammu',140.414,35.603],
    ['市原市','Ichihara',140.116,35.497],['袖ケ浦市','Sodegaura',139.954,35.430],
    ['木更津市','Kisarazu',139.925,35.376],['茂原市','Mobara',140.289,35.429],
    ['大網白里市','Oamishirasato',140.321,35.522],['君津市','Kimitsu',139.903,35.331],
    ['富津市','Futtsu',139.858,35.304],['いすみ市','Isumi',140.385,35.253],
    ['勝浦市','Katsuura',140.321,35.152],['鴨川市','Kamogawa',140.099,35.113],
    ['南房総市','Minamiboso',139.840,35.043],['館山市','Tateyama',139.870,34.996]
  ].map(([jp,en,lon,lat])=>({jp,en,point:project([lon,lat])}));
  let zoom=1,pan=[0,0],active=null,pointer=null,moved=false,baseWidth=1200;
  const screenPoint=p=>[600+(p[0]-600)*zoom+pan[0],390+(p[1]-390)*zoom+pan[1]];
  function show(city){
    if(!city){active=null;label.setAttribute('opacity',0);return;}
    active=city;const p=screenPoint(city.point);label.setAttribute('transform',`translate(${p[0]} ${p[1]})`);
    document.querySelector('#city-jp').textContent=city.jp;document.querySelector('#city-en').textContent=city.en;
    label.setAttribute('opacity',1);hint.style.opacity='0';
    document.querySelector('#announcement').textContent=`${city.jp} · ${city.en}`;
  }
  for(const city of cities){
    const c=document.createElementNS(NS,'circle');c.classList.add('city');c.setAttribute('cx',city.point[0]);c.setAttribute('cy',city.point[1]);c.setAttribute('r',16);c.setAttribute('tabindex','0');c.setAttribute('role','button');c.setAttribute('aria-label',`${city.en} · ${city.jp}`);
    c.addEventListener('focus',()=>show(city));c.addEventListener('blur',()=>show(null));
    c.addEventListener('keydown',e=>{if(['Enter',' '].includes(e.key)){e.preventDefault();show(city);}});
    document.querySelector('#cities').append(c);
  }
  function toMap(e){const p=svg.createSVGPoint();p.x=e.clientX;p.y=e.clientY;return p.matrixTransform(svg.getScreenCTM().inverse());}
  function hover(e){
    const p=toMap(e),x=(p.x-600-pan[0])/zoom+600,y=(p.y-390-pan[1])/zoom+390;
    // Match the silhouette rather than showing city names over the surrounding sea.
    const artPoint=new DOMPoint(x,y).matrixTransform(art.transform.baseVal.consolidate().matrix.inverse());
    const nx=(artPoint.x-topLeft[0])/(bottomRight[0]-topLeft[0]),ny=(artPoint.y-topLeft[1])/(bottomRight[1]-topLeft[1]);
    const silhouette=[[0,0],[.12,.11],[.27,.13],[.53,.02],[.68,.03],[.84,.09],[1,.15],[.96,.2],[.85,.21],[.73,.2],[.7,.29],[.7,.4],[.76,.62],[.73,.72],[.65,.75],[.58,.75],[.51,.84],[.42,.91],[.42,.98],[.36,1],[.22,1],[.2,.97],[.26,.94],[.28,.91],[.19,.76],[.16,.66],[.19,.55],[.29,.43],[.31,.39],[.23,.38],[.21,.36],[.19,.4],[.17,.38],[.17,.32],[.13,.3],[.1,.22],[.09,.14]];
    let inside=false;
    for(let i=0,j=silhouette.length-1;i<silhouette.length;j=i++){
      const a=silhouette[i],b=silhouette[j];if((a[1]>ny)!==(b[1]>ny)&&nx<(b[0]-a[0])*(ny-a[1])/(b[1]-a[1])+a[0])inside=!inside;
    }
    const point=svg.createSVGPoint();point.x=x;point.y=y;
    const overChiba=document.querySelector('#chiba').isPointInFill(point);
    if(!(inside && Number(alignment.value)>10) && !overChiba){show(null);return;}
    const nearest=cities.reduce((a,c)=>Math.hypot(c.point[0]-x,c.point[1]-y)<Math.hypot(a.point[0]-x,a.point[1]-y)?c:a);
    if(active!==nearest)show(nearest);
  }
  function render(){world.setAttribute('transform',`translate(${600+pan[0]} ${390+pan[1]}) scale(${zoom}) translate(-600 -390)`);if(active)show(active);document.querySelector('#zoom-in').disabled=zoom>=3;document.querySelector('#zoom-out').disabled=zoom<=.045;}
  function changeZoom(factor){zoom=Math.max(.045,Math.min(3,zoom*factor));show(null);render();}
  svg.addEventListener('pointermove',e=>{
    if(pointer){const p=toMap(e);if(Math.hypot(p.x-pointer.start.x,p.y-pointer.start.y)>4)moved=true;if(moved){pan=[pointer.pan[0]+p.x-pointer.start.x,pointer.pan[1]+p.y-pointer.start.y];show(null);render();}return;}
    if(e.pointerType!=='touch')hover(e);
  });
  svg.addEventListener('pointerdown',e=>{if(e.button!==0)return;pointer={id:e.pointerId,start:toMap(e),pan:[...pan]};moved=false;svg.setPointerCapture(e.pointerId);svg.classList.add('dragging');});
  svg.addEventListener('pointerup',e=>{if(!pointer)return;if(!moved)hover(e);pointer=null;svg.classList.remove('dragging');if(svg.hasPointerCapture(e.pointerId))svg.releasePointerCapture(e.pointerId);});
  svg.addEventListener('pointercancel',()=>{pointer=null;svg.classList.remove('dragging');});
  svg.addEventListener('pointerleave',()=>{if(!pointer)show(null);});
  svg.addEventListener('wheel',e=>{e.preventDefault();changeZoom(Math.exp(-e.deltaY*.0015));},{passive:false});
  document.querySelector('#zoom-in').addEventListener('click',()=>changeZoom(1.5));
  document.querySelector('#zoom-out').addEventListener('click',()=>changeZoom(1/1.5));
  function reset(){zoom=1;pan=[0,0];show(null);hint.style.opacity='1';render();}
  document.querySelector('#reset').addEventListener('click',reset);
  document.addEventListener('keydown',e=>{if(e.key==='Escape')reset();});
  new ResizeObserver(()=>{const r=svg.getBoundingClientRect();baseWidth=Math.max(620,800*r.width/r.height);svg.setAttribute('viewBox',`${600-baseWidth/2} -10 ${baseWidth} 800`);}).observe(svg);
  render();
})();
