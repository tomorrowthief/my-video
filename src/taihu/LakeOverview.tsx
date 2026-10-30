import React from 'react';
import {AbsoluteFill,Easing,Img,interpolate,staticFile,useCurrentFrame,useVideoConfig} from 'remotion';

/** Only the color illustration and one centered, unbroken title. */
export const LakeOverview: React.FC = () => {
 const frame=useCurrentFrame();const {fps}=useVideoConfig();const t=frame/fps;
 const title=interpolate(t,[.15,.55],[0,1],{extrapolateLeft:'clamp',extrapolateRight:'clamp',easing:Easing.bezier(.23,1,.32,1)});
 return <AbsoluteFill style={{background:'#e6e7ce',overflow:'hidden',opacity:interpolate(t,[0,.2,3.65,4],[0,1,1,0],{extrapolateLeft:'clamp',extrapolateRight:'clamp'})}}>
  <Img src={staticFile('taihu/taihu-handpainted.png')} style={{width:'100%',height:'100%',objectFit:'cover'}}/>
  <AbsoluteFill style={{display:'flex',alignItems:'center',justifyContent:'center',opacity:title}}>
   <div style={{fontFamily:'"Arial Black", "Helvetica Neue", sans-serif',fontSize:190,lineHeight:1,fontWeight:900,letterSpacing:-5,whiteSpace:'nowrap',color:'#ffffff',textShadow:'0 4px 28px #123f3e88'}}>LET’S GO!</div>
  </AbsoluteFill>
 </AbsoluteFill>;
};
