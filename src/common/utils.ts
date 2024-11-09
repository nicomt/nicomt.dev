export function cachedAsync<T>(fn: (...args: any[]) => Promise<T>) {
  let promise: Promise<T>;
  return (...args: any[]) => {
    if (!promise) {
      promise = fn(...args);
    }
    return promise;
  };
}

function componentToHex(c: number) {
  const hex = Math.max(Math.min(Math.round(c), 255), 0).toString(16);
  return hex.length === 1 ? '0' + hex : hex;
}

export function rgbToHex(r: number, g: number, b: number): string {
  return `#${componentToHex(r)}${componentToHex(g)}${componentToHex(b)}`;
}

export function deterministicRand(seed: number) {
  let s = seed;
  return () => {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };
}

export function randChoice<T>(rng: () => number, choices: T[]) {
  return () => {
    return choices[Math.floor(rng() * choices.length)];
  };
}
