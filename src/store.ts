import { useSyncExternalStore } from "use-sync-external-store";

export const create = (createState: any) => {
  let state: any;
  const getState = () => state;

  const listeners: Set<() => void> = new Set();

  const setState = (fn: any) => {
    const nextState = typeof fn === "function" ? fn(state) : fn;
    state = Object.assign({}, state, nextState);
    listeners.forEach((listener) => listener());
  };

  state = createState(setState, getState);

  const subscribe = (cb: any) => {
    listeners.add(cb);
    return () => listeners.delete(cb);
  };

  const useStore = (selector: any) =>
    useSyncExternalStore(subscribe, () => selector(getState()));

  Object.assign(useStore, { getState, setState });

  return useStore;
};
