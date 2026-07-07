import { loadPyodide } from 'pyodide';

const pyodidePromise = (async () => {
  const pyodide = await loadPyodide({
    indexURL: 'https://cdn.jsdelivr.net/pyodide/v0.29.2/full/',
  });

  await pyodide.loadPackage('sympy');

  const response = await fetch('/solve.py');
  const pythonCode = await response.text();
  await pyodide.runPythonAsync(pythonCode);

  return pyodide;
})();

self.onmessage = async ({ data: { id, equationStr } }) => {
  try {
    const pyodide = await pyodidePromise;

    const result = pyodide.runPython(`
import json
json.dumps(solve_equation(${JSON.stringify(equationStr)}))
    `);

    self.postMessage({ id, result: JSON.parse(result) });
  } catch (error) {
    self.postMessage({ id, error: error.message });
  }
};
