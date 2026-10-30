"""Original instrumental travel bed; deterministic synthesis, no external recording."""
import array, math, random, wave
from functools import lru_cache
SR=24000
DURATION=133
mix=array.array('f',[0.0])*(SR*DURATION)
random.seed(7)
@lru_cache(maxsize=None)
def note(freq,duration,kind):
    n=int(duration*SR);out=array.array('f')
    for i in range(n):
        t=i/SR
        if kind=='pad':
            env=min(1,t/.5,(duration-t)/.7)
            v=(math.sin(2*math.pi*freq*t)+.16*math.sin(2*math.pi*freq*2*t)+.08*math.sin(2*math.pi*(freq+.6)*t))*env*.023
        elif kind=='bass':
            v=math.sin(2*math.pi*freq*t)*min(1,t/.02)*math.exp(-t*3)*.085
        else:
            v=(math.sin(2*math.pi*freq*t)+.18*math.sin(2*math.pi*freq*2*t))*min(1,t/.008)*math.exp(-t*5.5)*.06
        out.append(v)
    return out
def add(at,values,gain=1):
    start=int(at*SR)
    if start<0:return
    for i in range(min(len(values),len(mix)-start)):mix[start+i]+=values[i]*gain
beat=.6
chords=[(146.83,185.,220.),(130.81,164.81,196.),(98.,123.47,146.83),(110.,138.59,164.81)]
for bar in range(56):
    at=bar*beat*4
    if at>=DURATION:break
    c=chords[(bar//2)%4]
    for f in c:add(at,note(f,3.,'pad'))
    for b in range(4):
        add(at+b*beat,note(c[0]/2,.55,'bass'),.6)
        f=c[[0,2,1,2][b]]*2
        add(at+b*beat+(.3 if b%2 else 0),note(f,.75,'pluck'),.9)
    if at>=14 and not 65<=at<77:
        kick=array.array('f',(math.sin(2*math.pi*(48*t+6*(1-math.exp(-t*30))))*math.exp(-t*22)*.095 for t in (i/SR for i in range(int(SR*.3)))))
        for b in (0,2):add(at+b*beat,kick)
        shaker=array.array('f',(random.uniform(-1,1)*math.exp(-i/SR*65)*.015 for i in range(int(SR*.1))))
        for b in range(8):add(at+b*beat/2,shaker)
peak=max(abs(v) for v in mix)
out=array.array('h')
for i,v in enumerate(mix):
    t=i/SR;fade=min(1,t/2.5,(DURATION-t)/4)
    out.append(int(max(-1,min(1,v/peak*.68*fade))*32767))
with wave.open('outputs/taihu/roadtrip-bgm.wav','w') as w:
    w.setnchannels(1);w.setsampwidth(2);w.setframerate(SR);w.writeframes(out.tobytes())
print(f'Original BGM: {DURATION}s, {SR}Hz')
