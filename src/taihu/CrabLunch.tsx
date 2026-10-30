import React from 'react';
import {Easing,Img,interpolate,staticFile,useCurrentFrame,useVideoConfig} from 'remotion';
import data from './map-data.json';

// Share the fixed map's projection so the callout stays attached to Qidu.
const [mapX,mapY]=data.stops[7].point;
const anchorX=-20+720+.94*(.94*mapX+.14*mapY-3-720);
const anchorY=570+.94*(-.10*mapX+.52*mapY+219-570);

export const CrabLunch: React.FC = () => {
 const frame=useCurrentFrame();const {fps}=useVideoConfig();const t=frame/fps;
 const enter=interpolate(t,[0,.4],[0,1],{extrapolateLeft:'clamp',extrapolateRight:'clamp',easing:Easing.bezier(.23,1,.32,1)});
 const opacity=interpolate(t,[0,.25,7.65,8],[0,1,1,0],{extrapolateLeft:'clamp',extrapolateRight:'clamp'});
 return <div style={{position:'absolute',inset:0,fontFamily:'"PingFang SC", "Microsoft YaHei", sans-serif',color:'#f4efda',pointerEvents:'none',opacity}}>
  <svg width="1920" height="1080" style={{position:'absolute',inset:0}}>
   <circle cx={anchorX} cy={anchorY} r={19+Math.sin(t*3)*3} fill="#f8d88a22" stroke="#f8d88a" strokeWidth="2"/>
   <circle cx={anchorX} cy={anchorY} r="7" fill="#f8d88a" stroke="#fff6da" strokeWidth="2"/>
   <path d={`M${anchorX+20} ${anchorY}H900L931 592`} fill="none" stroke="#f8d88a" strokeWidth="2" strokeDasharray="5 5"/>
  </svg>
  <div style={{position:'absolute',left:930,top:570,width:450,border:'1px solid #e8c77d',borderRadius:16,background:'#102b2af5',boxShadow:'0 16px 50px #0008',transformOrigin:'0 20px',transform:`translateY(${(1-enter)*12}px) scale(${.96+.04*enter})`}}>
   <div style={{position:'absolute',left:-8,top:18,width:14,height:14,background:'#102b2a',borderLeft:'1px solid #e8c77d',borderBottom:'1px solid #e8c77d',transform:'rotate(45deg)'}}/>
   <div style={{padding:'16px 20px',display:'flex',justifyContent:'space-between',alignItems:'center',fontSize:18,color:'#f8d88a',letterSpacing:1}}><span>美食打卡 / 苏州 · 七都</span><span style={{fontSize:15}}>D2 13:40</span></div>
   <Img src={staticFile('taihu/crab-feast.png')} style={{display:'block',width:'100%',height:174,objectFit:'cover',objectPosition:'78% 55%'}}/>
   <div style={{padding:'16px 20px 18px'}}><div style={{fontSize:29,fontWeight:600}}>太湖大闸蟹，开席！</div><div style={{fontSize:19,color:'#d0ddc8',marginTop:8}}>13:40–14:30 · 清蒸蟹 / 姜丝醋 / 热茶</div><div style={{fontSize:16,color:'#f8d88a',marginTop:10}}>14:30 返杭 · 16:00 预计到家</div><div style={{fontSize:12,color:'#9eb9a5',marginTop:9}}>AI 美食示意 · 未指定餐厅</div></div>
  </div>
 </div>;
};
