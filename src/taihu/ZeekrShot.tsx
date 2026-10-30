import React from 'react';
import {AbsoluteFill,Easing,Img,interpolate,staticFile,useCurrentFrame,useVideoConfig} from 'remotion';
import {NavigationBackdrop} from './NavigationBackdrop';

export const ZeekrShot: React.FC = () => {
 const frame=useCurrentFrame();const {fps}=useVideoConfig();const t=frame/fps;
 const reveal=interpolate(t,[.1,.85],[0,1],{extrapolateLeft:'clamp',extrapolateRight:'clamp',easing:Easing.bezier(.23,1,.32,1)});
 const trunk=interpolate(t,[4.75,5.2],[0,1],{extrapolateLeft:'clamp',extrapolateRight:'clamp'});
 return <AbsoluteFill style={{background:'#09191c',fontFamily:'"PingFang SC", "Microsoft YaHei", sans-serif',color:'#eef3df',overflow:'hidden'}}>
  <NavigationBackdrop/>
  <div style={{position:'absolute',left:90,top:80,fontSize:22,letterSpacing:6,color:'#f8d88a',opacity:reveal}}>OUR RIDE / 环湖座驾</div>
  <div style={{position:'absolute',left:88,top:238,width:535,opacity:reveal*(1-trunk),transform:`translateY(${(1-reveal)*22}px)`}}>
   <div style={{fontSize:104,lineHeight:1.15,fontWeight:650,letterSpacing:2}}>极氪 7X</div>
   <div style={{fontSize:34,lineHeight:1.7,marginTop:27}}>这趟环湖，<br/>我们开它。</div>
   <div style={{fontSize:23,marginTop:40,color:'#d0ddc7'}}>SUV / 伙伴同行</div>
  </div>
  <div style={{position:'absolute',left:650,top:196,width:1180,height:665,border:'1px solid #b49d68',borderRadius:20,overflow:'hidden',boxShadow:'0 22px 65px #0009',opacity:reveal,transform:`translateY(${(1-reveal)*20}px)`}}>
   <Img src={staticFile('taihu/zeekr7x-exterior.jpg')} style={{position:'absolute',width:'100%',height:'100%',objectFit:'cover'}}/>
   <Img src={staticFile('taihu/zeekr7x-trunk.jpg')} style={{position:'absolute',width:'100%',height:'100%',objectFit:'cover',opacity:trunk}}/>
   <div style={{position:'absolute',left:24,top:22,background:'#102b2bcc',border:'1px solid #d5c18d77',borderRadius:6,padding:'9px 15px',fontSize:17,color:'#fff3cd',letterSpacing:3}}>ZEEKR 7X</div>
   <div style={{position:'absolute',bottom:15,right:22,fontSize:13,color:'#173a3c'}}>车型素材：极氪官网 · 展示用图</div>
  </div>
  <div style={{position:'absolute',left:90,top:225,width:520,opacity:trunk}}>
   <div style={{fontSize:20,color:'#f8d88a',letterSpacing:4}}>READY TO PACK / 准备装车</div>
   <div style={{fontSize:61,lineHeight:1.4,fontWeight:600,marginTop:28}}>把周末，<br/>装进后备厢。</div>
   <div style={{fontSize:25,lineHeight:1.9,color:'#d7e4d3',marginTop:31}}>行李、干粮、喝茶装备<br/>逐件装好，马上出发。</div>
   <div style={{fontSize:20,color:'#f8d88a',marginTop:39}}>接下来 / 出征装备准备清单 →</div>
  </div>
  <div style={{position:'absolute',left:92,bottom:85,right:92,borderTop:'1px solid #9aaa7c77',paddingTop:24,display:'flex',justifyContent:'space-between',fontSize:26,color:'#e3e9d6',opacity:reveal}}><span>一辆 SUV，载上几个人的周末。</span><span style={{color:'#f8d88a'}}>杭州 → 环太湖</span></div>
 </AbsoluteFill>;
};
