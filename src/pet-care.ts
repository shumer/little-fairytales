import Phaser from 'phaser';
import {PetRig} from './pet-rig';
export type PetKind = 'cat' | 'dog';
type Care = 'wash' | 'brush' | 'feed' | 'play';
const actions: Care[] = ['wash','brush','feed','play'];
const icons = {wash:'petShower',brush:'petBrush',feed:'petBowl',play:'petBall'};
const labels = {wash:'Помыть',brush:'Причесать',feed:'Покормить',play:'Поиграть'};
const key='little-fairytales-pets-v1';
interface PetSave {kind:PetKind;done:Record<PetKind,Care[]>}
function read():PetSave {
 try {
  const raw=JSON.parse(localStorage.getItem(key)||'null');
  return {kind:raw?.kind==='dog'?'dog':'cat',done:{cat:actions.filter(a=>raw?.done?.cat?.includes(a)),dog:actions.filter(a=>raw?.done?.dog?.includes(a))}};
 }catch{return {kind:'cat',done:{cat:[],dog:[]}};}
}
function write(value:PetSave){try{localStorage.setItem(key,JSON.stringify(value));}catch{/* Keep playing when storage is unavailable. */}}
export function resetPetCare(){write({kind:'cat',done:{cat:[],dog:[]}});}

