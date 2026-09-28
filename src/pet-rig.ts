import Phaser from 'phaser';

// Keep a single articulated silhouette across every activity.
export class PetRig extends Phaser.GameObjects.Container {
 private ink:Phaser.GameObjects.Graphics;
 private mood='idle';
 private sleep=0;
 private stretch=0;
 private gait=0;
 private phase=0;
 private facing=1;
 private previousX:number;
 private clock=0;
 constructor(scene:Phaser.Scene,x:number,y:number,private kind:'cat'|'dog'){
  super(scene,x,y);scene.add.existing(this);this.previousX=x;
  this.ink=scene.add.graphics();this.add(this.ink);
  this.setSize(240,220);
  scene.events.on('update',this.animate,this);
  this.once('destroy',()=>scene.events.off('update',this.animate,this));
  this.animate(0,16);
 }
 setMood(value:string){this.mood=value;return this;}
 private animate(_time:number,delta:number){
  const dt=Math.min(delta,50)/1000, blend=1-Math.exp(-dt*7);
  this.clock+=dt;
  const dx=this.x-this.previousX;this.previousX=this.x;
  const moving=this.mood==='walk'&&Math.abs(dx)>.04;
  this.gait+=(Number(moving)-this.gait)*blend;
  this.sleep+=(Number(this.mood==='sleep')-this.sleep)*blend;
  this.stretch+=(Number(this.mood==='stretch')-this.stretch)*blend;
  if(moving)this.facing+=((dx<0?-1:1)-this.facing)*(1-Math.exp(-dt*12));
  this.phase+=Math.abs(dx)/10.2;
  const g=this.ink;g.clear();g.scaleX=1;
  const nap=this.sleep, reach=this.stretch;
  const breath=Math.sin(this.clock*2.1)*(1.2+nap*.6);
  const bounce=-Math.abs(Math.sin(this.phase*2))*2*this.gait;
  const by=29+nap*42+reach*5+bounce+breath;
  const fur=this.kind==='cat'?0xe8b789:0xd7ac80;
  const pale=0xf6d9b8, dark=0x765648;
  const ellipse=(x:number,y:number,w:number,h:number,c:number)=>{g.fillStyle(c);g.fillEllipse(x,y,w,h);};
  const stroke=(points:number[],color:number,width:number)=>{
   g.lineStyle(width,color,1);g.beginPath();g.moveTo(points[0],points[1]);
   for(let i=2;i<points.length;i+=2)g.lineTo(points[i],points[i+1]);g.strokePath();
   ellipse(points[0],points[1],width,width,color);ellipse(points[points.length-2],points[points.length-1],width,width,color);
  };
  // The tail bends along a curve instead of rotating as a rigid sticker.
  const tail:number[]=[];
  for(let i=0;i<=16;i++){
   const t=i/16, wag=Math.sin(this.clock*(this.kind==='dog'?5:2.2)+t*2)*(this.mood==='petting'?13:5);
   tail.push((-63-t*40+nap*t*100)*this.facing,by-7-Math.sin(t*1.8)*48*(1-nap)+nap*t*27+wag*t*(1-nap));
  }
  stroke(tail,0xc99a70,13);
  // Feet stay on the ground during the stance half of each stride.
  const leg=(hip:number,offset:number,back:boolean)=>{
   const phase=(this.phase+offset)%(Math.PI*2);
   const stance=phase<Math.PI;
   const progress=(stance?phase:phase-Math.PI)/Math.PI;
   const swing=(stance?16-32*progress:-16+32*progress)*this.gait*this.facing;
   const lift=(stance?0:Math.sin(progress*Math.PI)*16)*this.gait;
   const hx=hip,hy=by+17;
   const footX=hip+swing+reach*(hip>0?31:-8);
   const footY=96-lift;
   const tuckedX=hip*.65,tuckedY=by+14;
   const fx=Phaser.Math.Linear(footX,tuckedX,nap),fy=Phaser.Math.Linear(footY,tuckedY,nap);
   stroke([hx,hy,(hx+fx)/2-5,(hy+fy)/2,fx,fy],back?0xc39973:fur,17);
   ellipse(fx+4,fy,26,14,back?0xd2ac87:pale);
  };
  leg(-43,Math.PI,true);leg(42,0,true);
  ellipse(0,by,147-18*nap,88+8*nap,fur);
  ellipse(29,by+14,65,55,pale);
  leg(-52,0,false);leg(43,Math.PI,false);
  const nod=this.mood==='feed'?Math.sin(this.clock*7)*5:0;
  const hx=(47-25*nap+reach*17)*this.facing;
  const hy=by-50+nap*38+reach*31+nod;
  const earWiggle=Math.sin(this.clock*2.5)*1.5;
  if(this.kind==='cat'){
   g.fillStyle(fur);g.fillTriangle(hx-37,hy-19,hx-34,hy-57+earWiggle,hx-7,hy-34);
   g.fillTriangle(hx+8,hy-35,hx+34,hy-55-earWiggle,hx+38,hy-12);
   g.fillStyle(0xe9a9a0);g.fillTriangle(hx-29,hy-29,hx-29,hy-46,hx-15,hy-32);
   g.fillTriangle(hx+17,hy-32,hx+29,hy-45,hx+31,hy-24);
  }else{
   ellipse(hx-35,hy-4+earWiggle,30,69,0xa77b5d);ellipse(hx+34,hy-4-earWiggle,29,66,0xa77b5d);
  }
  ellipse(hx,hy,83,73,0xf0cba5);
  ellipse(hx+4,hy+17,47,31,pale);
  const blink=this.clock%4.3>4.13;
  for(const ex of [-16,18]){
   if(nap>.45||blink||this.mood==='petting')stroke([hx+ex-5,hy+1,hx+ex,hy+3,hx+ex+5,hy+1],dark,2.5);
   else{ellipse(hx+ex,hy,8,12,dark);ellipse(hx+ex+1,hy-3,2.5,3,0xffffff);}
  }
  ellipse(hx+3,hy+15,this.kind==='dog'?13:9,7,0x94695c);
  stroke([hx+3,hy+19,hx+3,hy+25,hx+10,hy+25],0xa57967,2);
  if(this.kind==='cat')for(const side of [-1,1]){
   stroke([hx+side*23,hy+16,hx+side*45,hy+12],0xb68b71,1.5);
   stroke([hx+side*23,hy+22,hx+side*44,hy+25],0xb68b71,1.5);
  }
 }
}
