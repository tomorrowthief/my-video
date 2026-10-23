"""Original, quiet music-box pattern. Standard-library-only, deterministic."""
import math, wave, struct
from pathlib import Path
rate=22050
beat=.8
notes=[57,60,64,67,64,60,53,57,60,64,60,57,50,53,57,60,57,53,52,55,59,64,59,55]
length=len(notes)*beat
samples=[0.0]*int(length*rate)
for i,midi in enumerate(notes):
 freq=440*2**((midi-69)/12)
 start=int(i*beat*rate)
 for j in range(int(3.8*rate)):
  t=j/rate
  env=min(t/.012,1)*math.exp(-t*1.8)
  tone=math.sin(2*math.pi*freq*t)+.25*math.sin(2*math.pi*freq*2*t)*math.exp(-t*2)+.10*math.sin(2*math.pi*freq*3*t)*math.exp(-t*3)
  samples[(start+j)%len(samples)]+=.16*env*tone
Path('public/audio-dream').mkdir(exist_ok=True)
with wave.open('public/audio-dream/moonlight.wav','wb') as out:
 out.setnchannels(1);out.setsampwidth(2);out.setframerate(rate)
 out.writeframes(b''.join(struct.pack('<h',max(-32767,min(32767,int(s*32767)))) for s in samples))
