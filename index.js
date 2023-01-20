"use strict";

import { WIDTH, HEIGHT } from "./src/constants/constants.js";
import Scene from "./src/scenes/Scene.js";
import SceneGameOver from "./src/scenes/SceneGameOver.js";

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
  scene: [Scene, SceneGameOver]
};

new Phaser.Game(config);
