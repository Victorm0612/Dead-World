"use strict";

import { WIDTH, HEIGHT } from "./src/constants/constants.js";
import Scene from "./src/scenes/Scene.js";

var config = {
  type: Phaser.AUTO,
  width: WIDTH,
  height: HEIGHT,
  physics: {
    default: 'arcade',
    arcade: {
      debug: true, //lineas de colisión
      gravity: { y: 3000 }
    }
  },
  scene: [Scene]
};

new Phaser.Game(config);
