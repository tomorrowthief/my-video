import React from 'react';
import {AbsoluteFill,Sequence,interpolate,staticFile,useCurrentFrame,useVideoConfig} from 'remotion';
import data from './map-data.json';
import {CrabLunch} from './CrabLunch';
import {HikeStop} from './HikeStop';

const GOLD = '#f8d88a';
const START = 4;
const LEG = 7;
const screen = ([x,y]: number[]) => [x*.94+y*.14-3, -x*.10+y*.52+219];
const notes = ['第一天启程 · 杭州出发','南太湖晨光 · 月亮湾漫步','西岸观景 · 长兴慢游','周铁午餐 · 湖西休闲','马山落脚 · 今晚住一晚','第二天早起 · 十八湾湖景','渔洋山麓 · 两小时徒步','七都蟹宴 · 午餐后返杭','下午返杭 · 留足休息时间'];
const visits = ['D1 · 出发','D1 · 漫步约 60 分钟','D1 · 游玩约 60 分钟','D1 · 午餐与观景','D1 · 入住 / 住宿备选','D2 · 停留约 30 分钟','D2 · 10:00–12:00 徒步','D2 · 大闸蟹午餐约 50 分钟','D2 · 预计抵达，预留缓冲'];
const times = [420,510,630,780,960,1950,2040,2260,2400];
// 站点标签相对图钉的偏移，避开相邻标签、道路轨迹和城市名
const labelDx = [-170,30,-150,-185,34,34,22,28];
const labelDy = [-34,-38,62,-12,-20,-55,-26,-34];
const clock = (m: number) => `${String(Math.floor(m/60)%24).padStart(2,'0')}:${String(Math.floor(m%60)).padStart(2,'0')}`;

