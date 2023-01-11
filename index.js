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
      gravity: { y: 500 }
    }
  },
  scene: [Scene]
};

new Phaser.Game(config);
