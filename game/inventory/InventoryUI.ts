import * as Phaser from "phaser";

import InventorySystem, {
  InventorySlot,
} from "@/game/inventory/InventorySystem";

import {
  LootItem,
  LootRarity,
} from "@/game/loot/LootSystem";

export default class InventoryUI {
  private readonly scene: Phaser.Scene;

  private readonly inventory: InventorySystem;

  private container!: Phaser.GameObjects.Container;

  private titleText!: Phaser.GameObjects.Text;

  private valueText!: Phaser.GameObjects.Text;

  private slotContainers:
    Phaser.GameObjects.Container[] = [];

  private readonly slotSize = 58;

  private readonly slotGap = 8;

  private readonly columns = 4;

  constructor(
    scene: Phaser.Scene,
    inventory: InventorySystem
  ) {
    this.scene =
      scene;

    this.inventory =
      inventory;

    this.createItemTextures();

    this.create();
  }

  /*
   * =========================================
   * CREATE UI
   * =========================================
   */

  private create() {
    const cameraWidth =
      this.scene.cameras.main.width;

    /*
     * Posisi panel kanan atas.
     */

    const panelX =
      cameraWidth - 300;

    const panelY =
      30;

    this.container =
      this.scene.add.container(
        panelX,
        panelY
      );

    this.container
      .setScrollFactor(
        0
      )
      .setDepth(
        500
      );

    /*
     * BACKGROUND
     */

    const background =
      this.scene.add.rectangle(
        135,
        115,
        290,
        250,
        0x080c0f,
        0.92
      );

    background.setStrokeStyle(
      2,
      0x3c474d,
      1
    );

    this.container.add(
      background
    );

    /*
     * TITLE
     */

    this.titleText =
      this.scene.add.text(
        0,
        0,
        "INVENTORY",
        {
          fontFamily:
            "Arial",

          fontSize:
            "18px",

          color:
            "#d9a84e",

          fontStyle:
            "bold",
        }
      );

    this.container.add(
      this.titleText
    );

    /*
     * SLOT GRID
     */

    const maxSlots =
      this.inventory.getMaxSlots();

    for (
      let i = 0;
      i < maxSlots;
      i++
    ) {
      const column =
        i %
        this.columns;

      const row =
        Math.floor(
          i /
          this.columns
        );

      const x =
        column *
        (
          this.slotSize +
          this.slotGap
        );

      const y =
        42 +
        row *
        (
          this.slotSize +
          this.slotGap
        );

      const slotContainer =
        this.scene.add.container(
          x,
          y
        );

      this.container.add(
        slotContainer
      );

      this.slotContainers.push(
        slotContainer
      );
    }

    /*
     * TOTAL VALUE
     */

    this.valueText =
      this.scene.add.text(
        0,
        190,
        "",
        {
          fontFamily:
            "Arial",

          fontSize:
            "14px",

          color:
            "#ffd166",

          fontStyle:
            "bold",
        }
      );

    this.container.add(
      this.valueText
    );

    /*
     * Initial render.
     */

    this.update();
  }

  /*
   * =========================================
   * UPDATE INVENTORY
   * =========================================
   */

  public update() {
    const slots =
      this.inventory.getSlots();

    const usedSlots =
      this.inventory.getUsedSlots();

    const maxSlots =
      this.inventory.getMaxSlots();

    /*
     * TITLE
     */

    this.titleText.setText(
      `INVENTORY  ${usedSlots}/${maxSlots}`
    );

    /*
     * RENDER SLOT
     */

    for (
      let i = 0;
      i <
      this.slotContainers.length;
      i++
    ) {
      const slotContainer =
        this.slotContainers[
          i
        ];

      /*
       * Hapus visual lama.
       */

      slotContainer.removeAll(
        true
      );

      const slot =
        slots[
          i
        ];

      if (
        slot
      ) {
        this.renderItemSlot(
          slotContainer,
          slot
        );
      } else {
        this.renderEmptySlot(
          slotContainer
        );
      }
    }

    /*
     * TOTAL VALUE
     */

    this.valueText.setText(
      `RUN VALUE: ${this.inventory.getTotalValue()}`
    );
  }

  /*
   * =========================================
   * EMPTY SLOT
   * =========================================
   */

  private renderEmptySlot(
    container:
      Phaser.GameObjects.Container
  ) {
    const background =
      this.scene.add.rectangle(
        this.slotSize /
          2,

        this.slotSize /
          2,

        this.slotSize,
        this.slotSize,

        0x11181c,
        0.9
      );

    background.setStrokeStyle(
      2,
      0x344047,
      1
    );

    container.add(
      background
    );

    /*
     * Nomor slot kecil.
     */

    const slotNumber =
      this.slotContainers.indexOf(
        container
      ) +
      1;

    const numberText =
      this.scene.add.text(
        5,
        3,
        `${slotNumber}`,
        {
          fontFamily:
            "Arial",

          fontSize:
            "10px",

          color:
            "#58656c",
        }
      );

    container.add(
      numberText
    );
  }

  /*
   * =========================================
   * ITEM SLOT
   * =========================================
   */

