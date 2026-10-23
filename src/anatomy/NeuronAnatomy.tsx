import {AbsoluteFill, Composition, interpolate, useCurrentFrame, useVideoConfig} from 'remotion';
import * as k from './kit/iso-kit';
import {neuronAt} from './neuron-model';

const BLUE='#91caff', GREEN='#9ce7bb', AMBER='#e9b984';
const P:k.Projection={origin:[620,360],scale:1.75,azimuth:57,elevation:42};
const pt=(x:number,y:number,z:number)=>k.iso([x,y,z],P);
const box=(x:number,y:number,w:number,d:number,z:number,h:number,t:k.Tone='mid')=>k.solidSvg(k.slabOf({x,y,w,d,r:3},z,h,P,6,1),{tone:t});
const cyl=(x:number,y:number,r:number,z:number,h:number,t:k.Tone='mid')=>k.solidSvg(k.cylinder(x,y,r,z,h,P,48,0.5),{tone:t});
const line=(a:k.Point3,b:k.Point3,t:k.LineTone='mid')=>k.lineSvg(k.segment(a,b,P),{tone:t});
const fmt=(n:number)=> (Math.abs(n)<0.00001?0:n).toFixed(2);
const phaseAt=(s:number)=>s<5?0:s<11?1:s<16?2:s<21?3:4;
const titles=['一个神经元，如何计算？','先乘权重，决定每路影响','相加，再加上偏置','经过 ReLU，负数归零','调大一个权重，输出随之改变'];
const subtitles=['两个输入 → 加权求和 → 激活函数 → 一个输出','权重可以为负：这一路会降低总和。','偏置移动激活门槛；它同样参与数值计算。','ReLU(z) = max(0, z)。正数保留，负数变成 0。','这里只演示参数调整；训练还需要损失函数与梯度更新。'];

