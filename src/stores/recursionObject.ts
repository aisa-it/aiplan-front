export const findObjectByValue = (obj: object, key: string, value: any) => {
  if (obj[key] === value) {
    return obj;
  }

  for (const k in obj) {
    if (typeof obj[k] === 'object' && obj[k] !== null) {
      const result = findObjectByValue(obj[k], key, value);
      if (result) return result;
    }
  }
  return null;
};
