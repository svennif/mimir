'use client';

import { useSyncExternalStore } from 'react';

type Updater<T> = Partial<T> | ((state: T) => Partial<T>);

export function createStore<T extends object>(initial: T) {
  let state = initial;
  const listeners = new Set<() => void>();

  const getState = () => state;

  const setState = (updater: Updater<T>) => {
    const patch = typeof updater === 'function' ? updater(state) : updater;
    let changed = false;
    for (const key in patch) {
      if (!Object.is(state[key], patch[key]!)) { changed = true; break; }
    }
    if (!changed) return;          // no-op writes shouldn't wake subscribers
    state = { ...state, ...patch };
    for (const listener of listeners) listener();
  };

  const subscribe = (listener: () => void) => {
    listeners.add(listener);
    return () => { listeners.delete(listener); };
  };

  function useStore<S>(selector: (state: T) => S): S {
    return useSyncExternalStore(
      subscribe,
      () => selector(state),
      () => selector(initial),   // server snapshot — must not read mutable state
    );
  }

  return Object.assign(useStore, { getState, setState, subscribe });
}