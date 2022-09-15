import { Component, createEffect, createSignal, For } from "solid-js"
import { createStore } from "solid-js/store"

import { Input } from "./components/Input"
import {
  applyPotions,
  levelToExp,
  expToLevel,
  EXPERIENCE,
  PotionCount,
  PotionID,
  POTION_DATA,
  POTION_IDS,
  unapplyPotions,
  toPercentage,
  fromPercentage,
} from "./logic"
import { useReducer } from "./useReducer"

type Field =
  | "levelBefore"
  | "experienceBefore"
  | "percentageBefore"
  | "levelAfter"
  | "experienceAfter"
  | "percentageAfter"

type State = {
  levelBefore: number
  experienceBefore: number
  percentageBefore: number
  levelAfter: number
  experienceAfter: number
  percentageAfter: number
  potions: PotionCount
  change: Field
}

type Action =
  | { type: "levelBefore"; value: number }
  | { type: "experienceBefore"; value: number }
  | { type: "percentageBefore"; value: number }
  | { type: "levelAfter"; value: number }
  | { type: "experienceAfter"; value: number }
  | { type: "percentageAfter"; value: number }
  | { type: "potion"; potionId: PotionID; value: number }

const apply = (
  levelBefore: number,
  experienceBefore: number,
  potions: PotionCount
): Omit<State, "potions" | "change"> => {
  const percentageBefore = toPercentage(levelBefore, experienceBefore)
  const totalBefore = levelToExp(levelBefore, experienceBefore)
  const totalAfter = applyPotions(totalBefore, potions)
  const [levelAfter, experienceAfter] = expToLevel(totalAfter)
  const percentageAfter = toPercentage(levelAfter, experienceAfter)
  return {
    levelBefore,
    experienceBefore,
    percentageBefore,
    levelAfter,
    experienceAfter,
    percentageAfter,
  }
}

const unapply = (
  levelAfter: number,
  experienceAfter: number,
  potions: PotionCount
): Omit<State, "potions" | "change"> => {
  const percentageAfter = toPercentage(levelAfter, experienceAfter)
  const totalAfter = levelToExp(levelAfter, experienceAfter)
  const totalBefore = unapplyPotions(totalAfter, potions)
  const [levelBefore, experienceBefore] = expToLevel(totalBefore)
  const percentageBefore = toPercentage(levelBefore, experienceBefore)
  return {
    levelBefore,
    experienceBefore,
    percentageBefore,
    levelAfter,
    experienceAfter,
    percentageAfter,
  }
}

const reducer = (state: State, action: Action): State => {
  switch (action.type) {
    case "levelBefore":
      return {
        ...state,
        ...apply(action.value, state.experienceBefore, state.potions),
        change: "levelBefore",
      }

    case "experienceBefore":
      return {
        ...state,
        ...apply(state.levelBefore, action.value, state.potions),
        change: "experienceBefore",
      }

    case "percentageBefore":
      const percentageBefore = action.value
      return {
        ...state,
        ...apply(
          state.levelBefore,
          fromPercentage(state.levelBefore, percentageBefore),
          state.potions
        ),
        percentageBefore,
        change: "percentageBefore",
      }

    case "levelAfter":
      return {
        ...state,
        ...unapply(action.value, state.experienceAfter, state.potions),
        change: "levelAfter",
      }

    case "experienceAfter":
      return {
        ...state,
        ...unapply(state.levelAfter, action.value, state.potions),
        change: "experienceAfter",
      }

    case "percentageAfter":
      const percentageAfter = action.value
      return {
        ...state,
        ...unapply(
          state.levelAfter,
          fromPercentage(state.levelAfter, percentageAfter),
          state.potions
        ),
        percentageAfter,
        change: "percentageAfter",
      }

    case "potion":
      const potions = {
        ...state.potions,
        [action.potionId]: action.value,
      }

      switch (state.change) {
        case "levelBefore":
        case "experienceBefore":
        case "percentageBefore":
          return {
            ...state,
            ...apply(state.levelBefore, state.experienceBefore, potions),
            potions,
          }

        case "levelAfter":
        case "experienceAfter":
        case "percentageAfter":
          return {
            ...state,
            ...unapply(state.levelAfter, state.experienceAfter, potions),
            potions,
          }
      }

    default:
      return state
  }
}

