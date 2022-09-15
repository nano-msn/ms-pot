import { describe, expect, test } from "@jest/globals"

import {
  applyPotion,
  levelToExp,
  POTION_DATA,
  POTION_IDS,
  unapplyPotion,
} from "./logic"
import { sequence } from "./utils"

describe("apply/unapply potion", () => {
  describe.each(sequence(50).map((n) => n + 200))("Level: %i", () => {
    test.each(POTION_IDS)("Potion: %s", (potionID) => {
      const potion = POTION_DATA[potionID]
      const total = levelToExp(potion.max)
      expect(unapplyPotion(applyPotion(total, potion), potion)).toEqual(total)
    })
  })
})
