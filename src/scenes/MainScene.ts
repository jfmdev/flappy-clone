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
const SPAWN_RATE = 950;

// Other constants.
const DISABLE_RESET_DELAY = 500;
const INSTRUCTIONS_START = "Touch to\nflap wings";
const INSTRUCTIONS_RETRY = "Touch anywhere\nto try again";
const SCORE_THRESHOLD = 50;
const TITLE = "Flappy\nClone";

enum Status {
  READY,
  STARTED,
  OVER
}

enum Depths {
  BACKGROUND = 0,
  TOWERS = 1,
  TEXTS = 2,
  CLONE = 3,
  FLOOR = 4
}

export default class MainScene extends Phaser.Scene {
  private gameStatus = Status.READY;
  private highscore = 0;
  private resetDisabled = true;
  private score = 0;
  
  private clone: Phaser.Physics.Arcade.Sprite | null = null;
  private cloneBody: Phaser.Physics.Arcade.Body | null = null;
  private milestones: Phaser.Physics.Arcade.Group | null = null;
  private spawnTimer: Phaser.Time.TimerEvent | null = null;
  private tileFloor: Phaser.GameObjects.TileSprite | null = null;
  private tileSky: Phaser.GameObjects.TileSprite | null = null;
  private towers: Phaser.Physics.Arcade.Group | null = null;
  
  private highscoreText: Phaser.GameObjects.Text | null = null;
  private instructionsText: Phaser.GameObjects.Text | null = null;
  private scoreText: Phaser.GameObjects.Text | null = null;

  private flapSound: Phaser.Sound.BaseSound | null = null;
  private hurtSound: Phaser.Sound.BaseSound | null = null;
  private scoreSound: Phaser.Sound.BaseSound | null = null;

  constructor() {
    super('Initializing...');

    // Get highscore from local storage.
    this.highscore = 0;
    try {
      this.highscore = parseInt(localStorage.getItem('highscore') || '0', 10);
    }catch(err) {
      // Do nothing.
    }
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
    this.tileFloor.setDepth(Depths.FLOOR);

    // Add groups for towers and milestones.
    this.towers = this.physics.add.group();
    this.milestones = this.physics.add.group();

    // Add player.
    this.clone = this.physics.add.sprite(this.game.canvas.width / 4, this.game.canvas.height / 2, 'clone');
    this.clone.setCollideWorldBounds(true);
    this.clone.anims.create({ key: 'fly', frames: this.anims.generateFrameNumbers('clone', { start: 0, end: 3 }), frameRate: 10, repeat: -1 });
    this.clone.setDepth(Depths.CLONE);

    this.cloneBody = this.clone.body as Phaser.Physics.Arcade.Body;
    this.cloneBody.setAllowGravity(false);
    this.cloneBody.setGravityY(GRAVITY);

    // Add texts.
    this.scoreText = this.add.text(
      this.game.canvas.width / 2,
      this.game.canvas.height / 5,
      TITLE
    );
    this.scoreText.setFontSize(32);
    this.scoreText.setColor('#fff');
    this.scoreText.setAlign('center');
    this.scoreText.setShadow(1, 1, '#000', 1);
    this.scoreText.setOrigin(0.5, 0.5);
    this.scoreText.setDepth(Depths.TEXTS);
  
    this.instructionsText = this.add.text(
      this.game.canvas.width / 2,
      this.game.canvas.height * 3/4,
      INSTRUCTIONS_START
    );
    this.instructionsText.setFontSize(20);
    this.instructionsText.setFontFamily('Verdana');
    this.instructionsText.setColor('#fff');
    this.instructionsText.setAlign('center');
    this.instructionsText.setShadow(1, 1, '#000', 1);
    this.instructionsText.setOrigin(0.5, 0.5);
    this.instructionsText.setDepth(Depths.TEXTS);

    this.highscoreText = this.add.text(
      this.game.canvas.width / 2,
      this.game.canvas.height / 3,
      ""
    );
    this.highscoreText.setFontSize(24);
    this.highscoreText.setFontFamily('Verdana');
    this.highscoreText.setColor('#fff');
    this.highscoreText.setAlign('center');
    this.highscoreText.setShadow(1, 1, '#000', 1);
    this.highscoreText.setOrigin(0.5, 0.5);
    this.highscoreText.setDepth(Depths.TEXTS);

    // Add sounds.
    this.flapSound = this.sound.add('flap');
    this.hurtSound = this.sound.add('hurt');
    this.scoreSound = this.sound.add('score');

    // Add controls.
    this.input.keyboard?.on('keydown', this.flap.bind(this));
    this.input.on('pointerdown', this.flap.bind(this));

    // Reset statuses.
    this.reset();
  }

