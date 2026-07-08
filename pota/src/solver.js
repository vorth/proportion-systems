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
    request.resolve({ error });
  } else {
    request.resolve(result);
  }
};

const request = (kind, equationStr) => {
  const id = nextId++;

  return new Promise((resolve) => {
    pending.set(id, { resolve });
    worker.postMessage({ id, kind, equationStr });
  });
};

/**
 * Get the normalized general form (xⁿ = ...) of an equation, rendered as MathML.
 * @param {string} equationStr - Equation like "x = 1/(x) + 1 + x"
 * @returns {Promise<{general_form: string, general_form_mathml: string}>}
 */
export const getGeneralForm = (equationStr) => request('general_form', equationStr);

/**
 * Get positive real roots for an equation.
 * @param {string} equationStr - Equation like "x = 1/(x) + 1 + x"
 * @returns {Promise<{has_positive_roots: boolean, solutions: string[], float_values: number[]}>}
 */
export const getPositiveRoots = (equationStr) => request('roots', equationStr);
