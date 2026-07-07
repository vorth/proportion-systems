let nextId = 0;
const pending = new Map();

const worker = new Worker(new URL('./solver.worker.js', import.meta.url), {
  type: 'module',
});

worker.onmessage = ({ data: { id, result, error } }) => {
  const request = pending.get(id);
  if (!request) return;
  pending.delete(id);

  if (error) {
    request.resolve({ has_positive_roots: false, error });
  } else {
    request.resolve(result);
  }
};

/**
 * Get detailed solution for an equation
 * @param {string} equationStr - Equation like "x = 1/(x) + 1 + x"
 * @returns {Promise<{has_positive_roots: boolean, solutions: string[], float_values: number[]}>}
 */
export const solveEquation = (equationStr) => {
  const id = nextId++;

  return new Promise((resolve) => {
    pending.set(id, { resolve });
    worker.postMessage({ id, equationStr });
  });
};
