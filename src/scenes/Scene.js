"use strict";

import { WIDTH, HEIGHT } from "../constants/constants.js";

export default class Scene extends Phaser.Scene {
  constructor() {
    super('init');
    this.score = 0;
    this.isInitialState = true;
    this.isJumping = false;
    this.isBeingAttacked = false;

  }
  preload() {
    this.load.setBaseURL('http://localhost:3000/src/');

    // Background
    this.load.image('background', 'assets/img/background/War2/Bright/War2.png');
    this.load.image('floor', 'assets/img/background/War2/Bright/road.png');

    // Main character

    // Zombies
    this.load.spritesheet('zombie_man', 'assets/img/zombies/zombie_man/Walk.png', {
      frameWidth: 96,
      frameHeight: 96,
    });
    this.load.spritesheet('zombie_man_attack', 'assets/img/zombies/zombie_man/Attack_1.png', {
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
    this.load.spritesheet('player_hurt', 'assets/img/soldiers/Biker/Biker_hurt.png', {
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

    this.createSprites();
    this.adjustSpriteProperties();
    this.createAnimations();

    this.playAnimation(this.zombieMan, 'zombie_man_anim', true);
    this.playAnimation(this.player, 'player_walk_anim', true);

    // music
    this.soundtrack = this.sound.add('soundtrack');
    if (!this.playing && !this.load.isLoading()) {
      this.playing = true;
      this.soundtrack.loop = true;
      //this.soundtrack.play();
    }

    // first dialog
    this.text = this.add.text(30, 50, `¡¿Qué ha sucedido?!\n\n¡¿Dónde está mi esposa y mi hijo?!`, { font: '24px PixelGameFont, monospace' });
    this.text.setBackgroundColor('black');
    this.text.setPadding(20, 16);
    this.text.setVisible(false);

    //colliders
    this.physics.add.collider(this.player, this.floor);
    this.physics.add.collider(this.zombieMan, this.floor);
    this.physics.add.collider(this.player,this.zombieMan);
    //this.attack = this.physics.add.collider(this.zombieMan,this.player, ()=>this.attackToHuman());
    this.physics.add.overlap(this.zombieMan,this.player,()=>this.attackToHuman());
  }

  update() {
    if(this.isInitialState) {
      if (this.player.x >= 250) {
        this.player.x = 250;
        this.stop();
        this.showInitialDialog();
      } else {
        this.run(false);
      }
    } else {
      const playerBounds = this.player.getBounds();
      const zombieBounds = this.zombieMan.getBounds();
      this.isBeingAttacked = Phaser.Geom.Intersects.RectangleToRectangle(playerBounds, zombieBounds);
      this.setupControls();
      this.zombieMan.x -= 2;
      if (this.zombieMan.x < 0) {
        this.zombieMan.destroy();
      }
    }
  }

  attackToHuman(){    
    this.zombieMan.setVelocity(0,0);
    this.playAnimation(this.player,'player_hurt_anim');
    this.playAnimation(this.zombieMan,'zombie_man_attack_anim');    
  }


  createSprites() {
    // Set background
    this.background = this.add.sprite(WIDTH / 2, 320, 'background');
    
    // Floor
    this.floorImg = this.add.tileSprite(WIDTH / 2,  HEIGHT - 45, 0, 0, 'floor');
    this.floor = this.physics.add.sprite(WIDTH / 2, HEIGHT - 30, 'floor');
    
    // Zombie
    this.zombieMan = this.physics.add.sprite(WIDTH + 70 , 470, "zombie_man");
    
    // Player
    this.player = this.physics.add.sprite(-100, 490, 'player');
  }

  createAnimations() {
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
      frameRate: 10,
      repeat: -1
    });    

    this.anims.create({
      key: 'player_jump_anim',
      frames: this.anims.generateFrameNumbers('player_jump'),
      frameRate: 5,
      repeat: 1,
      hideOnComplete: true
    });
    this.anims.create({
      key: 'player_hurt_anim',
      frames: this.anims.generateFrameNumbers('player_hurt'),
      frameRate: 16,
      repeat: -1,
      hideOnComplete: true
    });

    // Animations Zombie
    this.anims.create({
      key: 'zombie_man_anim',
      frames: this.anims.generateFrameNumbers('zombie_man'),
      frameRate: 16,
      repeat: -1
    });
    this.anims.create({
      key: 'zombie_man_attack_anim',
      frames: this.anims.generateFrameNumbers('zombie_man_attack'),
      frameRate: 16,
      repeat: -1,
      hideOnComplete: true
    });    
  }

  adjustSpriteProperties() {
    // Background
    this.background.setScale(.7);

    // Floor
    this.floorImg.setScale(.5);
    this.floor
      .setScale(.5)
      .setAlpha(0)
      .body
      .setAllowGravity(false)
      .setImmovable(true);

    // Zombie
    this.zombieMan
      .setScale(2)
      .setFlipX(true);


    // Player
    this.player
      .setScale(3.2)
      .setCollideWorldBounds(true);
  }

  playAnimation(sprite, key, ignoreActualAnimation = false) {
    if(!sprite.anims) return;
    if (ignoreActualAnimation) {
      sprite.play(key);
    } else {
      if (sprite.anims.getName() !== key) {
        sprite.play(key);
      }
    }
  }

  showInitialDialog() {
    this.text.setVisible(true);
    setTimeout(() => {
      this.text.setText('¡Debo encontrarlos, cueste lo que cueste!');
    }, 200);
    setTimeout(() => {
      this.isInitialState = false;
      this.text.setVisible(false);
    }, 200);
  }

  setupControls() {
    if (this.isJumping) {
      this.floorImg.tilePositionX += this.player.flipX ? -1.5 : 1.5;
      if (this.player.anims.getFrameName() === 3) {
        // jump animation is over
        this.isJumping = false;
        this.playAnimation(this.player, 'player_stop_anim', true);
      }
    }
    else if (this.cursors.up.isDown) {
      this.jump();
    }
    else if (this.cursors.left.isDown) {
      this.run();
    }
    else if (this.cursors.right.isDown) {
      this.run(false);
    }
    else {
      this.stop();
    }
  }

  jump() {
    this.isJumping = true;
    this.playAnimation(this.player, 'player_jump_anim');
    this.player.setVelocityY(-800);
    if (!this.player.body.velocity.x) { // If x is zero
      this.player.setVelocityX(this.player.flipX ? -100 : 100);
    }
  }

  run(isLeft = true) {
    this.playAnimation(this.player, 'player_walk_anim');
    this.player.setFlipX(isLeft);
    this.player.setVelocityX(isLeft ? -300 : 300);
    this.floorImg.tilePositionX += isLeft ? -4 : 4;
  }

  stop() {
    this.player.setVelocity(0,0);
    if(!this.isBeingAttacked){
      this.playAnimation(this.player, 'player_stop_anim');
    }
  }
}