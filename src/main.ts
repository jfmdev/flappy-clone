import Phaser from "phaser";
import MainScene from "./scenes/MainScene";

const isPortrait = window.innerHeight > window.innerWidth;
const screenWidth = isPortrait ? 480 : 700;
const screenHeight = isPortrait ? 700 : 480;

const config: Phaser.Types.Core.GameConfig = {
  parent: "app",
  type: Phaser.AUTO,
  width: screenWidth,
  height: screenHeight,
  scale: {
    mode: Phaser.Scale.ScaleModes.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 200 }
    }
  },
  scene: [
    MainScene,
  ]
};

export default new Phaser.Game(config);