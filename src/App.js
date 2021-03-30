import "./styles.css";
import { useLayoutEffect, useReducer, useRef } from 'react';
// import { devtools } from 'zustand/middleware'
// import create from 'zustand'
function create(fn) {
  let state;
  const listeners = new Set()
  const setState = (partial) => {
    const nextState = typeof partial === 'function' ? partial(state) : partial
    if (nextState !== state) {
      state = { ...state, ...nextState };
      listeners.forEach(listener => listener())
    }
  }
  state = fn(setState)
  const getState = () => state;
  const subscribe = (listener) => {
    listeners.add(listener);

    return () => {
      listeners.delete(listener)
    }
  }
  const useStore = (selector = getState) => {
    const state = getState();
    const stateRef = useRef();
    const lastSelectorRef = useRef();
    const selectorRef = useRef();
    selectorRef.current = selector;
    const [, forceUpdate] = useReducer((c) => c + 1, 0)
    useLayoutEffect(() => {
      lastSelectorRef.current = selector;
      stateRef.current = state;
    })
    useLayoutEffect(() => {
      const unsubscribe = subscribe(() => {
        const lastSelector = lastSelectorRef.current;
        const nextSelector = selectorRef.current;
        const nextState = getState()
        if (lastSelector(stateRef.current) !== nextSelector(nextState)) {
          forceUpdate()
        }
      })
      return unsubscribe
    }, [])

    return selector(state);
  }

  return useStore;
}

const useStore = create(set => ({
  bears: 0,
  increasePopulation: () => set(state => ({ bears: state.bears + 1 })),
  removeAllBears: () => set({ bears: 0 })
}))
function BearCounter() {
  console.log('BearCounter render')
  const bears = useStore(state => state.bears)
  return <h1>{bears} around here ...</h1>
}

function Controls() {
  console.log('Controls render')
  const increasePopulation = useStore(state => state.increasePopulation)
  return <button onClick={increasePopulation}>one up</button>
}
export default function App() {
  return (
    <div className="App">
      <BearCounter />
      <Controls />
    </div>
  );
}
