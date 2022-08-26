export type Token = {
  type: string;
  value: string | number;
};

export function InputStream(input: string) {
  let pos = 0;
  function next() {
    return input.charAt(pos++);
  }
  function peek() {
    return input.charAt(pos);
  }
  function eof() {
    return peek() === "";
  }
  function croak(msg: string) {
    throw new Error(msg);
  }
  return {
    next: next,
    peek: peek,
    eof: eof,
    croak: croak
  };
}

export function TokenStream(input: ReturnType<typeof InputStream>) {
  let current:
    | { type: string; value: number | string }
    | null
    | undefined = null;

  function is_digit(ch: string) {
    return /[0-9]/i.test(ch);
  }

  function is_op_char(ch: string) {
    return "+-*/".indexOf(ch) >= 0;
  }
  function is_punc(ch: string) {
    return "()".indexOf(ch) >= 0;
  }
  function is_whitespace(ch: string) {
    return " \t\n".indexOf(ch) >= 0;
  }
  function read_while(predicate: any) {
    let str = "";
    while (!input.eof() && predicate(input.peek())) str += input.next();
    return str;
  }
  function read_number() {
    let has_dot = false;
    let number = read_while(function (ch: string) {
      if (ch === ".") {
        if (has_dot) return false;
        has_dot = true;
        return true;
      }
      return is_digit(ch);
    });
    return { type: "num", value: parseFloat(number) };
  }

  function read_next() {
    read_while(is_whitespace);
    if (input.eof()) return null;
    let ch = input.peek();
    if (is_digit(ch)) return read_number();
    if (is_punc(ch))
      return {
        type: "punc",
        value: input.next()
      };
    if (is_op_char(ch))
      return {
        type: "op",
        value: read_while(is_op_char)
      };
    input.croak("Can't handle character: " + ch);
  }
  function peek() {
    return current || (current = read_next());
  }
  function next() {
    let tok = current;
    current = null;
    return tok || read_next();
  }
  function eof() {
    return peek() == null;
  }

  return {
    next: next,
    peek: peek,
    eof: eof,
    croak: input.croak
  };
}
