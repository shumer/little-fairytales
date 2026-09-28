import type { Piece } from './state';
export type StoryId = 'castle' | 'space' | 'forest';
export const storyIds: StoryId[] = ['castle', 'space', 'forest'];
export const stories = {
  castle: { name: 'Праздник в замке', building: 'Замок', guest: 'cat', dressTitle: 'Нарядим принцессу?', buildTitle: 'Украсим замок', special: 'firework', names: {door:'Дверь',window:'Окошко',flag:'Флажок',flowers:'Цветы'} },
  space: { name: 'Космические друзья', building: 'Ракета', guest: 'alien', dressTitle: 'Готовимся к полёту!', buildTitle: 'Соберём ракету', special: 'rocket', names: {door:'Люк',window:'Окошко',flag:'Антенна',flowers:'Двигатель'} },
  forest: { name: 'Домик дракончика', building: 'Домик', guest: 'dragon', dressTitle: 'В гости к дракончику!', buildTitle: 'Украсим домик', special: 'dragon', names: {door:'Дверь',window:'Окошко',flag:'Листик',flowers:'Грибочки'} },
};
export type Target = {x:number;y:number;size:number};
export const storyTargets: Record<StoryId, Record<Piece,Target>> = {
 castle: { door:{x:240,y:448,size:100}, window:{x:240,y:364,size:66}, flag:{x:355,y:221,size:60}, flowers:{x:143,y:478,size:85} },
 space: { door:{x:240,y:448,size:90}, window:{x:240,y:343,size:90}, flag:{x:240,y:227,size:65}, flowers:{x:240,y:498,size:65} },
 forest: { door:{x:240,y:448,size:100}, window:{x:240,y:353,size:66}, flag:{x:338,y:272,size:70}, flowers:{x:143,y:478,size:85} },
};
