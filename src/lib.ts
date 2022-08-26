import { Token } from "./lexer";
type Value = number;
export type Operator = "+" | "*" | "/" | "-";

const OPERATORS: Array<Operator> = ["+", "*", "/", "-"];

export type Exp =
  | { value: Value }
  | {
      op: Operator;
      left?: Exp;
      right?: Exp;
    };

export function stringToExp(str: string): Exp {
  let arr = str.split(/\s+/).reverse();
  function buildTree(): Exp {
    const currentToken = arr.shift();

    if (!currentToken) {
      throw new Error(`stringToExp: token undefined`);
    }
    if (OPERATORS.includes(currentToken as Operator)) {
      return {
        op: currentToken as Operator,
        right: buildTree(),
        left: buildTree()
      };
    }
    return {
      value: +currentToken
    };
  }
  return buildTree();
}

export function compute(str: string): number {
  const tree = stringToExp(str);
  function _compute(r: Exp): number {
    if ("value" in r) {
      return r.value;
    }
    switch (r.op) {
      case "*":
        return _compute(r.left!) * _compute(r.right!);
      case "+":
        return _compute(r.left!) + _compute(r.right!);
      case "-":
        return _compute(r.left!) - _compute(r.right!);
      case "/":
        return _compute(r.left!) / _compute(r.right!);
    }
  }
  return _compute(tree);
}
//          /
//       +     +
//      1 *   4 *
//       2 3   2 5
//
//const xp = "2 5 * 4 + 3 2 * 1 + /";

export function postfixe(exp: Exp): string {
  if ("value" in exp) {
    return exp.value.toString();
  }
  return postfixe(exp.left!) + " " + postfixe(exp.right!) + " " + exp.op;
}

export function infixe(exp: Exp): string {
  if ("value" in exp) {
    return exp.value.toString();
  } else {
    return "(" + infixe(exp.right!) + exp.op + infixe(exp.left!) + ")";
  }
}

export function expToString(exp: Exp): string {
  let t = postfixe(exp);
  //console.log(compute(t));
  return t;
}

export function expToStringInfixe(exp: Exp): string {
  let t = infixe(exp);
  //console.log(eval(t));
  return t.slice(1, t.length - 1);
}

function newValueNode(value: string): Exp {
  return { value: +value };
}

function newOpNode(op: string): Exp {
  return {
    op: op as Operator
  };
}

function newNode(s: string) {
  if (/^\d+\.?\d*$/.test(s)) {
    return newValueNode(s);
  }
  return newOpNode(s);
}

export function buildExpTree(tokens: Token[]): Exp {
  tokens.unshift({ value: "(", type: "" });
  tokens.push({ value: ")", type: "" });
  let s = tokens.map((t) => t.value.toString());
  // Stack to hold nodes
  let stN = [];

  // Stack to hold chars
  let stC = [];
  let t, t1, t2;

  // Prioritising the operators
  let p: Record<string, number> = {
    "+": 1,
    "-": 1,
    "/": 2,
    "*": 2,
    "^": 3,
    ")": 0
  };

  for (let i = 0; i < s.length; i++) {
    if (s[i] === "(") {
      // Push '(' in char stack
      stC.push(s[i]);
    }

    // Push the operands in node stack
    ///[a-zA-Z]/
    //^\d+\.?\d*$
    else if (/^\d+\.?\d*$/.test(s[i])) {
      t = newNode(s[i]);
      stN.push(t);
    } else if (p[s[i]] > 0) {
      // If an operator with lower or
      // same associativity appears
      while (
        stC.length !== 0 &&
        stC[stC.length - 1] !== "(" &&
        ((s[i] !== "^" && p[stC[stC.length - 1]] >= p[s[i]]) ||
          (s[i] === "^" && p[stC[stC.length - 1]] > p[s[i]]))
      ) {
        // Get and remove the top element
        // from the character stack
        t = newNode(stC[stC.length - 1]);
        stC.pop();

        // Get and remove the top element
        // from the node stack
        t1 = stN[stN.length - 1];
        stN.pop();

        // Get and remove the currently top
        // element from the node stack
        t2 = stN[stN.length - 1];
        stN.pop();

        // Update the tree
        if ("op" in t) {
          t.left = t2;
          t.right = t1;
        } else {
          throw new Error(JSON.stringify(t));
        }

        // Push the node to the node stack
        stN.push(t);
      }

      // Push s[i] to char stack
      stC.push(s[i]);
    } else if (s[i] === ")") {
      while (stC.length !== 0 && stC[stC.length - 1] !== "(") {
        t = newNode(stC[stC.length - 1]);
        stC.pop();
        t1 = stN[stN.length - 1];
        stN.pop();
        t2 = stN[stN.length - 1];
        stN.pop();
        if ("op" in t) {
          t.left = t2;
          t.right = t1;
        } else {
          throw new Error(JSON.stringify(t));
        }
        stN.push(t);
      }
      stC.pop();
    }
  }
  t = stN[stN.length - 1];
  return t;
}

export function convertToPostfix(infix: string): string {
  var output = "";
  var stack = [];
  let operators: Record<string, number> = {
    "+": 1,
    "-": 1,
    "*": 2,
    "/": 2
  };
  for (let i = 0; i < infix.length; i++) {
    var ch = infix.charAt(i);
    if (ch === "+" || ch === "-" || ch === "*" || ch === "/") {
      while (
        stack.length !== 0 &&
        stack[stack.length - 1] !== "(" &&
        operators[ch] <= operators[stack[stack.length - 1]]
      ) {
        output += stack.pop();
        output += " ";
      }
      stack.push(ch);
    } else if (ch === "(") {
      stack.push(ch);
    } else if (ch === ")") {
      while (stack.length !== 0 && stack[stack.length - 1] !== "(") {
        output += " ";
        output += stack.pop();
        output += " ";
      }
      stack.pop();
    } else {
      output += ch;
    }
  }
  while (stack.length !== 0) {
    output += " ";
    output += stack.pop();
    output += " ";
  }
  return output;
}
