class Move {
  constructor(move, imgs, dir) {
    this.move = move;
    this.image = imgs[this.move];
    this.dir = dir;
    this.w = 150;
    this.h = 150;
    this.x = dir == 1 ? video.width : width - this.w * 0.8;
    this.y = height / 2 - this.h / 2;
    this.winner = true;
  }

  show() {
    if (this.winner) {
      image(this.image, this.x, this.y, this.w, this.h);
    }
  }

  update() {
    this.x += this.dir * 3;
  }

  grow() {
    this.w = 200;
    this.h = 200;
  }
}
