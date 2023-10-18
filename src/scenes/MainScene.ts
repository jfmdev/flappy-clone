// FIXME: These constants should probably need to be adjusted to fit the new canvas size.
const SPEED = 0.12;
const GRAVITY = 18;
const FLAP = 210;

enum Status {
  READY,
  STARTED,
  OVER
}

export default class MainScene extends Phaser.Scene {
  private gameStatus = Status.READY;
  // private highscore = 0;
  private score = 0;
  
  private clone: Phaser.Physics.Arcade.Sprite | null = null;
  private cloneBody: Phaser.Physics.Arcade.Body | null = null;
  private tileFloor: Phaser.GameObjects.TileSprite | null = null;
  private tileSky: Phaser.GameObjects.TileSprite | null = null;
  private towersSprites: Phaser.GameObjects.Group | null = null;
  private towersBounds: Phaser.GameObjects.Group | null = null;
  
  private highscoreText: Phaser.GameObjects.Text | null = null;
  private instructionsText: Phaser.GameObjects.Text | null = null;
  private scoreText: Phaser.GameObjects.Text | null = null;

  private flapSound: Phaser.Sound.BaseSound | null = null;
  // private hurtSound: Phaser.Sound.BaseSound | null = null;
  // private scoreSound: Phaser.Sound.BaseSound | null = null;

  constructor() {
    super('Initializing...');

    // // Get highscore from local storage.
    // this.highscore = 0;
    // try {
    //   this.highscore = parseInt(localStorage.getItem('highscore') || '0', 10);
    // }catch(err) {
    //   // Do nothing.
    // }
  }

  preload() {
    // Load images.
    this.load.image('fence', 'assets/images/fence.png');
    this.load.image('stars', 'assets/images/stars.png');
    this.load.image('tower', 'assets/images/tower.png');

    // Load spritesheets.
    this.load.spritesheet('clone', 'assets/spritesheet/clone.png', { frameWidth: 48, frameHeight: 48 });

    // Load audio.
    this.load.audio('flap', 'assets/sound/flap.wav');
    this.load.audio('hurt', 'assets/sound/hurt.wav');
    this.load.audio('score', 'assets/sound/score.wav');
  }

  create() {
    // Add sky and floor.
    this.tileFloor = this.add.tileSprite(0, this.game.canvas.height - 32, this.game.canvas.width, 32, 'fence').setOrigin(0, 0);
    this.tileSky = this.add.tileSprite(0, 0, this.game.canvas.width, this.game.canvas.height, 'stars').setOrigin(0, 0);

    // Add clone trooper.
    this.clone = this.physics.add.sprite(this.game.canvas.width / 4, this.game.canvas.height / 2, 'clone');
    this.clone.setCollideWorldBounds(true);
    this.clone.anims.create({ key: 'fly', frames: this.anims.generateFrameNumbers('clone', { start: 0, end: 3 }), frameRate: 10, repeat: -1 });

    this.cloneBody = this.clone.body as Phaser.Physics.Arcade.Body;
    this.cloneBody.setGravityY(GRAVITY);

    // Add groups for towers sprites and colliders.
    this.towersSprites = this.add.group();
    this.towersBounds = this.add.group();

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
      "Touch to\nflap wings"
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

    // Add sounds.
    this.flapSound = this.sound.add('flap');
    // this.hurtSound = this.sound.add('hurt');
    // this.scoreSound = this.sound.add('score');

    // Add controls.
    this.input.keyboard?.on('keydown', this.flap.bind(this));
    this.input.on('pointerdown', this.flap.bind(this));

    // Start.
    this.reset();
  }

  update(_time: number, delta: number) {
    // TODO: Finish implementation.

    // Move background.
    if(this.gameStatus !== Status.OVER) {
      if(this.tileFloor != null) this.tileFloor.tilePositionX += delta * SPEED;
      if(this.tileSky != null) this.tileSky.tilePositionX += delta * SPEED / 16;
    }
  }

  reset() {
    // Update flags and score.
    this.gameStatus = Status.READY;
    this.score = 0;

    // Update texts.
    this.scoreText?.setText("Flappy\nClone");
    this.instructionsText?.setVisible(true);
    this.highscoreText?.setText("");

    // Update clone.
    this.clone?.setAngle(0);
    this.clone?.setPosition(this.game.canvas.width / 4, this.game.canvas.height / 2);
    this.clone?.setScale(1, 1);
    this.clone?.anims.play('fly');
    this.cloneBody?.setAllowGravity(false);
    
    // Update towers.
    this.towersSprites?.clear();
    this.towersBounds?.clear();
  }

  start() {
    // Update flag.
    this.gameStatus = Status.STARTED;

    // Update texts.
    this.scoreText?.setText(this.score + '');
    this.instructionsText?.setVisible(false)

    // Update clone.
    this.cloneBody?.setAllowGravity(true);

    // Update towers.
    // TODO: Add timer to spawn towers.
  }

  // openingSize() {}
  // addScore() {}
  // setGameOver() {}
  // spawnTower() {}
  // spawnTowers() {}

  flap() {
    if (this.gameStatus !== Status.STARTED) {
      this.start();
    }

    if (this.gameStatus !== Status.OVER) {
      this.clone?.setVelocityY(-FLAP);
      this.flapSound?.play();
    }
  }
}
