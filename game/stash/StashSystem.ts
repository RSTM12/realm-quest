import {
  LootItem,
} from "@/game/loot/LootSystem";

export type StashSlot = {
  item: LootItem;
  quantity: number;
};

export type PlayerLoadout = {
  weapon: LootItem | null;
  armor: LootItem | null;
};

type SavedStashData = {
  slots: StashSlot[];
};

type SavedLoadoutData = {
  weapon: LootItem | null;
  armor: LootItem | null;
};

export default class StashSystem {
  private slots:
    StashSlot[] = [];

  private loadout:
    PlayerLoadout = {
      weapon: null,
      armor: null,
    };

  private readonly storageKey =
    "realm_quest_stash";

  private readonly loadoutStorageKey =
    "realm_quest_loadout";

  constructor() {
    this.load();

    this.loadLoadout();
  }

  /*
   * =========================================
   * ADD SINGLE ITEM
   * =========================================
   */

  public addItem(
    item: LootItem,
    quantity = 1
  ) {
    if (
      quantity <=
      0
    ) {
      return;
    }

    const existingSlot =
      this.slots.find(
        (slot) =>
          slot.item.id ===
          item.id
      );

    if (
      existingSlot
    ) {
      existingSlot.quantity +=
        quantity;
    } else {
      this.slots.push({
        item: {
          ...item,
        },

        quantity,
      });
    }

    this.save();
  }

  /*
   * =========================================
   * ADD MULTIPLE INVENTORY SLOTS
   * =========================================
   */

  public addSlots(
    slots: {
      item: LootItem;
      quantity: number;
    }[]
  ) {
    for (
      const slot
      of slots
    ) {
      this.addItem(
        slot.item,
        slot.quantity
      );
    }
  }

  /*
   * =========================================
   * GET STASH
   * =========================================
   */

  public getSlots():
    StashSlot[] {
    return this.slots.map(
      (slot) => ({
        item: {
          ...slot.item,
        },

        quantity:
          slot.quantity,
      })
    );
  }

  /*
   * =========================================
   * GET SINGLE ITEM
   * =========================================
   */

  public getItem(
    itemId: string
  ): LootItem | null {
    const slot =
      this.slots.find(
        (stashSlot) =>
          stashSlot.item.id ===
          itemId
      );

    if (
      !slot
    ) {
      return null;
    }

    return {
      ...slot.item,
    };
  }

  /*
   * =========================================
   * HAS ITEM
   * =========================================
   */

  public hasItem(
    itemId: string
  ): boolean {
    return this.slots.some(
      (slot) =>
        slot.item.id ===
        itemId &&
        slot.quantity >
        0
    );
  }

  /*
   * =========================================
   * TOTAL UNIQUE ITEMS
   * =========================================
   */

  public getUsedSlots():
    number {
    return this.slots.length;
  }

  /*
   * =========================================
   * TOTAL ITEM COUNT
   * =========================================
   */

  public getTotalItemCount():
    number {
    return this.slots.reduce(
      (
        total,
        slot
      ) =>
        total +
        slot.quantity,

      0
    );
  }

  /*
   * =========================================
   * TOTAL VALUE
   * =========================================
   */

  public getTotalValue():
    number {
    return this.slots.reduce(
      (
        total,
        slot
      ) =>
        total +
        slot.item.value *
          slot.quantity,

      0
    );
  }

  /*
   * =========================================
   * EQUIP ITEM
   * =========================================
   */

  public equipItem(
    itemId: string
  ): boolean {
    const item =
      this.getItem(
        itemId
      );

    if (
      !item
    ) {
      return false;
    }

    /*
     * Material tidak bisa dipakai
     * sebagai equipment.
     */

    if (
      item.type ===
      "material"
    ) {
      return false;
    }

    /*
     * Equip weapon.
     */

    if (
      item.type ===
      "weapon"
    ) {
      this.loadout.weapon = {
        ...item,
      };

      this.saveLoadout();

      return true;
    }

    /*
     * Equip armor.
     */

    if (
      item.type ===
      "armor"
    ) {
      this.loadout.armor = {
        ...item,
      };

      this.saveLoadout();

      return true;
    }

    return false;
  }

  /*
   * =========================================
   * UNEQUIP WEAPON
   * =========================================
   */

  public unequipWeapon() {
    this.loadout.weapon =
      null;

    this.saveLoadout();
  }

  /*
   * =========================================
   * UNEQUIP ARMOR
   * =========================================
   */

  public unequipArmor() {
    this.loadout.armor =
      null;

    this.saveLoadout();
  }

  /*
   * =========================================
   * GET LOADOUT
   * =========================================
   */

  public getLoadout():
    PlayerLoadout {
    return {
      weapon:
        this.loadout.weapon
          ? {
              ...this.loadout.weapon,
            }
          : null,

      armor:
        this.loadout.armor
          ? {
              ...this.loadout.armor,
            }
          : null,
    };
  }

