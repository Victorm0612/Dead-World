"use strict";

import { WIDTH, HEIGHT, ZOMBIES } from "../constants/constants.js";

export default class Scene extends Phaser.Scene {
  constructor() {
    super('init');
    this.score = 0;
    this.isGameOver = false;
    this.isInitialState = true;
    this.isJumping = false;
    this.playerAttacking = false;
    this.isBeingAttacked = false;
  }
  preload() {
    this.load.setBaseURL('http://localhost:3000/src/');

    // Background
    this.load.image('background', 'assets/img/background/War2/Bright/War2.png');
    this.load.image('floor', 'assets/img/background/War2/Bright/road.png');

    // Bullet
    this.load.image('bullet', 'assets/img/soldiers/Biker/bullet.png');

    //HUD
    this.load.image('health_container', 'assets/img/hud/health_bar_empty.png');
    this.load.image('health_bar', 'assets/img/hud/health_bar_fully.png');

    // Main character

    // Zombies
    this.loadSpriteZombies('wild_zombie');
    this.loadSpriteZombies('zombie_man');
    this.loadSpriteZombies('zombie_woman');

    // Player
    this.load.spritesheet('player', 'assets/img/soldiers/Biker/Biker_run.png', {
      frameWidth: 48,
      frameHeight: 48
    });
    this.load.spritesheet('player_run_attack', 'assets/img/soldiers/Biker/Biker_run_gun_attack.png', {
      frameWidth: 48,
      frameHeight: 48
    });
    this.load.spritesheet('player_attack', 'assets/img/soldiers/Biker/Biker_attack_gun.png', {
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
    this.load.spritesheet('player_death', 'assets/img/soldiers/Biker/Biker_death.png', {
      frameWidth: 48,
      frameHeight: 48
    });
    this.load.spritesheet('player_jump_hurt', 'assets/img/soldiers/Biker/Biker_jump_hurt.png', {
      frameWidth: 48,
      frameHeight: 48
    });    
    this.load.spritesheet('player_run_hurt', 'assets/img/soldiers/Biker/Biker_run_hurt.png', {
      frameWidth: 48,
      frameHeight: 48
    });
    this.load.spritesheet('player_run_attack_hurt', 'assets/img/soldiers/Biker/Biker_run_gun_attack_hurt.png', {
      frameWidth: 48,
      frameHeight: 48
    });
    this.load.spritesheet('player_stop_attack_hurt', 'assets/img/soldiers/Biker/Biker_hurt_attack_gun.png', {
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
    this.load.audio('zombie_boss', 'assets/sfx/zombie_boss.mp3');
    this.load.audio('zombie_sfx', 'assets/sfx/zombie_dead.mp3');
    this.load.audio('zombie_attack', 'assets/sfx/sword_slash.mp3');
  }


  create() {
    // Set controls
    this.cursors = this.input.keyboard.createCursorKeys();
    this.input.keyboard.on('keydown', (event) => {
      if (event.keyCode === 88 && !this.playerAttacking) {
        this.shootGun();
        this.playerAttacking = true;
      }
    });

    this.createSprites();
    this.adjustSpriteProperties();
    this.createAnimations();
    this.playAnimation(this.player, 'player_walk_anim', true);

    // music
    this.initializeSounds();

    // first dialog
    this.text = this.add.text(30, 50, `¡¿Qué ha sucedido?!\n\n¡¿Dónde está mi esposa y mi hijo?!`, { font: '24px PixelGameFont, monospace' });
    this.text.setBackgroundColor('black');
    this.text.setPadding(20, 16);
    this.text.setVisible(false);

    //colliders
    this.physics.add.collider(this.player, this.floor);

    this.time.addEvent({
      duration: 1000,
      repeat: -1,
      callbackScope: this,
      callback: () => {
        if(this.isBeingAttacked && !this.isGameOver) {
          this.attackSound.play();
        }
      },
      delay: 500
    });
    this.generateZombies();
  }

  update() {
    if(this.isInitialState) {
      if (this.player.x >= 250) {
        this.player.x = 250;
        this.stop();
        return this.showInitialDialog();
      }
      return this.run(false);
    }

    if(this.isGameOver) return;
    if(this.healthMask.x <= 685 && !this.isGameOver) {
      return this.gameOver();
    }
    this.setupControls();
    
    this.isBeingAttacked = this.zombies.children.entries.some((zombie) => {
      const playerBounds = this.player.getBounds();
      const zombieBounds = zombie.getBounds();
      return Phaser.Geom.Intersects.RectangleToRectangle(playerBounds, zombieBounds);
    });

    this.zombies.children.entries.forEach((zombie) => {
      const playerBounds = this.player.getBounds();
      const zombieBounds = zombie.getBounds();
      const IsAttacking = Phaser.Geom.Intersects.RectangleToRectangle(playerBounds, zombieBounds);
      if (!IsAttacking && zombie.x >= 0) {
        const [first, second] = zombie.texture.key.split('_');
        this.playAnimation(zombie, `${first}_${second}_walk_anim`);
        zombie.setVelocityX(0);
        this.followPlayer(zombie);
      }
    });
  }

  generateZombies() {
    const zombies = [...ZOMBIES];
    // group size
    const size = Phaser.Math.Between(1, 3);
    // time - how often they will come out?
    const time = Phaser.Math.Between(5000, 10000);
    for (let i = 0; i < size; i++) {
      let newZombie;
      newZombie = this.zombies.create(WIDTH + 70 + (i*300) , 467, `${zombies[i]}_walk`);
      newZombie
        .setScale(2)
        .setFlipX(true);
      newZombie.hit = 0;
      this.playAnimation(newZombie, `${zombies[i]}_walk_anim`, true);
      this.physics.add.collider(newZombie, this.floor);
      this.physics.add.overlap(this.player, newZombie, () => this.attackToHuman(newZombie, `${zombies[i]}_attack`), null, this);  
    }
    this.time.delayedCall(time, this.generateZombies, [], this);
  }

  shootGun() {
    let newBullet;
    newBullet = this.bullets.create(this.player.body.x + 50, this.player.body.y + 80, 'bullet');
    newBullet
      .setScale(5)
      .setFlipX(this.player.flipX)
      .body.allowGravity = false;
    this.physics.add.collider(newBullet, this.floor);
    this.physics.add.overlap(this.zombies, newBullet, (bullet, zombie) => {
      bullet.destroy();
      zombie.hit += 1;

      if (zombie.hit >= 3) {
        this.zombies.killAndHide(zombie);
        zombie.destroy();
      }
    });
    newBullet.setVelocityX(this.player.flipX ? -1500 : 1500);
    this.time.delayedCall(450, () => {
      this.playerAttacking = false;
    }, [], this);
  }

  attackToHuman(sprite, key) {
    if(this.isGameOver) return;
    sprite.setVelocityX(0);
    if (this.playerAttacking && !this.isRunning && !this.isJumping) {
      this.player.setVelocity(0,0);
      this.playAnimation(this.player,'player_stop_attack_hurt_anim');
    }
    else if (!this.isJumping && !this.isRunning) {
      this.playAnimation(this.player,'player_hurt_anim');
    }
    this.playAnimation(sprite, `${key}_anim`);

    // moving the mask
    this.healthMask.x -= 0.5;
  }

  initializeSounds() {
    this.soundtrack = this.sound.add('soundtrack');
    this.attackSound = this.sound.add('zombie_attack');
    if (!this.playing && !this.load.isLoading()) {
      this.playing = true;
      this.soundtrack.loop = true;
      this.soundtrack.play();
    }
  }

  createSprites() {
    // Set background
    this.background = this.add.sprite(WIDTH / 2, 320, 'background');

    // Bullets
    this.bullets = this.physics.add.group();

    // Zombies
    this.zombies = this.physics.add.group();

    // HUD
    this.healthContainer = this.add.sprite(WIDTH - 130, 40, 'health_container');
    this.healthBar = this.add.sprite(this.healthContainer.x, this.healthContainer.y, 'health_bar');
    this.healthMask = this.add.sprite(this.healthBar.x, this.healthBar.y, 'health_bar');

    this.healthMask.visible = false;
    this.healthBar.mask = new Phaser.Display.Masks.BitmapMask(this, this.healthMask);
    
    // Floor
    this.floorImg = this.add.tileSprite(WIDTH / 2,  HEIGHT - 45, 0, 0, 'floor');
    this.floor = this.physics.add.sprite(WIDTH / 2, HEIGHT - 30, 'floor');
    
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
      key: 'player_stop_attack_anim',
      frames: this.anims.generateFrameNumbers('player_attack'),
      frameRate: 16,
      repeat: 0
    });
    this.anims.create({
      key: 'player_run_attack_anim',
      frames: this.anims.generateFrameNumbers('player_run_attack'),
      frameRate: 16,
      repeat: 0
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
    this.anims.create({
      key: 'player_death_anim',
      frames: this.anims.generateFrameNumbers('player_death'),
      frameRate: 16,
      repeat: 0,
      hideOnComplete: true
    });
    this.anims.create({
      key: 'player_run_attack_hurt_anim',
      frames: this.anims.generateFrameNumbers('player_run_attack_hurt'),
      frameRate: 16,
      repeat: -1,
      hideOnComplete: true
    });
    this.anims.create({
      key: 'player_stop_attack_hurt_anim',
      frames: this.anims.generateFrameNumbers('player_stop_attack_hurt'),
      frameRate: 16,
      repeat: -1,
      hideOnComplete: true
    });
    this.anims.create({
      key: 'player_run_hurt_anim',
      frames: this.anims.generateFrameNumbers('player_run_hurt'),
      frameRate: 16,
      repeat: -1,
      hideOnComplete: true
    });
    this.anims.create({
      key: 'player_jump_hurt_anim',
      frames: this.anims.generateFrameNumbers('player_jump_hurt'),
      frameRate: 5,
      repeat: 1,
      hideOnComplete: true
    });

    // Animations Zombie
    ZOMBIES.forEach((zombie) => {
      this.anims.create({
        key: `${zombie}_walk_anim`,
        frames: this.anims.generateFrameNumbers(`${zombie}_walk`),
        frameRate: 16,
        repeat: -1
      });
      this.anims.create({
        key: `${zombie}_stop_anim`,
        frames: this.anims.generateFrameNumbers(`${zombie}_stop`),
        frameRate: 16,
        repeat: -1
      });
      this.anims.create({
        key: `${zombie}_attack_anim`,
        frames: this.anims.generateFrameNumbers(`${zombie}_attack`),
        frameRate: 16,
        repeat: -1,
        hideOnComplete: true
      });
      this.anims.create({
        key: `${zombie}_death_anim`,
        frames: this.anims.generateFrameNumbers(`${zombie}_death`),
        frameRate: 16,
        repeat: 0,
        hideOnComplete: true
      });
    });
  }

  adjustSpriteProperties() {
    // Background
    this.background.setScale(.7);

    // HUD
    this.healthContainer.setScale(.5);
    this.healthBar.setScale(.5);
    this.healthMask.setScale(.5);

    // Floor
    this.floorImg.setScale(.5);
    this.floor
      .setScale(.5)
      .setAlpha(0)
      .body
      .setAllowGravity(false)
      .setImmovable(true);

    // Player
    this.player
      .setScale(3.2)
      .setCollideWorldBounds(true);
  }

  playAnimation(sprite, key, ignoreActualAnimation = false) {
    if(!sprite?.anims) return;
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
    if (this.isJumping && !this.isGameOver) {
      this.floorImg.tilePositionX += this.player.flipX ? -1.5 : 1.5;
      if (this.player.anims.getFrameName() === 3) {
        // jump animation is over
        this.isJumping = false;
        this.playAnimation(this.player, 'player_stop_anim', true);
      }
    }
    else if (this.cursors.up.isDown && !this.isGameOver) {
      this.jump();
    }
    else if (this.cursors.left.isDown && !this.isGameOver) {
      this.run();
    }
    else if (this.cursors.right.isDown && !this.isGameOver) {
      this.run(false);
    }
    else {
      this.stop();
    }
  }

  jump() {
    this.isJumping = true;
    if (this.isBeingAttacked) {
      this.playAnimation(this.player, 'player_jump_hurt_anim');
    } else {
      this.playAnimation(this.player, 'player_jump_anim');
    }
    this.player.setVelocityY(-800);
    if (!this.player.body.velocity.x) { // If x is zero
      this.player.setVelocityX(this.player.flipX ? -100 : 100);
    }
  }

  run(isLeft = true) {
    this.isRunning = true;
    if (this.isBeingAttacked) {
      if (this.playerAttacking) {
        this.playAnimation(this.player, 'player_run_attack_hurt_anim');
      } else {
        this.playAnimation(this.player, 'player_run_hurt_anim');
      }
    } else {
      if (this.playerAttacking) {
        this.playAnimation(this.player, 'player_run_attack_anim');
      } else {
        this.playAnimation(this.player, 'player_walk_anim');
      }
    }
    this.player.setFlipX(isLeft);
    this.player.setVelocityX(isLeft ? -300 : 300);
    this.floorImg.tilePositionX += isLeft ? -4 : 4;
  }

  stop() {
    this.isRunning = false;
    this.player.setVelocity(0,0);
    if(!this.isBeingAttacked) {
      if (this.playerAttacking) {
        this.playAnimation(this.player, 'player_stop_attack_anim');
      } else {
        this.playAnimation(this.player, 'player_stop_anim');
      }
    }
  }
  
  gameOver() {
    this.isGameOver = true;
    this.isBeingAttacked = false;
    this.player.setVelocity(0,0);
    this.zombies.children.entries.forEach((zombie) => {
      const [first, second] = zombie.texture.key.split('_');
      zombie.setVelocity(0,0);
      this.playAnimation(zombie, `${first}_${second}_stop_anim`);
    });
    this.playAnimation(this.player, 'player_death_anim');
    setTimeout(() => {
      this.player.anims.pause(this.player.anims.currentAnim.frames[5]);
    }, 200);

    // Sounds
    const deadBody = this.sound.add('fail_body');
    const failSound = this.sound.add('fail_death');
    failSound.play();
    deadBody.play();
    setTimeout(() => {
      this.isInitialState = true;
      this.isBeingAttacked = false;
      this.isGameOver = false;
      this.score = 0;
      this.isJumping = false;
      this.scene.restart();
    }, 3500);
  }

  followPlayer(sprite) {
    const playerPosition = this.player.body.position.x;
    const spritePosition = sprite.body.position.x;
    sprite.setFlipX(spritePosition > playerPosition) // If spritePosition is grather than playerPosition then is right side
    this.physics.moveToObject(sprite, this.player, 100);
    sprite.setVelocityY(0);
  }  

  loadSpriteZombies(key) {
    this.load.spritesheet(`${key}_walk`, `assets/img/zombies/${key}/Walk.png`, {
      frameWidth: 96,
      frameHeight: 96,
    });
    this.load.spritesheet(`${key}_stop`, `assets/img/zombies/${key}/Idle.png`, {
      frameWidth: 96,
      frameHeight: 96,
    });
    this.load.spritesheet(`${key}_attack`, `assets/img/zombies/${key}/Attack_1.png`, {
      frameWidth: 96,
      frameHeight: 96,
    });
    this.load.spritesheet(`${key}_hurt`, `assets/img/zombies/${key}/Hurt.png`, {
      frameWidth: 96,
      frameHeight: 96,
    });
    this.load.spritesheet(`${key}_death`, `assets/img/zombies/${key}/Dead.png`, {
      frameWidth: 96,
      frameHeight: 96,
    });
  }
}
