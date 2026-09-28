import Phaser from 'phaser';
import './style.css';
import { art } from './art';
import './story-art';
import './adventure-art';
import {stories, storyIds, storyTargets} from './stories';
import {petCare,resetPetCare} from './pet-care';
import { StoryAudio } from './music';
import { fresh, persist, restore, restoreStory, pieceNames, categories, type Save, type Category, type Piece, type Stage } from './state';

const W = 480, H = 820;
const ink = '#65536e', muted = '#9b899e';
const labels: Record<Category, string> = { dress: 'Одежда', shoes: 'Обувь', crown: 'Короны', earrings: 'Серьги' };
let save: Save = restore();
const soundtrack = new StoryAudio(save.sound);
function chime(notes = [523, 659, 784]) { soundtrack.chime(notes); }

class CastleGame extends Phaser.Scene {
  private showStories = true;
  private showPets = false;
  private guest?: Phaser.GameObjects.Image;
  private hero?: Phaser.GameObjects.Container;
  private dancing = false;
  private specialBusy = false;
  private toys = new Set<Phaser.GameObjects.GameObject>();
  private get story() { return stories[save.story]; }
  private get targets() { return storyTargets[save.story]; }
  private texture(key: string) { return art[`${save.story}_${key}`] ? `${save.story}_${key}` : key; }
  private category: Category = 'dress';
  private outfitLayers: Partial<Record<Category, Phaser.GameObjects.Image>> = {};
  private castleImage?: Phaser.GameObjects.Image;
  private paintPalette?: Phaser.GameObjects.Container;
  private palette?: Phaser.GameObjects.Container;
  private next?: Phaser.GameObjects.Container;
  private count?: Phaser.GameObjects.Text;
  private pending = new Set<Piece>();
  private slots: Partial<Record<Piece, Phaser.GameObjects.Image>> = {};
  private partImages: Partial<Record<Piece, Phaser.GameObjects.Image>> = {};
  private guestArrived = false;
  private gift?: Phaser.GameObjects.Image;
  private partyTitle?: Phaser.GameObjects.Text;
  private partyNote?: Phaser.GameObjects.Text;

