import {AbsoluteFill, Composition, interpolate, useCurrentFrame, useVideoConfig} from 'remotion';
import {NNScene} from './NNEnergy';
import {MAIN} from './scenes';

const stages=[
 {label:'观察网络',title:'一次输入，如何穿过神经网络？',body:'每个节点代表一个计算单元。\n连接把上一层的输出送往下一层。',formula:'输入层 → 隐藏层 → 输出层'},
 {label:'输入数据',title:'把数据编码成一组数值',body:'图像、文本和声音先被表示为数值。\n输入层接收这组数值，开始一次前向计算。',formula:'x = [x₁, x₂, …, xₙ]'},
 {label:'加权与激活',title:'每一层，都在重新组合信息',body:'节点将输入乘以权重，加上偏置，\n再通过激活函数产生自己的输出。',formula:'a⁽ˡ⁾ = ReLU(W⁽ˡ⁾a⁽ˡ⁻¹⁾ + b⁽ˡ⁾)'},
 {label:'逐层传播',title:'上一层的输出，成为下一层的输入',body:'数值逐层参与新的计算。\n深层网络由这些重复的计算步骤组成。',formula:'a⁽⁰⁾ → a⁽¹⁾ → a⁽²⁾ → …'},
 {label:'形成输出',title:'最后一层，给出任务需要的结果',body:'结果可以是分类分数、预测值或下一词分数。\n输出的含义取决于模型解决的任务。',formula:'输入 x → 网络 f → 输出 f(x)'},
];

export const NetworkExplainer:React.FC=()=>{
 const frame=useCurrentFrame(),{fps}=useVideoConfig(),s=frame/fps;
 const chapter=Math.min(4,Math.floor(s/6)),stage=stages[chapter];
 const local=s-chapter*6;
 const enter=interpolate(local,[0,0.55],[0,1],{extrapolateLeft:'clamp',extrapolateRight:'clamp'});
 return <AbsoluteFill style={{background:'#080c10',color:'#e6edf5',fontFamily:'"PingFang SC",sans-serif'}}>
  <div style={{position:'absolute',width:2560,height:1440,transform:'scale(0.75)',transformOrigin:'top left'}}>
   <NNScene scene={MAIN} progress={(s/14)%1}/>
  </div>
  <AbsoluteFill style={{background:'linear-gradient(180deg,rgba(6,11,17,.98) 0%,rgba(6,11,17,.5) 24%,transparent 42%,transparent 60%,rgba(6,11,17,.92) 81%,#060b11 100%)'}}/>
  <div style={{position:'absolute',left:80,top:53,fontSize:19,color:'#829bb0',letterSpacing:5}}>NEURAL NETWORK / 前向传播</div>
  <div style={{position:'absolute',right:80,top:53,fontSize:21,color:'#91caff'}}>0{chapter+1} / 05</div>
  <div style={{position:'absolute',left:80,top:108,fontSize:49,fontWeight:600,opacity:enter,transform:`translateY(${(1-enter)*12}px)`}}>{stage.title}</div>
  <div style={{position:'absolute',left:100,right:100,top:725,display:'flex',justifyContent:'space-between',fontSize:22,color:'#b6cadb'}}><span>输入层</span><span>隐藏层 · 加权求和与非线性变换</span><span>输出层</span></div>
  <div style={{position:'absolute',left:80,top:792,width:990,fontSize:28,lineHeight:1.8,whiteSpace:'pre-line',opacity:enter}}>{stage.body}</div>
  <div style={{position:'absolute',right:80,top:806,width:650,padding:'24px 26px',background:'#111e2bc9',border:'1px solid #34516a',borderRadius:14,color:'#91caff',fontSize:27,textAlign:'center',opacity:enter}}>{stage.formula}</div>
  <div style={{position:'absolute',left:80,right:80,top:958,display:'flex',gap:16}}>{stages.map((v,i)=><div key={v.label} style={{flex:1,borderTop:`2px solid ${i<=chapter?'#91caff':'#283846'}`,paddingTop:13,color:i===chapter?'#e3effa':'#75899b',fontSize:20}}>0{i+1} / {v.label}</div>)}</div>
  <div style={{position:'absolute',left:80,bottom:24,fontSize:16,color:'#6f8497'}}>蓝色光点表示信息传播示意，不是电流；节点布局、连接亮度与传播时间不表示实测神经网络计算。</div>
  <div style={{position:'absolute',bottom:0,height:3,width:`${s/30*100}%`,background:'#91caff'}}/>
 </AbsoluteFill>;
};
export const NetworkExplainerComposition:React.FC=()=> <Composition id="NetworkExplainer" component={NetworkExplainer} durationInFrames={900} fps={30} width={1920} height={1080}/>;
