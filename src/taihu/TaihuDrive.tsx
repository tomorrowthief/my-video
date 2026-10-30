import React from 'react';
import {AbsoluteFill, Audio, Composition, Sequence, interpolate, staticFile, useVideoConfig} from 'remotion';
import {Preparation} from './Preparation';
import {Summon} from './Summon';
import {ZeekrShot} from './ZeekrShot';
import {LakeOverview} from './LakeOverview';
import {CrabLunch} from './CrabLunch';
import {TaihuMap} from './TaihuMap';

export const TaihuDrive: React.FC = () => {
 const {fps,durationInFrames}=useVideoConfig();
 return <AbsoluteFill>
  <Sequence name="环太湖集结召唤" durationInFrames={6*fps} premountFor={fps}><Summon/></Sequence>
  <Sequence name="极氪7X座驾亮相与装车" from={6*fps} durationInFrames={8*fps} premountFor={fps}><ZeekrShot/></Sequence>
  <Sequence name="出征准备：伙伴、司机、干粮与茶具" from={14*fps} durationInFrames={6*fps} premountFor={fps}><Preparation/></Sequence>
  <Sequence name="固定机位环太湖：一天半一夜" from={23*fps} durationInFrames={100*fps} premountFor={fps}><TaihuMap/></Sequence>
  <Sequence name="手绘太湖鸟瞰 LET’S GO" from={20*fps} durationInFrames={4*fps} premountFor={fps} style={{zIndex:10}}><LakeOverview/></Sequence>
  <Audio src={staticFile('taihu/roadtrip-bgm.m4a')} volume={(f)=>interpolate(f,[0,2*fps,durationInFrames-3*fps,durationInFrames],[0,.65,.65,0],{extrapolateLeft:'clamp',extrapolateRight:'clamp'})}/>
 </AbsoluteFill>;
};
export const TaihuComposition = () => <>
 <Composition id="TaihuDayDrive" component={TaihuDrive} durationInFrames={3690} fps={30} width={1920} height={1080}/>
 <Composition id="TaihuSummon" component={Summon} durationInFrames={180} fps={30} width={1920} height={1080}/>
 <Composition id="TaihuZeekr7X" component={ZeekrShot} durationInFrames={240} fps={30} width={1920} height={1080}/>
 <Composition id="TaihuLakeOverview" component={LakeOverview} durationInFrames={120} fps={30} width={1920} height={1080}/>
 <Composition id="TaihuCrabLunch" component={CrabLunch} durationInFrames={240} fps={30} width={1920} height={1080}/>
 <Composition id="TaihuPreparation" component={Preparation} durationInFrames={180} fps={30} width={1920} height={1080}/>
</>;
