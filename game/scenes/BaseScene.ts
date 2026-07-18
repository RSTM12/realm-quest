import * as Phaser from "phaser";

import StashSystem, {
  StashSlot,
} from "@/game/stash/StashSystem";

export default class BaseScene extends Phaser.Scene {
  private stash!: StashSystem;

  private readonly slotSize = 70;

  private readonly slotGap = 12;

  private readonly columns = 6;

  constructor() {
    super("BaseScene");
  }

  create() {
    /*
     * =========================================
     * STASH
     * =========================================
     */

    this.stash =
      new StashSystem();

    /*
     * =========================================
     * BACKGROUND
     * =========================================
     */

    this.createBackground();

    /*
     * =========================================
     * HEADER
     * =========================================
     */

    this.createHeader();

    /*
     * =========================================
     * STASH PANEL
     * =========================================
     */

    this.createStashPanel();

    /*
     * =========================================
     * ENTER DUNGEON
     * =========================================
     */

    this.createDungeonButton();
  }

  /*
   * =========================================
   * BACKGROUND
   * =========================================
   */

  private createBackground() {
    const camera =
      this.cameras.main;

    camera.setBackgroundColor(
      "#080c0f"
    );

    /*
     * Main background.
     */

    this.add.rectangle(
      camera.width / 2,
      camera.height / 2,
      camera.width,
      camera.height,
      0x080c0f,
      1
    );

    /*
     * Decorative grid.
     */

    const graphics =
      this.add.graphics();

    graphics.lineStyle(
      1,
      0x182126,
      0.8
    );

    const gridSize =
      64;

    for (
      let x = 0;
      x <= camera.width;
      x += gridSize
    ) {
      graphics.lineBetween(
        x,
        0,
        x,
        camera.height
      );
    }

    for (
      let y = 0;
      y <= camera.height;
      y += gridSize
    ) {
      graphics.lineBetween(
        0,
        y,
        camera.width,
        y
      );
    }

    /*
     * Glow dekorasi.
     */

    const glow =
      this.add.circle(
        camera.width * 0.78,
        camera.height * 0.3,
        260,
        0xd9a84e,
        0.035
      );

    this.tweens.add({
      targets:
        glow,

      scale: {
        from:
          0.9,

        to:
          1.1,
      },

      alpha: {
        from:
          0.02,

        to:
          0.06,
      },

      duration:
        3000,

      yoyo:
        true,

      repeat:
        -1,
    });
  }

  /*
   * =========================================
   * HEADER
   * =========================================
   */

  private createHeader() {
    const camera =
      this.cameras.main;

    /*
     * Header background.
     */

    this.add.rectangle(
      camera.width / 2,
      45,
      camera.width,
      90,
      0x0b1014,
      0.96
    );

    /*
     * Bottom border.
     */

    this.add.rectangle(
      camera.width / 2,
      89,
      camera.width,
      2,
      0x344047,
      1
    );

    /*
     * Logo.
     */

    this.add.text(
      30,
      18,
      "REALM QUEST",
      {
        fontFamily:
          "Arial",

        fontSize:
          "27px",

        color:
          "#d9a84e",

        fontStyle:
          "bold",
      }
    );

    this.add.text(
      32,
      54,
      "ADVENTURER BASE",
      {
        fontFamily:
          "Arial",

        fontSize:
          "12px",

        color:
          "#7e8c94",

        letterSpacing:
          4,
      }
    );

    /*
     * Stash summary header.
     */

    const totalItems =
      this.stash.getTotalItemCount();

    const totalValue =
      this.stash.getTotalValue();

    this.add
      .text(
        camera.width - 30,
        27,

        `STASH: ${totalItems} ITEMS   •   VALUE: ${totalValue}`,

        {
          fontFamily:
            "Arial",

          fontSize:
            "15px",

          color:
            "#d0d6da",
        }
      )
      .setOrigin(
        1,
        0
      );
  }

  /*
   * =========================================
   * STASH PANEL
   * =========================================
   */

