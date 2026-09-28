import {art,svg} from './art';

const face='<ellipse cx="120" cy="120" rx="40" ry="45" fill="#f7d5b5"/><path d="M111 147q9 7 18 0" fill="none" stroke="#b9796d" stroke-width="3"/><ellipse cx="91" cy="136" rx="8" ry="4" fill="#eeb4a3"/><ellipse cx="149" cy="136" rx="8" ry="4" fill="#eeb4a3"/>';
const limbs='<path d="M101 287v39m37-39v39M91 182l-23 55m81-55 23 55" stroke="#f7d5b5" stroke-width="15" stroke-linecap="round"/>';
art.forest_body=svg(`<path d="M102 183Q12 97 26 188Q32 224 96 224Q22 226 49 264Q85 274 113 220M138 183Q228 97 214 188Q208 224 144 224Q218 226 191 264Q155 274 127 220" fill="#ccebdd" stroke="#94c9b5" stroke-width="3"/>${limbs}<path d="M72 132Q55 62 120 58Q184 60 168 150l-31-15-47 12Z" fill="#bc744c"/>${face}<path d="M78 103Q80 58 121 63Q168 63 163 106Q135 98 125 79Q107 104 78 103Z" fill="#bc744c"/><path d="M108 159h24v29h-24" fill="#f7d5b5"/>`);
art.wizard_body=svg(`${limbs}${face}<path d="M79 99Q64 126 83 155l6-50m62-2 8 52q19-35 1-55" fill="#e7e3ec"/><path d="M86 143Q119 163 154 143Q150 174 120 193Q90 175 86 143Z" fill="#f7f4f4"/><path d="M111 139q-12-8-21 6m39-6q12-8 21 6" stroke="#f7f4f4" stroke-width="9" fill="none"/>`);
art.pirate_body=svg(`${limbs}<path d="M76 128Q58 68 120 62Q185 64 166 153l-18-14-57 8Z" fill="#765342"/>${face}<path d="M79 104Q77 67 120 68Q161 66 164 103l-25-17-26 11-15-6Z" fill="#765342"/><path d="M108 159h24v29h-24" fill="#f7d5b5"/>`);
const colors=['#a996d2','#82bba2','#86b6d4','#dcaa83'];
for(let v=0;v<4;v++){
 const c=colors[v];
 const clothes={
 forest:`<path d="M96 174l24 13 24-13 12 54-19 68-18-25-21 27-19-68Z" fill="${c}" stroke="#7da18b" stroke-width="2"/><path d="M86 219q34 16 68 0" stroke="#f6df96" stroke-width="6"/><path d="M118 191q-26 1-21 20q20 3 21-20m4 0q26 1 21 20q-20 3-21-20" fill="#d5eed2"/>`,
 wizard:`<path d="M91 175l-20 124q49 25 98 0l-20-124-29 20Z" fill="${c}" stroke="#8975ac" stroke-width="3"/><path d="M120 195v113M84 238h73" stroke="#f1d58b" stroke-width="5"/>${[95,145,100,140].map((x,i)=>`<path d="M${x} ${220+i*21}l3 6 7 1-5 5 1 7-6-4-6 4 1-7-5-5 7-1Z" fill="#f8e8ac"/>`).join('')}`,
 pirate:`<path d="M93 176h54l11 58-13 74h-20l-5-48-5 48H95l-13-74Z" fill="#526b87"/><path d="M95 177h50v52H95Z" fill="#fff2d6"/><path d="M95 189h50m-50 15h50m-50 15h50" stroke="${c}" stroke-width="6"/><path d="M92 177l-12 62h23l7-61m38-1 12 62h-23l-7-61" fill="${c}"/><path d="M84 237h72" stroke="#b97565" stroke-width="9"/><rect x="112" y="231" width="17" height="13" rx="2" fill="#efd184"/>`
 };
 const hats={forest:`<path d="M80 83q40-30 80 0" stroke="#86a778" stroke-width="8" fill="none"/>${[87,104,122,141,157].map((x,i)=>`<circle cx="${x}" cy="${77-(i%3)*5}" r="8" fill="${c}"/><circle cx="${x}" cy="${77-(i%3)*5}" r="3" fill="#f9e5a8"/>`).join('')}`,wizard:`<path d="M79 95l34-80q8-15 14 0l35 80Z" fill="${c}"/><ellipse cx="120" cy="95" rx="59" ry="12" fill="${c}"/><path d="M110 57l9 5 9-5-2 11 8 7-11 1-5 10-5-10-11-2 9-7Z" fill="#f9df91"/>`,pirate:`<path d="M60 98Q41 43 91 64Q120 24 149 64Q197 43 180 98Z" fill="${c}" stroke="#725b63" stroke-width="4"/><path d="M66 90h109" stroke="#f7dc94" stroke-width="7"/><path d="M120 55l5 10 12 2-9 8 2 12-10-6-10 6 2-12-9-8 12-2Z" fill="#fff1cc"/>`};
 for(const id of ['forest','wizard','pirate'] as const){
  art[`${id}_dress${v}`]=svg(clothes[id]);art[`${id}_dressIcon${v}`]=svg(`<g transform="translate(-28 -125) scale(.9)">${clothes[id]}</g>`,160,170);
  art[`${id}_crown${v}`]=svg(hats[id]);art[`${id}_crownIcon${v}`]=svg(`<g transform="translate(-28 0) scale(.9)">${hats[id]}</g>`,160,110);
  art[`${id}_shoes${v}`]=svg(`<path d="M90 307h25v23H78q-7-8 12-14Zm35 0h25v9q19 6 12 14h-37Z" fill="${c}" stroke="#867385" stroke-width="2"/>`);
  art[`${id}_shoesIcon${v}`]=svg(`<path d="M23 25h35v35H7q-4-12 16-15m59-20h35v20q20 4 17 15H82Z" fill="${c}"/>`,160,100);
 }
 art[`wizard_castle${v}`]=svg(`<ellipse cx="180" cy="302" rx="115" ry="12" fill="#b3a3c8"/><path d="M99 118h162v177H99Z" fill="#e5dcee" stroke="#b4a0c4" stroke-width="3"/><path d="M97 174h166m-166 48h166m-166 48h166M141 118v56m70 0v48m-70 0v48" stroke="#c9b9d8" stroke-width="3"/><path d="M73 122L180 22l107 100Z" fill="${c}" stroke="#9e89ba" stroke-width="3"/>`,360,320);
 art[`pirate_castle${v}`]=svg(`<path d="M10 286q50-25 100 0t100 0t140 0v34H10Z" fill="#abd6e0"/><path d="M32 218h298l-40 71H75Z" fill="${c}" stroke="#a18573" stroke-width="4"/><path d="M44 236h270m-254 21h239" stroke="#b18d72" stroke-width="3"/><path d="M182 224V26" stroke="#a88568" stroke-width="9"/><path d="M85 201h76v28H85Z" fill="#e5cba6"/>`,360,320);
}
art.owl=svg('<ellipse cx="80" cy="100" rx="49" ry="49" fill="#bda5d0"/><path d="M37 73V26l29 26m29 0 28-26v47" fill="#bda5d0"/><ellipse cx="80" cy="108" rx="28" ry="35" fill="#eee0d6"/><circle cx="60" cy="75" r="23" fill="#fff0d8"/><circle cx="100" cy="75" r="23" fill="#fff0d8"/><circle cx="61" cy="76" r="7" fill="#66536e"/><circle cx="99" cy="76" r="7" fill="#66536e"/><path d="M71 96h18l-9 13Z" fill="#e8ba75"/>',160,160);
art.parrot=svg('<path d="M68 111l-6 43 22-22 10 20 7-47" fill="#7fa8ca"/><ellipse cx="80" cy="93" rx="38" ry="48" fill="#8bc5a0"/><circle cx="88" cy="52" r="31" fill="#9fd8af"/><path d="M111 51q35 5 8 28l-14-14Z" fill="#e7b970"/><ellipse cx="66" cy="98" rx="22" ry="31" fill="#8baed0"/><circle cx="95" cy="48" r="5" fill="#506b63"/>',160,160);
art.magicWand=svg('<path d="M20 88l46-53" stroke="#a68ac6" stroke-width="12" stroke-linecap="round"/><path d="M66 7l8 16 18 3-13 12 3 18-16-9-16 9 3-18-13-12 18-3Z" fill="#f0d180"/>',100,100);
art.treasure=svg('<path d="M13 49q0-31 37-31t37 31v36H13Z" fill="#bd966e" stroke="#99765f" stroke-width="3"/><path d="M15 50h70M30 23v62m40-62v62" stroke="#edcf80" stroke-width="7"/><rect x="42" y="45" width="16" height="20" rx="4" fill="#f5dc93"/>',100,100);
for(let v=0;v<3;v++){
 for(const id of ['wizard','pirate']){
  art[`${id}_door${v}`]=art[`door${v}`];art[`${id}_window${v}`]=id==='pirate'?svg(`<circle cx="50" cy="50" r="36" fill="#cce6ee" stroke="${colors[v]}" stroke-width="12"/><path d="M31 47l25-21m-17 41 30-25" stroke="#fff6dd" stroke-width="6"/>`,100,100):art[`window${v}`];
 }
 art[`wizard_flag${v}`]=svg(`<path d="M50 8l11 25 28 3-21 19 6 28-24-14-24 14 6-28-21-19 28-3Z" fill="${colors[v]}" stroke="#e6c777" stroke-width="5"/>`,100,100);
 art[`wizard_flowers${v}`]=svg(`<path d="M9 78l9-37 15 38 18-64 19 62 14-35 9 38Z" fill="${colors[v]}" stroke="#eee5fa" stroke-width="3"/>`,100,100);
 art[`pirate_flag${v}`]=svg(`<path d="M50 7v86" stroke="#ab8567" stroke-width="5"/><path d="M46 12Q15 33 11 75h35Zm9 0v63h38Q87 36 55 12Z" fill="${colors[v]}" stroke="#fff3d8" stroke-width="3"/>`,100,100);
 art[`pirate_flowers${v}`]=art.treasure.replace('#bd966e',colors[v]);
}