export const TaihuMap: React.FC<{snapshot?: boolean}> = ({snapshot=false}) => {
 const frame = useCurrentFrame(); const {fps} = useVideoConfig(); const t = snapshot?98:frame/fps;
 const hiking=t>=57 && t<65;
 const baseTime=t<57?t:t<65?57:t-8;
 const meal=baseTime>=64 && baseTime<72;
 const storyTime=baseTime<64?baseTime:baseTime<72?64:baseTime-8;
 const overnight = storyTime>=32 && storyTime<44;
 const routeTime=storyTime<32?storyTime:storyTime<44?32:storyTime-12;
 const overall = Math.max(0, Math.min(8, (routeTime-START)/LEG));
 const li = overnight?3:Math.min(7,Math.floor(overall));
 const phase = overnight?1:overall-li;
 const travel = Math.min(1,phase/.74);
 const arrived = phase>=.74 || overall>=8;
 const active = overall>=8 ? 8 : (t<START?0:li+(arrived?1:0));
 const leg = data.legs[li]; const dist = leg.length*travel;
 let p = leg.points[0];
 for(let i=1;i<leg.points.length;i++) {if(leg.lengths[i]>=dist){const f=(dist-leg.lengths[i-1])/(leg.lengths[i]-leg.lengths[i-1]||1);p=[leg.points[i-1][0]+(leg.points[i][0]-leg.points[i-1][0])*f,leg.points[i-1][1]+(leg.points[i][1]-leg.points[i-1][1])*f];break;}p=leg.points[i];}
 const [cx,cy]=screen(p);
 const legDeparture=li===4?1920:li===6?2190:li===7?2310:times[li];
 const now=hiking?2040+(t-57)/8*120:meal?2260+(baseTime-64)/8*50:t>=65&&li===5?2160:baseTime>=72&&li===6?2310:overnight?1080:overall>=8?2400:legDeparture+(times[li+1]-legDeparture)*travel;
 const day=t>=44?2:1;
 return <AbsoluteFill style={{background:'#09191c',color:'#eef5eb',fontFamily:'"PingFang SC", "Microsoft YaHei", sans-serif',overflow:'hidden'}}>
  <AbsoluteFill style={{background:'radial-gradient(ellipse at 37% 54%, #315046 0%, #12292a 48%, #071518 90%)'}} />
  <svg width="1460" height="1080" viewBox="0 0 1460 1080" style={{position:'absolute',left:-20,top:0,transform:'scale(.94)',transformOrigin:'720px 570px'}}>
   <defs>
    <filter id="shadow"><feGaussianBlur stdDeviation="24"/></filter>
    <filter id="glow"><feGaussianBlur stdDeviation="4"/></filter>
    <linearGradient id="edge" x2="0" y2="1"><stop stopColor="#638276"/><stop offset="1" stopColor="#203c35"/></linearGradient>
    <clipPath id="mapClip"><rect width="1300" height="1600" rx="10"/></clipPath>
   </defs>
   <polygon points="-3,247 1219,117 1443,949 221,1079" fill="#000" opacity=".7" filter="url(#shadow)"/>
   <g transform="matrix(.94 -.10 .14 .52 -3 239)"><rect width="1300" height="1600" rx="10" fill="url(#edge)"/></g>
   <g transform="matrix(.94 -.10 .14 .52 -3 219)">
    <g clipPath="url(#mapClip)">
     <image href={staticFile('taihu/full-satellite.jpg')} width="1300" height="1600" preserveAspectRatio="none" />
     <rect width="1300" height="1600" fill="#0d2728" opacity=".24"/>
     {data.legs.map((l,i)=><path key={`base${i}`} d={l.path} fill="none" stroke="#fff6d7" strokeWidth="3" opacity=".30"/>)}
     {data.legs.map((l,i)=>{const progress=i<li?1:i===li?travel:0;return <g key={i}><path d={l.path} fill="none" stroke="#ffbc46" strokeWidth="16" opacity=".4" filter="url(#glow)" strokeDasharray={l.length} strokeDashoffset={l.length*(1-progress)}/><path d={l.path} fill="none" stroke={i===0||i===7?'#b9e6e5':GOLD} strokeWidth="5.5" strokeLinecap="round" strokeLinejoin="round" strokeDasharray={l.length} strokeDashoffset={l.length*(1-progress)}/></g>;})}
    </g>
    <rect width="1300" height="1600" rx="10" fill="none" stroke="#b7cab4" strokeWidth="2" opacity=".5"/>
   </g>
   <text x="717" y="470" fill="#f5f8e9" fontSize="64" fontWeight="300" letterSpacing="20" opacity=".8">太 湖</text>
   <text x="742" y="507" fill="#ecf2dc" fontSize="16" letterSpacing="7" opacity=".65">TAI LAKE</text>
   {/* 无锡字样右移，让出十八湾标签位置 */}
   {([[119.83,31.34,'宜兴',0,0],[120.29,31.6,'无锡',127,18],[120.59,31.31,'苏州',0,0],[120.07,30.88,'湖州',0,0]] as const).map(([lon,lat,name,ox,oy])=>{const y=(Math.log(Math.tan(Math.PI/4+31.7*Math.PI/360))-Math.log(Math.tan(Math.PI/4+lat*Math.PI/360)))/(Math.log(Math.tan(Math.PI/4+31.7*Math.PI/360))-Math.log(Math.tan(Math.PI/4+30.15*Math.PI/360)))*1600;const [x,sy]=screen([(lon-119.65)/1.2*1300,y]);return <text key={name} x={x+ox} y={sy+oy} fontSize="29" fill="#fff" opacity=".65" letterSpacing="5">{name}</text>;})}
   {data.stops.slice(0,8).map((s,i)=>{const [x,y]=screen(s.point);const done=i<=active; const a=active===i;const dx=labelDx[i];const dy=labelDy[i];return <g key={s.name} opacity={done?1:.55}>
     <ellipse cx={x} cy={y+4} rx="16" ry="6" fill="#000" opacity=".4"/>
     <line x1={x} y1={y} x2={x} y2={y-28} stroke={done?GOLD:'#d6e4df'} strokeWidth="2"/>
     {a&&<circle cx={x} cy={y} r={19+Math.sin(t*3)*4} fill="none" stroke={GOLD} opacity=".65"/>}
     <circle cx={x} cy={y-30} r="13" fill={done?GOLD:'#22443d'} stroke="#fff6db" strokeWidth="2"/>
     <text x={x} y={y-25} textAnchor="middle" fontSize="14" fontWeight="700" fill={done?'#15312d':'#fff'}>{String(i+1).padStart(2,'0')}</text>
     <g transform={`translate(${x+dx},${y+dy})`} opacity={(meal&&i===7)||(hiking&&i===6)?0:1}><rect x="-10" y="-25" width={i===0?167:181} height="62" rx="7" fill="#0a2225" opacity=".91" stroke={a?GOLD:'#729188'} strokeWidth="1"/>
     <text y="-2" fill={done?GOLD:'#dce8e1'} fontSize="22" fontWeight="600">D{s.day} {s.time} <tspan fontSize="13">{i===0?'出发':'打卡'}</tspan></text><text y="23" fill="#fff" fontSize="19">{s.name.replace(' · ',' / ')}</text></g>
    </g>;})}
   {t>=START&&t<88&&!overnight&&!meal&&!hiking&&<g transform={`translate(${cx},${cy})`}><circle r="18" fill={GOLD} opacity=".18"/><circle r="8" fill="#fffbe9" stroke="#d79a39" strokeWidth="3"/><circle r="3" fill="#e9b94f"/></g>}
  </svg>
  <div style={{position:'absolute',left:66,top:48}}>
   <div style={{fontSize:18,letterSpacing:6,color:GOLD,marginBottom:14}}>ROAD TRIP / 1.5 DAYS · 1 NIGHT</div>
   <div style={{fontSize:62,fontWeight:650,letterSpacing:3}}>杭州出发 · 环太湖</div>
   <div style={{fontSize:24,color:'#b8c9c2',marginTop:14,letterSpacing:3}}>一天半环湖 · 住一晚 · 次日下午返杭</div>
  </div>
  <div style={{position:'absolute',right:50,top:48,width:400,bottom:54,background:'linear-gradient(155deg, rgba(26,52,49,.97),rgba(9,29,31,.97))',border:'1px solid #52655a',borderRadius:24,padding:'30px 32px',boxShadow:'0 25px 70px #0006'}}>
   <div style={{display:'flex',justifyContent:'space-between',fontSize:17,letterSpacing:3,color:'#b7c8bb'}}><span>1.5 天环湖路线</span><span style={{color:GOLD}}>建议时间</span></div>
   <div style={{display:'flex',alignItems:'baseline',gap:14,marginTop:20}}><span style={{fontSize:66,color:GOLD,fontVariantNumeric:'tabular-nums',fontWeight:500}}>{clock(now)}</span><span style={{fontSize:19,color:'#b6c8bc'}}>{overnight?'D1 · 过夜休息':overall>=8?'D2 · 已返杭':`D${day} · ${arrived?'打卡停靠':'行程进行中'}`}</span></div>
   <div style={{fontSize:21,height:32,color:'#e5ebdf',marginTop:2}}>{overnight?'无锡马山 · 酒店 / 露营二选一':notes[active]}</div>
   <div style={{height:1,background:'#506359',margin:'22px 0 16px'}}/>
   {data.stops.map((s,i)=><div key={s.name} style={{height:66,display:'flex',alignItems:'center',gap:17,position:'relative',opacity:i<=active?1:.48}}>
    {i<8&&<div style={{position:'absolute',left:8,top:39,width:1,height:44,background:i<active?GOLD:'#7d9184'}}/>}
    <div style={{width:17,height:17,background:i<=active?GOLD:'#193933',border:'1px solid #b6c3ad',borderRadius:'50%',flexShrink:0,boxShadow:i===active?'0 0 18px #f8d88a88':'none'}}/>
    <div style={{width:73,color:i===active?GOLD:'#dae4d7',fontSize:25,fontVariantNumeric:'tabular-nums'}}>{s.time}</div>
    <div><div style={{fontSize:25,fontWeight:i===active?600:400,color:i===active?'#fff9e9':'#e2ebde'}}>{s.name}</div><div style={{fontSize:14,color:'#a8bdb2',marginTop:3}}>{visits[i]}</div></div>
   </div>)}
   <div style={{borderTop:'1px solid #506359',marginTop:20,paddingTop:20,display:'flex',justifyContent:'space-between'}}><div><span style={{fontSize:35,color:GOLD}}>约 {data.km}</span><span style={{fontSize:17,color:'#b9c9bc'}}> km</span></div><div style={{textAlign:'right',fontSize:18,lineHeight:1.6,color:'#c5d1c4'}}>杭州往返<br/>酒店主线 · 露营备选</div></div>
  </div>
  {overnight&&<div style={{position:'absolute',left:92,top:365,width:1110,background:'linear-gradient(140deg,#102c30f5,#132925f5)',border:'1px solid #b59a62',borderRadius:24,padding:'32px 36px',boxShadow:'0 24px 70px #0008',opacity:interpolate(t,[32,32.6,43.3,44],[0,1,1,0],{extrapolateLeft:'clamp',extrapolateRight:'clamp'})}}>
   <div style={{fontSize:19,color:GOLD,letterSpacing:4}}>D1 → D2 / 一夜停留</div>
   <div style={{fontSize:42,marginTop:12,marginBottom:24}}>16:00 到达马山，今晚慢下来</div>
   <div style={{display:'flex',gap:24}}>
    <div style={{flex:1,border:'1px solid #728d78',borderRadius:16,padding:24,background:'#24443e'}}><div style={{fontSize:19,color:GOLD}}>方案 A · 酒店主线</div><div style={{fontSize:31,marginTop:12}}>马山 · 拈花客栈</div><div style={{fontSize:22,lineHeight:1.75,marginTop:14,color:'#d4e2d6'}}>入住后晚餐、散步与休息<br/>次日 08:00 出发 → 十八湾</div></div>
    <div style={{flex:1,border:'1px solid #728d78',borderRadius:16,padding:24,background:'#24443e'}}><div style={{fontSize:19,color:GOLD}}>方案 B · 露营备选</div><div style={{fontSize:31,marginTop:12}}>常州 · 太湖湾露营谷</div><div style={{fontSize:22,lineHeight:1.75,marginTop:14,color:'#d4e2d6'}}>房车 / 帐篷住宿，提前预约<br/>需走住宿支线，里程另计</div></div>
   </div>
   <div style={{fontSize:18,marginTop:22,color:'#becfc0',lineHeight:1.65}}>住宿二选一；地图展示酒店主线。露营请确认过夜营位与天气，次日提前出发，仍以 16:00 返杭为目标。</div>
  </div>}
  <div style={{position:'absolute',left:66,bottom:52,width:710}}><div style={{display:'flex',gap:18,alignItems:'center'}}><div style={{height:3,width:46,background:GOLD}}/><span style={{fontSize:24,color:GOLD}}>{hiking?'渔洋山麓 · 10:00–12:00 两小时徒步':meal?'七都 · 大闸蟹打卡 · 午餐后从容返杭':overnight?'住一晚，明早 08:00 继续环湖。':storyTime>=72?'D2 16:00 预计返杭，下午从容到家。':t<4?'D1 07:00 杭州出发 · D2 16:00 预计返杭':`${data.stops[li].name}  →  ${data.stops[li+1].name}`}</span></div><div style={{fontSize:15,color:'#a8bdb3',marginTop:15,lineHeight:1.7}}>卫星影像：Esri World Imagery · 道路：© OpenStreetMap / OSRM<br/>时间为建议安排，轨迹为道路规划示意；实际通行与耗时以当天导航为准。</div></div>
  <div style={{position:'absolute',left:68,top:270,fontSize:16,color:'#d2dfd0',letterSpacing:3}}><div style={{fontSize:28,marginBottom:6}}>↑ N</div>斜俯视 · 卫星地图</div>
  <div style={{position:'absolute',left:0,bottom:0,height:4,width:`${Math.min(100,t/100*100)}%`,background:GOLD}}/>
  <Sequence name="渔洋山两小时徒步" from={57*fps} durationInFrames={8*fps} premountFor={fps}><HikeStop/></Sequence>
  <Sequence name="七都美食打卡图片提示卡" from={72*fps} durationInFrames={8*fps} premountFor={fps}><CrabLunch/></Sequence>
 </AbsoluteFill>;
};
