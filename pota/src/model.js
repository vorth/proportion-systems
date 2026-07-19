
// Each array is an inverse of a sum, except the top one, which is just a sum.
//  So this means "1/x + 1/x + 1/x + 1/( 1 + 1 + 1 + 1/x )"
export const test = [
  1,
  [ 'x' ],
  [ 1, 'x' ],
];

export const generateExprs = function*( squares, rects )
{
  if ( squares < 0 || rects < 0 )
    return;
  if ( squares === 0 && rects === 0 )
    return;
  if ( squares === 0 && rects === 1 ) {
    yield [ 'x' ];
    // yield [ [ 'x' ] ];
    return;
  }
  if ( squares === 1 && rects === 0 ) {
    yield [ 1 ];
    return;
  }
  if ( squares === 1 && rects === 1 ) {
    yield [ 1, 'x' ];
    yield [ 1, [ 'x' ] ];
    yield [ [ 1, 'x' ] ];
    yield [ [ 1, [ 'x' ] ] ];
    return;
  }
  for ( const e of generateExprs( squares - 1, rects ) ) {
    yield [ 1, ...e ];
    yield [ 1, [ ...e ] ];
  }
  for ( const e of generateExprs( squares, rects - 1 ) ) {
    yield [ 'x', ...e ];
    yield [ 'x', [ ...e ] ];
  }
  for ( const e of generateExprs( squares, rects - 1 ) ) {
    yield [ [ 'x' ], ...e ];
    yield [ [ 'x' ], [ ...e ] ];
  }
}

export const generateGoodExprs = function*( squares, rects )
{
  for ( const e of generateExprs( squares, rects - 1 ) ) {
    yield [ [ 'x' ], ...e ];
    yield [ [ 'x' ], [ ...e ] ];
  }
  for ( const e of generateExprs( squares - 1, rects ) ) {
    yield [ 1, [ ...e ] ];
    yield [ 1, ...e ];
  }
}

export const generateRegionExprs = function*( regions )
{
  for ( let rects = 0; rects <= regions; rects++ ) {
    console.log( `%%%%%%%%%%%%%%%% Generating ${regions-rects} squares, ${rects} rectangles` );
    for ( const e of generateExprs( regions-rects, rects ) ) yield e;
  }
}

export const printExpr = ( expr, top=true ) =>
{
  let result = top? 'x = ' : '';
  if ( typeof expr === 'number' ) {
    result += expr.toString();
  } else if ( typeof expr === 'string' ) {
    result += expr;
  } else if ( Array.isArray( expr ) ) {
    const parts = expr.map( e => printExpr( e, false ) );
    const inner = parts.join( ' + ' );
    if ( top ) {
      result += inner;
    } else {
      result += `1/( ${inner} )`;
    }
  }
  return result;
}
