import "./styles.css";
import { useState } from "react";
import { convertToPostfix, Exp, stringToExp } from "./lib";
import { InputStream, TokenStream } from "./lexer";

function Node({ t }: { t: Exp }) {
  if ("value" in t) {
    return (
      <li>
        <div>{t.value}</div>
      </li>
    );
  }
  return (
    <li>
      <div>{t.op}</div>
      <ul>
        {t.left && <Node t={t.left} />}
        {t.right && <Node t={t.right} />}
      </ul>
    </li>
  );
}

export default function App() {
  const [exp, setExp] = useState("");
  const [rpn, setRpn] = useState("");
  const [result, setResult] = useState<any>({
    result: 0,
    root: undefined
  });
  const [err, setErr] = useState("");
  return (
    <>
      <h3 style={{ textAlign: "center" }}>
        Infixe to reverse polish notation (RPN)
      </h3>
      <form
        className="rpn--form"
        onSubmit={(e) => {
          e.preventDefault();
          try {
            // Check if exp is valid
            let t = TokenStream(InputStream(exp));
            while(!t.eof()) {
                t.next();
            }
            // eslint-disable-next-line
            let result = eval(exp);
            const postfix = convertToPostfix(exp);
            let root = stringToExp(postfix.trim());
            setRpn(postfix);
            const data = { root, result };
            setResult(data);
            setErr("");
          } catch (err) {
            setRpn("");
            setResult("");
            setErr((err as any).toString());
          }
        }}
      >
        <input
          placeholder="infix notation"
          value={exp}
          onChange={(e) => setExp(e.target.value)}
        ></input>
        <button className="rpn--button" disabled={exp.trim() === ""}>
          to RPN
        </button>
      </form>
      <p className="rpn--text">{rpn && `${rpn} = ${result.result}`}</p>
      {/* <pre>{JSON.stringify(result, null, 2)}</pre> */}
      {err}
      <div className="tree">
        <ul>{result?.root && <Node t={result.root} />}</ul>
      </div>
    </>
  );
}
