const SPEED = 0.12;
// const GRAVITY = 0.012;

export default class MainScene extends Phaser.Scene {
  private gameOver = false;
  
  private tileFloor: Phaser.GameObjects.TileSprite | null = null;
  private tileSky: Phaser.GameObjects.TileSprite | null = null;
  // private towersSprites: Phaser.GameObjects.Group | null = null;
  // private towersBounds: Phaser.GameObjects.Group | null = null;
  
  private highscoreText: Phaser.GameObjects.Text | null = null;
  private instructionsText: Phaser.GameObjects.Text | null = null;
  private scoreText: Phaser.GameObjects.Text | null = null;

  constructor() {
    super('Initializing...');
  }

  preload() {
    // Load images.
    this.load.image('fence', 'assets/images/fence.png');
    this.load.image('stars', 'assets/images/stars.png');
    this.load.image('tower', 'assets/images/tower.png');

    // Load spritesheets.
    this.load.spritesheet('clone', 'assets/spritesheet/clone.png', { frameWidth: 48, frameHeight: 48 });

    // Load audio.
    this.load.audio('flap', 'assets/audio/flap.wav');
    this.load.audio('hurt', 'assets/audio/hurt.wav');
    this.load.audio('score', 'assets/audio/score.wav');
  }

  create() {
    // Add sky and floor.
    this.tileFloor = this.add.tileSprite(0, this.game.canvas.height - 32, this.game.canvas.width, 32, 'fence').setOrigin(0, 0);
    this.tileSky = this.add.tileSprite(0, 0, this.game.canvas.width, this.game.canvas.height, 'stars').setOrigin(0, 0);

    // Add clone trooper.
    const clone = this.physics.add.sprite(400, 100, 'clone');
    clone.setCollideWorldBounds(true);
    clone.setInteractive(true);
    // clone.body.setGravityY(GRAVITY); // TODO: Uncomment this line of code once we configure the physics engine properly.

    clone.anims.create({ key: 'fly', frames: this.anims.generateFrameNumbers('clone', { start: 0, end: 3 }), frameRate: 10, repeat: -1 });
    clone.anims.play('fly', true);

    // TODO: Remove these two lines of code (won't be need once we configure the physics engine properly).
    clone.setVelocity(100, 200);
    clone.setBounce(1, 1);

    // Add groups for towers sprites and colliders.
    // this.towersSprites = this.add.group();
    // this.towersBounds = this.add.group();

    // Add texts.
    this.scoreText = this.add.text(
      this.game.canvas.width / 2,
      this.game.canvas.height / 5,
      ""
    );
    this.scoreText.setFontSize(32);
    this.scoreText.setColor('#fff');
    this.scoreText.setAlign('center');
    this.scoreText.setOrigin(0.5, 0.5);
  
    this.instructionsText = this.add.text(
      this.game.canvas.width / 2,
      this.game.canvas.height * 3/4,
      ""
    );
    this.instructionsText.setFontSize(20);
    this.instructionsText.setFontFamily('Verdana');
    this.instructionsText.setColor('#fff');
    this.instructionsText.setAlign('center');
    this.instructionsText.setOrigin(0.5, 0.5);

    this.highscoreText = this.add.text(
      this.game.canvas.width / 2,
      this.game.canvas.height / 3,
      ""
    );
    this.highscoreText.setFontSize(24);
    this.highscoreText.setFontFamily('Verdana');
    this.highscoreText.setColor('#fff');
    this.highscoreText.setAlign('center');
    this.highscoreText.setOrigin(0.5, 0.5);
  }

  update(_time: number, delta: number) {
    if(!this.gameOver) {
      if(this.tileFloor != null) this.tileFloor.tilePositionX += delta * SPEED;
      if(this.tileSky != null) this.tileSky.tilePositionX += delta * SPEED / 16;
    }
  }
}
