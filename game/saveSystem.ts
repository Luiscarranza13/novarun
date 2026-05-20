const SAVE_KEY = "novarun_highscores";

interface HighScoreData {
  [levelKey: string]: number;
}

function load(): HighScoreData {
  try {
    const data = localStorage.getItem(SAVE_KEY);
    return data ? (JSON.parse(data) as HighScoreData) : {};
  } catch {
    return {};
  }
}

export function getHighScore(levelIndex: number): number {
  return load()[`level_${levelIndex}`] ?? 0;
}

/** Returns true if the new score is a new record. */
export function saveHighScore(levelIndex: number, score: number): boolean {
  const current = getHighScore(levelIndex);
  if (score <= current) return false;
  try {
    const data = load();
    data[`level_${levelIndex}`] = score;
    localStorage.setItem(SAVE_KEY, JSON.stringify(data));
    return true;
  } catch {
    return false;
  }
}

export function getAllHighScores(): number[] {
  const data = load();
  return [0, 1, 2].map((i) => data[`level_${i}`] ?? 0);
}