function bench(s:number) {
 const m=neuronAt(s),out:string[]=[];
 for(const x of [-225,225])for(const y of [-100,100])out.push(cyl(x,y,8,-16,7,'lo'));
 out.push(box(-245,-120,490,240,-9,9,'lo'));
 for(const x of [-232,232])for(const y of [-107,107])out.push(cyl(x,y,2,0,1,'hi'));
 // Conductors run on the bench, below their mounted terminal blocks.
 const routes:k.Point3[][]=[ [[-160,-65,3],[-90,-65,3],[-90,-22,3],[20,-22,3]], [[-160,65,3],[-65,65,3],[-65,22,3],[20,22,3]], [[62,0,3],[114,0,3]], [[155,0,3],[210,0,3]] ];
 for(const route of routes){out.push(k.lineSvg(k.pathOf(route.map(p=>k.iso(p,P))),{tone:'hi'}));}
 // Two weight stations: supported posts, dial bezels, screws and knurled crowns.
 for(const [y,value] of [[-65,m.w1],[65,m.w2]]) {
   out.push(box(-212,y-29,80,58,0,18));
   for(const x of [-205,-139])for(const dy of [-21,21])out.push(cyl(x,y+dy,1.5,18,1,'hi'));
   out.push(cyl(-172,y,23,18,4,'lo'),cyl(-172,y,19,22,3,'hi'));
   for(let j=0;j<20;j++) {
    const a=j*Math.PI/10;
    out.push(line([-172+17*Math.cos(a),y+17*Math.sin(a),25],[-172+19*Math.cos(a),y+19*Math.sin(a),25],'lo'));
   }
   const a=(value*0.65-0.5)*Math.PI;
   out.push(line([-172,y,26],[-172+16*Math.cos(a),y+16*Math.sin(a),26],'lit'));
   out.push(cyl(-172,y,4,25,6,'hi'));
   for(let j=0;j<12;j++){const a=j*Math.PI/6;out.push(cyl(-172+4*Math.cos(a),y+4*Math.sin(a),0.4,28,3,'lo'));}
   out.push(box(-132,y-6,8,12,0,8,'hi'));
 }
 // Summing instrument, three input sockets and its zero-centred mechanical gauge.
 out.push(box(-14,-44,87,88,0,24));
 for(const x of [-7,66])for(const y of [-36,36])out.push(cyl(x,y,1.6,24,1,'hi'));
 out.push(cyl(30,0,32,24,4,'lo'),cyl(30,0,28,28,1,'hi'));
 for(let j=0;j<=24;j++) {
  const a=(j/24*1.5+0.25)*Math.PI;
  out.push(line([30+24*Math.cos(a),24*Math.sin(a),30],[30+27*Math.cos(a),27*Math.sin(a),30],j%4?'lo':'hi'));
 }
 const a=(m.z*1.5-0.5)*Math.PI;
 out.push(line([30,0,31],[30+23*Math.cos(a),23*Math.sin(a),31],'lit'),cyl(30,0,3,30,2,'hi'));
 // Activation gate: a fixed threshold and a slider driven by the actual ReLU output.
 out.push(box(102,-39,65,78,0,19));
 for(const x of [109,160])out.push(box(x,-31,3,62,19,4,'hi'));
 out.push(box(115,-30+Math.min(1,m.output/0.4)*48,40,10,23,8,'hi'));
 for(let i=0;i<=10;i++)out.push(line([160,-28+i*5,24],[i%5?156:153,-28+i*5,24],'mid'));
 out.push(cyl(212,0,22,0,14,'lo'),cyl(212,0,17,14,4,'hi'));
 const glow=pt(212,0,19);
 out.push(`<circle cx="${glow[0]}" cy="${glow[1]}" r="${8+m.output*22}" fill="${m.output>0?GREEN:'#536476'}" opacity="0.9"/>`);
 // A bias trim module is seated behind the summing instrument.
 out.push(box(-17,-102,73,28,0,12,'lo'),cyl(20,-88,8,12,7,'hi'));
 // Pulse position denotes calculation progress, not electrical current.
 for(let r=0;r<routes.length;r++) {
  if(s<5+r*3 || (r===3 && m.output<=0))continue;
  const route=routes[r];
  const lengths=route.slice(1).map((p,i)=>Math.hypot(p[0]-route[i][0],p[1]-route[i][1],p[2]-route[i][2]));
  const total=lengths.reduce((a,b)=>a+b,0);
  for(let j=0;j<2;j++) {
   let remaining=((s*0.48+j*0.5)%1)*total;
   for(let i=0;i<lengths.length;i++) {
    if(remaining<=lengths[i]) {
     const a=route[i],b=route[i+1],q=remaining/lengths[i];
     const xy=pt(a[0]+(b[0]-a[0])*q,a[1]+(b[1]-a[1])*q,a[2]+(b[2]-a[2])*q+1);
     out.push(`<circle cx="${xy[0]}" cy="${xy[1]}" r="3.5" fill="${r===3?GREEN:BLUE}"/>`);break;
    }
    remaining-=lengths[i];
   }
  }
 }
 return out.join('');
}

