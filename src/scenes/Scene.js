"use strict";

import { WIDTH, HEIGHT } from "../constants/constants.js";

export default class Scene extends Phaser.Scene {
  constructor() {
    super('init');
    this.score = 0;

  }
  preload() {
    this.load.setBaseURL('http://localhost:3000/src/');

    // Background
    this.load.image('background', 'assets/img/background/War2/Bright/War2.png');

    // Main character

    // Zombies
    this.load.spritesheet('zombie_man', 'assets/img/zombies/zombie_man/Walk.png', {
      frameWidth: 96,
      frameHeight: 96,
    });
  
    // sfx
    this.load.audio('soundtrack', 'assets/music/soundtrack.mp3');

    // sfx related to fail
    this.load.audio('fail_death', 'assets/sfx/fail_death.mp3');
    this.load.audio('fail_body', 'assets/sfx/dead_body.mp3');

    // sfx related to shoot
    this.load.audio('gun', 'assets/sfx/shoot.mp3');

    // sfx related to zombies
    this.load.audio('boss', 'assets/sfx/zombie_boss');
    this.load.audio('sfx_zombie', 'assets/sfx/zombie_dead');
  }
  create() {
    // Set background
    this.background = this.add.sprite(WIDTH / 2, 320, 'background');
    this.background.setScale(.7);

    // Set first zombie
    this.zombieMan = this.physics.add.sprite(WIDTH - 100, 500, "zombie_man");
    this.zombieMan
      .setScale(2)
      .setFlipX(true)
      .body.allowGravity = false;
    this.anims.create({
      key: 'zombie_man_anim',
      frames: this.anims.generateFrameNumbers('zombie_man'),
      frameRate: 16,
      repeat: -1
    });
    this.zombieMan.play("zombie_man_anim");

    // music
    this.soundtrack = this.sound.add('soundtrack');
    if (!this.playing && !this.load.isLoading()) {
      this.playing = true;
      this.soundtrack.loop = true;
      this.soundtrack.play();
    }
  }

  update() {
    this.zombieMan.x -= 2;
    if (this.zombieMan.x < 0) {
      this.zombieMan.destroy();
    }
  }
}