  private renderItemSlot(
    container:
      Phaser.GameObjects.Container,

    slot:
      InventorySlot
  ) {
    const item =
      slot.item;

    const rarityColor =
      this.getRarityColor(
        item.rarity
      );

    /*
     * SLOT BACKGROUND
     */

    const background =
      this.scene.add.rectangle(
        this.slotSize /
          2,

        this.slotSize /
          2,

        this.slotSize,
        this.slotSize,

        0x11181c,
        0.96
      );

    background.setStrokeStyle(
      3,
      rarityColor,
      1
    );

    container.add(
      background
    );

    /*
     * RARITY GLOW
     */

    const glow =
      this.scene.add.rectangle(
        this.slotSize /
          2,

        this.slotSize /
          2,

        this.slotSize -
          8,

        this.slotSize -
          8,

        rarityColor,
        0.08
      );

    container.add(
      glow
    );

    /*
     * ITEM ICON
     */

    const textureKey =
      this.getItemTexture(
        item
      );

    const icon =
      this.scene.add.image(
        this.slotSize /
          2,

        this.slotSize /
          2,

        textureKey
      );

    icon.setDisplaySize(
      34,
      34
    );

    container.add(
      icon
    );

    /*
     * QUANTITY
     */

    if (
      slot.quantity >
      1
    ) {
      const quantityBackground =
        this.scene.add.circle(
          this.slotSize -
            10,

          this.slotSize -
            10,

          10,

          0x000000,
          0.85
        );

      container.add(
        quantityBackground
      );

      const quantityText =
        this.scene.add
          .text(
            this.slotSize -
              10,

            this.slotSize -
              10,

            `${slot.quantity}`,

            {
              fontFamily:
                "Arial",

              fontSize:
                "11px",

              color:
                "#ffffff",

              fontStyle:
                "bold",
            }
          )
          .setOrigin(
            0.5
          );

      container.add(
        quantityText
      );
    }

    /*
     * RARITY DOT
     */

    const rarityDot =
      this.scene.add.circle(
        8,
        this.slotSize -
          8,

        4,
        rarityColor,
        1
      );

    container.add(
      rarityDot
    );
  }

  /*
   * =========================================
   * ITEM TEXTURES
   * =========================================
   */

  private createItemTextures() {
    this.createMaterialTexture();

    this.createWeaponTexture();

    this.createArmorTexture();
  }

  /*
   * MATERIAL ICON
   *
   * Crystal / resource.
   */

  private createMaterialTexture() {
    const key =
      "inventory_material";

    if (
      this.scene.textures.exists(
        key
      )
    ) {
      return;
    }

    const graphics =
      this.scene.add.graphics();

    graphics.fillStyle(
      0xc9d3d9,
      1
    );

    graphics.beginPath();

    graphics.moveTo(
      20,
      2
    );

    graphics.lineTo(
      35,
      15
    );

    graphics.lineTo(
      29,
      37
    );

    graphics.lineTo(
      11,
      37
    );

    graphics.lineTo(
      5,
      15
    );

    graphics.closePath();

    graphics.fillPath();

    graphics.lineStyle(
      2,
      0xffffff,
      0.8
    );

    graphics.strokePath();

    graphics.lineStyle(
      2,
      0x75838a,
      1
    );

    graphics.lineBetween(
      20,
      3,
      20,
      36
    );

    graphics.generateTexture(
      key,
      40,
      40
    );

    graphics.destroy();
  }

  /*
   * WEAPON ICON
   *
   * Sword sederhana.
   */

  private createWeaponTexture() {
    const key =
      "inventory_weapon";

    if (
      this.scene.textures.exists(
        key
      )
    ) {
      return;
    }

    const graphics =
      this.scene.add.graphics();

    /*
     * Blade.
     */

    graphics.fillStyle(
      0xdce5e9,
      1
    );

    graphics.beginPath();

    graphics.moveTo(
      31,
      3
    );

    graphics.lineTo(
      35,
      7
    );

    graphics.lineTo(
      17,
      28
    );

    graphics.lineTo(
      12,
      23
    );

    graphics.closePath();

    graphics.fillPath();

    /*
     * Guard.
     */

    graphics.lineStyle(
      4,
      0xd9a84e,
      1
    );

    graphics.lineBetween(
      9,
      21,
      19,
      31
    );

    /*
     * Handle.
     */

    graphics.lineStyle(
      5,
      0x795548,
      1
    );

    graphics.lineBetween(
      11,
      29,
      5,
      35
    );

    graphics.generateTexture(
      key,
      40,
      40
    );

    graphics.destroy();
  }

  /*
   * ARMOR ICON
   *
   * Chest armor sederhana.
   */

  private createArmorTexture() {
    const key =
      "inventory_armor";

    if (
      this.scene.textures.exists(
        key
      )
    ) {
      return;
    }

    const graphics =
      this.scene.add.graphics();

    graphics.fillStyle(
      0x8d99a0,
      1
    );

    graphics.beginPath();

    graphics.moveTo(
      12,
      5
    );

    graphics.lineTo(
      20,
      9
    );

    graphics.lineTo(
      28,
      5
    );

    graphics.lineTo(
      36,
      13
    );

    graphics.lineTo(
      31,
      20
    );

    graphics.lineTo(
      31,
      36
    );

    graphics.lineTo(
      9,
      36
    );

    graphics.lineTo(
      9,
      20
    );

    graphics.lineTo(
      4,
      13
    );

    graphics.closePath();

    graphics.fillPath();

    graphics.lineStyle(
      2,
      0xdce5e9,
      1
    );

    graphics.strokePath();

    graphics.generateTexture(
      key,
      40,
      40
    );

    graphics.destroy();
  }

  /*
   * =========================================
   * HELPERS
   * =========================================
   */

  private getItemTexture(
    item: LootItem
  ): string {
    switch (
      item.type
    ) {
      case "weapon":
        return "inventory_weapon";

      case "armor":
        return "inventory_armor";

      default:
        return "inventory_material";
    }
  }

  private getRarityColor(
    rarity: LootRarity
  ): number {
    switch (
      rarity
    ) {
      case "uncommon":
        return 0x62c370;

      case "rare":
        return 0x4d8dff;

      case "epic":
        return 0xa855f7;

      case "legendary":
        return 0xffa928;

      default:
        return 0xb7c0c7;
    }
  }
}
