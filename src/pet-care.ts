import Phaser from 'phaser';
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
 const pet=scene.add.image(240,382,saved.kind).setDisplaySize(250,250);
 const dirt=scene.add.container(0,0);
 if(!saved.done[saved.kind].includes('wash'))for(const [x,y]of [[194,424],[273,420],[291,389]])dirt.add(scene.add.ellipse(x,y,17,11,0xa8866c,.25));
 scene.tweens.add({targets:pet,y:379,duration:1500,yoyo:true,repeat:-1,ease:'Sine.easeInOut'});
 function hearts(){
  for(let i=0;i<3;i++){
   const h=scene.add.image(204+i*36,320,'heart').setDisplaySize(22,22).setDepth(12);
   scene.tweens.add({targets:h,y:265-i*11,alpha:0,duration:900+i*150,onComplete:()=>h.destroy()});
  }
 }
 pet.setInteractive({useHandCursor:true}).on('pointerdown',()=>{if(!busy){hearts();chime([392,494]);}});
 const message=text(240,527,'Нажми на предмет или принеси его другу',15);
 panel(240,623,440,143);
 const ticks:Partial<Record<Care,Phaser.GameObjects.Text>>={};
 function refresh(){
  for(const a of actions)ticks[a]?.setVisible(saved.done[saved.kind].includes(a));
  document.querySelector('#game')?.setAttribute('data-pet',saved.kind);
  document.querySelector('#game')?.setAttribute('data-care',saved.done[saved.kind].join(','));
 }
 function perform(action:Care){
  if(busy)return;busy=true;
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
   scene.tweens.add({targets:pet,angle:7,duration:210,yoyo:true,repeat:2});
   for(let i=0;i<5;i++){
    const crumb=scene.add.circle(219+i*10,466,4,0xc5a179);effect.add(crumb);
    scene.tweens.add({targets:crumb,y:406,alpha:0,duration:500,delay:i*120});
   }
  }else{
   const ball=scene.add.image(100,460,'petBall').setDisplaySize(61,61);effect.add(ball);
   scene.tweens.add({targets:ball,x:374,y:415,angle:250,duration:640,yoyo:true,ease:'Sine.easeInOut'});
   scene.tweens.add({targets:pet,x:264,angle:8,duration:320,yoyo:true,repeat:1});
  }
  chime([523,659,784]);
  scene.time.delayedCall(1450,()=>{
   effect.destroy(true);pet.setAngle(0).setX(240);busy=false;
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
