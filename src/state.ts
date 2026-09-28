import { storyIds, type StoryId } from './stories';
export type Category = 'dress' | 'shoes' | 'crown' | 'earrings';
export type Piece = 'door' | 'window' | 'flag' | 'flowers';
export type Stage = 'dress' | 'castle' | 'party';
export interface Save { version: 1; story: StoryId; stage: Stage; outfit: Record<Category, number>; pieces: Piece[]; sound: boolean; giftOpened: boolean; castleColor: number; variants: Record<Piece, number> }
export const KEY = 'little-castle-v1';
export const pieceNames: Piece[] = ['door', 'window', 'flag', 'flowers'];
export const categories: Category[] = ['dress', 'shoes', 'crown', 'earrings'];
export const fresh = (story: StoryId = 'castle'): Save => ({ version: 1, story, stage: 'dress', outfit: { dress: 0, shoes: 0, crown: 0, earrings: 0 }, pieces: [], sound: true, giftOpened: false, castleColor: 0, variants: { door: 0, window: 0, flag: 0, flowers: 0 } });
function index(value: unknown, count: number): number { return typeof value === 'number' && Number.isInteger(value) && value >= 0 && value < count ? value : 0; }
export function restore(key = KEY): Save {
  try {
    const raw = JSON.parse(localStorage.getItem(key) || 'null');
    if (!raw || raw.version !== 1) return fresh();
    const saved = fresh(storyIds.includes(raw.story) ? raw.story : 'castle');
    for (const k of categories) saved.outfit[k] = index(raw.outfit?.[k], 4);
    for (const k of pieceNames) saved.variants[k] = index(raw.variants?.[k], 3);
    saved.castleColor = index(raw.castleColor, 4);
    saved.pieces = pieceNames.filter(k => Array.isArray(raw.pieces) && raw.pieces.includes(k));
    saved.stage = raw.stage === 'castle' || (raw.stage === 'party' && saved.pieces.length === 4) ? raw.stage : 'dress';
    saved.sound = raw.sound !== false;
    saved.giftOpened = raw.giftOpened === true;
    return saved;
  } catch { return fresh(); }
}
export function persist(save: Save) {
  try { localStorage.setItem(KEY, JSON.stringify(save)); localStorage.setItem(`${KEY}-${save.story}`,JSON.stringify(save)); } catch { /* Continue playing when storage is unavailable. */ }
}

export function restoreStory(story: StoryId, sound: boolean): Save {
 const saved = restore(`${KEY}-${story}`);
 return {...(saved.story===story?saved:fresh(story)),sound};
}
