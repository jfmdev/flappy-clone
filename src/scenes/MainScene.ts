const SPEED = 0.12;

export default class MainScene extends Phaser.Scene {
  private gameOver = false;
  private tileFloor: Phaser.GameObjects.TileSprite | null = null;
  private tileSky: Phaser.GameObjects.TileSprite | null = null;

  constructor() {
    super('Initializing...');
  }

  preload() {
    // Load images.
    this.load.image('fence', 'assets/images/fence.png');
    this.load.image('stars', 'assets/images/stars.png');
    this.load.image('tower', 'assets/images/tower.png');

    // Load spritesheets.
    this.load.spritesheet('clone', 'assets/spritesheet/clone.png', { frameWidth: 24, frameHeight: 24 });

    // Load audio.
    this.load.audio('flap', 'assets/audio/flap.wav');
    this.load.audio('hurt', 'assets/audio/hurt.wav');
    this.load.audio('score', 'assets/audio/score.wav');
  }

  create() {
    // Add sky and floor.
    this.tileFloor = this.add.tileSprite(0, this.game.canvas.height - 32, this.game.canvas.width, 32, 'fence').setOrigin(0, 0);
    this.tileSky = this.add.tileSprite(0, 0, this.game.canvas.width, this.game.canvas.height, 'stars').setOrigin(0, 0);

    // Add clone.
    const logo = this.physics.add.sprite(400, 100, 'clone');
    logo.setVelocity(100, 200);
    logo.setBounce(1, 1);
    logo.setCollideWorldBounds(true);

    logo.anims.create({ key: 'fly', frames: this.anims.generateFrameNumbers('clone', { start: 0, end: 3 }), frameRate: 10, repeat: -1 });
    logo.anims.play('fly', true);
    logo.setScale(2);
  }

  update(_time: number, delta: number) {
    if(!this.gameOver) {
      if(this.tileFloor != null) this.tileFloor.tilePositionX += delta * SPEED;
      if(this.tileSky != null) this.tileSky.tilePositionX += delta * SPEED / 16;
    }
  }
}
