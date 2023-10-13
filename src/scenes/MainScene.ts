
export default class MainScene extends Phaser.Scene {
  constructor() {
    super('Initializing...');
  }

  preload() {
    // Load images.
    this.load.image('fence', 'assets/images/fence.png');
    this.load.image('space', 'assets/images/space.png');
    this.load.image('tower', 'assets/images/tower.png');

    // Load spritesheets.
    // TODO: Rename to clone.
    this.load.spritesheet('birdie', 'assets/spritesheet/clone.png', { frameWidth: 24, frameHeight: 24 });

    // Load audio.
    this.load.audio('flap', 'assets/audio/flap.wav');
    this.load.audio('hurt', 'assets/audio/hurt.wav');
    this.load.audio('score', 'assets/audio/score.wav');
  }

  create() {
    this.add.tileSprite(0, 0, this.game.canvas.width, this.game.canvas.height, 'space').setOrigin(0, 0);

    const logo = this.physics.add.sprite(400, 100, 'birdie');
    logo.setVelocity(100, 200);
    logo.setBounce(1, 1);
    logo.setCollideWorldBounds(true);

    logo.anims.create({ key: 'fly', frames: this.anims.generateFrameNumbers('birdie', { start: 0, end: 3 }), frameRate: 10, repeat: -1 });
    logo.anims.play('fly', true);
    logo.setScale(2);
  }
}