  update(_time: number, delta: number) {
    if(this.gameStatus === Status.STARTED) {
      // Update player angle according to its vertical speed.
      const angle = 90 * (this.cloneBody?.velocity.y || 0)/FLAP_IMPULSE - 90;
      this.clone?.setAngle(angle < -30 ? -30 : angle > 90 || angle < -90 ? 90 : angle);

      // Check for collisions.
      if(this.clone && this.towers) {
        this.physics.overlap(this.clone, this.towers, this.endGame.bind(this));
      }
      if(this.clone && this.milestones) {
        this.physics.overlap(this.clone, this.milestones, this.increaseScore.bind(this));
      }
      if(this.cloneBody && this.cloneBody.position.y > this.game.canvas.height - FENCE_HEIGHT - CLONE_SIZE/2) {
        this.endGame();
      }

      // Destroy towers when they are out of the screen (no need to do the same for milestones, that's done when increasing the score).
      this.towers?.getChildren().forEach((tower: Phaser.GameObjects.GameObject) => {
        const towerBody = tower.body as Phaser.Physics.Arcade.Body;
        if (towerBody.x + towerBody.width < 0) {
          this.towers?.remove(tower, true, true);
        }
      });
    }
    
    if(this.gameStatus === Status.OVER) {
      // Rotate player, stop animation and increase (gradually) its scale.
      this.clone?.setAngle(90);
      this.clone?.anims.stop();
      if(this.clone && this.clone.scale < 2) {
        const newScale = this.clone.scale * (1 + delta/650);
        this.clone.setScale(newScale > 2 ? 2 : newScale);
      }
    }

    if(this.gameStatus === Status.READY && this.cloneBody) {
      this.cloneBody.position.y = (this.game.canvas.height / 2) + 8 * Math.cos(this.time.now / 200);
    }

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
    this.scoreText?.setText(TITLE);
    this.instructionsText?.setText(INSTRUCTIONS_START);
    this.instructionsText?.setVisible(true);
    this.highscoreText?.setVisible(false);

    // Update player.
    this.clone?.setAngle(0);
    this.clone?.setPosition(this.game.canvas.width / 4, this.game.canvas.height / 2);
    this.clone?.setScale(1, 1);
    this.clone?.anims.play('fly');
    this.cloneBody?.setAllowGravity(false);
    
    // Clear towers, milestones and timer.
    this.towers?.clear(true);
    this.milestones?.clear(true);
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
    if (this.gameStatus === Status.OVER && !this.resetDisabled) {
      this.reset();
    } else if (this.gameStatus === Status.READY) {
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
    const bottomTower = this.spawnTower(gapPosition);
    this.spawnTower(gapPosition, true);

    // Create milestone (we use an invisible rectangle).
    const milestone = this.add.rectangle(bottomTower.x + bottomTower.width, this.game.canvas.height/2, 2, this.game.canvas.height);
    this.milestones?.add(milestone);
    const milestoneBody = milestone.body as Phaser.Physics.Arcade.Body;
    milestoneBody.setAllowGravity(false)
    milestoneBody.setVelocityX(-BACKGROUND_SPEED);
  }

  spawnTower(gapCenter: number, flipped = false) {
    const tower = this.towers?.create(
      this.game.canvas.width,
      gapCenter + (flipped ? -1 : 1) * (this.gapHeight() / 2),
      'tower'
    ) as Phaser.GameObjects.Sprite;
    tower.setScale(1.5, 1.5);
    tower.setFlipY(flipped);
    tower.setOrigin(0, flipped ? 1 : 0);
    tower.setDepth(Depths.TOWERS);

    const towerBody = tower.body as Phaser.Physics.Arcade.Body;
    towerBody.setAllowGravity(false)
    towerBody.setVelocityX(-BACKGROUND_SPEED);

    return tower;
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  increaseScore(_objectA: any, objectB: any) {
    const milestone = objectB as Phaser.GameObjects.Rectangle;
    this.milestones?.remove(milestone, true, true);
    this.score += 1;
    this.scoreText?.setText(this.score + '');
    this.scoreSound?.play();
  }

  endGame() {
    this.hurtSound?.play();
    this.gameStatus = Status.OVER;

    // Update highscore.
    if(this.score > this.highscore) {
      this.highscore = this.score;
      try {
        localStorage.setItem('highscore', this.score + '');
      }catch(exp) {
        // Do nothing.
      }
    }
    this.highscoreText?.setText("Highscore\n" + this.highscore);
    this.highscoreText?.setVisible(true);

    // Stop towers and milestones.
    this.towers?.getChildren().forEach((tower: Phaser.GameObjects.GameObject) => {
      const towerBody = tower.body as Phaser.Physics.Arcade.Body;
      towerBody.setVelocityX(0);
    });
    this.milestones?.getChildren().forEach((milestone: Phaser.GameObjects.GameObject) => {
      const milestoneBody = milestone.body as Phaser.Physics.Arcade.Body;
      milestoneBody.setVelocityX(0);
    });

    // Stop spawning towers
    this.spawnTimer?.remove();

    // Wait a time before allowing the user to reset.
    this.resetDisabled = true;
    this.time.addEvent({
      delay: DISABLE_RESET_DELAY,
      callback: () => { 
        this.resetDisabled = false;

        this.instructionsText?.setText(INSTRUCTIONS_RETRY);
        this.instructionsText?.setVisible(true);
      }
    });
  }
}
