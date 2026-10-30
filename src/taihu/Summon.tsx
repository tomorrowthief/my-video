import React from 'react';
import {AbsoluteFill,Easing,interpolate,useCurrentFrame,useVideoConfig} from 'remotion';
import {NavigationBackdrop} from './NavigationBackdrop';

export const Summon: React.FC = () => {
 const frame=useCurrentFrame();const {fps}=useVideoConfig();const t=frame/fps;
 const enter=(start:number)=>interpolate(t,[start,start+.65],[0,1],{extrapolateLeft:'clamp',extrapolateRight:'clamp',easing:Easing.bezier(.23,1,.32,1)});
 return <AbsoluteFill style={{background:'#07191c',fontFamily:'"PingFang SC", "Microsoft YaHei",sans-serif',color:'#f3f3de',overflow:'hidden'}}>
  <NavigationBackdrop/>
  <svg width="1920" height="1080" style={{position:'absolute',opacity:.45}}><g transform="translate(1550 400)" fill="none" stroke="#f8d88a">{[200,310,420].map((r,i)=><circle key={r} r={r+(t*20+i*12)%45} strokeWidth="1" opacity={.5-i*.1}/>)}<path d="M-520 0H520M0-520V520" opacity=".28"/></g><path d="M1040 1050Q1260 780 1570 810T1970 200" fill="none" stroke="#f8d88a" strokeWidth="3" strokeDasharray="8 16" opacity=".6"/></svg>
  <div style={{position:'absolute',left:105,top:84,color:'#f8d88a',fontSize:23,letterSpacing:8,opacity:enter(.1)}}>TAI LAKE / 周末远征队 · 征召令</div>
  <div style={{position:'absolute',left:97,top:178,opacity:enter(.35),transform:`translateY(${(1-enter(.35))*45}px)`}}>
   <div style={{fontSize:110,lineHeight:1.1,fontWeight:700,letterSpacing:8}}>环太湖</div>
   <div style={{fontSize:186,lineHeight:1.14,fontWeight:800,letterSpacing:12,color:'#f8d88a'}}>出征！</div>
  </div>
  <div style={{position:'absolute',left:110,top:557,fontSize:32,color:'#d2e1ce',letterSpacing:4,opacity:enter(.9)}}>征召几位伙伴，一起奔赴湖光。</div>
  <div style={{position:'absolute',left:1130,top:205,width:600,opacity:enter(1.1)}}>
   <div style={{fontSize:24,color:'#f8d88a',letterSpacing:5}}>周末远征队 / 正在征集</div>
   <div style={{marginTop:35}}>{[['驾驶组','司机就位 · 轮换驾驶'],['补给组','干粮入列 · 行李集结'],['茶友组','带上好茶 · 湖边会合']].map(([role,detail],i)=><div key={role} style={{display:'flex',gap:25,alignItems:'center',borderBottom:'1px solid #728168',padding:'23px 0',opacity:enter(1.25+i*.15),transform:`translateX(${(1-enter(1.25+i*.15))*35}px)`}}><span style={{fontSize:28,color:'#f8d88a',border:'1px solid #83916d',padding:'10px 18px'}}>{role}</span><span style={{fontSize:25,color:'#d2e1ce'}}>{detail}</span></div>)}</div>
   <div style={{display:'inline-block',marginTop:33,border:'3px solid #f8d88a',padding:'8px 26px',fontSize:35,fontWeight:650,letterSpacing:9,color:'#f8d88a',transform:'rotate(-7deg)',opacity:enter(2.05)}}>征 募 中</div>
  </div>
  <div style={{position:'absolute',left:108,right:108,bottom:112,borderTop:'1px solid #718065',paddingTop:30,display:'flex',justifyContent:'space-between',alignItems:'center',opacity:enter(2.25)}}><div><div style={{fontSize:37,fontWeight:600}}>杭州出发 / 一天半 / 住一晚</div><div style={{fontSize:24,marginTop:15,color:'#bdcfba'}}>{'D1 07:00 集合出发　→　D2 16:00 预计返杭'}</div></div><div style={{fontSize:31,color:'#f8d88a',border:'1px solid #bca165',padding:'22px 34px',borderRadius:6}}>响应征召，一起出发 →</div></div>
  <AbsoluteFill style={{background:'#09191c',opacity:interpolate(t,[5.65,6],[0,1],{extrapolateLeft:'clamp',extrapolateRight:'clamp'})}}/>
 </AbsoluteFill>;
};
