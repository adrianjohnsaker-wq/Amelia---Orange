export function binomCdf(k, n, p) {
  if (k < 0) return 0;
  if (k >= n) return 1;
  let term = (1 - p) ** n, sum = term;
  for (let i = 0; i < k; i++) {
    term *= ((n - i) / (i + 1)) * (p / (1 - p));
    sum += term;
  }
  return Math.min(1, sum);
}
export function binomTail(n, k, p) {
  if (k <= 0) return 1;
  if (k > n) return 0;
  let term = p ** n, sum = term;
  for (let i = n; i > k; i--) {
    term *= (i / (n - i + 1)) * ((1 - p) / p);
    sum += term;
  }
  return Math.min(1, sum);
}
export function clopperPearson(x, n, alpha = 0.05) {
  let lower = 0, upper = 1;
  if (x > 0) {
    let lo = 0, hi = 1;
    for (let i = 0; i < 80; i++) {
      const mid = (lo + hi) / 2;
      if (binomTail(n, x, mid) < alpha / 2) hi = mid;
      else lo = mid;
    }
    lower = (lo + hi) / 2;
  }
  if (x < n) {
    let lo = 0, hi = 1;
    for (let i = 0; i < 80; i++) {
      const mid = (lo + hi) / 2;
      if (binomCdf(x, n, mid) > alpha / 2) lo = mid;
      else hi = mid;
    }
    upper = (lo + hi) / 2;
  }
  return [lower, upper];
}
