import * as Phaser from "phaser";

import StashSystem, {
  StashSlot,
} from "@/game/stash/StashSystem";

export default class BaseScene extends Phaser.Scene {
  private stash!: StashSystem;

  private selectedSlot:
    StashSlot | null =
    null;

  private stashContainer!:
    Phaser.GameObjects.Container;

  private detailContainer!:
    Phaser.GameObjects.Container;

  private loadoutContainer!:
    Phaser.GameObjects.Container;

  private headerStatsText!:
    Phaser.GameObjects.Text;

  private readonly slotSize =
    70;

  private readonly slotGap =
    12;

  private readonly columns =
    6;

  constructor() {
    super(
      "BaseScene"
    );
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
     * STASH
     * =========================================
     */

    this.createStashPanel();

    /*
     * =========================================
     * ITEM DETAIL
     * =========================================
     */

    this.createDetailPanel();

    /*
     * =========================================
     * LOADOUT
     * =========================================
     */

    this.createLoadoutPanel();

    /*
     * =========================================
     * DUNGEON
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

    this.add.rectangle(
      camera.width / 2,
      camera.height / 2,
      camera.width,
      camera.height,
      0x080c0f,
      1
    );

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

    const glow =
      this.add.circle(
        camera.width *
          0.78,

        camera.height *
          0.3,

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

    this.add.rectangle(
      camera.width / 2,
      45,
      camera.width,
      90,
      0x0b1014,
      0.96
    );

    this.add.rectangle(
      camera.width / 2,
      89,
      camera.width,
      2,
      0x344047,
      1
    );

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

    this.headerStatsText =
      this.add
        .text(
          camera.width -
            30,

          27,

          "",

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

    this.updateHeader();
  }

  private updateHeader() {
    const totalItems =
      this.stash.getTotalItemCount();

    const totalValue =
      this.stash.getTotalValue();

    this.headerStatsText.setText(
      `STASH: ${totalItems} ITEMS   •   VALUE: ${totalValue}`
    );
  }

  /*
   * =========================================
   * STASH PANEL
   * =========================================
   */

  private createStashPanel() {
    const panelX =
      40;

    const panelY =
      125;

    const panelWidth =
      600;

    const panelHeight =
      540;

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
      "Click equipment to inspect or equip it.",
      {
        fontFamily:
          "Arial",

        fontSize:
          "13px",

        color:
          "#7e8c94",
      }
    );

    this.add.rectangle(
      panelX +
        panelWidth / 2,

      panelY + 85,

      panelWidth - 50,

      1,

      0x344047,

      1
    );

    this.stashContainer =
      this.add.container(
        0,
        0
      );

    this.renderStash();
  }

  /*
   * =========================================
   * RENDER STASH
   * =========================================
   */

