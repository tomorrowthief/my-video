import { AbsoluteFill, Composition, Folder, interpolate, useCurrentFrame, useVideoConfig } from 'remotion';
import * as k from './kit/iso-kit';
import { NeuronComposition } from './NeuronAnatomy';

// Anatomy's MIT-licensed geometry kit. Every pose is a pure function of video time.
const P: k.Projection = {origin: [670, 290], scale: 2.1, azimuth: 42, elevation: 34};
const at = (p: k.Point3) => k.iso(p, P);
const solid = (paths: k.SolidPaths, tone: k.Tone = 'mid') => k.solidSvg(paths, {tone});
const box = (x:number,y:number,w:number,d:number,z:number,h:number,t:k.Tone='mid') => solid(k.slabOf({x,y,w,d,r:2},z,h,P,6,0.7),t);
const cyl = (x:number,y:number,r:number,z:number,h:number,t:k.Tone='mid') => solid(k.cylinder(x,y,r,z,h,P,48,0.5),t);
const TAU = Math.PI*2;
const smooth = (t:number,a:number,b:number) => {const q=Math.max(0,Math.min(1,(t-a)/(b-a)));return q*q*(3-2*q);};

function machine(t:number, accent:string) {
  const lift=54*smooth(t,0.8,3.4);
  // Continuous angle and continuous speed across the drive-to-regen handoff.
  const a=t<10?t*1.4:14+1.4*(t-10)-0.045*(t-10)**2;
  const out:string[]=[];
  for(const x of [-142,130])for(const y of [-78,74]) out.push(cyl(x,y,8,-15,6,'lo'));
  out.push(box(-160,-95,320,190,-9,9,'lo'));
  for(const x of [-148,148])for(const y of [-83,83])out.push(cyl(x,y,2,0,1,'hi'));
  // Battery case, cell caps, terminal posts, and inverter with cooling fins.
  out.push(box(-142,-63,72,112,0,30));
  for(let i=0;i<6;i++)out.push(box(-137,-57+i*17,61,13,30,2,'lo'));
  out.push(cyl(-125,-47,3,32,6,'hi'),cyl(-85,31,3,32,6,'hi'));
  out.push(box(-51,-70,45,53,0,23));
  for(let i=0;i<8;i++)out.push(box(-48+i*5,-66,2,45,23,4,'hi'));
  // Mechanically mounted, open stator. Coils surround a smaller rotor with air gap.
  for(const x of [25,101])for(const y of [-38,38])out.push(box(x-7,y-7,14,14,0,16,'lo'),cyl(x,y,2,16,2,'hi'));
  out.push(cyl(63,0,47,16,7,'lo'),cyl(63,0,42,23,2,'hi'));
  const coils = Array.from({length:18},(_,i)=>({theta:i*TAU/18})).sort((a,b)=>{
    const pa=at([63+35*Math.cos(a.theta),35*Math.sin(a.theta),25]);
    const pb=at([63+35*Math.cos(b.theta),35*Math.sin(b.theta),25]);return pa[1]-pb[1];
  });
  // Rear coils, rotor, then front coils: opaque solids preserve the cutaway.
  const coil=(q:number)=>{
    const x=63+35*Math.cos(q), y=35*Math.sin(q);
    let s=box(x-4,y-4,8,8,25,29,'hi');
    for(let j=0;j<5;j++)s+=box(x-4.5,y-4.5,9,9,27+j*5,1,'lo');return s;
  };
  for(const c of coils.filter(c=>Math.cos(c.theta)*Math.cos(42*Math.PI/180)+Math.sin(c.theta)*Math.sin(42*Math.PI/180)<0))out.push(coil(c.theta));
  out.push(cyl(63,0,23,25,29,'hi'));
  for(let i=0;i<10;i++){
    const q=a+i*TAU/10;
    out.push(cyl(63+18*Math.cos(q),18*Math.sin(q),2.3,54,1,'lo'));
  }
  out.push(cyl(63,0,7,54,18,'hi'));
  const mark=at([63+17*Math.cos(a),17*Math.sin(a),55]);
  out.push(`<circle cx="${mark[0]}" cy="${mark[1]}" r="4" fill="${accent}"/>`);
  for(const c of coils.filter(c=>Math.cos(c.theta)*Math.cos(42*Math.PI/180)+Math.sin(c.theta)*Math.sin(42*Math.PI/180)>=0))out.push(coil(c.theta));
  // Exploded protective cover, supported by the original mounting bolt pattern.
  out.push(cyl(63,0,47,58+lift,5,'lo'),cyl(63,0,34,63+lift,2,'mid'));
  for(let i=0;i<8;i++){
    const q=i*TAU/8;out.push(cyl(63+41*Math.cos(q),41*Math.sin(q),1.8,63+lift,2,'hi'));
  }
  // Recessed scale strip and fasteners give the bench a readable real construction.
  out.push(box(-135,67,264,12,0,1,'lo'));
  for(let i=0;i<=52;i++){
    const x=-132+i*5;
    out.push(k.lineSvg(k.segment([x,79,1],[x,79-(i%5===0?8:4),1],P),{tone:i%5===0?'mid':'lo'}));
  }
  return out.join('');
}

