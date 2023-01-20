"use strict";

import { HEIGHT, WIDTH } from "../constants/constants.js";

export default class SceneGameOver extends Phaser.Scene {
  constructor() {
    super('gameover');
  }
  preload() {
    this.load.setBaseURL('http://localhost:3000/src/');

    this.load.image('background_game_over', 'assets/img/background/GameOver/game_over.png');
    this.load.spritesheet('button', 'assets/img/background/GameOver/button_sprite.png', {
      frameWidth: 193,
      frameHeight: 71
    });
  }

  create() {
    this.gameOverBackground = this.add.image(WIDTH / 2, 220, 'background_game_over');
    this.gameOverBackground.setScale(0.7);
    this.button = this.add.sprite(WIDTH / 2, HEIGHT - 120, 'button');

    this.anims.create({
      key: 'button_anim',
      frames: this.anims.generateFrameNumbers('button'),
      frameRate: 16,
      repeat: -1,
    });
    this.button.play('button_anim');
    this.button.anims.pause(this.button.anims.currentAnim.frames[0]);
    this.button
      .setInteractive({ useHandCursor: true })
      .on('pointerdown', () => this.resetGame())
      .on('pointerover', () => this.button.anims.pause(this.button.anims.currentAnim.frames[1]))
      .on('pointerout', () => this.button.anims.pause(this.button.anims.currentAnim.frames[0]));

    const bestScore = Number(localStorage.getItem('best_score')) || 0;
    const actualScore = Number(localStorage.getItem('actual_score')) || 0;
    this.bestScoreText = this.add.text(WIDTH - 580, 380, `Best Score: ${bestScore} \n\nActual score: ${actualScore}`, { font: '24px PixelGameFont, monospace' });
  }

  resetGame() {
    this.scene.start('init');
  }
}
