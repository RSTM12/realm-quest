import * as Phaser from "phaser";

type ExtractionConfig = {
  scene: Phaser.Scene;

  player:
    Phaser.Physics.Arcade.Sprite;

  x: number;

  y: number;

  radius?: number;

  extractionTime?: number;

  onExtract:
    () => void;
};

export default class ExtractionSystem {
  private readonly scene:
    Phaser.Scene;

  private readonly player:
    Phaser.Physics.Arcade.Sprite;

  private readonly x:
    number;

  private readonly y:
    number;

  private readonly radius:
    number;

  private readonly extractionTime:
    number;

  private readonly onExtract:
    () => void;

  private extractKey!:
    Phaser.Input.Keyboard.Key;

  private portal!:
    Phaser.GameObjects.Arc;

  private portalGlow!:
    Phaser.GameObjects.Arc;

  private promptText!:
    Phaser.GameObjects.Text;

  private progressBackground!:
    Phaser.GameObjects.Rectangle;

  private progressBar!:
    Phaser.GameObjects.Rectangle;

  private extracting =
    false;

  private extracted =
    false;

  private extractionProgress =
    0;

  constructor(
    config:
      ExtractionConfig
  ) {
    this.scene =
      config.scene;

    this.player =
      config.player;

    this.x =
      config.x;

    this.y =
      config.y;

    this.radius =
      config.radius ??
      100;

    this.extractionTime =
      config.extractionTime ??
      2500;

    this.onExtract =
      config.onExtract;

    this.createPortal();

    this.createControls();

    this.createUI();
  }

  /*
   * =========================================
   * CREATE PORTAL
   * =========================================
   */

  private createPortal() {
    /*
     * Glow luar.
     */

    this.portalGlow =
      this.scene.add.circle(
        this.x,
        this.y,
        65,
        0x35d0ba,
        0.12
      );

    this.portalGlow.setDepth(
      4
    );

    /*
     * Portal utama.
     */

    this.portal =
      this.scene.add.circle(
        this.x,
        this.y,
        38,
        0x35d0ba,
        0.18
      );

    this.portal.setStrokeStyle(
      5,
      0x65f5df,
      0.9
    );

    this.portal.setDepth(
      5
    );

    /*
     * Lingkaran tengah.
     */

    const core =
      this.scene.add.circle(
        this.x,
        this.y,
        12,
        0xc5fff7,
        0.9
      );

    core.setDepth(
      6
    );

    /*
     * Animasi portal.
     */

    this.scene.tweens.add({
      targets:
        this.portalGlow,

      scale: {
        from:
          0.85,

        to:
          1.25,
      },

      alpha: {
        from:
          0.05,

        to:
          0.2,
      },

      duration:
        1200,

      yoyo:
        true,

      repeat:
        -1,

      ease:
        "Sine.InOut",
    });

    this.scene.tweens.add({
      targets:
        this.portal,

      angle:
        360,

      duration:
        5000,

      repeat:
        -1,
    });

    this.scene.tweens.add({
      targets:
        core,

      scale: {
        from:
          0.7,

        to:
          1.2,
      },

      alpha: {
        from:
          0.5,

        to:
          1,
      },

      duration:
        700,

      yoyo:
        true,

      repeat:
        -1,
    });

    /*
     * Label dunia.
     */

    this.scene.add
      .text(
        this.x,
        this.y -
          80,

        "EXTRACTION",

        {
          fontFamily:
            "Arial",

          fontSize:
            "15px",

          color:
            "#65f5df",

          fontStyle:
            "bold",

          stroke:
            "#000000",

          strokeThickness:
            4,
        }
      )
      .setOrigin(
        0.5
      )
      .setDepth(
        20
      );
  }

  /*
   * =========================================
   * CONTROLS
   * =========================================
   */

  private createControls() {
    const keyboard =
      this.scene.input.keyboard;

    if (
      !keyboard
    ) {
      return;
    }

    this.extractKey =
      keyboard.addKey(
        Phaser.Input.Keyboard
          .KeyCodes.E
      );
  }

