
import { Switch, Match, mergeProps, For, Show } from 'solid-js'

const CanonicalExpression = (props) =>
{
  props = mergeProps( { inverse: true }, props );

  return (
    <Switch fallback={
        <mfrac>
          <mn>1</mn>
          <CanonicalExpression tree={props.tree} inverse={false} />
        </mfrac>
      }>
      <Match when={props.tree === 1}>
        <mn>1</mn>
      </Match>
      <Match when={props.tree === 'x'}>
        <mi>x</mi>
      </Match>
      <Match when={props.inverse === false}>
        <mrow>
          <For each={props.tree}>{ (child, i) =>
            <>
              <CanonicalExpression tree={child} />
              <Show when={i() < props.tree.length - 1}>
                <mo>+</mo>
              </Show>
            </>
          }</For>
        </mrow>
      </Match>
    </Switch>
  )
}

export const Equation = (props) =>
{
  return (
    <math class="equation" display="block">
      <mrow>
        <mi>x</mi>
        <mo>=</mo>
        <CanonicalExpression tree={props.tree} inverse={false} />
      </mrow>
    </math>
  );
}

