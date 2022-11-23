export function deepclone<T>(obj: T): T {
  if (!obj || typeof obj !== "object") {
    return obj;
  }
  let result: any = {};
  if (Array.isArray(obj)) {
    result = obj.map((item) => deepclone(item));
  } else {
    Object.keys(obj as any).forEach((key) => {
      // @ts-ignore
      result[key] = deepclone(obj[key]);
    });
  }
  return result;
}
