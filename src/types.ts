
export enum Mood {
  VeryBad = 1,
  Bad = 2,
  Neutral = 3,
  Good = 4,
  VeryGood = 5
}

export interface ActivityLog {
  id: string;
  userId: string;
  loggedAt: Date;
  moodBefore?: Mood;
  moodAfter?: Mood;
}

export interface UserProfile {
  id: string;
  email: string;
  createdAt: Date;
  streakCount: number;
}

export interface MicroTip {
  id: string;
  text: string;
  category: 'Oficina' | 'Casa' | 'Espera';
}