export const MotorAnatomy:React.FC=()=>{
  const frame=useCurrentFrame();const {fps}=useVideoConfig();const t=frame/fps;
  const regen=t>=10;const accent=regen?'#78dfb0':'#91caff';
  const chapter=t<4?0:t<10?1:t<17?2:3;
  const title=['打开电机，看看里面','电能，让转子动起来','车轮带动电机，回收能量','同一台电机，两种能量方向'][chapter];
  const caption=['外壳展开 · 定子围绕转子，二者之间留有气隙','电池经逆变器供电，电机产生转矩，驱动车轮','减速时电机产生制动转矩，将部分动能转为电能','转子继续向前旋转，改变的是转矩与能量传递方向'][chapter];
  const fade=interpolate(frame,[0,20],[0,1],{extrapolateRight:'clamp'});
  return <AbsoluteFill style={{background:'#0b1117',color:'#e6edf3',fontFamily:'"PingFang SC", sans-serif',opacity:fade}}>
    <style>{k.ISO_CSS + `.motor-art{--anatomy-paper:#354656;--anatomy-shade-0:#182630;--anatomy-shade-1:#223442;--anatomy-shade-2:#3c5162;--anatomy-shade-3:#4b6275;--anatomy-top:#566d80}`}</style>
    <div style={{position:'absolute',left:88,top:62,fontSize:20,letterSpacing:5,color:'#8a9aa9'}}>ANATOMY / 电驱实验室</div>
    <div style={{position:'absolute',left:88,top:113,fontSize:52,fontWeight:600}}>{title}</div>
    <div style={{position:'absolute',right:90,top:78,color:accent,fontSize:21}}>FIG. 01 / {String(chapter+1).padStart(2,'0')}</div>
    <div style={{position:'absolute',left:80,top:213,width:1760,height:672,border:'1px solid #2a3743',borderRadius:20,background:'radial-gradient(ellipse at 50% 65%, #1b2934 0%, #101820 65%)'}}>
      <svg className="iso motor-art" viewBox="0 0 1600 640" width="100%" height="100%">
        <g dangerouslySetInnerHTML={{__html:machine(t,accent)}} />
      </svg>
      <div style={{position:'absolute',right:50,top:58,width:290}}>
        <div style={{color:'#8a9aa9',fontSize:18,letterSpacing:3}}>工作状态</div>
        <div style={{color:accent,fontSize:36,marginTop:14}}>{t<4?'结构展开':regen?'再生制动':'电机驱动'}</div>
        <div style={{height:1,background:'#32404a',margin:'25px 0'}}/>
        {['01  动力电池','02  逆变器','03  定子绕组','04  转子与输出轴'].map(s=><div key={s} style={{fontSize:23,marginBottom:18,color:'#a9b8c6'}}>{s}</div>)}
        <div style={{fontSize:17,color:'#738697',lineHeight:1.8,marginTop:25}}>结构与运动为原理示意<br/>不表示实测转速或效率</div>
      </div>
      <div style={{position:'absolute',left:40,right:40,bottom:30,display:'flex',alignItems:'center',gap:22}}>
        {(regen?['车轮','电机发电','电力转换','电池']:['电池','逆变器','驱动电机','车轮']).map((s,i)=><div key={s} style={{display:'flex',alignItems:'center',gap:22}}>
          <div style={{border:'1px solid #3b4b57',borderRadius:8,padding:'10px 24px',fontSize:22,color:accent}}>{s}</div>
          {i<3?<svg width="65" height="22"><path d="M 0 11 H 62 M 53 4 L 62 11 L 53 18" fill="none" stroke={accent} strokeWidth="1.5"/>{Array.from({length:3},(_,j)=><circle key={j} cx={((t*30+j*22)%60)} cy={11} r={2.7} fill={accent}/>)}</svg>:null}
        </div>)}
      </div>
    </div>
    <div style={{position:'absolute',left:88,top:925,fontSize:29}}>{caption}</div>
    <div style={{position:'absolute',left:88,top:987,fontSize:18,color:'#7f91a0'}}>回收能力受电池与工况限制，仍需摩擦制动。能量点表示传递方向。</div>
    <div style={{position:'absolute',bottom:0,left:0,height:4,width:`${t/20*100}%`,background:accent}}/>
  </AbsoluteFill>;
};
export const AnatomyCompositions:React.FC=()=> <Folder name="Anatomy"><Composition id="MotorAnatomy" component={MotorAnatomy} durationInFrames={600} fps={30} width={1920} height={1080}/><NeuronComposition/></Folder>;
