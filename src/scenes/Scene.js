"use strict";

import { WIDTH, HEIGHT } from "../constants/constants.js";

export default class Scene extends Phaser.Scene {
  constructor() {
    super('init');
    this.score = 0;
    this.isInitialState = true;
    this.isJumping = false;

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

    // Player
    this.load.spritesheet('player', 'assets/img/soldiers/Biker/Biker_run.png', {
      frameWidth: 48,
      frameHeight: 48
    });
    this.load.spritesheet('player_stop', 'assets/img/soldiers/Biker/Biker_idle.png', {
      frameWidth: 48,
      frameHeight: 48
    });
    this.load.spritesheet('player_jump', 'assets/img/soldiers/Biker/Biker_jump.png', {
      frameWidth: 48,
      frameHeight: 48
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
    // Set controls
    this.cursors = this.input.keyboard.createCursorKeys();

    // Set background
    this.background = this.add.sprite(WIDTH / 2, 320, 'background');
    this.background.setScale(.7);

    // Zombie
    this.zombieMan = this.physics.add.sprite(WIDTH + 100, 500, "zombie_man");
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


    // Player
    this.player = this.physics.add.sprite(-100, HEIGHT, 'player');
    this.player
      .setScale(3.2)
      .setCollideWorldBounds(true);

    // animations - Player
    this.anims.create({
      key: 'player_walk_anim',
      frames: this.anims.generateFrameNumbers('player'),
      frameRate: 16,
      repeat: -1
    });

    this.anims.create({
      key: 'player_stop_anim',
      frames: this.anims.generateFrameNumbers('player_stop'),
      frameRate: 16,
      repeat: -1
    });    

    this.anims.create({
      key: 'player_jump_anim',
      frames: this.anims.generateFrameNumbers('player_jump'),
      frameRate: 5,
      repeat: 1,
      hideOnComplete: true
    });

    this.player.play('player_walk_anim');

    // music
    this.soundtrack = this.sound.add('soundtrack');
    if (!this.playing && !this.load.isLoading()) {
      this.playing = true;
      this.soundtrack.loop = true;
      this.soundtrack.play();
    }

    // first dialog
    this.text = this.add.text(30, 50, `¡¿Qué ha sucedido?!\n\n¡¿Dónde está mi esposa y mi hijo?!`, { font: '24px PixelGameFont, monospace' });
    this.text.setBackgroundColor('black');
    this.text.setPadding(20, 16);
    this.text.setVisible(false);    
  }

  update() {
    if(this.isInitialState) {
      if (this.player.x >= 100) {
        this.player.x = 100;
        this.stop();
        this.showInitialDialog();
      } else {
        this.player.x += 2;
      }
    } else {
      this.setupControls();
      this.zombieMan.x -= 2;
      if (this.zombieMan.x < 0) {
        this.zombieMan.destroy();
      }
    }
  }

  showInitialDialog() {
    this.text.setVisible(true);
    setTimeout(() => {
      this.text.setText('¡Debo encontrarlos, cueste lo que cueste!');
    }, 2000);
    setTimeout(() => {
      this.isInitialState = false;
      this.text.setVisible(false);
    }, 3500);
  }

  setupControls() {
    if (this.cursors.left.isDown) {
      this.run();
    }
    else if (this.cursors.right.isDown) {
      this.run(false);
    }
    else if (this.isJumping) {
      if (this.player.anims.getFrameName() === 3) {
        // jump animation is over
        this.isJumping = false;
        this.player.play('player_stop_anim');
      }
    }
    else if (this.cursors.up.isDown) {
      this.jump();
    }
    else {
      this.stop();
    }
  }

  jump() {
    this.isJumping = true;
    if (this.player.anims.getName() !== 'player_jump_anim') {
      this.player.play('player_jump_anim');
    }
    this.player.setVelocityY(-800);
  }

  run(isLeft = true) {
    if (this.player.anims.getName() !== 'player_walk_anim') {
      this.player.play('player_walk_anim');
    }
    this.player.setFlipX(isLeft);
    this.player.setVelocityX(isLeft ? -300 : 300);
  }

  stop() {
    this.player.setVelocity(0,0);
    if (this.player.anims.getName() !== 'player_stop_anim') {
      this.player.play('player_stop_anim');
    }
  }
}