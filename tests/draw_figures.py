"""Draw schematic figures from documented prototype states, not screenshots."""
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont
import math

OUT=Path(__file__).resolve().parents[1]/'docs'
FONT='/System/Library/Fonts/HelveticaNeue.ttc'
def font(n):return ImageFont.truetype(FONT,n)
INK='#152b40';BLUE='#e9f2f8';AMBER='#fff0cf';GREY='#f0f1f3';TEAL='#146b70'
def text(draw,xy,s,size=32,fill=INK):draw.text(xy,s,font=font(size),fill=fill)
def lines(draw,box,strings,size=32):
 x,y,w,h=box;step=size+12;total=len(strings)*step
 for i,s in enumerate(strings):
  b=draw.textbbox((0,0),s,font=font(size));draw.text((x+(w-(b[2]-b[0]))/2,y+(h-total)/2+i*step),s,font=font(size),fill=INK)
def dashed(draw,box,fill='#89939b',width=3):
 x,y,x2,y2=box
 for a in range(x,x2,20):draw.line((a,y,min(a+11,x2),y),fill=fill,width=width);draw.line((a,y2,min(a+11,x2),y2),fill=fill,width=width)
 for b in range(y,y2,20):draw.line((x,b,x,min(b+11,y2)),fill=fill,width=width);draw.line((x2,b,x2,min(b+11,y2)),fill=fill,width=width)
def box(draw,b,strings,status='implemented'):
 x,y,w,h=b;draw.rounded_rectangle((x,y,x+w,y+h),radius=15,fill={'implemented':BLUE,'simulated':AMBER,'planned':GREY}[status],outline=None if status=='planned' else '#8ea5b6',width=2)
 if status=='planned':dashed(draw,(x,y,x+w,y+h))
 lines(draw,b,strings)
def arrow(d,a,b,label=None):
 d.line((a,b),fill=TEAL,width=5);angle=math.atan2(b[1]-a[1],b[0]-a[0]);L=18
 pts=[b,(b[0]-L*math.cos(angle-.5),b[1]-L*math.sin(angle-.5)),(b[0]-L*math.cos(angle+.5),b[1]-L*math.sin(angle+.5))];d.polygon(pts,fill=TEAL)
 if label:
  mx=(a[0]+b[0])/2;my=(a[1]+b[1])/2;bbox=d.textbbox((0,0),label,font=font(28));tw=bbox[2]-bbox[0];d.rectangle((mx-tw/2-7,my-35,mx+tw/2+7,my-1),fill='white');text(d,(mx-tw/2,my-35),label,28)

im=Image.new('RGB',(1800,1120),'white');d=ImageDraw.Draw(im)
text(d,(55,25),'System components and control flow',44)
text(d,(55,95),'Blue: implemented     Amber: simulated AI     Dashed: planned',30)
box(d,(60,190,390,150),['User','Select / request / correct'])
box(d,(690,190,430,150),['Keyword interpreter','Two fixed style rules'],'simulated')
box(d,(1360,190,380,150),['Proposal','Target / intent / revision'])
arrow(d,(450,265),(690,265),'input');arrow(d,(1120,265),(1360,265),'candidate')
box(d,(1360,510,380,155),['Separate preview','Current poster unchanged'])
box(d,(690,510,430,155),['Apply validator','Target / version / style / lock'])
box(d,(60,510,390,155),['Confirmed poster state','Apply valid local change'])
arrow(d,(1550,340),(1550,510),'render');arrow(d,(1360,587),(1120,587),'user approves');arrow(d,(690,587),(450,587),'valid only');arrow(d,(255,510),(255,340),'visible feedback')
box(d,(60,850,390,140),['Undo stack','Restore prior content'])
arrow(d,(135,665),(135,850),'save')
arrow(d,(375,850),(375,665),'undo')
box(d,(690,850,430,140),['External model','Replace rule interpreter'],'planned')
box(d,(1360,850,380,140),['Property editor','User-controlled locks'],'planned')
text(d,(55,1045),'Single browser session. No external model call or participant study.',32)
im.save(OUT/'architecture.png')

def poster(d,x,y,w,h,style='base',label='Current',selected=True):
 text(d,(x,y-39),label,28);d.rounded_rectangle((x,y,x+w,y+h),radius=10,fill='#102d45')
 text(d,(x+17,y+18),'AI SOCIETY',25,'white');text(d,(x+17,y+64),"Imagine what's",23,'white');text(d,(x+17,y+91),'next with AI',23,'white')
 d.rounded_rectangle((x+w*.35,y+123,x+w*.70,y+165),radius=13,fill='#69c6bd')
 text(d,(x+17,y+171),'31 October',23,'white')
 colors={'base':'#e9f6f0','readability':'#fff4ba','playful':'#f7cfdd'}
 d.rounded_rectangle((x+14,y+h-80,x+w-14,y+h-18),radius=9,fill=colors[style],outline='#e4b94f' if selected else None,width=3)
 text(d,(x+25,y+h-63),'Sign up',28,'#172d40')
def panel(d,x,y,w,h,title,step,style='base',preview=None,note=''):
 d.rounded_rectangle((x,y,x+w,y+h),radius=15,outline='#becbd4',width=2,fill='#fbfcfd')
 text(d,(x+20,y+17),step+'  '+title,32)
 if preview:
  poster(d,x+22,y+105,205,280,style,'Current');poster(d,x+280,y+105,205,280,preview,'Not applied',False)
 else:
  poster(d,x+34,y+105,230,280,style,'Current')
  lines(d,(x+290,y+120,195,210),note.split('|'),30)

im=Image.new('RGB',(1800,1560),'white');d=ImageDraw.Draw(im)
text(d,(50,15),'Illustrated replays of implemented states',44)
rows=[('1  Inspect and accept',[
 ('Select and request','A','base',None,'Select panel|stand out'),
 ('Inspect suggestion','B','base','readability',''),
 ('Apply local change','C','readability',None,'Approved|Revision 2')]),
 ('2  Correct and recover',[
 ('Correct interpretation','A','base','playful',''),
 ('Apply playful accent','B','playful',None,'Only panel|changes'),
 ('Undo applied change','C','base',None,'Style restored|Revision 3')]),
 ('3  Clarify an unsupported request',[
 ('Enter unclear request','A','base',None,'Make it|different'),
 ('Ask for clarification','B','base',None,'Readability|or playful?'),
 ('Wait for user input','C','base',None,'No preview|No change')])]
for row,(title,cards) in enumerate(rows):
 y=90+row*475;text(d,(50,y),title,36)
 for col,(title,step,style,preview,note) in enumerate(cards):
  x=50+col*580;panel(d,x,y+55,540,400,title,step,style,preview,note)
  if col<2:arrow(d,(x+547,y+255),(x+573,y+255))
text(d,(50,1530),'Schematic redrawings of controls and states. No participant data.',28)
im.save(OUT/'storyboards.png')
print('Created architecture.png and storyboards.png')
