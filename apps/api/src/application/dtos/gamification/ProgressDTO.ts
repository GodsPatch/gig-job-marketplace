export interface ProgressDTO {
  points: {
    total: number;
    weekly: number;
    monthly: number;
  };
  rank: {
    weekly: { position: number | null; totalParticipants: number };
    monthly: { position: number | null; totalParticipants: number };
  };
  streak: {
    current: number;
    longest: number;
  };
  achievements: {
    unlocked: Array<{
      id: string;
      code: string;
      name: string;
      description: string;
      icon: string;
      tier: string;
      unlockedAt: Date;
    }>;
    locked: Array<{
      id: string;
      code: string;
      name: string;
      description: string;
      icon: string;
      tier: string;
      progress: {
        current: number;
        target: number;
      };
    }>;
  };
}
