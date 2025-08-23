export function shuffleArray<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function calcPct(correct: number, total: number): number {
  if (!Number.isFinite(correct) || !Number.isFinite(total)) return 0;
  if (total <= 0) return 0;
  const pct = Math.round((correct / total) * 100);
  return Math.max(0, Math.min(100, pct));
}
