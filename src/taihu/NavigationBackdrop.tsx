import React from 'react';
import {AbsoluteFill,Freeze} from 'remotion';
import {TaihuMap} from './TaihuMap';

/** All introductory scenes share the exact final navigation layout, frozen. */
export const NavigationBackdrop: React.FC = () => {
 return <AbsoluteFill style={{overflow:'hidden',pointerEvents:'none'}}>
  <AbsoluteFill style={{filter:'blur(6px)',opacity:.63,transform:'scale(1.025)'}}><Freeze frame={0}><TaihuMap snapshot/></Freeze></AbsoluteFill>
  <AbsoluteFill style={{background:'linear-gradient(90deg,#071b20aa,#071b2044 65%,#071b2088)'}}/>
 </AbsoluteFill>;
};
