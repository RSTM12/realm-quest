import {
  LootItem,
} from "@/game/loot/LootSystem";

export type InventorySlot = {
  item: LootItem;
  quantity: number;
};

export default class InventorySystem {
  /*
   * Untuk awal kita kasih 8 slot.
   *
   * Material yang ID-nya sama
   * bisa stack dalam satu slot.
   *
   * Weapon dan armor tidak stack.
   */

  private readonly maxSlots: number;

  private slots: InventorySlot[] = [];

  constructor(
    maxSlots = 8
  ) {
    this.maxSlots =
      maxSlots;
  }

  /*
   * =========================================
   * ADD ITEM
   * =========================================
   */

  public addItem(
    item: LootItem
  ): boolean {
    /*
     * Material boleh stack.
     */

    if (
      item.type ===
      "material"
    ) {
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
          1;

        return true;
      }
    }

    /*
     * Kalau tidak bisa stack,
     * butuh slot kosong.
     */

    if (
      this.slots.length >=
      this.maxSlots
    ) {
      return false;
    }

    /*
     * Buat slot baru.
     */

    this.slots.push({
      item: {
        ...item,
      },

      quantity:
        1,
    });

    return true;
  }

  /*
   * =========================================
   * REMOVE ITEM
   * =========================================
   */

  public removeItem(
    slotIndex: number,
    quantity = 1
  ): boolean {
    const slot =
      this.slots[
        slotIndex
      ];

    if (
      !slot
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

    return true;
  }

  /*
   * =========================================
   * GET INVENTORY
   * =========================================
   */

  public getSlots():
    InventorySlot[] {
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
   * INVENTORY INFO
   * =========================================
   */

  public getUsedSlots():
    number {
    return this.slots.length;
  }

  public getMaxSlots():
    number {
    return this.maxSlots;
  }

  public isFull():
    boolean {
    return (
      this.slots.length >=
      this.maxSlots
    );
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
   * TOTAL LOOT VALUE
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
        (
          slot.item.value *
          slot.quantity
        ),

      0
    );
  }

  /*
   * =========================================
   * CLEAR INVENTORY
   * =========================================
   *
   * Nanti dipakai kalau player mati
   * dan kehilangan loot selama run.
   */

  public clear() {
    this.slots =
      [];
  }
}
