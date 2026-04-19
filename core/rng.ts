export type Rng = () => number;

export const defaultRng: Rng = () => Math.random();

/** Seeded LCG — deterministic for testing. */
export function seededRng(seed: number): Rng {
  let s = seed;
  return () => {
    s = (s * 1664525 + 1013904223) & 0xffffffff;
    return (s >>> 0) / 0x100000000;
  };
}

export function shuffle<T>(arr: readonly T[], rng: Rng = defaultRng): T[] {
  const result = [...arr];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    [result[i], result[j]] = [result[j]!, result[i]!];
  }
  return result;
}
