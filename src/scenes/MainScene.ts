// Constants related to the game physics (speeds are pixels per second).
const FLAP_IMPULSE = 420;
const GRAVITY = 900;
const BACKGROUND_SPEED = 180;

// Constants related to images sizes.
const CLONE_SIZE = 48;
const FENCE_HEIGHT = 32;

// Constants related to the towers.
const GAP_MARGIN = CLONE_SIZE;
const GAP_MIN_HEIGHT = CLONE_SIZE * 3;
const GAP_MAX_HEIGHT = CLONE_SIZE * 4.5;
const SPAWN_RATE = 900;

// Other constants.
const SCORE_THRESHOLD = 50;

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
  private gaps: Phaser.Physics.Arcade.Group | null = null;
  private spawnTimer: Phaser.Time.TimerEvent | null = null;
  private tileFloor: Phaser.GameObjects.TileSprite | null = null;
  private tileSky: Phaser.GameObjects.TileSprite | null = null;
  private towers: Phaser.Physics.Arcade.Group | null = null;
  
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
    this.load.spritesheet('clone', 'assets/spritesheet/clone.png', { frameWidth: CLONE_SIZE, frameHeight: CLONE_SIZE });

    // Load audio.
    this.load.audio('flap', 'assets/sound/flap.wav');
    this.load.audio('hurt', 'assets/sound/hurt.wav');
    this.load.audio('score', 'assets/sound/score.wav');
  }

  create() {
    // Add sky and floor.
    this.tileSky = this.add.tileSprite(0, 0, this.game.canvas.width, this.game.canvas.height, 'stars').setOrigin(0, 0);
    this.tileFloor = this.add.tileSprite(
      0, this.game.canvas.height - FENCE_HEIGHT, 
      this.game.canvas.width, FENCE_HEIGHT, 
      'fence').setOrigin(0, 0);
    this.tileFloor.setDepth(1);

    // Add groups for towers and colliders.
    this.towers = this.physics.add.group();
    this.gaps = this.physics.add.group();

    // Add clone trooper.
    this.clone = this.physics.add.sprite(this.game.canvas.width / 4, this.game.canvas.height / 2, 'clone');
    this.clone.setCollideWorldBounds(true);
    this.clone.anims.create({ key: 'fly', frames: this.anims.generateFrameNumbers('clone', { start: 0, end: 3 }), frameRate: 10, repeat: -1 });

    this.cloneBody = this.clone.body as Phaser.Physics.Arcade.Body;
    this.cloneBody.setGravityY(GRAVITY);

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

    // Reset statuses.
    this.reset();
  }

  update(_time: number, delta: number) {
    // TODO: Finish implementation.

    // Move background.
    if(this.gameStatus !== Status.OVER) {
      if(this.tileFloor != null) this.tileFloor.tilePositionX += delta * BACKGROUND_SPEED / 1000;
      if(this.tileSky != null) this.tileSky.tilePositionX += delta * BACKGROUND_SPEED / 16000;
    }
  }

  // --- Custom methods --- //

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
    
    // Clear towers, gaps and timer.
    this.towers?.clear();
    this.gaps?.clear();
    this.spawnTimer?.remove();
  }

  start() {
    // Update flag.
    this.gameStatus = Status.STARTED;

    // Update texts.
    this.scoreText?.setText(this.score + '');
    this.instructionsText?.setVisible(false)

    // Update clone.
    this.cloneBody?.setAllowGravity(true);

    // Initialize timer to add towers.
    this.spawnTimer = this.time.addEvent({
      delay: SPAWN_RATE,
      callback: this.spawnTowers,
      callbackScope: this,
      loop: true
    });
  }

  flap() {
    if (this.gameStatus !== Status.STARTED) {
      this.start();
    }

    if (this.gameStatus !== Status.OVER) {
      this.clone?.setVelocityY(-FLAP_IMPULSE);
      this.flapSound?.play();
    }
  }
  
  gapHeight() {
    // The more score, the smaller the space between the towers (until reaching the threshold, when the space becames constant).
    const scorePenalty = this.score >= SCORE_THRESHOLD ? 1 : this.score / SCORE_THRESHOLD;
    return GAP_MAX_HEIGHT - (GAP_MAX_HEIGHT - GAP_MIN_HEIGHT) * scorePenalty;
  }

  spawnTowers() {
    // Generate a random position for the gap between the towers.
    const minGapPosition = this.gapHeight()/2 + GAP_MARGIN;
    const maxGapPosition = this.game.canvas.height - FENCE_HEIGHT - this.gapHeight()/2 - GAP_MARGIN;
    const gapPosition = maxGapPosition - (maxGapPosition - minGapPosition) * Math.random();

    // Create towers.
    this.spawnTower(gapPosition);
    this.spawnTower(gapPosition, true);

    // TODO: Create gap.
  }

  spawnTower(gapCenter: number, flipped = false) {
    const flipSign = flipped ? -1 : 1;

    const tower = this.towers?.create(
      this.game.canvas.width,
      gapCenter + (flipSign * this.gapHeight() / 2),
      'tower'
    ) as Phaser.GameObjects.Sprite;
    tower.setScale(1.5, flipSign * 1.5);
    tower.setOrigin(0, 0);

    const towerBody = tower.body as Phaser.Physics.Arcade.Body;
    towerBody.setAllowGravity(false)
    towerBody.setVelocityX(-BACKGROUND_SPEED);

    return tower;
  }

  // addScore() {}
  // setGameOver() {}
}