  constructor() { super('story'); }
  preload() {
    this.load.image('garden', './garden.png');
    for (const [key, value] of Object.entries(art)) this.load.svg(key, `data:image/svg+xml;base64,${btoa(value)}`, { scale: 2 });
    const bg = this.add.rectangle(240, 410, 480, 820, 0xfff8ee);
    const title = this.add.text(240, 385, 'Открываем сказку…', { fontFamily: 'Arial', fontSize: '24px', color: ink }).setOrigin(.5);
    const bar = this.add.rectangle(140, 432, 0, 5, 0xb59ac8).setOrigin(0,.5);
    this.load.on('progress', (v: number) => bar.width = 200 * v);
    this.load.once('complete', () => { bg.destroy(); title.destroy(); bar.destroy(); });
  }
  create() {
    this.input.dragDistanceThreshold = 8;
    this.toys.clear(); this.dancing=false; this.specialBusy=false;
    this.pending.clear(); this.slots = {}; this.partImages = {}; this.outfitLayers = {}; this.guestArrived = false;
    this.add.image(W / 2, H / 2, !this.showStories&&!this.showPets&&save.story==='space'?'spaceBackground':'garden').setDisplaySize(W, H);
    this.add.rectangle(240, 76, 480, 152, 0xfffbf6, .88);
    this.text(26, 28, 'МАЛЕНЬКИЕ СКАЗКИ', 12, muted).setLetterSpacing(2);
    this.text(26, 58, this.showStories?'Куда отправимся?':this.showPets?'Забота о питомце':this.story.name, 23, ink, true);
    this.add.image(377,45,'worlds').setDisplaySize(32,32);
    this.add.zone(377,45,56,60).setInteractive({useHandCursor:true}).on('pointerdown',()=>this.openStories());
    const sound = this.add.image(438, 45, save.sound ? 'sound' : 'mute').setDisplaySize(29, 29);
    this.add.zone(437, 46, 60, 60).setInteractive({ useHandCursor: true }).on('pointerdown', () => {
      save.sound = !save.sound; soundtrack.setEnabled(save.sound); persist(save); sound.setTexture(save.sound ? 'sound' : 'mute'); if (save.sound) chime([659]);
    });
    if(this.showStories) {
      this.storyMenu();
      this.cameras.main.fadeIn(350,255,249,243);
      this.events.once('shutdown',()=>this.input.removeAllListeners());
      document.querySelector('#game')?.setAttribute('data-stage','stories');
      return;
    }
    if(this.showPets){
      petCare(this,chime,()=>this.openStories());
      this.events.once('shutdown',()=>this.input.removeAllListeners());
      document.querySelector('#game')?.setAttribute('data-stage','pets');
      document.querySelector('#game')?.setAttribute('data-story','pets');
      return;
    }
    const stageIndex = ['dress','castle','party'].indexOf(save.stage);
    ['Наряд', this.story.building, 'Гость'].forEach((name, i) => {
      const x = 87 + 153 * i;
      if (i < 2) this.add.rectangle(x + 78, 113, 55, 2, 0xe4d8e2);
      this.add.circle(x - 29, 113, 15, i <= stageIndex ? 0xb79ac8 : 0xece3ea);
      this.text(x - 29, 113, i < stageIndex ? '✓' : `${i + 1}`, 14, i <= stageIndex ? '#ffffff' : '#ac99b0', true).setOrigin(.5);
      this.add.image(x + 13, 110, [this.texture('dressIcon0'),this.texture('castle0'),this.story.guest][i]).setDisplaySize(42,42).setAlpha(i <= stageIndex ? 1 : .45);
      this.text(x + 13, 136, name, 10, muted).setOrigin(.5);
    });
    if (save.stage === 'dress') this.dressScene();
    if (save.stage === 'castle') this.castleScene();
    if (save.stage === 'party') this.partyScene();
    this.cameras.main.fadeIn(240, 255, 249, 243);
    this.events.once('shutdown', () => { this.input.removeAllListeners(); });
    document.querySelector('#game')?.setAttribute('data-stage', save.stage);
    document.querySelector('#game')?.setAttribute('data-story', save.story);
  }
  private openStories() {
    if(this.showStories)return;
    persist(save);this.showStories=true;this.scene.restart();
  }
  private storyMenu() {
    this.text(240,124,'Твоя маленькая страна чудес',19,ink,true).setOrigin(.5);
    for(let i=0;i<12;i++) {
      const star=this.add.star(30+(i*97)%420,164+(i*61)%540,4,2,7,0xf1d59a,.6);
      this.tweens.add({targets:star,y:star.y-15,alpha:.15,angle:25,duration:1700+i*90,yoyo:true,repeat:-1});
    }
    ([...storyIds,'pets'] as const).forEach((id,i)=>{
      const story=id==='pets'?{name:'Забота о питомце',guest:'dog'}:stories[id],x=132+(i%2)*216,y=247+Math.floor(i/2)*174;
      const card=this.add.container(x,y);
      card.add(this.panel(0,0,200,158,[0xf4e5ed,0xe8e8f8,0xe7efe2,0xeee2f5,0xe0eff2,0xf8e8d6][i],0xffffff));
      card.add(this.add.ellipse(-20,34,125,13,0xd8ccd7));
      const key=id==='pets'?'cat':id==='castle'?'castle0':id+'_castle0';
      const building=this.add.image(-24,-16,key).setDisplaySize(100,94);
      card.add(building);
      const guest=this.add.image(45,10,story.guest).setDisplaySize(61,61);
      card.add(guest);
      this.tweens.add({targets:guest,y:4,angle:i===1?6:-4,duration:1100+i*200,yoyo:true,repeat:-1,ease:'Sine.easeInOut'});
      if(id==='space')this.tweens.add({targets:building,y:-13,duration:1900,yoyo:true,repeat:-1,ease:'Sine.easeInOut'});
      card.add(this.text(0,45,story.name,14,ink,true).setWordWrapWidth(182).setOrigin(.5,0));
      card.add(this.add.circle(75,-49,17,0xffffff,.85));
      const play=this.add.triangle(77,-49,0,0,0,16,13,8,0xa487b9);
      card.add(play);
      this.tweens.add({targets:play,x:79,duration:900,yoyo:true,repeat:-1,ease:'Sine.easeInOut'});
      card.setSize(200,158).setInteractive({useHandCursor:true});
      let opening=false;
      card.on('pointerdown',()=>this.tweens.add({targets:card,scale:.98,duration:90}));
      card.on('pointerout',()=>this.tweens.add({targets:card,scale:1,duration:90}));
      card.on('pointerup',()=>{
        if(opening)return;opening=true;card.disableInteractive();
        this.sparkles(x,y);chime([523,659,784]);
        this.time.delayedCall(180,()=>{
          this.showPets=id==='pets';
          if(id!=='pets'&&id!==save.story)save=restoreStory(id,save.sound);
          persist(save);this.showStories=false;this.category='dress';this.scene.restart();
        });
      });
      card.setAlpha(.01).setX(x+12);
      this.tweens.add({targets:card,x,alpha:1,duration:330,delay:i*100,ease:'Sine.easeOut'});
    });
    this.button(240,757,410,'Заново: '+(this.showPets?'Забота о питомце':this.story.name),()=>{
      if(this.showPets)resetPetCare();
      else {save={...fresh(save.story),sound:save.sound};persist(save);}
      this.showStories=false;this.category='dress';this.scene.restart();
    },true,'replay');
    this.text(240,809,'Нажми на сказку, чтобы начать или продолжить',11,muted).setOrigin(.5);
  }
  private text(x: number, y: number, content: string, size = 18, color = ink, bold = false) {
    return this.add.text(x, y, content, { fontFamily: 'Arial, sans-serif', fontSize: `${size}px`, color, fontStyle: bold ? 'bold' : 'normal' });
  }
  private panel(x: number, y: number, w: number, h: number, fill = 0xfffcf8, stroke = 0xede1e9, radius = 22) {
    const g = this.add.graphics({ x, y });
    g.fillStyle(0x8d709c, .07).fillRoundedRect(-w / 2, -h / 2 + 4, w, h, radius);
    g.fillStyle(fill, .97).fillRoundedRect(-w / 2, -h / 2, w, h, radius);
    g.lineStyle(1.5, stroke).strokeRoundedRect(-w / 2, -h / 2, w, h, radius);
    return g;
  }
  private button(x: number, y: number, width: number, label: string, action: () => void, secondary = false, icon = 'arrow') {
    const c = this.add.container(x, y);
    const shape = this.panel(0, 0, width, 68, secondary ? 0xfffcf8 : 0xac8bc0, secondary ? 0xe1d1e3 : 0xac8bc0, 20);
    const txt = this.text(0, 24, label, 11, secondary ? ink : '#ffffff', true).setOrigin(.5);
    const pictogram = this.add.image(width > 200 ? -28 : 0, -7, icon);
    if(secondary&&icon==='replay')pictogram.setTint(0xaa8dc0);
    const ratio = pictogram.width / pictogram.height;
    pictogram.setDisplaySize(Math.min(48,44*ratio),Math.min(44,48/ratio));
    c.add([shape, pictogram, txt]);
    if(width > 200) {
      const arrow=this.add.image(38,-7,'arrow').setDisplaySize(36,36);if(secondary)arrow.setTint(0xaa8dc0);c.add(arrow);
      this.tweens.add({targets:arrow,x:46,duration:700,yoyo:true,repeat:-1,ease:'Sine.easeInOut'});
    }
    c.setSize(width, 68).setInteractive({ useHandCursor: true });
    c.on('pointerdown', () => { this.tweens.add({ targets: c, scale: .96, duration: 80 }); });
    c.on('pointerout', () => { this.tweens.add({ targets: c, scale: 1, duration: 80 }); });
    c.on('pointerup', () => { this.tweens.add({ targets: c, scale: 1, duration: 100 }); action(); });
    return c;
  }
  private tapHint(x: number,y: number) {
    const hint=this.add.container(x,y).setDepth(40);
    const ring=this.add.circle(0,0,26).setStrokeStyle(3,0xd4b580,.8);
    const hand=this.add.image(22,43,'tap').setDisplaySize(43,43);
    hint.add([ring,hand]);
    const pulse=this.tweens.add({targets:ring,scale:1.3,alpha:.25,duration:850,yoyo:true,repeat:-1});
    const tap=this.tweens.add({targets:hand,y:31,duration:850,yoyo:true,repeat:-1});
    this.input.once('pointerdown',()=>{pulse.stop();tap.stop();hint.destroy(true);});
  }
  private title(title: string, subtitle: string) {
    this.text(240, 155, title, 25, ink, true).setOrigin(.5);
    this.text(240, 185, subtitle, 15, muted).setOrigin(.5);
  }
  private go(stage: Stage) { save.stage = stage; persist(save); this.scene.restart(); }
  private sparkles(x: number, y: number, color = 0xe7bd74) {
    for (let i = 0; i < 10; i++) {
      const angle = Math.PI * 2 * i / 10;
      const star = this.add.star(x, y, 4, 2, 6, color).setDepth(30);
      this.tweens.add({ targets: star, x: x + Math.cos(angle) * 65, y: y + Math.sin(angle) * 60 - 15, alpha: 0, angle: 90, duration: 700, onComplete: () => star.destroy() });
    }
  }
  private princess(x: number, y: number, scale = 1) {
    const c = this.add.container(x, y);
    const body = this.add.image(0, 0, this.texture('body')).setDisplaySize(240,360);
    c.add(body);
    for (const category of ['shoes','dress','crown','earrings'] as Category[]) {
      const item = this.add.image(0, 0, this.texture(`${category}${save.outfit[category]}`)).setDisplaySize(240,360);
      c.add(item); this.outfitLayers[category] = item;
    }
    const eyes = this.add.image(0, 0, 'eyes').setDisplaySize(240,360); c.add(eyes);
    this.time.addEvent({ delay: 3200, loop: true, callback: () => { eyes.setTexture('blink'); this.time.delayedCall(150, () => eyes.setTexture('eyes')); } });
    c.setScale(scale);
    c.setSize(175,310).setInteractive({useHandCursor:true}).on('pointerdown',()=>{
      this.sparkles(x,y-65);
      this.tweens.add({targets:c,angle:5,duration:160,yoyo:true,repeat:1});
      chime([659,784,988]);
    });
    this.tweens.add({ targets: c, y: y - 3, duration: 1700, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });
    return c;
  }
  private dressScene() {
    this.title(this.story.dressTitle, 'Выбирай всё, что нравится');
    this.add.ellipse(240, 511, 182, 24, 0x9f8399, .12);
    this.add.circle(240, 339, 122, 0xfffcf2, .43);
    this.princess(240, 366, 1.08);
    const star = this.add.star(351, 286, 4, 4, 12, 0xeac584, .8);
    this.tweens.add({ targets: star, angle: 40, alpha: .25, duration: 2000, repeat: -1, yoyo: true });
    this.drawPalette();
    this.button(240, 757, 410, this.story.building, () => { chime([523,784]); this.go('castle'); }, false, this.texture('castle0'));
    this.tapHint(75, 638);
    this.text(240, 802, 'Можно нажимать или перетаскивать', 12, muted).setOrigin(.5);
  }
  private drawPalette() {
    this.palette?.destroy(true);
    const c = this.add.container(0,0); this.palette = c;
    c.add(this.panel(240, 626, 440, 184));
    categories.forEach((category, i) => {
      const x = 75 + i * 110;
      const tab = this.add.container(x, 558);
      if (this.category === category) tab.add(this.panel(0, 0, 101, 46, 0xefe5f3, 0xefe5f3, 14));
      const symbol=this.add.image(0,-5,this.texture(`${category}Icon${category==='earrings'?2:0}`));
      const aspect=symbol.width/symbol.height;
      symbol.setDisplaySize(Math.min(43,34*aspect),Math.min(34,43/aspect));tab.add(symbol);
      tab.add(this.text(0,17,category==='crown'?(save.story==='space'?'Шлемы':save.story==='wizard'||save.story==='pirate'?'Шляпы':save.story==='forest'?'Венки':labels[category]):labels[category],10, this.category === category ? '#866393' : muted, true).setOrigin(.5));
      tab.setSize(104,44).setInteractive({ useHandCursor:true }).on('pointerdown', () => { this.category = category; this.drawPalette(); });
      c.add(tab);
    });
    for (let v = 0; v < 4; v++) {
      const x = 75 + v * 110, selected = save.outfit[this.category] === v;
      c.add(this.panel(x, 644, 94, 116, selected ? 0xf3e9f5 : 0xfffbf6, selected ? 0xb899ca : 0xede1e9, 17));
      const image = this.add.image(x, 638, this.texture(`${this.category}Icon${v}`));
      const ratio = image.width / image.height;
      image.setDisplaySize(Math.min(76, 81*ratio), Math.min(81,76/ratio));
      image.setInteractive({ useHandCursor: true, draggable: true });
      const category = this.category;
      image.setData('dragged',false);
      image.on('pointerdown', () => image.setData('dragged',false));
      image.on('dragstart', () => { image.setData('dragged',true); image.setDepth(20); });
      image.on('drag', (_p: Phaser.Input.Pointer, dx: number, dy: number) => { image.setPosition(dx,dy); });
      image.on('dragend', () => {
        const near = image.y < 530 && image.x > 95 && image.x < 385;
        if (near) this.choose(category, v);
        image.setPosition(x,638).setDepth(0);
      });
      image.on('pointerup', () => { if (!image.getData('dragged')) this.choose(category,v); });
      c.add(image);
      const zone = this.add.zone(x, 644, 94, 116).setInteractive({ useHandCursor:true }).on('pointerdown', () => this.choose(category,v));
      c.addAt(zone, c.length - 1);
      if (selected) { c.add(this.add.circle(x+33,600,11,0xb79ac8)); c.add(this.text(x+33,600,'✓',14,'#ffffff',true).setOrigin(.5)); }
    }
  }
  private choose(category: Category, v: number) {
    save.outfit[category] = v; persist(save);
    const layer = this.outfitLayers[category]; layer?.setTexture(this.texture(`${category}${v}`));
    this.sparkles(240, category === 'crown' ? 229 : category === 'shoes' ? 518 : 410);
    chime([659,784]);
    this.time.delayedCall(0, () => this.drawPalette());
  }
  private drawCastle() {
    this.castleImage = this.add.image(240, 365, this.texture(`castle${save.castleColor}`)).setDisplaySize(360,320);
    for (const piece of pieceNames) {
      const {x,y,size} = this.targets[piece];
      if (save.pieces.includes(piece)) this.placeImage(piece);
      else {
        const slot = this.add.image(x,y,this.texture(`${piece}0`)).setDisplaySize(size,size).setTint(0x9f839e).setAlpha(.23);
        this.slots[piece] = slot;
        this.add.circle(x,y,18,0xfffaf4,.85);
        this.text(x,y,'+',23,'#ad91b4').setOrigin(.5);
      }
    }
  }
  private placeImage(piece: Piece) {
    const {x,y,size} = this.targets[piece];
    const item = this.add.image(x,y,this.texture(`${piece}${save.variants[piece]}`)).setDisplaySize(size,size).setDepth(4);
    this.partImages[piece] = item;
    if(save.stage==='castle' || piece!=='door') item.setInteractive({useHandCursor:true}).on('pointerdown',()=>{
      save.variants[piece]=(save.variants[piece]+1)%3;
      item.setTexture(this.texture(`${piece}${save.variants[piece]}`));
      persist(save);this.sparkles(x,y);chime([523,659]);
    });
    if (piece === 'flag') this.tweens.add({ targets:item, angle:2, duration:1400, yoyo:true, repeat:-1, ease:'Sine.easeInOut' });
    return item;
  }
  private castleScene() {
    this.title(this.story.buildTitle, 'Выбирай цвет и меняй детали нажатием');
    this.drawCastle();
    this.panel(240,626,440,184);
    this.drawPaintPalette();
    pieceNames.forEach((piece,i) => {
      const x = 75 + i * 110, y = 637;
      this.panel(x,y,94,112,0xfff9f1,0xeee1df,17);
      this.text(x,680,this.story.names[piece],12,muted).setOrigin(.5);
      if (save.pieces.includes(piece)) { this.trayPreview(piece,x); return; }
      const item = this.add.image(x,y-9,this.texture(`${piece}${save.variants[piece]}`)).setDisplaySize(70,70).setDepth(8);
      item.setInteractive({useHandCursor:true,draggable:true});
      item.on('pointerdown', () => item.setData('dragged',false));
      item.on('dragstart', () => { item.setData('dragged',true); item.setDepth(20); this.slots[piece]?.setAlpha(.55); });
      item.on('drag', (_p: Phaser.Input.Pointer, dx: number, dy: number) => item.setPosition(dx,dy-20));
      item.on('dragend', () => {
        const t = this.targets[piece];
        this.slots[piece]?.setAlpha(.23);
        if (Phaser.Math.Distance.Between(item.x,item.y,t.x,t.y) < 85) this.place(piece,item);
        else { this.tweens.add({targets:item,x,y:y-9,duration:260,ease:'Back.easeOut'}); this.hint(piece); }
      });
      item.on('pointerup', () => { if (!item.getData('dragged')) this.place(piece,item); });
    });
    this.updateNext();
    this.text(240,802,'Нажимай на готовые детали, чтобы менять их',12,muted).setOrigin(.5);
    this.time.addEvent({delay:6500,loop:true,callback:()=>{const p=pieceNames.find(p=>!save.pieces.includes(p)&&!this.pending.has(p));if(p)this.hint(p);}});
  }
  private drawPaintPalette() {
    this.paintPalette?.destroy(true);
    const c=this.add.container(0,0);this.paintPalette=c;
    c.add(this.add.image(65,557,'paint').setDisplaySize(40,40));
    [0xc6aed9,0xa4c7b1,0xb3c6e6,0xe7b4a5].forEach((color,i)=>{
      const x=151+i*75;
      c.add(this.add.circle(x,557,19,color).setStrokeStyle(save.castleColor===i?3:1,save.castleColor===i?0x806389:0xffffff));
      if(save.castleColor===i)c.add(this.text(x,557,'✓',18,'#ffffff',true).setOrigin(.5));
      c.add(this.add.zone(x,557,56,44).setInteractive({useHandCursor:true}).on('pointerdown',()=>{
        save.castleColor=i;persist(save);this.castleImage?.setTexture(this.texture(`castle${i}`));
        this.sparkles(240,320,color);chime([523+i*65,784]);this.drawPaintPalette();
      }));
    });
  }
  private trayPreview(piece: Piece,x:number) {
    const image=this.add.image(x,628,this.texture(`${piece}${save.variants[piece]}`)).setDisplaySize(64,64).setAlpha(.65);
    image.setInteractive({useHandCursor:true}).on('pointerdown',()=>{
      const part=this.partImages[piece];
      if(part) {part.emit('pointerdown');image.setTexture(this.texture(`${piece}${save.variants[piece]}`));}
    });
    this.add.circle(x+31,593,10,0x9caf8c);
    this.text(x+31,593,'✓',12,'#ffffff',true).setOrigin(.5);
  }
  private hint(piece: Piece) {
    const slot = this.slots[piece];
    if(slot?.active) this.tweens.add({targets:slot,alpha:.65,duration:400,yoyo:true,repeat:1});
  }
  private place(piece: Piece, item: Phaser.GameObjects.Image) {
    if(save.pieces.includes(piece)||this.pending.has(piece))return;
    this.pending.add(piece); item.disableInteractive();
    const t=this.targets[piece];
    this.tweens.add({targets:item,x:t.x,y:t.y,displayWidth:t.size,displayHeight:t.size,duration:400,ease:'Back.easeOut',onComplete:()=>{
      item.destroy(); this.slots[piece]?.destroy(); this.placeImage(piece);
      save.pieces.push(piece); persist(save); this.pending.delete(piece);
      this.sparkles(t.x,t.y); chime();
      this.count?.setText(`Готово ${save.pieces.length} из 4`);
      const index=pieceNames.indexOf(piece);this.trayPreview(piece,75+index*110);
      this.updateNext();
    }});
  }
  private updateNext() {
    this.next?.destroy(true);
    if(save.pieces.length===4) this.next=this.button(240,757,410,'К гостю',()=>{chime([523,659,784,1047]);this.go('party');},false,this.story.guest);
    else {
      this.next=this.add.container(240,757);
      pieceNames.forEach((piece,i)=>{
        const x=-90+i*60;
        this.next!.add(this.add.image(x,0,this.texture(`${piece}0`)).setDisplaySize(40,40).setAlpha(save.pieces.includes(piece)?1:.22));
        if(save.pieces.includes(piece))this.next!.add(this.text(x+17,10,'✓',14,'#719767',true).setOrigin(.5));
      });
    }
  }
  private partyScene() {
    this.title('Тук-тук! Кто там?', 'Нажми на дверь, чтобы встретить гостя');
    this.drawCastle();
    const door=this.partImages.door!;
    door.setInteractive({useHandCursor:true}).once('pointerdown',()=>this.welcome());
    this.tweens.add({targets:door,angle:2,duration:180,yoyo:true,repeat:3,delay:500});
    this.panel(240,649,440,111);
    this.partyTitle = this.text(240,627,'Всё готово к празднику!',23,ink,true).setOrigin(.5);
    this.partyNote = this.text(240,665,'Открой дверь и встречай друга',15,muted).setOrigin(.5);
    this.button(90,757,136,'Наряд',()=>this.go('dress'),true,this.texture('dressIcon0'));
    this.button(240,757,136,this.story.building,()=>this.go('castle'),true,this.texture('castle0'));
    this.button(390,757,136,'Сказки',()=>this.openStories(),false,'worlds');
    if(save.giftOpened) this.welcome();
    else this.tapHint(240,448);
  }
  private welcome() {
    if(this.guestArrived)return;this.guestArrived=true;
    this.children.list.filter(o=>o instanceof Phaser.GameObjects.Text && (o.text==='Тук-тук! Кто там?'||o.text==='Нажми на дверь, чтобы встретить гостя')).forEach(o=>o.destroy());
    this.title('Какой чудесный праздник!', 'Нажимай, танцуй и запускай праздник!');
    this.partyTitle?.destroy();this.partyNote?.destroy();
    this.partyTitle=this.text(240,576,'Ура! Теперь можно поиграть',17,ink,true).setOrigin(.5);
    this.partyControls();
    const door=this.partImages.door!;door.disableInteractive();
    this.tweens.add({targets:door,scaleX:door.scaleX*.12,alpha:.4,duration:500});
    this.hero=this.princess(140,454,.49).setDepth(7);
    const cat=this.add.image(246,458,this.story.guest).setDisplaySize(38,38).setDepth(10);
    this.tweens.add({targets:cat,x:305,y:506,displayWidth:110,displayHeight:110,duration:650,ease:'Back.easeOut'});
    this.guest=cat;
    cat.setInteractive({useHandCursor:true}).on('pointerdown',()=>{
      const h=this.add.image(cat.x,cat.y-50,'heart').setDisplaySize(25,25).setDepth(11);
      this.tweens.add({targets:h,y:h.y-60,alpha:0,duration:1000,onComplete:()=>h.destroy()});
      this.tweens.add({targets:cat,angle:-5,duration:130,yoyo:true,repeat:1});chime([392,494]);
    });
    this.gift=this.add.image(368,531,'gift').setDisplaySize(66,66).setDepth(10).setInteractive({useHandCursor:true});
    this.gift.on('pointerdown',()=>this.openGift());
    chime([523,659,784,1047]);this.confetti();
    this.time.delayedCall(800,()=>this.balloons());
    if(save.giftOpened)this.showGift();
  }
  private partyControls() {
    const actions=[
      {x:75,icon:'dance',label:'Танцевать',run:()=>this.dance()},
      {x:185,icon:'balloon',label:'Шарики',run:()=>this.balloons()},
      {x:295,icon:'bubbles',label:'Пузыри',run:()=>this.bubbles()},
      {x:405,icon:this.story.special,label:save.story==='space'?'Полёт':save.story==='forest'||save.story==='wizard'?'Волшебство':save.story==='pirate'?'Сокровища':'Салют',run:()=>this.special()},
    ];
    actions.forEach(a=>this.button(a.x,649,94,a.label,a.run,true,a.icon));
  }
  private confetti() {
    const colors=[0xe9a9c4,0xb4d5a8,0xf4d282,0xb4c6e9];
    for(let i=0;i<32;i++){
      const bit=this.add.rectangle(Phaser.Math.Between(25,455),210,6,11,colors[i%4]).setDepth(25);
      this.tweens.add({targets:bit,y:Phaser.Math.Between(450,560),x:bit.x+Phaser.Math.Between(-25,25),angle:Phaser.Math.Between(-200,200),alpha:0,duration:Phaser.Math.Between(1100,2200),onComplete:()=>bit.destroy()});
    }
  }
  private dance() {
    if(this.dancing||!this.hero||!this.guest)return;this.dancing=true;
    this.tweens.add({targets:[this.hero,this.guest],angle:9,duration:220,yoyo:true,repeat:5,onComplete:()=>{
      this.hero?.setAngle(0);this.guest?.setAngle(0);this.dancing=false;
    }});
    chime([523,659,784,659,523,784]);this.confetti();
  }
  private balloons() {
    if(this.toys.size>8)return;
    [0,1,2].forEach(i=>{
      const item=this.add.image(80+i*155,425,'balloon').setDisplaySize(67,85).setDepth(18);
      item.setTint([0xffffff,0xd4f0e0,0xded6ff][i]);
      this.toys.add(item);
      const float=this.tweens.add({targets:item,y:240,x:item.x+Phaser.Math.Between(-15,15),duration:6500,onComplete:()=>{this.toys.delete(item);item.destroy();}});
      item.setInteractive({useHandCursor:true}).once('pointerdown',()=>{
        float.stop();this.sparkles(item.x,item.y,0xe9a9c4);chime([784,1047]);this.toys.delete(item);item.destroy();
      });
    });
  }
  private bubbles() {
    if(this.toys.size>8)return;
    for(let i=0;i<5;i++){
      const x=55+i*88;
      const bubble=this.add.circle(x,510,Phaser.Math.Between(17,25),0xd7eff5,.6).setStrokeStyle(3,0xb1c9e0).setDepth(18);
      this.toys.add(bubble);
      const float=this.tweens.add({targets:bubble,y:230,x:x+Phaser.Math.Between(-20,20),duration:4500+i*300,onComplete:()=>{this.toys.delete(bubble);bubble.destroy();}});
      bubble.setInteractive({useHandCursor:true}).once('pointerdown',()=>{
        float.stop();this.sparkles(bubble.x,bubble.y,0xb0d7db);chime([1047]);this.toys.delete(bubble);bubble.destroy();
      });
    }
  }
  private special() {
    if(this.specialBusy)return;this.specialBusy=true;
    if(save.story==='space'){
      const ship=this.add.image(240,480,'rocket').setDisplaySize(70,95).setDepth(22);
      this.tweens.add({targets:ship,y:210,angle:20,x:350,duration:1800,ease:'Sine.easeIn',onComplete:()=>{ship.destroy();this.sparkles(350,210);}});
    }else if(save.story==='wizard'){
      for(let i=0;i<8;i++)this.time.delayedCall(i*120,()=>{const star=this.add.star(240,450,5,8,20,0xf3d57e).setDepth(22);star.setInteractive().on('pointerdown',()=>{this.sparkles(star.x,star.y);star.destroy();});this.tweens.add({targets:star,x:90+i*43,y:240+(i%3)*45,angle:180,alpha:0,duration:1800,onComplete:()=>star.destroy()});});
    }else if(save.story==='pirate'){
      const chest=this.add.image(240,380,'treasure').setDisplaySize(90,90).setDepth(22);this.tweens.add({targets:chest,y:320,angle:8,duration:450,yoyo:true,repeat:2,onComplete:()=>chest.destroy()});for(let i=0;i<10;i++)this.time.delayedCall(i*90,()=>this.sparkles(90+i*33,330+(i%2)*70,0xefcd68));
    }else if(save.story==='forest'){
      for(let i=0;i<5;i++)this.time.delayedCall(i*140,()=>{
        const heart=this.add.image(310,484,'heart').setDisplaySize(25,25).setDepth(22);
        this.tweens.add({targets:heart,x:150+i*35,y:280-i*10,alpha:0,duration:1600,onComplete:()=>heart.destroy()});
      });
    }else{
      [0,1,2].forEach(i=>this.time.delayedCall(i*300,()=>this.sparkles(100+i*140,255+(i%2)*55,[0xe7bd74,0xe9a9c4,0xb3c6e6][i])));
    }
    chime([523,659,784,1047]);this.confetti();
    this.time.delayedCall(2200,()=>this.specialBusy=false);
  }
  private openGift(){
    if(save.giftOpened)return;save.giftOpened=true;persist(save);this.showGift();this.sparkles(368,505);chime([659,784,1047]);
  }
  private showGift(){
    this.partyTitle?.setText('Это сердечко для тебя!');
    this.confetti();
    this.gift?.disableInteractive().setTexture('heart').setDisplaySize(49,49);
    if(this.gift)this.tweens.add({targets:this.gift,y:511,duration:1200,yoyo:true,repeat:-1,ease:'Sine.easeInOut'});
  }
}

new Phaser.Game({type:Phaser.AUTO,parent:'game',width:W,height:H,backgroundColor:'#fff9f0',transparent:false,scale:{mode:Phaser.Scale.FIT,autoCenter:Phaser.Scale.CENTER_BOTH},render:{antialias:true},input:{activePointers:2},scene:[CastleGame],audio:{noAudio:true}});

if(import.meta.env.PROD && 'serviceWorker' in navigator){
  window.addEventListener('load',()=>{void navigator.serviceWorker.register('./sw.js').catch(()=>{ /* Offline mode can be retried on the next launch. */ });});
}
