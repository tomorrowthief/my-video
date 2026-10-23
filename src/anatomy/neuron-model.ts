/** A single ReLU neuron; parameter demonstration, not a training algorithm. */
export const neuronAt = (seconds: number) => {
  const p = Math.max(0, Math.min(1, (seconds - 21) / 5));
  const eased = p * p * (3 - 2 * p);
  const x1 = 0.8, x2 = 0.4, w1 = 0.5 + 0.5 * eased, w2 = -0.75, bias = -0.2;
  const p1 = x1 * w1, p2 = x2 * w2;
  const z = p1 + p2 + bias;
  return {x1, x2, w1, w2, bias, p1, p2, z, output: Math.max(0, z)};
};
