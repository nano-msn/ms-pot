import { createStore } from "solid-js/store"

export type Reducer<State, Action> = (state: State, action: Action) => State

export type Dispatcher<Action> = (action: Action) => void

export const useReducer = <State extends object, Action extends unknown>(
  init: State,
  reducer: Reducer<State, Action>
): [State, Dispatcher<Action>] => {
  const [state, setState] = createStore(init)
  const dispatch = (action: Action) => setState(reducer(init, action))
  return [state, dispatch]
}
