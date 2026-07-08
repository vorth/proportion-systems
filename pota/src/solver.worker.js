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

const pyFunctionForKind = {
  general_form: 'get_general_form',
  roots: 'get_positive_roots',
};

self.onmessage = async ({ data: { id, kind, equationStr } }) => {
  try {
    const pyodide = await pyodidePromise;
    const pyFunction = pyFunctionForKind[kind];

    console.log( `Worker received '${kind}' request for equation: '${equationStr}'` );

    const result = pyodide.runPython(`
import json
json.dumps(${pyFunction}('${equationStr}'))
    `);

    const parsed = JSON.parse(result);

    if (kind === 'roots') {
      if (parsed.has_positive_roots) {
        console.log(`Worker solved '${equationStr}': positive root(s) ${parsed.float_values.join(', ')}`);
      } else if (parsed.error) {
        console.log(`Worker failed on '${equationStr}': ${parsed.error}`);
      } else {
        console.log(`Worker solved '${equationStr}': no positive roots`);
      }
    } else if (kind === 'general_form') {
      if (parsed.error) {
        console.log(`Worker failed to get general form for '${equationStr}': ${parsed.error}`);
      } else {
        console.log(`Worker got general form for '${equationStr}': ${parsed.general_form}`);
      }
    }

    self.postMessage({ id, result: parsed });
  } catch (error) {
    self.postMessage({ id, error: error.message });
  }
};
