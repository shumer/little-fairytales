import type { Piece } from './state';
export type StoryId = 'castle' | 'space' | 'forest' | 'wizard' | 'pirate';
export const storyIds: StoryId[] = ['castle', 'space', 'forest', 'wizard', 'pirate'];
export const stories = {
  castle: { name: 'Праздник в замке', building: 'Замок', guest: 'cat', dressTitle: 'Нарядим принцессу?', buildTitle: 'Украсим замок', special: 'firework', names: {door:'Дверь',window:'Окошко',flag:'Флажок',flowers:'Цветы'} },
  space: { name: 'Космические друзья', building: 'Ракета', guest: 'alien', dressTitle: 'Готовимся к полёту!', buildTitle: 'Соберём ракету', special: 'rocket', names: {door:'Люк',window:'Окошко',flag:'Антенна',flowers:'Двигатель'} },
  forest: { name: 'Домик дракончика', building: 'Домик', guest: 'dragon', dressTitle: 'Нарядим лесную фею!', buildTitle: 'Украсим домик', special: 'dragon', names: {door:'Дверь',window:'Окошко',flag:'Листик',flowers:'Грибочки'} },
  wizard: { name:'Башня волшебника', building:'Башня', guest:'owl', dressTitle:'Нарядим волшебника!', buildTitle:'Построим волшебную башню', special:'magicWand', names:{door:'Дверь',window:'Витраж',flag:'Звезда',flowers:'Кристаллы'} },
  pirate: { name:'Пиратское приключение', building:'Корабль', guest:'parrot', dressTitle:'Собираем пирата в путь!', buildTitle:'Снарядим корабль', special:'treasure', names:{door:'Каюта',window:'Иллюминатор',flag:'Парус',flowers:'Сундук'} },
};
export type Target = {x:number;y:number;size:number};
export const storyTargets: Record<StoryId, Record<Piece,Target>> = {
 castle: { door:{x:240,y:448,size:100}, window:{x:240,y:364,size:66}, flag:{x:355,y:221,size:60}, flowers:{x:143,y:478,size:85} },
 space: { door:{x:240,y:448,size:90}, window:{x:240,y:343,size:90}, flag:{x:240,y:227,size:65}, flowers:{x:240,y:498,size:65} },
 forest: { door:{x:240,y:448,size:100}, window:{x:240,y:353,size:66}, flag:{x:338,y:272,size:70}, flowers:{x:143,y:478,size:85} },
 wizard: { door:{x:240,y:448,size:90}, window:{x:240,y:354,size:70}, flag:{x:240,y:228,size:60}, flowers:{x:140,y:478,size:80} },
 pirate: { door:{x:240,y:449,size:75}, window:{x:320,y:452,size:55}, flag:{x:244,y:310,size:115}, flowers:{x:135,y:470,size:70} },
};
