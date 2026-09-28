import { readdir, readFile, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
async function files(dir) {
  const result=[];
  for(const entry of await readdir(dir,{withFileTypes:true})) {
    const path=`${dir}/${entry.name}`;
    if(entry.isDirectory()) result.push(...await files(path));
    else if(entry.name!=='sw.js') result.push(path);
  }
  return result;
}
const paths=await files('dist');
const hash=createHash('sha256');
hash.update(await readFile('scripts/offline.mjs')); 
for(const path of paths) hash.update(await readFile(path));
const cache=`little-castle-${hash.digest('hex').slice(0,12)}`;
const assets=paths.map(p=>'./'+p.slice(5));
await writeFile('dist/sw.js', `const CACHE=${JSON.stringify(cache)};
const ASSETS=${JSON.stringify(['./',...assets])};
self.addEventListener('install',event=>event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(ASSETS))));
self.addEventListener('activate',event=>event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(key=>key.startsWith('little-castle-')&&key!==CACHE).map(key=>caches.delete(key)))).then(()=>self.clients.claim())));
self.addEventListener('fetch',event=>{
 if(event.request.method!=='GET'||new URL(event.request.url).origin!==self.location.origin)return;
 event.respondWith(caches.match(event.request,{ignoreVary:true}).then(hit=>hit||fetch(event.request).catch(error=>{
  if(event.request.mode==='navigate')return caches.match('./index.html');
  throw error;
 })));
});
`);
console.log(`Offline cache: ${assets.length} files, ${cache}`);