export const NeuronAnatomy:React.FC=()=>{
 const f=useCurrentFrame(),{fps}=useVideoConfig(),s=f/fps,m=neuronAt(s),phase=phaseAt(s);
 const accent=phase===4?GREEN:BLUE;
 const row=(label:string,value:string,color=BLUE)=><div style={{display:'flex',justifyContent:'space-between',alignItems:'baseline',padding:'10px 0',borderBottom:'1px solid #283543'}}><span style={{fontSize:23,color:'#a9bac9'}}>{label}</span><span style={{fontSize:33,color,fontVariantNumeric:'tabular-nums'}}>{value}</span></div>;
 return <AbsoluteFill style={{background:'#0a1017',color:'#edf3f8',fontFamily:'"PingFang SC",sans-serif'}}>
  <style>{k.ISO_CSS+`.neuron-art{--anatomy-paper:#304354;--anatomy-shade-0:#162633;--anatomy-shade-1:#243747;--anatomy-shade-2:#41596b;--anatomy-shade-3:#506a7d;--anatomy-top:#5a7386}`}</style>
  <div style={{position:'absolute',left:80,top:55,color:'#8ea7ba',fontSize:19,letterSpacing:5}}>ANATOMY / 神经元计算实验台</div>
  <div style={{position:'absolute',left:80,top:105,fontSize:49,fontWeight:600}}>{titles[phase]}</div>
  <div style={{position:'absolute',right:80,top:68,color:accent,fontSize:21}}>FIG. 02 / {String(phase+1).padStart(2,'0')}</div>
  <div style={{position:'absolute',left:80,top:204,width:1170,height:616,border:'1px solid #293b4c',borderRadius:20,background:'radial-gradient(ellipse at 50% 60%,#1b2d3b,#101923 75%)'}}>
   <svg className="iso neuron-art" width="100%" height="100%" viewBox="0 0 1240 650"><g dangerouslySetInnerHTML={{__html:bench(s)}}/></svg>
   <div style={{position:'absolute',top:28,left:32,color:'#93a9bb',fontSize:19}}>输入与权重旋钮 / 求和仪表 / 激活闸门</div>
   <div style={{position:'absolute',bottom:28,left:32,right:32,display:'flex',justifyContent:'space-between',color:'#aac0d1',fontSize:21}}><span>x₁ = 0.80 / x₂ = 0.40</span><span>机械装置为计算隐喻</span></div>
  </div>
  <div style={{position:'absolute',left:1290,top:204,width:470,height:616,padding:'28px 32px',border:'1px solid #293b4c',borderRadius:20,background:'#111c26'}}>
   <div style={{fontSize:19,letterSpacing:3,color:'#8ea7ba'}}>同一组计算 · 实时读数</div>
   {row(`0.80 × ${fmt(m.w1)}`,fmt(m.p1))}
   {row('0.40 × (−0.75)',fmt(m.p2),AMBER)}
   {row('偏置 b',fmt(m.bias),AMBER)}
   {row('加权和 z',fmt(m.z),m.z>0?GREEN:AMBER)}
   <div style={{fontSize:21,color:'#a8bbc9',marginTop:18}}>输出 y = max(0, z)</div>
   <div style={{fontSize:68,color:m.output>0?GREEN:'#8094a5',fontVariantNumeric:'tabular-nums',marginTop:5}}>{fmt(m.output)}</div>
   <svg width="380" height="90" viewBox="0 0 380 90"><path d="M 15 70 H 365 M 160 80 V 5" stroke="#3e5364" fill="none"/><path d="M 20 70 H 160 L 350 12" fill="none" stroke={GREEN} strokeWidth="3"/><circle cx={160+m.z*400} cy={70-m.output*122} r="6" fill={accent}/><text x="315" y="82" fill="#8ea7ba" fontSize="15">ReLU</text></svg>
  </div>
  <div style={{position:'absolute',left:80,right:160,top:854,display:'flex',gap:14}}>{['输入','乘权重','求和 + 偏置','ReLU 激活','调整参数'].map((v,i)=><div key={v} style={{flex:1,borderTop:`3px solid ${i<=phase?accent:'#2a3946'}`,paddingTop:13,color:i===phase?'#edf3f8':'#758d9f',fontSize:20}}>{String(i+1).padStart(2,'0')} / {v}</div>)}</div>
  <div style={{position:'absolute',left:80,top:938,fontSize:28}}>{subtitles[phase]}</div>
  <div style={{position:'absolute',left:80,top:998,fontSize:17,color:'#8094a6'}}>数值与仪表由同一模型驱动 · 单个 ReLU 神经元示例 · 不代表生物神经元的工作机制</div>
  <div style={{position:'absolute',bottom:0,height:4,width:`${interpolate(f,[0,30*fps],[0,100])}%`,background:accent}}/>
 </AbsoluteFill>;
};
export const NeuronComposition:React.FC=()=> <Composition id="NeuronAnatomy" component={NeuronAnatomy} durationInFrames={900} fps={30} width={1920} height={1080}/>;
