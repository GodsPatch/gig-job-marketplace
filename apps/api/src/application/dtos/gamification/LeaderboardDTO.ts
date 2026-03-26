export interface LeaderboardDTO {
  cycle: {
    type: 'weekly' | 'monthly';
    startDate: string;
  };
  rankings: Array<{
    rank: number;
    points: number;
    user: {
      id: string;
      fullName: string;
      avatarUrl: string | null;
      role: string;
    };
  }>;
  currentUser: {
    rank: number | null;
    points: number;
  } | null;
  totalParticipants: number;
}
