export function intersection(set1: Set<any>, set2: Set<any>) {
  return new Set(Array.from(set1).filter((item) => set2.has(item)));
}
