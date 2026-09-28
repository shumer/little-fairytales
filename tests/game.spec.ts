import { test, expect, type Page } from '@playwright/test';
const key='little-castle-v1';
const read=(page:Page)=>page.evaluate(k=>JSON.parse(localStorage.getItem(k)||'null'),key);
async function ready(page:Page,stage:string){await expect(page.locator('#game')).toHaveAttribute('data-stage',stage);await page.waitForTimeout(300);}
async function tap(page:Page,x:number,y:number){const b=await page.locator('canvas').boundingBox();if(!b)throw Error('Missing canvas.');await page.mouse.click(b.x+x*b.width/480,b.y+y*b.height/820,{delay:80});await page.waitForTimeout(80);}

async function enterSaved(page:Page,stage:string){
 await ready(page,'stories');const saved=await read(page).catch(()=>null);
 const index=['castle','space','forest'].indexOf(saved?.story||'castle');
 await tap(page,240,225+139*index);await ready(page,stage);
}

test('Full story, invalid drop, drag, persistence, gift and restart',async({page})=>{
 const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto('/');await enterSaved(page,'dress');
 await tap(page,185,638);await expect.poll(async()=>(await read(page))?.outfit.dress).toBe(1);
 await tap(page,185,558);await tap(page,185,638);await expect.poll(async()=>(await read(page))?.outfit.shoes).toBe(1);
 await tap(page,295,558);await tap(page,185,638);await expect.poll(async()=>(await read(page))?.outfit.crown).toBe(1);
 await page.reload();await enterSaved(page,'dress');expect((await read(page)).outfit).toEqual({dress:1,shoes:1,crown:1,earrings:0});
 await page.screenshot({path:'test-results/dress.png'});
 await tap(page,240,757);await ready(page,'castle');
 await page.mouse.move(75,628);await page.mouse.down();await page.mouse.move(60,350,{steps:12});await page.mouse.up();await page.waitForTimeout(500);
 expect((await read(page)).pieces).toHaveLength(0);
 await page.mouse.move(75,628);await page.mouse.down();await page.mouse.move(240,468,{steps:16});await page.mouse.up();
 await expect.poll(async()=>(await read(page)).pieces).toEqual(['door']);
 await tap(page,185,628);await tap(page,295,628);await tap(page,405,628);
 await expect.poll(async()=>(await read(page)).pieces.length).toBe(4);
 await page.reload();await enterSaved(page,'castle');await page.screenshot({path:'test-results/castle.png'});
 await tap(page,240,757);await ready(page,'party');await tap(page,240,448);await page.waitForTimeout(750);
 await tap(page,305,506);await tap(page,368,531);await expect.poll(async()=>(await read(page)).giftOpened).toBe(true);
 await page.screenshot({path:'test-results/party.png'});
 await page.reload();await enterSaved(page,'party');expect((await read(page)).giftOpened).toBe(true);
 await tap(page,390,757);await ready(page,'stories');await tap(page,240,757);await ready(page,'dress');expect((await read(page)).pieces).toEqual([]);expect((await read(page)).giftOpened).toBe(false);
 expect(errors).toEqual([]);
});

test('Production starts offline after first load',async({page,context})=>{
 await page.goto('/');await enterSaved(page,'dress');await tap(page,185,638);
 await page.evaluate(async()=>{await navigator.serviceWorker.ready;if(!navigator.serviceWorker.controller)await new Promise<void>(resolve=>navigator.serviceWorker.addEventListener('controllerchange',()=>resolve(),{once:true}));});
 await context.setOffline(true);await page.reload();await enterSaved(page,'dress');
 expect((await read(page)).outfit.dress).toBe(1);
 await tap(page,240,757);await ready(page,'castle');await tap(page,75,628);
 await expect.poll(async()=>(await read(page)).pieces).toEqual(['door']);
});

test('Small phone touch input and corrupt storage recovery',async({browser})=>{
 const context=await browser.newContext({viewport:{width:360,height:740},isMobile:true,hasTouch:true});const page=await context.newPage();
 await page.goto('http://localhost:4174/');await enterSaved(page,'dress');
 await page.evaluate(k=>localStorage.setItem(k,'broken'),key);await page.reload();await enterSaved(page,'dress');
 const b=await page.locator('canvas').boundingBox();if(!b)throw Error('Missing canvas.');
 await page.touchscreen.tap(b.x+185*b.width/480,b.y+638*b.height/820);
 await expect.poll(async()=>(await read(page))?.outfit.dress).toBe(1);
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
 await page.screenshot({path:'test-results/phone.png'});await context.close();
});


