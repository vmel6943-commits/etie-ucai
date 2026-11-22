import { BookOpen, Clock3, Film, Mail, Newspaper, ScrollText, Users, type LucideIcon } from 'lucide-react';
import type { GameState, SceneId } from '../game/model';
import {canOpenSuitcase} from '../game/model';

const boardingTargets: Partial<Record<SceneId, string>> = {
  desk: 'envelope',
  station: 'door',
  machine: 'activate',
  platform: 'board',
  journal: 'stamp',
};

export function primaryObject(game: GameState): string | undefined {
  switch (game.scene) {
    case 'hall':
      if (!game.flags.includes('briefed')) return 'bell';
      return game.ticket ? 'gate' : 'machine';
    case 'gate':
      return game.ticket?.checked ? undefined : 'check';
    case 'carriage':
      return game.flags.includes('map-seen') ? 'spy' : 'route';
    case 'informant':
      return canOpenSuitcase(game) ? 'case' : 'report';
    default:
      return boardingTargets[game.scene];
  }
}

const evidenceItems: { id: string; label: string; icon: LucideIcon }[] = [
  { id: 'video', label: '视频档案', icon: Film },
  { id: 'notice', label: '开放公告', icon: ScrollText },
  { id: 'timeline', label: '事件时间线', icon: Clock3 },
  { id: 'witness', label: '现场证词', icon: Users },
  { id: 'spread', label: '传播记录', icon: Newspaper },
  { id: 'evidence', label: '调查笔记', icon: BookOpen },
];

export const objectIcons: Record<string, LucideIcon> = {
  ...Object.fromEntries(evidenceItems.map(({id, icon}) => [id, icon])),
  envelope: Mail,
};