  private createStashPanel() {
    const camera =
      this.cameras.main;

    const panelX =
      40;

    const panelY =
      125;

    const panelWidth =
      Math.min(
        600,
        camera.width - 80
      );

    const panelHeight =
      Math.min(
        540,
        camera.height - 165
      );

    /*
     * Panel background.
     */

    this.add
      .rectangle(
        panelX +
          panelWidth / 2,

        panelY +
          panelHeight / 2,

        panelWidth,

        panelHeight,

        0x0d1317,

        0.96
      )
      .setStrokeStyle(
        2,
        0x344047,
        1
      );

    /*
     * Title.
     */

    this.add.text(
      panelX + 25,
      panelY + 22,

      "PERMANENT STASH",

      {
        fontFamily:
          "Arial",

        fontSize:
          "21px",

        color:
          "#d9a84e",

        fontStyle:
          "bold",
      }
    );

    this.add.text(
      panelX + 25,
      panelY + 53,

      "Loot successfully extracted from the dungeon.",

      {
        fontFamily:
          "Arial",

        fontSize:
          "13px",

        color:
          "#7e8c94",
      }
    );

    /*
     * Divider.
     */

    this.add.rectangle(
      panelX +
        panelWidth / 2,

      panelY +
        85,

      panelWidth -
        50,

      1,

      0x344047,

      1
    );

    /*
     * Render stash.
     */

    const slots =
      this.stash.getSlots();

    if (
      slots.length ===
      0
    ) {
      this.createEmptyStash(
        panelX,
        panelY,
        panelWidth
      );

      return;
    }

    slots.forEach(
      (
        slot,
        index
      ) => {
        this.createStashSlot(
          slot,
          index,
          panelX + 25,
          panelY + 110
        );
      }
    );
  }

  /*
   * =========================================
   * EMPTY STASH
   * =========================================
   */

  private createEmptyStash(
    panelX: number,
    panelY: number,
    panelWidth: number
  ) {
    this.add
      .text(
        panelX +
          panelWidth / 2,

        panelY +
          250,

        "YOUR STASH IS EMPTY",

        {
          fontFamily:
            "Arial",

          fontSize:
            "20px",

          color:
            "#56636a",

          fontStyle:
            "bold",
        }
      )
      .setOrigin(
        0.5
      );

    this.add
      .text(
        panelX +
          panelWidth / 2,

        panelY +
          285,

        "Enter the dungeon, collect loot and extract safely.",

        {
          fontFamily:
            "Arial",

          fontSize:
            "13px",

          color:
            "#465158",
        }
      )
      .setOrigin(
        0.5
      );
  }

  /*
   * =========================================
   * STASH SLOT
   * =========================================
   */

