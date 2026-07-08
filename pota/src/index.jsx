
import { createSignal, For, Show, Switch, Match, onMount } from 'solid-js'
import { render } from 'solid-js/web'

import { Equation } from './equation.jsx';
import { Diagram } from './diagram.jsx';
import { SelectionProvider, useSelection } from './context.jsx';
import { getGeneralForm, getPositiveRoots } from './solver.js';

import { generateGoodExprs, generateRegionExprs, generateExprs, printExpr, test } from './model.js';

const queryParams = new URLSearchParams( window.location.search );
const targetExpr = queryParams.get( 'expr' );

let exprs = [];

async function loadExpressionsWithPositiveRoots() {
  if ( targetExpr ) {
    console.log( targetExpr );
    exprs.push( JSON.parse( targetExpr ) );
  } else {
    console.log('Generating and filtering expressions...');
    const allExprs = [];
    
    // Generate all expressions
    for ( const e of generateExprs( 1, 3 ) ) {
      allExprs.push(e);
    }
    
    console.log(`Generated ${allExprs.length} expressions, checking for positive roots...`);
    
    // Filter expressions that have positive real roots
    for (const expr of allExprs) {
      const equationStr = printExpr(expr);
      console.log(`Checking: ${equationStr}`);
      
      const roots = await getPositiveRoots(equationStr);
      if (roots.has_positive_roots) {
        const rootValue = roots.float_values[0];
        console.log(`✓ Has positive roots: ${equationStr} = ${rootValue}`);
        const generalForm = await getGeneralForm(equationStr);
        exprs.push({ expr, rootValue, generalFormMathml: generalForm.general_form_mathml });
      }
    }
    
    console.log(`Found ${exprs.length} expressions with positive real roots`);
    
    // Sort by root value, least to greatest
    exprs.sort((a, b) => a.rootValue - b.rootValue);
  }
  return exprs;
}

const GOLDEN_RATIO = ( 1 + Math.sqrt( 5 ) ) / 2;

const ProportionSystem = ( props ) =>
{
  const setSynSize = w => {} //console.log( 'total width', w );

  return (
    <div class='proportion-system'>
      <Equation tree={props.tree} />
      {props.generalFormMathml && (
        <math class='general-form' display='block' style={{ 'font-size': '1.5em' }} innerHTML={props.generalFormMathml} />
      )}

      <div class='diagram' >
        <Diagram tree={props.tree} path={[]} x={props.x} rotated={props.rotate} inverse={false}
          inhSize={props.scale} setSynSize={setSynSize} />
      </div>

      <div class='root-value' style={{ 'margin-top': '8px', 'text-align': 'center' }}>
        <Switch>
          <Match when={props.status === 'loading'}>
            calculating solution...
          </Match>
          <Match when={props.status === 'found'}>
            x = {props.x.toFixed(6)}
          </Match>
          <Match when={props.status === 'not-found'}>
            <div>x = {props.x.toFixed(6)}</div>
            <input type='range' min='1' max='3' step='0.001' value={props.x}
              onInput={e => props.setX(parseFloat(e.target.value))} />
          </Match>
        </Switch>
      </div>
    </div>
  );
}

// const Proportions = ( props ) =>
// {
//   return (
//     <SelectionProvider tree={props.tree}>
//       <ProportionsUI scale={props.scale} />
//     </SelectionProvider>
//   );
// }

const NavBar = ( props ) =>
{
  return (
    <div class='nav-bar' style={{ display: 'flex', 'align-items': 'center', 'justify-content': 'space-between', 'padding-block': '12px' }}>
      <div class='nav-title' style={{ 'font-weight': 'bold', 'font-size': 'large' }}>Proportion Systems</div>
      <div class='nav-buttons' style={{ display: 'flex', gap: '8px' }}>
        <button classList={{ active: props.view() === 'editor' }} onClick={() => props.setView('editor')}>Editor</button>
        <button classList={{ active: props.view() === 'enumeration' }} onClick={() => props.setView('enumeration')}>Enumeration</button>
      </div>
    </div>
  );
}

const Editor = () =>
{
  const [ x, setX ] = createSignal( GOLDEN_RATIO );
  const [ generalFormMathml, setGeneralFormMathml ] = createSignal( null );
  const [ status, setStatus ] = createSignal( 'loading' );

  onMount(async () => {
    const equationStr = printExpr( test );

    getGeneralForm( equationStr ).then( generalForm => {
      setGeneralFormMathml( generalForm.general_form_mathml );
    } );

    getPositiveRoots( equationStr ).then( roots => {
      if ( roots.has_positive_roots ) {
        setX( roots.float_values[0] );
        setStatus( 'found' );
      } else {
        setStatus( 'not-found' );
      }
    } );
  });

  return (
    <div class='editor'>
      <ProportionSystem tree={test} scale={5} rotate={false} x={x()} setX={setX} status={status()}
        generalFormMathml={generalFormMathml()} />
    </div>
  );
}

// Hoisted out of the Enumeration component so the solve loop runs once and
// results survive switching to the Editor tab and back (Show unmounts/remounts).
const [ enumerationExpressions, setEnumerationExpressions ] = createSignal( [] );
const [ enumerationLoading, setEnumerationLoading ] = createSignal( true );

let enumerationLoadStarted = false;

const ensureEnumerationLoaded = () =>
{
  if ( enumerationLoadStarted ) return;
  enumerationLoadStarted = true;

  loadExpressionsWithPositiveRoots().then( filteredExprs => {
    setEnumerationExpressions( filteredExprs );
    setEnumerationLoading( false );
  } );
}

const Enumeration = () =>
{
  const [ rotate, setRotate ] = createSignal( false );

  ensureEnumerationLoaded();

  return (
    <div class='enumeration-view'>
      {enumerationLoading() && <p>Loading equation solver...</p>}

      <div class='enumeration'>
        <For each={enumerationExpressions()}>
          {(item) => (
            <ProportionSystem tree={item.expr} scale={5} rotate={rotate()} x={item.rootValue} status='found' generalFormMathml={item.generalFormMathml} />
          )}
        </For>
      </div>
    </div>
  );
}

const App = () =>
{
  const [ view, setView ] = createSignal( 'editor' );

  return (
    <div class='proportion-display'>
      <NavBar view={view} setView={setView} />

      <Show when={view() === 'editor'} fallback={<Enumeration />}>
        <Editor />
      </Show>
    </div>
  );
}

const root = document.getElementById( 'root' )

render(() => <App />, root)