  /*
   * =========================================
   * IS ITEM EQUIPPED
   * =========================================
   */

  public isEquipped(
    itemId: string
  ): boolean {
    return (
      this.loadout.weapon?.id ===
        itemId ||
      this.loadout.armor?.id ===
        itemId
    );
  }

  /*
   * =========================================
   * REMOVE ITEM
   * =========================================
   */

  public removeItem(
    itemName: string,
    quantity = 1
  ): boolean {
    const slotIndex =
      this.slots.findIndex(
        (slot) =>
          slot.item.name ===
          itemName
      );

    if (
      slotIndex ===
      -1
    ) {
      return false;
    }

    const slot =
      this.slots[
        slotIndex
      ];

    if (
      slot.quantity <
      quantity
    ) {
      return false;
    }

    slot.quantity -=
      quantity;

    /*
     * Kalau item habis,
     * hapus juga dari loadout.
     */

    if (
      slot.quantity <=
      0
    ) {
      const removedItemId =
        slot.item.id;

      this.slots.splice(
        slotIndex,
        1
      );

      if (
        this.loadout.weapon?.id ===
        removedItemId
      ) {
        this.loadout.weapon =
          null;
      }

      if (
        this.loadout.armor?.id ===
        removedItemId
      ) {
        this.loadout.armor =
          null;
      }

      this.saveLoadout();
    }

    this.save();

    return true;
  }

  /*
   * =========================================
   * CLEAR STASH
   * =========================================
   */

  public clear() {
    this.slots =
      [];

    this.loadout = {
      weapon: null,
      armor: null,
    };

    this.save();

    this.saveLoadout();
  }

  /*
   * =========================================
   * SAVE STASH
   * =========================================
   */

  private save() {
    if (
      typeof window ===
      "undefined"
    ) {
      return;
    }

    try {
      const data:
        SavedStashData = {
        slots:
          this.slots,
      };

      window.localStorage.setItem(
        this.storageKey,
        JSON.stringify(
          data
        )
      );
    } catch (
      error
    ) {
      console.error(
        "Failed to save stash:",
        error
      );
    }
  }

  /*
   * =========================================
   * LOAD STASH
   * =========================================
   */

  private load() {
    if (
      typeof window ===
      "undefined"
    ) {
      return;
    }

    try {
      const savedData =
        window.localStorage.getItem(
          this.storageKey
        );

      if (
        !savedData
      ) {
        this.slots =
          [];

        return;
      }

      const parsed =
        JSON.parse(
          savedData
        ) as SavedStashData;

      if (
        !Array.isArray(
          parsed.slots
        )
      ) {
        this.slots =
          [];

        return;
      }

      this.slots =
        parsed.slots.filter(
          (slot) =>
            slot &&
            slot.item &&
            typeof slot.item.id ===
              "string" &&
            typeof slot.quantity ===
              "number" &&
            slot.quantity >
              0
        );
    } catch (
      error
    ) {
      console.error(
        "Failed to load stash:",
        error
      );

      this.slots =
        [];
    }
  }

  /*
   * =========================================
   * SAVE LOADOUT
   * =========================================
   */

  private saveLoadout() {
    if (
      typeof window ===
      "undefined"
    ) {
      return;
    }

    try {
      const data:
        SavedLoadoutData = {
        weapon:
          this.loadout.weapon,

        armor:
          this.loadout.armor,
      };

      window.localStorage.setItem(
        this.loadoutStorageKey,
        JSON.stringify(
          data
        )
      );
    } catch (
      error
    ) {
      console.error(
        "Failed to save loadout:",
        error
      );
    }
  }

  /*
   * =========================================
   * LOAD LOADOUT
   * =========================================
   */

  private loadLoadout() {
    if (
      typeof window ===
      "undefined"
    ) {
      return;
    }

    try {
      const savedData =
        window.localStorage.getItem(
          this.loadoutStorageKey
        );

      if (
        !savedData
      ) {
        return;
      }

      const parsed =
        JSON.parse(
          savedData
        ) as SavedLoadoutData;

      /*
       * Weapon hanya dipulihkan kalau
       * item masih ada di stash.
       */

      if (
        parsed.weapon &&
        parsed.weapon.type ===
          "weapon" &&
        this.hasItem(
          parsed.weapon.id
        )
      ) {
        this.loadout.weapon = {
          ...parsed.weapon,
        };
      }

      /*
       * Armor hanya dipulihkan kalau
       * item masih ada di stash.
       */

      if (
        parsed.armor &&
        parsed.armor.type ===
          "armor" &&
        this.hasItem(
          parsed.armor.id
        )
      ) {
        this.loadout.armor = {
          ...parsed.armor,
        };
      }

      /*
       * Bersihkan data lama kalau
       * equipment sudah tidak ada.
       */

      this.saveLoadout();
    } catch (
      error
    ) {
      console.error(
        "Failed to load loadout:",
        error
      );

      this.loadout = {
        weapon: null,
        armor: null,
      };
    }
  }
}