export function petCare(scene:Phaser.Scene,chime:(notes?:number[])=>void,onBack:()=>void){
 const saved=read();let busy=false;
 let mood='idle', lastTouch=scene.time.now;
 let motion:Phaser.Tweens.Tween|undefined;
 const game=document.querySelector('#game');
 const text=(x:number,y:number,t:string,size=18)=>scene.add.text(x,y,t,{fontFamily:'Arial',fontSize:`${size}px`,color:'#65536e'}).setOrigin(.5);
 const panel=(x:number,y:number,w:number,h:number,color=0xfffcf8)=>{
  const g=scene.add.graphics();g.fillStyle(color,.97).fillRoundedRect(x-w/2,y-h/2,w,h,22);g.lineStyle(2,0xe4d4e7).strokeRoundedRect(x-w/2,y-h/2,w,h,22);return g;
 };
 text(240,125,'Выбери пушистого друга',19);
 (['cat','dog'] as PetKind[]).forEach((kind,i)=>{
  const x=178+i*124;
  panel(x,194,105,88,kind===saved.kind?0xeee0f4:0xfffcf8);
  scene.add.image(x,191,kind).setDisplaySize(67,67);
  if(kind===saved.kind)scene.add.circle(x+36,165,8,0xac8bc0);
  scene.add.zone(x,194,105,88).setInteractive({useHandCursor:true}).on('pointerdown',()=>{
   if(busy||saved.kind===kind)return;saved.kind=kind;write(saved);scene.scene.restart();
  });
 });
 scene.add.ellipse(240,486,304,51,0xc5bad3,.3);
 scene.add.ellipse(240,474,316,65,0xf5dfd5,.85);
 const pet=new PetRig(scene,240,382,saved.kind);
 const dirt=scene.add.container(0,0);
 if(!saved.done[saved.kind].includes('wash'))for(const [x,y]of [[194,424],[273,420],[291,389]])dirt.add(scene.add.ellipse(x,y,17,11,0xa8866c,.25));
 function pose(value:string){mood=value;pet.setMood(value);game?.setAttribute('data-pet-mood',value);}
 function settle(){
  motion?.stop();scene.tweens.killTweensOf(pet);pet.setAngle(0);motion=scene.tweens.add({targets:pet,x:240,duration:400,ease:'Sine.easeInOut'});dirt.setVisible(true);pose('idle');lastTouch=scene.time.now;
 }
 function rest(){
  if(busy)return;settle();dirt.setVisible(false);pose('sleep');
  message.setText('Тс-с-с... Погладь друга, чтобы разбудить');
 }
 function stretch(){
  if(busy)return;settle();dirt.setVisible(false);pose('stretch');
  scene.time.delayedCall(1600,()=>{if(mood==='stretch'){settle();hearts();}});
 }
 function walk(x:number,complete:()=>void=()=>settle()){
  motion?.stop();scene.tweens.killTweensOf(pet);dirt.setVisible(false);pose('walk');
  motion=scene.tweens.add({targets:pet,x,duration:Math.max(450,Math.abs(x-pet.x)*7),ease:'Sine.easeInOut',onComplete:complete});
 }
 scene.time.addEvent({delay:6000,loop:true,callback:()=>{
  if(busy||mood!=='idle'||scene.time.now-lastTouch<5500)return;
  const choice=Phaser.Math.Between(0,2);
  if(choice===0)rest();else if(choice===1)stretch();else walk(Phaser.Math.Between(130,350),()=>walk(240));
 }});
 pose('idle');
 function hearts(){
  for(let i=0;i<3;i++){
   const h=scene.add.image(pet.x-36+i*36,pet.y-62,'heart').setDisplaySize(22,22).setDepth(12);
   scene.tweens.add({targets:h,y:pet.y-117-i*11,alpha:0,duration:900+i*150,onComplete:()=>h.destroy()});
  }
 }
 let stroking=false, strokeX=0;
 function affection(){
  if(busy)return;settle();hearts();chime([392,494]);pose('petting');
  scene.time.delayedCall(850,()=>{if(mood==='petting')settle();});
 }
 pet.setInteractive({useHandCursor:true}).on('pointerdown',(p:Phaser.Input.Pointer)=>{stroking=true;strokeX=p.x;affection();});
 pet.on('pointermove',(p:Phaser.Input.Pointer)=>{if(stroking&&p.isDown&&Math.abs(p.x-strokeX)>35){strokeX=p.x;affection();}});
 scene.input.on('pointerup',()=>{stroking=false;});
 const message=text(240,527,'Нажми на предмет или принеси его другу',15);
 for(const [x,label,action] of [[49,'☾',rest],[431,'↔',stretch]] as const){
  panel(x,284,66,64);
  if(label==='↔')scene.add.image(x,282,`${saved.kind}Stretch`).setDisplaySize(60,60);else text(x,282,label,34);
  scene.add.zone(x,284,66,64).setInteractive({useHandCursor:true}).on('pointerdown',action);
 }
 const ball=scene.add.image(365,474,'petBall').setDisplaySize(49,49).setDepth(11).setInteractive({useHandCursor:true,draggable:true});
 let ballDragged=false;
 function chase(x:number){
  if(busy){ball.setPosition(365,474);return;}
  settle();busy=true;pose('play');message.setText('Лови! Мячик можно бросить ещё раз');
  const target=Phaser.Math.Clamp(x,90,390);ball.setPosition(target,460);
  scene.tweens.add({targets:ball,y:480,angle:ball.angle+180,duration:300,yoyo:true});
  walk(Phaser.Math.Clamp(target,130,350),()=>{
   hearts();chime([659,784]);
   scene.time.delayedCall(200,()=>walk(240,()=>{
    busy=false;settle();
    if(!saved.done[saved.kind].includes('play'))saved.done[saved.kind].push('play');write(saved);refresh();
   }));
  });
 }
 ball.on('pointerdown',()=>{ballDragged=false;});
 ball.on('dragstart',()=>{ballDragged=true;});
 ball.on('drag',(_p:Phaser.Input.Pointer,x:number,y:number)=>{if(!busy)ball.setPosition(Phaser.Math.Clamp(x,70,410),Phaser.Math.Clamp(y,330,490));});
 ball.on('dragend',()=>chase(ball.x));
 ball.on('pointerup',()=>{if(!ballDragged)chase(ball.x>240?110:370);});
 panel(240,623,440,143);
 const ticks:Partial<Record<Care,Phaser.GameObjects.Text>>={};
 function refresh(){
  for(const a of actions)ticks[a]?.setVisible(saved.done[saved.kind].includes(a));
  document.querySelector('#game')?.setAttribute('data-pet',saved.kind);
  document.querySelector('#game')?.setAttribute('data-care',saved.done[saved.kind].join(','));
 }
 function perform(action:Care){
  if(busy)return;
  if(action==='play'){chase(ball.x>240?110:370);return;}
  settle();busy=true;pose(action);
  message.setText({wash:'Тёплый душ и пушистая пена!',brush:'Какая мягкая шёрстка!',feed:'Вкусный обед!',play:'Лови мячик!'}[action]);
  const effect=scene.add.container(0,0).setDepth(10);
  if(action==='wash'){
   effect.add(scene.add.image(326,280,'petShower').setDisplaySize(75,75).setAngle(-15));
   for(let i=0;i<15;i++){
    const drop=scene.add.ellipse(192+(i*37)%111,285+(i%3)*14,5,12,0x9bcfdf,.8);effect.add(drop);
    scene.tweens.add({targets:drop,y:435,alpha:0,duration:500+i*30,repeat:1});
   }
   for(let i=0;i<9;i++)effect.add(scene.add.circle(177+(i*29)%125,392+(i%3)*19,10+(i%4),0xf8ffff,.8).setStrokeStyle(1,0xb9dce6));
   scene.tweens.add({targets:dirt,alpha:0,duration:1100});
  }else if(action==='brush'){
   const brush=scene.add.image(280,350,'petBrush').setDisplaySize(78,78).setAngle(-25);effect.add(brush);
   scene.tweens.add({targets:brush,x:203,y:416,duration:350,yoyo:true,repeat:1});
  }else if(action==='feed'){
   const bowl=scene.add.image(240,480,'petBowl').setDisplaySize(100,80);effect.add(bowl);

   for(let i=0;i<5;i++){
    const crumb=scene.add.circle(219+i*10,466,4,0xc5a179);effect.add(crumb);
    scene.tweens.add({targets:crumb,y:406,alpha:0,duration:500,delay:i*120});
   }
  }
  chime([523,659,784]);
  scene.time.delayedCall(1450,()=>{
   effect.destroy(true);settle();busy=false;
   if(!saved.done[saved.kind].includes(action))saved.done[saved.kind].push(action);
   write(saved);refresh();hearts();
   message.setText(saved.done[saved.kind].length===4?'Друг счастлив! Можно поиграть ещё':saved.kind==='cat'?'Мур-мур! Что будем делать дальше?':'Гав-гав! Что будем делать дальше?');
  });
 }
 actions.forEach((action,i)=>{
  const x=75+i*110;
  panel(x,617,96,109);
  const item=scene.add.image(x,608,icons[action]).setDisplaySize(64,64).setDepth(15);
  text(x,656,labels[action],12);
  ticks[action]=text(x+32,577,'✓',19).setDepth(16);
  item.setInteractive({useHandCursor:true,draggable:true});
  item.on('pointerdown',()=>item.setData('dragged',false));
  item.on('dragstart',()=>item.setData('dragged',true));
  item.on('drag',(_p:Phaser.Input.Pointer,dx:number,dy:number)=>item.setPosition(dx,dy-15));
  item.on('dragend',()=>{
   if(Phaser.Math.Distance.Between(item.x,item.y,240,390)<160)perform(action);
   item.setPosition(x,608);
  });
  item.on('pointerup',()=>{if(!item.getData('dragged'))perform(action);});
 });
 refresh();
 panel(240,757,410,68,0xac8bc0);
 scene.add.image(240,748,'worlds').setDisplaySize(38,38);
 text(240,781,'К сказкам',11).setColor('#ffffff');
 scene.add.zone(240,757,410,68).setInteractive({useHandCursor:true}).on('pointerup',onBack);
}
