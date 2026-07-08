from sympy import symbols, Eq, simplify, solve, Poly, together, fraction, mathml
from sympy.parsing.sympy_parser import parse_expr


def to_general_form(eq, var):
    """
    Rewrite an equation with the highest-power term isolated on the left
    with a unit coefficient: var**n = -(rest of the polynomial).

    Clears denominators first (via together/fraction) so equations like
    "x = 1/x + 1" become polynomial before conversion.

    Returns an Eq object, or None if the result isn't polynomial in var.
    """
    diff = together(eq.lhs - eq.rhs)
    numerator, _ = fraction(diff)

    try:
        poly = Poly(numerator, var)
    except Exception:
        return None

    degree = poly.degree()
    lead_coeff = poly.LC()

    monic = poly.as_expr() / lead_coeff
    remainder = monic - var**degree

    return Eq(var**degree, -remainder)


def _parse_equation(eq_str):
    left, right = eq_str.split('=', 1)
    lhs = parse_expr(left.strip())
    rhs = parse_expr(right.strip())
    eq = Eq(lhs, rhs)
    var = list(eq.free_symbols)[0]
    return eq, var


def get_general_form(eq_str):
    """
    Parse an equation and render its normalized general form (highest-power
    term isolated on the left with a unit coefficient) as presentation MathML.

    Args:
        eq_str: Equation string like "x = 1/(x) + 1 + x + x"

    Returns:
        dict with keys: general_form, general_form_mathml
    """
    if '=' not in eq_str:
        return {"error": "No '=' found"}

    try:
        eq, var = _parse_equation(eq_str)

        general_form = to_general_form(eq, var)
        general_form_mathml = mathml(general_form, printer='presentation') if general_form is not None else None

        return {
            "general_form": str(general_form) if general_form is not None else None,
            "general_form_mathml": general_form_mathml
        }
    except Exception as e:
        return {"error": str(e)}


def get_positive_roots(eq_str):
    """
    Solve a single equation and return positive real roots.

    Args:
        eq_str: Equation string like "x = 1/(x) + 1 + x + x"

    Returns:
        dict with keys: has_positive_roots, solutions, float_values
    """
    if '=' not in eq_str:
        return {"has_positive_roots": False, "error": "No '=' found"}

    try:
        eq, var = _parse_equation(eq_str)
        solutions = solve(eq, var)

        # Filter for positive real solutions
        positive_real_solutions = []
        for sol in solutions:
            if sol.is_real and sol.is_positive:
                positive_real_solutions.append(sol)

        has_roots = len(positive_real_solutions) > 0

        return {
            "has_positive_roots": has_roots,
            "solutions": [str(sol) for sol in positive_real_solutions],
            "float_values": [float(sol.evalf()) for sol in positive_real_solutions]
        }
    except Exception as e:
        return {"has_positive_roots": False, "error": str(e)}


# # Script mode - read equations from file
# if __name__ == "__main__":
#     # Read equations from file
#     with open('equations.txt', 'r') as f:
#         equation_strings = f.readlines()

#     equations = []
#     for eq_str in equation_strings:
#         eq_str = eq_str.strip()
#         if '=' in eq_str:
#             left, right = eq_str.split('=')
#             lhs = parse_expr(left.strip())
#             rhs = parse_expr(right.strip())
#             equations.append(Eq(lhs, rhs))


#     print("\nEquations with Positive Real Roots:")
#     for i, eq in enumerate(equations, 1):
#         # Get the variable (assumes single variable per equation)
#         var = list(eq.free_symbols)[0]
#         solutions = solve(eq, var)
        
#         # Filter for positive real solutions
#         positive_real_solutions = []
#         for sol in solutions:
#             if sol.is_real and sol.is_positive:
#                 positive_real_solutions.append(sol)
        
#         # Only print if there are positive real roots
#         if positive_real_solutions:
#             poly_form = simplify(eq.lhs - eq.rhs)
#             print(f"\n\nEquation {i}:")
#             print(f"{i}. {poly_form} = 0")
#             print(f"   {var} = {positive_real_solutions}")
#             # Print floating point approximations
#             float_values = [float(sol.evalf()) for sol in positive_real_solutions]
#             print(f"   Approximate values: {float_values}")

