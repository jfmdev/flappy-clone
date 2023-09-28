
export default class HelloScene extends Phaser.Scene {
  constructor() {
    super('hello');
  }

  preload() {
    // load static from our public dir
    this.load.image('vite-phaser-logo', 'assets/images/vite-phaser.png');

    // load static assets from url
    this.load.image('sky', 'https://labs.phaser.io/assets/skies/space3.png');
    this.load.image('red', 'https://labs.phaser.io/assets/particles/red.png');
  }

  create() {
    this.add.image(400, 300, 'sky');

    const particles = this.add.particles(0, 0, 'red', {
      speed: 100,
      scale: { start: 1, end: 0 },
      blendMode: 'ADD'
    });

    const logo = this.physics.add.image(400, 100, 'vite-phaser-logo');
    logo.setVelocity(100, 200);
    logo.setBounce(1, 1);
    logo.setCollideWorldBounds(true)

    particles.startFollow(logo);
  }
}