  /*
   * =========================================
   * UI
   * =========================================
   */

  private createUI() {
    const camera =
      this.scene.cameras.main;

    /*
     * Prompt.
     */

    this.promptText =
      this.scene.add
        .text(
          camera.width /
            2,

          camera.height -
            110,

          "",

          {
            fontFamily:
              "Arial",

            fontSize:
              "18px",

            color:
              "#ffffff",

            fontStyle:
              "bold",

            stroke:
              "#000000",

            strokeThickness:
              5,
          }
        )
        .setOrigin(
          0.5
        )
        .setScrollFactor(
          0
        )
        .setDepth(
          1000
        );

    /*
     * Progress background.
     */

    this.progressBackground =
      this.scene.add
        .rectangle(
          camera.width /
            2,

          camera.height -
            75,

          220,

          14,

          0x000000,

          0.8
        )
        .setScrollFactor(
          0
        )
        .setDepth(
          1000
        )
        .setVisible(
          false
        );

    this.progressBackground.setStrokeStyle(
      2,
      0x65f5df,
      1
    );

    /*
     * Progress bar.
     */

    this.progressBar =
      this.scene.add
        .rectangle(
          camera.width /
            2 -
            108,

          camera.height -
            75,

          0,

          10,

          0x65f5df,

          1
        )
        .setOrigin(
          0,
          0.5
        )
        .setScrollFactor(
          0
        )
        .setDepth(
          1001
        )
        .setVisible(
          false
        );
  }

  /*
   * =========================================
   * UPDATE
   * =========================================
   */

  public update(
    delta: number
  ) {
    if (
      this.extracted
    ) {
      return;
    }

    const distance =
      Phaser.Math.Distance.Between(
        this.player.x,
        this.player.y,
        this.x,
        this.y
      );

    const insideZone =
      distance <=
      this.radius;

    /*
     * Player di luar zona.
     */

    if (
      !insideZone
    ) {
      this.cancelExtraction();

      this.promptText.setText(
        ""
      );

      return;
    }

    /*
     * Player ada di zona.
     */

    if (
      !this.extractKey
    ) {
      return;
    }

    /*
     * Belum tekan E.
     */

    if (
      !this.extractKey.isDown
    ) {
      this.cancelExtraction();

      this.promptText.setText(
        "Hold E to Extract"
      );

      return;
    }

    /*
     * Mulai extraction.
     */

    this.extracting =
      true;

    this.promptText.setText(
      "EXTRACTING..."
    );

    this.progressBackground.setVisible(
      true
    );

    this.progressBar.setVisible(
      true
    );

    /*
     * Tambah progress.
     */

    this.extractionProgress +=
      delta;

    const progress =
      Phaser.Math.Clamp(
        this.extractionProgress /
          this.extractionTime,

        0,

        1
      );

    this.progressBar.width =
      216 *
      progress;

    /*
     * Extraction selesai.
     */

    if (
      progress >=
      1
    ) {
      this.completeExtraction();
    }
  }

  /*
   * =========================================
   * CANCEL EXTRACTION
   * =========================================
   */

  private cancelExtraction() {
    if (
      !this.extracting &&
      this.extractionProgress ===
        0
    ) {
      return;
    }

    this.extracting =
      false;

    this.extractionProgress =
      0;

    this.progressBar.width =
      0;

    this.progressBackground.setVisible(
      false
    );

    this.progressBar.setVisible(
      false
    );
  }

  /*
   * =========================================
   * COMPLETE EXTRACTION
   * =========================================
   */

  private completeExtraction() {
    if (
      this.extracted
    ) {
      return;
    }

    this.extracted =
      true;

    this.extracting =
      false;

    this.extractionProgress =
      this.extractionTime;

    this.progressBar.width =
      216;

    this.promptText.setText(
      "EXTRACTION SUCCESS"
    );

    /*
     * Callback ke DungeonScene.
     */

    this.onExtract();
  }
}