test('Expanded wardrobe, earrings, castle paint and variants survive reload',async({page})=>{
 await page.goto('/');await enterSaved(page,'dress');
 await tap(page,295,638);expect((await read(page)).outfit.dress).toBe(2);
 await tap(page,405,638);expect((await read(page)).outfit.dress).toBe(3);
 await tap(page,295,558);await tap(page,405,638);
 await tap(page,405,558);await tap(page,295,638);
 expect((await read(page)).outfit).toMatchObject({dress:3,crown:3,earrings:2});
 await page.screenshot({path:'test-results/expanded-outfit.png'});
 await tap(page,75,638);expect((await read(page)).outfit.earrings).toBe(0);
 await tap(page,405,638);await tap(page,240,757);await ready(page,'castle');
 await tap(page,226,557);expect((await read(page)).castleColor).toBe(1);
 for(const x of [75,185,295,405])await tap(page,x,628);
 await expect.poll(async()=>(await read(page)).pieces.length).toBe(4);
 await tap(page,240,448);expect((await read(page)).variants.door).toBe(1);
 await tap(page,185,628);expect((await read(page)).variants.window).toBe(1);
 await page.reload();await enterSaved(page,'castle');
 expect((await read(page)).castleColor).toBe(1);expect((await read(page)).variants.door).toBe(1);
 await page.screenshot({path:'test-results/painted-castle.png'});
 await tap(page,240,757);await ready(page,'party');await tap(page,240,757);await ready(page,'castle');
 expect((await read(page)).outfit.earrings).toBe(3);
});

test('Old saves receive defaults for new customizations',async({page})=>{
 await page.goto('/');await enterSaved(page,'dress');
 await page.evaluate(k=>localStorage.setItem(k,JSON.stringify({version:1,stage:'castle',outfit:{dress:1,shoes:1,crown:1},pieces:['door'],sound:false,giftOpened:false})),key);
 await page.reload();await enterSaved(page,'castle');await tap(page,301,557);
 expect((await read(page)).castleColor).toBe(2);expect((await read(page)).outfit.earrings).toBe(0);
 expect((await read(page)).variants).toEqual({door:0,window:0,flag:0,flowers:0});
});

test('Music starts on touch, follows mute, pauses when hidden and shares one context',async({page})=>{
 await page.addInitScript(()=>{
  const contexts: AudioContext[]=[];
  Object.assign(window,{audioTestContexts:contexts});
  const Native=window.AudioContext;
  window.AudioContext=new Proxy(Native,{construct(target,args){const context=new target(...args);contexts.push(context);return context;}});
 });
 const states=()=>page.evaluate(()=>((window as unknown as {audioTestContexts:AudioContext[]}).audioTestContexts).map(c=>c.state));
 await page.goto('/');await ready(page,'stories');expect(await states()).toEqual([]);await enterSaved(page,'dress');
 await tap(page,185,638);await expect.poll(states).toEqual(['running']);
 await tap(page,438,45);await expect.poll(states).toEqual(['suspended']);expect((await read(page)).sound).toBe(false);
 await tap(page,438,45);await expect.poll(states).toEqual(['running']);
 await tap(page,240,757);await ready(page,'castle');expect(await states()).toEqual(['running']);
 await page.evaluate(()=>{Object.defineProperty(document,'hidden',{value:true,configurable:true});document.dispatchEvent(new Event('visibilitychange'));});
 await expect.poll(states).toEqual(['suspended']);
 await page.evaluate(()=>{Object.defineProperty(document,'hidden',{value:false,configurable:true});document.dispatchEvent(new Event('visibilitychange'));});
 await expect.poll(states).toEqual(['running']);
 await tap(page,438,45);await page.reload();await enterSaved(page,'castle');await tap(page,75,628);
 expect(await states()).toEqual([]);expect((await read(page)).sound).toBe(false);
});