const defaultState: State = {
  levelBefore: 200,
  experienceBefore: 0,
  percentageBefore: 0,
  levelAfter: 200,
  experienceAfter: 0,
  percentageAfter: 0,
  potions: {
    POTION0: 0,
    POTION1: 0,
    POTION2: 0,
    POTION3: 0,
    POTION4: 0,
    POTION5: 0,
  },
  change: "levelBefore",
}

const STATE_STORAGE_KEY = "state"

const saveState = (state: State) => {
  localStorage.setItem(STATE_STORAGE_KEY, JSON.stringify(state))
}

const loadState = (): State => {
  const value = localStorage.getItem(STATE_STORAGE_KEY)
  return value ? (JSON.parse(value) as State) : defaultState
}

const App: Component = () => {
  const [state, dispatch] = useReducer(loadState(), reducer)
  const [values, setValues] = createStore({
    levelBefore: state.levelBefore.toString(),
    experienceBefore: state.experienceBefore.toString(),
    percentageBefore: state.percentageBefore.toString(),
    levelAfter: state.levelAfter.toString(),
    experienceAfter: state.experienceAfter.toString(),
    percentageAfter: state.percentageAfter.toString(),
    POTION0: state.potions.POTION0.toString(),
    POTION1: state.potions.POTION1.toString(),
    POTION2: state.potions.POTION2.toString(),
    POTION3: state.potions.POTION3.toString(),
    POTION4: state.potions.POTION4.toString(),
    POTION5: state.potions.POTION5.toString(),
  })

  createEffect(() => {
    saveState(state)
  })

  const [focus, setFocus] = createSignal<Field | PotionID>("levelBefore")

  const levelBeforeValue = () =>
    focus() === "levelBefore"
      ? values.levelBefore
      : state.levelBefore.toString()

  const experienceBeforeValue = () =>
    focus() === "experienceBefore"
      ? values.experienceBefore
      : state.experienceBefore.toString()

  const percentageBeforeValue = () =>
    focus() === "percentageBefore"
      ? values.percentageBefore
      : state.percentageBefore.toFixed(3)

  const levelAfterValue = () =>
    focus() === "levelAfter" ? values.levelAfter : state.levelAfter.toString()

  const experienceAfterValue = () =>
    focus() === "experienceAfter"
      ? values.experienceAfter
      : state.experienceAfter.toString()

  const percentageAfterValue = () =>
    focus() === "percentageAfter"
      ? values.percentageAfter
      : state.percentageAfter.toFixed(3)

  const potionValue = (potionId: PotionID) =>
    focus() === potionId ? values[potionId] : state.potions[potionId]

  return (
    <main>
      <div class="flex justify-center w-full">
        <div class="flex flex-col gap-4 w-[360px]">
          <div>
            <h2 class="font-medium leading-tight text-2xl mt-0 mb-2">
              秘薬使用前のレベル
            </h2>
            <div class="grid grid-cols-[1fr_3fr_3fr] space-x-1">
              <div>
                <Input
                  placeholder="レベル"
                  value={levelBeforeValue()}
                  onInput={(event) => {
                    const value = parseInt(event.currentTarget.value)
                    if (!isNaN(value)) {
                      dispatch({ type: "levelBefore", value })
                    }
                    setValues({ levelBefore: event.currentTarget.value })
                  }}
                  onFocus={() => {
                    setFocus("levelBefore")
                    setValues({ levelBefore: state.levelBefore.toString() })
                  }}
                />
              </div>
              <div>
                <Input
                  placeholder="経験値"
                  value={experienceBeforeValue()}
                  onInput={(event) => {
                    const value = parseInt(event.currentTarget.value)
                    if (!isNaN(value)) {
                      dispatch({ type: "experienceBefore", value })
                    }
                    setValues({ experienceBefore: event.currentTarget.value })
                  }}
                  onFocus={() => {
                    setFocus("experienceBefore")
                    setValues({
                      experienceBefore: state.experienceBefore.toString(),
                    })
                  }}
                />
              </div>
              <div>
                <Input
                  placeholder="％"
                  value={percentageBeforeValue()}
                  onInput={(event) => {
                    const value = parseFloat(event.currentTarget.value)
                    if (!isNaN(value)) {
                      dispatch({ type: "percentageBefore", value })
                    }
                    setValues({ percentageBefore: event.currentTarget.value })
                  }}
                  onFocus={() => {
                    setFocus("percentageBefore")
                    setValues({
                      percentageBefore: state.percentageBefore.toFixed(3),
                    })
                  }}
                />
              </div>
            </div>
          </div>

          <div>
            <h2 class="font-medium leading-tight text-2xl mt-0 mb-2">
              使用する秘薬
            </h2>
            <div class="grid grid-cols-[1fr_50px] gap-1">
              <For each={POTION_IDS}>
                {(potionId: PotionID) => (
                  <>
                    <div>{POTION_DATA[potionId].label}</div>
                    <div>
                      <Input
                        value={potionValue(potionId)}
                        onInput={(event) => {
                          const value =
                            event.currentTarget.value === ""
                              ? 0
                              : parseInt(event.currentTarget.value)
                          if (!isNaN(value)) {
                            dispatch({ type: "potion", potionId, value })
                          }
                          setValues({ [potionId]: event.currentTarget.value })
                        }}
                        onFocus={() => {
                          setFocus(potionId)
                        }}
                      />
                    </div>
                  </>
                )}
              </For>
            </div>
          </div>

          <div>
            <h2 class="font-medium leading-tight text-2xl mt-0 mb-2">
              秘薬使用後のレベル
            </h2>
            <div class="grid grid-cols-[1fr_3fr_3fr] space-x-1">
              <div>
                <Input
                  class="w-[50px]"
                  placeholder="レベル"
                  value={levelAfterValue()}
                  onInput={(event) => {
                    const value = parseInt(event.currentTarget.value)
                    if (!isNaN(value)) {
                      dispatch({ type: "levelAfter", value })
                    }
                    setValues({ levelAfter: event.currentTarget.value })
                  }}
                  onFocus={() => {
                    setFocus("levelAfter")
                    setValues({ levelAfter: state.levelAfter.toString() })
                  }}
                />
              </div>
              <div>
                <Input
                  class="w-[150px]"
                  placeholder="経験値"
                  value={experienceAfterValue()}
                  onInput={(event) => {
                    const value = parseInt(event.currentTarget.value)
                    if (!isNaN(value)) {
                      dispatch({ type: "experienceAfter", value })
                    }
                    setValues({ experienceAfter: event.currentTarget.value })
                  }}
                  onFocus={() => {
                    setFocus("experienceAfter")
                    setValues({
                      experienceAfter: state.experienceAfter.toString(),
                    })
                  }}
                />
              </div>
              <div>
                <Input
                  class="w-[150px]"
                  placeholder="％"
                  value={percentageAfterValue()}
                  onInput={(event) => {
                    const value = parseFloat(event.currentTarget.value)
                    if (!isNaN(value)) {
                      dispatch({ type: "percentageAfter", value })
                    }
                    setValues({ percentageAfter: event.currentTarget.value })
                  }}
                  onFocus={() => {
                    setFocus("percentageAfter")
                    setValues({
                      percentageAfter: state.percentageAfter.toFixed(3),
                    })
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}

export default App
