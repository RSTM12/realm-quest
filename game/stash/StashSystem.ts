import {
  LootItem,
} from "@/game/loot/LootSystem";

export type StashSlot = {
  item: LootItem;
  quantity: number;
};

type SavedStashData = {
  slots: StashSlot[];
};

export default class StashSystem {
  private slots:
    StashSlot[] = [];

  private readonly storageKey =
    "realm_quest_stash";

  constructor() {
    this.load();
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
    /*
     * Cari item yang sama.
     */

    const existingSlot =
      this.slots.find(
        (slot) =>
          slot.item.name ===
            item.name &&
          slot.item.type ===
            item.type &&
          slot.item.rarity ===
            item.rarity
      );

    /*
     * Kalau sudah ada,
     * tambah quantity.
     */

    if (
      existingSlot
    ) {
      existingSlot.quantity +=
        quantity;
    } else {
      /*
       * Item baru.
       */

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
    /*
     * Return copy supaya data asli
     * tidak bisa diubah dari luar.
     */

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
   * REMOVE ITEM
   *
   * Nanti dipakai buat:
   * - jual ke market
   * - crafting
   * - upgrade
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
     * Kalau quantity habis,
     * hapus slot.
     */

    if (
      slot.quantity <=
      0
    ) {
      this.slots.splice(
        slotIndex,
        1
      );
    }

    this.save();

    return true;
  }

  /*
   * =========================================
   * CLEAR STASH
   *
   * Berguna untuk testing.
   * =========================================
   */

  public clear() {
    this.slots =
      [];

    this.save();
  }

  /*
   * =========================================
   * SAVE
   * =========================================
   */

  private save() {
    /*
     * Next.js bisa render di server.
     * Jadi pastikan window tersedia.
     */

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
   * LOAD
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

      /*
       * Belum pernah punya stash.
       */

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

      /*
       * Validasi sederhana.
       */

      this.slots =
        parsed.slots.filter(
          (slot) =>
            slot &&
            slot.item &&
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
}