  private createStashSlot(
    slot: StashSlot,
    index: number,
    startX: number,
    startY: number
  ) {
    const column =
      index %
      this.columns;

    const row =
      Math.floor(
        index /
          this.columns
      );

    const x =
      startX +
      column *
        (
          this.slotSize +
          this.slotGap
        );

    const y =
      startY +
      row *
        (
          this.slotSize +
          this.slotGap
        );

    const rarityColor =
      this.getRarityColor(
        slot.item.rarity
      );

    /*
     * Slot background.
     */

    const background =
      this.add.rectangle(
        x +
          this.slotSize / 2,

        y +
          this.slotSize / 2,

        this.slotSize,

        this.slotSize,

        0x11181c,

        1
      );

    background.setStrokeStyle(
      3,
      rarityColor,
      1
    );

    /*
     * Rarity inner glow.
     */

    this.add.rectangle(
      x +
        this.slotSize / 2,

      y +
        this.slotSize / 2,

      this.slotSize - 8,

      this.slotSize - 8,

      rarityColor,

      0.08
    );

    /*
     * Item icon.
     */

    this.createItemIcon(
      slot,
      x +
        this.slotSize / 2,

      y +
        this.slotSize / 2
    );

    /*
     * Quantity.
     */

    if (
      slot.quantity >
      1
    ) {
      this.add.circle(
        x +
          this.slotSize -
          11,

        y +
          this.slotSize -
          11,

        11,

        0x000000,

        0.9
      );

      this.add
        .text(
          x +
            this.slotSize -
            11,

          y +
            this.slotSize -
            11,

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
    }

    /*
     * Rarity dot.
     */

    this.add.circle(
      x + 9,
      y +
        this.slotSize -
        9,

      4,

      rarityColor,

      1
    );

    /*
     * Tooltip.
     */

    background.setInteractive({
      useHandCursor:
        true,
    });

    let tooltip:
      Phaser.GameObjects.Container |
      null =
      null;

    background.on(
      "pointerover",

      () => {
        background.setScale(
          1.05
        );

        tooltip =
          this.createTooltip(
            slot,

            x +
              this.slotSize +
              10,

            y
          );
      }
    );

    background.on(
      "pointerout",

      () => {
        background.setScale(
          1
        );

        if (
          tooltip
        ) {
          tooltip.destroy(
            true
          );

          tooltip =
            null;
        }
      }
    );
  }

  /*
   * =========================================
   * ITEM ICON
   * =========================================
   */

  private createItemIcon(
    slot: StashSlot,
    x: number,
    y: number
  ) {
    const graphics =
      this.add.graphics();

    /*
     * WEAPON
     */

    if (
      slot.item.type ===
      "weapon"
    ) {
      graphics.lineStyle(
        7,
        0xdce5e9,
        1
      );

      graphics.lineBetween(
        x - 14,
        y + 14,
        x + 14,
        y - 14
      );

      graphics.lineStyle(
        5,
        0xd9a84e,
        1
      );

      graphics.lineBetween(
        x - 14,
        y + 5,
        x - 5,
        y + 14
      );

      return;
    }

    /*
     * ARMOR
     */

    if (
      slot.item.type ===
      "armor"
    ) {
      graphics.fillStyle(
        0x8d99a0,
        1
      );

      graphics.beginPath();

      graphics.moveTo(
        x - 14,
        y - 14
      );

      graphics.lineTo(
        x,
        y - 8
      );

      graphics.lineTo(
        x + 14,
        y - 14
      );

      graphics.lineTo(
        x + 19,
        y
      );

      graphics.lineTo(
        x + 12,
        y + 18
      );

      graphics.lineTo(
        x - 12,
        y + 18
      );

      graphics.lineTo(
        x - 19,
        y
      );

      graphics.closePath();

      graphics.fillPath();

      return;
    }

    /*
     * MATERIAL
     */

    graphics.fillStyle(
      0xc9d3d9,
      1
    );

    graphics.beginPath();

    graphics.moveTo(
      x,
      y - 19
    );

    graphics.lineTo(
      x + 15,
      y - 6
    );

    graphics.lineTo(
      x + 10,
      y + 18
    );

    graphics.lineTo(
      x - 10,
      y + 18
    );

    graphics.lineTo(
      x - 15,
      y - 6
    );

    graphics.closePath();

    graphics.fillPath();
  }

  /*
   * =========================================
   * TOOLTIP
   * =========================================
   */

  private createTooltip(
    slot: StashSlot,
    x: number,
    y: number
  ) {
    const container =
      this.add.container(
        x,
        y
      );

    container.setDepth(
      1000
    );

    const rarityColor =
      this.getRarityColor(
        slot.item.rarity
      );

    const background =
      this.add.rectangle(
        100,
        65,
        200,
        130,
        0x050809,
        0.98
      );

    background.setStrokeStyle(
      2,
      rarityColor,
      1
    );

    container.add(
      background
    );

    const nameText =
      this.add.text(
        15,
        14,
        slot.item.name,
        {
          fontFamily:
            "Arial",

          fontSize:
            "16px",

          color:
            this.numberToColor(
              rarityColor
            ),

          fontStyle:
            "bold",
        }
      );

    container.add(
      nameText
    );

    const rarityText =
      this.add.text(
        15,
        42,

        slot.item.rarity.toUpperCase(),

        {
          fontFamily:
            "Arial",

          fontSize:
            "11px",

          color:
            "#89959c",
        }
      );

    container.add(
      rarityText
    );

    const quantityText =
      this.add.text(
        15,
        70,

        `Quantity: ${slot.quantity}`,

        {
          fontFamily:
            "Arial",

          fontSize:
            "13px",

          color:
            "#d0d6da",
        }
      );

    container.add(
      quantityText
    );

    const valueText =
      this.add.text(
        15,
        95,

        `Value: ${slot.item.value * slot.quantity}`,

        {
          fontFamily:
            "Arial",

          fontSize:
            "13px",

          color:
            "#ffd166",
        }
      );

    container.add(
      valueText
    );

    return container;
  }

  /*
   * =========================================
   * ENTER DUNGEON BUTTON
   * =========================================
   */

  private createDungeonButton() {
    const camera =
      this.cameras.main;

    const x =
      Math.max(
        camera.width - 300,
        750
      );

    const y =
      camera.height / 2;

    /*
     * Decorative portal.
     */

    const glow =
      this.add.circle(
        x,
        y - 80,
        100,
        0xd9a84e,
        0.06
      );

    const portal =
      this.add.circle(
        x,
        y - 80,
        60,
        0xd9a84e,
        0.12
      );

    portal.setStrokeStyle(
      5,
      0xd9a84e,
      0.8
    );

    this.add.circle(
      x,
      y - 80,
      20,
      0xf5dfaa,
      0.8
    );

    this.tweens.add({
      targets:
        glow,

      scale: {
        from:
          0.85,

        to:
          1.2,
      },

      alpha: {
        from:
          0.03,

        to:
          0.1,
      },

      duration:
        1500,

      yoyo:
        true,

      repeat:
        -1,
    });

    this.tweens.add({
      targets:
        portal,

      angle:
        360,

      duration:
        6000,

      repeat:
        -1,
    });

    /*
     * Title.
     */

    this.add
      .text(
        x,
        y + 35,

        "THE DUNGEON",

        {
          fontFamily:
            "Arial",

          fontSize:
            "25px",

          color:
            "#d9a84e",

          fontStyle:
            "bold",
        }
      )
      .setOrigin(
        0.5
      );

    this.add
      .text(
        x,
        y + 70,

        "Enter. Loot. Survive. Extract.",

        {
          fontFamily:
            "Arial",

          fontSize:
            "13px",

          color:
            "#7e8c94",
        }
      )
      .setOrigin(
        0.5
      );

    /*
     * Button.
     */

    const button =
      this.add
        .rectangle(
          x,
          y + 135,

          250,
          56,

          0xd9a84e,

          1
        )
        .setInteractive({
          useHandCursor:
            true,
        });

    const buttonText =
      this.add
        .text(
          x,
          y + 135,

          "ENTER DUNGEON",

          {
            fontFamily:
              "Arial",

            fontSize:
              "16px",

            color:
              "#080c0f",

            fontStyle:
              "bold",
          }
        )
        .setOrigin(
          0.5
        );

    button.on(
      "pointerover",

      () => {
        button.setScale(
          1.04
        );

        buttonText.setScale(
          1.04
        );
      }
    );

    button.on(
      "pointerout",

      () => {
        button.setScale(
          1
        );

        buttonText.setScale(
          1
        );
      }
    );

    button.on(
      "pointerdown",

      () => {
        this.scene.start(
          "DungeonScene"
        );
      }
    );
  }

  /*
   * =========================================
   * HELPERS
   * =========================================
   */

  private getRarityColor(
    rarity: string
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

  private numberToColor(
    color: number
  ): string {
    return (
      "#" +
      color
        .toString(
          16
        )
        .padStart(
          6,
          "0"
        )
    );
  }
}