test('Three stories, independent progress and interactive finales',async({page})=>{
 const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto('/');await enterSaved(page,'dress');
 await tap(page,295,638);
 await tap(page,377,45);await ready(page,'stories');await page.screenshot({path:'test-results/stories.png'});
 await tap(page,240,364);await ready(page,'dress');
 await expect(page.locator('#game')).toHaveAttribute('data-story','space');
 await tap(page,185,638);await page.screenshot({path:'test-results/space-outfit.png'});
 await tap(page,240,757);await ready(page,'castle');
 for(const x of [75,185,295,405])await tap(page,x,628);
 await expect.poll(async()=>(await read(page)).pieces.length).toBe(4);
 await page.screenshot({path:'test-results/space-build.png'});
 await tap(page,240,757);await ready(page,'party');await tap(page,240,448);await page.waitForTimeout(800);
 for(const x of [75,185,295,405])await tap(page,x,649);
 await page.screenshot({path:'test-results/space-party.png'});
 await tap(page,368,531);expect((await read(page)).giftOpened).toBe(true);
 await tap(page,390,757);await ready(page,'stories');await tap(page,240,503);await ready(page,'dress');
 await expect(page.locator('#game')).toHaveAttribute('data-story','forest');
 expect((await read(page)).pieces).toEqual([]);
 await tap(page,405,638);await tap(page,240,757);await ready(page,'castle');
 for(const x of [75,185,295,405])await tap(page,x,628);
 await expect.poll(async()=>(await read(page)).pieces.length).toBe(4);
 await tap(page,240,757);await ready(page,'party');await tap(page,240,448);await page.waitForTimeout(800);
 await tap(page,405,649);await tap(page,295,649);await page.screenshot({path:'test-results/forest-party.png'});
 await tap(page,377,45);await ready(page,'stories');await tap(page,240,225);await ready(page,'dress');
 expect((await read(page)).outfit.dress).toBe(2);expect((await read(page)).pieces).toEqual([]);
 await tap(page,377,45);await ready(page,'stories');await tap(page,240,364);await ready(page,'party');
 expect((await read(page)).story).toBe('space');expect((await read(page)).outfit.dress).toBe(1);expect((await read(page)).giftOpened).toBe(true);
 await page.reload();await enterSaved(page,'party');expect((await read(page)).story).toBe('space');expect(errors).toEqual([]);
});

test('Animated home is the first screen and resumes the selected story',async({page})=>{
 await page.goto('/');await ready(page,'stories');await page.waitForTimeout(350);
 await page.screenshot({path:'test-results/home.png'});
 await tap(page,240,364);await ready(page,'dress');await tap(page,295,638);
 await page.reload();await ready(page,'stories');
 await tap(page,240,364);await ready(page,'dress');
 expect((await read(page)).story).toBe('space');expect((await read(page)).outfit.dress).toBe(2);
});

test('Pet care supports both pets, every activity, dragging and saved progress',async({page})=>{
 const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto('/');await ready(page,'stories');await tap(page,240,642);await ready(page,'pets');
 await expect(page.locator('#game')).toHaveAttribute('data-pet','cat');
 for(const [x,action] of [[75,'wash'],[185,'brush'],[295,'feed'],[405,'play']] as const){
  await tap(page,x,608);await expect.poll(async()=>await page.locator('#game').getAttribute('data-care')).toContain(action);
 }
 await page.screenshot({path:'test-results/pet-cat.png'});
 await tap(page,302,194);await ready(page,'pets');await expect(page.locator('#game')).toHaveAttribute('data-pet','dog');
 await expect(page.locator('#game')).toHaveAttribute('data-care','');
 await page.mouse.move(75,608);await page.mouse.down();await page.mouse.move(240,390,{steps:14});await page.mouse.up();
 await expect(page.locator('#game')).toHaveAttribute('data-care','wash');
 await tap(page,185,608);await page.waitForTimeout(400);await page.screenshot({path:'test-results/pet-dog.png'});await page.waitForTimeout(1200);
 await page.reload();await ready(page,'stories');await tap(page,240,642);await ready(page,'pets');
 await expect(page.locator('#game')).toHaveAttribute('data-pet','dog');await expect(page.locator('#game')).toHaveAttribute('data-care','wash,brush');
 await tap(page,178,194);await ready(page,'pets');await expect(page.locator('#game')).toHaveAttribute('data-care','wash,brush,feed,play');
 await tap(page,240,757);await ready(page,'stories');await tap(page,240,225);await ready(page,'dress');expect(errors).toEqual([]);
});


test('Pets sleep, wake, stretch and chase a draggable ball',async({page})=>{
 const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto('/');await ready(page,'stories');await tap(page,240,642);await ready(page,'pets');
 const game=page.locator('#game');
 for(const kind of ['cat','dog']){
  if(kind==='dog')await tap(page,302,194);
  await tap(page,49,284);await expect(game).toHaveAttribute('data-pet-mood','sleep');
  await page.screenshot({path:`test-results/${kind}-sleep.png`});
  await tap(page,240,390);await expect(game).toHaveAttribute('data-pet-mood','petting');
  await expect(game).toHaveAttribute('data-pet-mood','idle');
  await tap(page,431,284);await expect(game).toHaveAttribute('data-pet-mood','stretch');
  await page.screenshot({path:`test-results/${kind}-stretch.png`});
  await expect(game).toHaveAttribute('data-pet-mood','idle');
  await page.mouse.move(365,474);await page.mouse.down();await page.mouse.move(90,450,{steps:12});await page.mouse.up();
  await expect(game).toHaveAttribute('data-pet-mood','walk');
  await page.screenshot({path:`test-results/${kind}-chase.png`});
  await expect(game).toHaveAttribute('data-pet-mood','idle');
  await expect(game).toHaveAttribute('data-care','play');
  await tap(page,75,608);await expect(game).toHaveAttribute('data-care','play,wash');
 }
 expect(errors).toEqual([]);
});