  private renderStash() {
    this.stashContainer.removeAll(
      true
    );

    const slots =
      this.stash.getSlots();

    if (
      slots.length ===
      0
    ) {
      const title =
        this.add
          .text(
            340,
            375,

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

      const subtitle =
        this.add
          .text(
            340,
            410,

            "Enter the dungeon and extract loot safely.",

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

      this.stashContainer.add([
        title,
        subtitle,
      ]);

      return;
    }

    slots.forEach(
      (
        slot,
        index
      ) => {
        this.createStashSlot(
          slot,
          index
        );
      }
    );
  }

  /*
   * =========================================
   * STASH SLOT
   * =========================================
   */

  private createStashSlot(
    slot: StashSlot,
    index: number
  ) {
    const startX =
      65;

    const startY =
      235;

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

    const centerX =
      x +
      this.slotSize /
        2;

    const centerY =
      y +
      this.slotSize /
        2;

    const rarityColor =
      this.getRarityColor(
        slot.item.rarity
      );

    const isEquipped =
      this.stash.isEquipped(
        slot.item.id
      );

    /*
     * SLOT BACKGROUND
     */

    const background =
      this.add.rectangle(
        centerX,
        centerY,

        this.slotSize,
        this.slotSize,

        isEquipped
          ? 0x243127
          : 0x11181c,

        1
      );

    background.setStrokeStyle(
      isEquipped
        ? 4
        : 3,

      isEquipped
        ? 0x65f5df
        : rarityColor,

      1
    );

    background.setInteractive({
      useHandCursor:
        true,
    });

    /*
     * INNER GLOW
     */

    const glow =
      this.add.rectangle(
        centerX,
        centerY,

        this.slotSize - 8,
        this.slotSize - 8,

        rarityColor,

        0.08
      );

    /*
     * ITEM ICON
     */

    const icon =
      this.createItemIcon(
        slot,
        centerX,
        centerY
      );

    /*
     * QUANTITY
     */

    const objects:
      Phaser.GameObjects.GameObject[] = [
      background,
      glow,
      ...icon,
    ];

    if (
      slot.quantity >
      1
    ) {
      const quantityCircle =
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

      const quantityText =
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

      objects.push(
        quantityCircle,
        quantityText
      );
    }

    /*
     * EQUIPPED BADGE
     */

    if (
      isEquipped
    ) {
      const equippedText =
        this.add
          .text(
            centerX,
            y - 7,

            "EQUIPPED",

            {
              fontFamily:
                "Arial",

              fontSize:
                "9px",

              color:
                "#65f5df",

              fontStyle:
                "bold",

              backgroundColor:
                "#0b1515",

              padding: {
                x: 5,
                y: 2,
              },
            }
          )
          .setOrigin(
            0.5
          );

      objects.push(
        equippedText
      );
    }

    /*
     * RARITY DOT
     */

    const rarityDot =
      this.add.circle(
        x + 9,

        y +
          this.slotSize -
          9,

        4,

        rarityColor,

        1
      );

    objects.push(
      rarityDot
    );

    this.stashContainer.add(
      objects
    );

    /*
     * CLICK
     */

    background.on(
      "pointerdown",
      () => {
        this.selectedSlot = {
          item: {
            ...slot.item,
          },

          quantity:
            slot.quantity,
        };

        this.renderDetailPanel();
      }
    );

    background.on(
      "pointerover",
      () => {
        background.setScale(
          1.05
        );
      }
    );

    background.on(
      "pointerout",
      () => {
        background.setScale(
          1
        );
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
  ): Phaser.GameObjects.GameObject[] {
    const graphics =
      this.add.graphics();

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

      return [
        graphics,
      ];
    }

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

      return [
        graphics,
      ];
    }

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

    return [
      graphics,
    ];
  }

  /*
   * =========================================
   * DETAIL PANEL
   * =========================================
   */

  private createDetailPanel() {
    this.detailContainer =
      this.add.container(
        0,
        0
      );

    this.renderDetailPanel();
  }

  private renderDetailPanel() {
    this.detailContainer.removeAll(
      true
    );

    const x =
      690;

    const y =
      125;

    const width =
      360;

    const height =
      300;

    const background =
      this.add
        .rectangle(
          x +
            width / 2,

          y +
            height / 2,

          width,

          height,

          0x0d1317,

          0.96
        )
        .setStrokeStyle(
          2,
          0x344047,
          1
        );

    this.detailContainer.add(
      background
    );

    const title =
      this.add.text(
        x + 25,
        y + 22,

        "ITEM DETAILS",

        {
          fontFamily:
            "Arial",

          fontSize:
            "20px",

          color:
            "#d9a84e",

          fontStyle:
            "bold",
        }
      );

    this.detailContainer.add(
      title
    );

    if (
      !this.selectedSlot
    ) {
      const emptyText =
        this.add
          .text(
            x +
              width / 2,

            y + 155,

            "Select an item\nfrom your stash.",

            {
              fontFamily:
                "Arial",

              fontSize:
                "16px",

              color:
                "#56636a",

              align:
                "center",

              lineSpacing:
                8,
            }
          )
          .setOrigin(
            0.5
          );

      this.detailContainer.add(
        emptyText
      );

      return;
    }

    const slot =
      this.selectedSlot;

    const rarityColor =
      this.getRarityColor(
        slot.item.rarity
      );

    const itemName =
      this.add.text(
        x + 25,
        y + 70,

        slot.item.name,

        {
          fontFamily:
            "Arial",

          fontSize:
            "23px",

          color:
            this.numberToColor(
              rarityColor
            ),

          fontStyle:
            "bold",
        }
      );

    this.detailContainer.add(
      itemName
    );

    const info =
      this.add.text(
        x + 25,
        y + 110,

        [
          `Rarity: ${slot.item.rarity.toUpperCase()}`,
          `Type: ${slot.item.type.toUpperCase()}`,
          `Quantity: ${slot.quantity}`,
          `Value: ${slot.item.value}`,
        ].join(
          "\n"
        ),

        {
          fontFamily:
            "Arial",

          fontSize:
            "14px",

          color:
            "#b7c0c7",

          lineSpacing:
            8,
        }
      );

    this.detailContainer.add(
      info
    );

    /*
     * MATERIAL
     */

    if (
      slot.item.type ===
      "material"
    ) {
      const materialText =
        this.add.text(
          x + 25,
          y + 245,

          "CRAFTING MATERIAL",

          {
            fontFamily:
              "Arial",

            fontSize:
              "13px",

            color:
              "#89959c",

            fontStyle:
              "bold",
          }
        );

      this.detailContainer.add(
        materialText
      );

      return;
    }

    /*
     * EQUIP BUTTON
     */

    const isEquipped =
      this.stash.isEquipped(
        slot.item.id
      );

    const button =
      this.add
        .rectangle(
          x +
            width / 2,

          y + 255,

          220,

          48,

          isEquipped
            ? 0x25363a
            : 0xd9a84e,

          1
        )
        .setInteractive({
          useHandCursor:
            true,
        });

    const buttonText =
      this.add
        .text(
          x +
            width / 2,

          y + 255,

          isEquipped
            ? "EQUIPPED"
            : "EQUIP ITEM",

          {
            fontFamily:
              "Arial",

            fontSize:
              "15px",

            color:
              isEquipped
                ? "#65f5df"
                : "#080c0f",

            fontStyle:
              "bold",
          }
        )
        .setOrigin(
          0.5
        );

    this.detailContainer.add([
      button,
      buttonText,
    ]);

    if (
      !isEquipped
    ) {
      button.on(
        "pointerdown",
        () => {
          const success =
            this.stash.equipItem(
              slot.item.id
            );

          if (
            !success
          ) {
            return;
          }

          this.renderStash();

          this.renderDetailPanel();

          this.renderLoadoutPanel();
        }
      );

      button.on(
        "pointerover",
        () => {
          button.setScale(
            1.03
          );

          buttonText.setScale(
            1.03
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
    }
  }

  /*
   * =========================================
   * LOADOUT PANEL
   * =========================================
   */

  private createLoadoutPanel() {
    this.loadoutContainer =
      this.add.container(
        0,
        0
      );

    this.renderLoadoutPanel();
  }

  private renderLoadoutPanel() {
    this.loadoutContainer.removeAll(
      true
    );

    const x =
      690;

    const y =
      455;

    const width =
      360;

    const height =
      210;

    const background =
      this.add
        .rectangle(
          x +
            width / 2,

          y +
            height / 2,

          width,

          height,

          0x0d1317,

          0.96
        )
        .setStrokeStyle(
          2,
          0x344047,
          1
        );

    this.loadoutContainer.add(
      background
    );

    const title =
      this.add.text(
        x + 25,
        y + 20,

        "CURRENT LOADOUT",

        {
          fontFamily:
            "Arial",

          fontSize:
            "19px",

          color:
            "#d9a84e",

          fontStyle:
            "bold",
        }
      );

    this.loadoutContainer.add(
      title
    );

    const loadout =
      this.stash.getLoadout();

    this.createLoadoutSlot(
      "WEAPON",

      loadout.weapon,

      x + 25,

      y + 65
    );

    this.createLoadoutSlot(
      "ARMOR",

      loadout.armor,

      x + 185,

      y + 65
    );
  }

  /*
   * =========================================
   * LOADOUT SLOT
   * =========================================
   */

  private createLoadoutSlot(
    label: string,

    item:
      StashSlot["item"] |
      null,

    x: number,
    y: number
  ) {
    const background =
      this.add
        .rectangle(
          x + 70,

          y + 55,

          140,

          110,

          0x11181c,

          1
        )
        .setStrokeStyle(
          2,

          item
            ? this.getRarityColor(
                item.rarity
              )
            : 0x344047,

          1
        );

    this.loadoutContainer.add(
      background
    );

    const labelText =
      this.add
        .text(
          x + 70,

          y + 15,

          label,

          {
            fontFamily:
              "Arial",

            fontSize:
              "11px",

            color:
              "#89959c",

            fontStyle:
              "bold",
          }
        )
        .setOrigin(
          0.5
        );

    this.loadoutContainer.add(
      labelText
    );

    if (
      !item
    ) {
      const empty =
        this.add
          .text(
            x + 70,

            y + 65,

            "EMPTY",

            {
              fontFamily:
                "Arial",

              fontSize:
                "13px",

              color:
                "#56636a",

              fontStyle:
                "bold",
            }
          )
          .setOrigin(
            0.5
          );

      this.loadoutContainer.add(
        empty
      );

      return;
    }

    const itemName =
      this.add
        .text(
          x + 70,

          y + 60,

          item.name,

          {
            fontFamily:
              "Arial",

            fontSize:
              "13px",

            color:
              this.numberToColor(
                this.getRarityColor(
                  item.rarity
                )
              ),

            fontStyle:
              "bold",

            align:
              "center",

            wordWrap: {
              width:
                120,
            },
          }
        )
        .setOrigin(
          0.5
        );

    this.loadoutContainer.add(
      itemName
    );

    const removeButton =
      this.add
        .text(
          x + 70,

          y + 92,

          "UNEQUIP",

          {
            fontFamily:
              "Arial",

            fontSize:
              "10px",

            color:
              "#ff7888",

            fontStyle:
              "bold",
          }
        )
        .setOrigin(
          0.5
        )
        .setInteractive({
          useHandCursor:
            true,
        });

    this.loadoutContainer.add(
      removeButton
    );

    removeButton.on(
      "pointerdown",
      () => {
        if (
          label ===
          "WEAPON"
        ) {
          this.stash.unequipWeapon();
        } else {
          this.stash.unequipArmor();
        }

        this.renderStash();

        this.renderDetailPanel();

        this.renderLoadoutPanel();
      }
    );
  }

  /*
   * =========================================
   * DUNGEON BUTTON
   * =========================================
   */

  private createDungeonButton() {
    const camera =
      this.cameras.main;

    const x =
      1315;

    const y =
      camera.height /
      2;

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
