import React from 'react';
import {interpolate,useCurrentFrame,useVideoConfig} from 'remotion';
import data from './map-data.json';
const [x,y]=data.stops[6].point;
const ax=-20+720+.94*(.94*x+.14*y-3-720),ay=570+.94*(-.1*x+.52*y+219-570);
export const HikeStop: React.FC=()=>{
 const f=useCurrentFrame();const {fps}=useVideoConfig();const t=f/fps;
 return <div style={{position:'absolute',inset:0,pointerEvents:'none',fontFamily:'"PingFang SC",sans-serif',opacity:interpolate(t,[0,.3,7.6,8],[0,1,1,0],{extrapolateLeft:'clamp',extrapolateRight:'clamp'})}}>
  <svg width="1920" height="1080" style={{position:'absolute'}}><circle cx={ax} cy={ay} r="21" fill="#f8d88a22" stroke="#f8d88a" strokeWidth="2"/><path d={`M${ax+22} ${ay}H900L931 398`} fill="none" stroke="#f8d88a" strokeWidth="2" strokeDasharray="5 5"/></svg>
  <div style={{position:'absolute',left:930,top:375,width:450,border:'1px solid #e8c77d',borderRadius:16,background:'#102b2af5',color:'#f4efda',boxShadow:'0 16px 50px #0008',overflow:'hidden'}}>
   <div style={{padding:'17px 22px',color:'#f8d88a',fontSize:19}}>徒步打卡 / 渔洋山麓</div>
   <svg width="450" height="145" viewBox="0 0 450 145"><rect width="450" height="145" fill="#264d43"/><path d="M0 123L100 31 179 107 272 15 420 135" fill="#53765b"/><path d="M80 145Q210 102 204 88T275 45" fill="none" stroke="#d9c28c" strokeWidth="5" strokeDasharray="8 7"/><g stroke="#bfd0ac" strokeWidth="5" fill="none"><circle cx="294" cy="42" r="8" fill="#e4cea0" stroke="none"/><path d="M289 55L278 82 294 95 302 116M278 82L266 110M289 59L308 76 320 62M321 62L322 117"/></g></svg>
   <div style={{padding:'19px 22px 23px'}}><div style={{fontSize:29,fontWeight:600}}>停好车，走进湖山。</div><div style={{fontSize:23,color:'#f8d88a',marginTop:12}}>D2 10:00–12:00 · 徒步 2 小时</div><div style={{fontSize:18,color:'#d1dec8',lineHeight:1.8,marginTop:10}}>选择现场开放步道，休闲往返<br/>12:00–12:30 茶歇休整，再去七都吃蟹</div></div>
  </div>
 </div>;
};
