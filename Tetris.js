// Global //
var tabIndex = 0;
var dt = 20; // milliseconds
var now = (new Date).getTime();

// Setup //
(function (elementId) {
  function clone (obj) {
    // http://stackoverflow.com/questions/122102/122190#122190
    if(obj == null || typeof(obj) != 'object')
      return obj;
    var temp = obj.constructor();
    for(var key in obj)
      temp[key] = clone(obj[key]);
    return temp;
  }

  function stopPropagation (evt) {
    var e = window.event || evt;
    if (e.stopPropagation) {
      e.stopPropagation();
      e.preventDefault();
    } else {
      e.cancelBubble = true;
      e.returnValue = false;
    }
  }

  var gameboard = document.getElementById(elementId);
  gameboard.cols = 10;
  gameboard.rows = 20;
  gameboard.tileWidth = 15;
  gameboard.tileHeight = 15;
  gameboard.width = gameboard.cols * gameboard.tileWidth;
  gameboard.height = gameboard.rows * gameboard.tileHeight;
  gameboard.tabIndex = tabIndex++; // adds kbd focus
  gameboard.focus();
  gameboard.colors = ['black','red','brown','cyan','orange','magenta','yellow','green'];
  gameboard.style.backgroundColor = gameboard.colors[0];
  gameboard.tetrominoes = {
    O: [[[0,0,0,0], [0,0,0,0], [0,0,0,0], [0,0,0,0]],
        [[0,1,1,0], [0,1,1,0], [0,1,1,0], [0,1,1,0]],
        [[0,1,1,0], [0,1,1,0], [0,1,1,0], [0,1,1,0]],
        [[0,0,0,0], [0,0,0,0], [0,0,0,0], [0,0,0,0]]],
        
    I: [[[0,0,0,0], [0,0,2,0], [0,0,0,0], [0,0,2,0]],
        [[2,2,2,2], [0,0,2,0], [2,2,2,2], [0,0,2,0]],
        [[0,0,0,0], [0,0,2,0], [0,0,0,0], [0,0,2,0]],
        [[0,0,0,0], [0,0,2,0], [0,0,0,0], [0,0,2,0]]],
        
    S: [[[0,0,0,0], [0,0,3,0], [0,0,0,0], [0,0,3,0]],
        [[0,0,3,3], [0,0,3,3], [0,0,3,3], [0,0,3,3]],
        [[0,3,3,0], [0,0,0,3], [0,3,3,0], [0,0,0,3]],
        [[0,0,0,0], [0,0,0,0], [0,0,0,0], [0,0,0,0]]],
        
    Z: [[[0,0,0,0], [0,0,0,4], [0,0,0,0], [0,0,0,4]],
        [[0,4,4,0], [0,0,4,4], [0,4,4,0], [0,0,4,4]],
        [[0,0,4,4], [0,0,4,0], [0,0,4,4], [0,0,4,0]],
        [[0,0,0,0], [0,0,0,0], [0,0,0,0], [0,0,0,0]]],
        
    L: [[[0,0,0,0], [0,0,5,0], [0,0,0,5], [0,5,5,0]],
        [[0,5,5,5], [0,0,5,0], [0,5,5,5], [0,0,5,0]],
        [[0,5,0,0], [0,0,5,5], [0,0,0,0], [0,0,5,0]],
        [[0,0,0,0], [0,0,0,0], [0,0,0,0], [0,0,0,0]]],
        
    J: [[[0,0,0,0], [0,0,6,6], [0,6,0,0], [0,0,6,0]],
        [[0,6,6,6], [0,0,6,0], [0,6,6,6], [0,0,6,0]],
        [[0,0,0,6], [0,0,6,0], [0,0,0,0], [0,6,6,0]],
        [[0,0,0,0], [0,0,0,0], [0,0,0,0], [0,0,0,0]]],
        
    T: [[[0,0,0,0], [0,0,7,0], [0,0,7,0], [0,0,7,0]],
        [[0,7,7,7], [0,0,7,7], [0,7,7,7], [0,7,7,0]],
        [[0,0,7,0], [0,0,7,0], [0,0,0,0], [0,0,7,0]],
        [[0,0,0,0], [0,0,0,0], [0,0,0,0], [0,0,0,0]]]
  };

  gameboard.Tetromino = {
    cols: 4,
    rows: 4,
    tileWidth: gameboard.tileWidth,
    tileHeight: gameboard.tileHeight,
    moveUp: function () {
      this.row--;
      this.fallingPeriod = now + dt * gameboard.fallingFactor;
    },
    moveDown: function () {
      this.row++;
      this.fallingPeriod = now + dt * gameboard.fallingFactor;
    },
    keyHandlers: {
      37: function () {this.col--},
      38: function () {this.orientation++; this.orientation %= 4},
      39: function () {this.col++},
      40: function () {this.moveDown()}
    },
    draw: function (ctx) {
      if (this.committed) return;
      ctx.save();
      ctx.shadowOffsetX = 1;
      ctx.shadowOffsetY = 1;
      ctx.shadowBlur = 4;
      ctx.shadowColor = gameboard.colors[0];
      for (var row=0; row < this.rows; row++) {
        for (var col=0; col < this.cols; col++) {
          var c = gameboard.tetrominoes[this.name][row][this.orientation][col];
          if (c > 0) {
            ctx.fillStyle = gameboard.colors[c];
            ctx.fillRect(
              (this.col + col) * this.tileWidth,
              (this.row + row) * this.tileHeight,
              this.tileWidth,
              this.tileHeight);
          }
        }
      }
      ctx.restore();
    }
  };

  // key states and timings
  gameboard.keyStates = {};
  gameboard.waitPeriods = {37:0, 38:0, 39:0, 40:0};
  gameboard.waitFactors = {37:5, 38:25, 39:5, 40:0};
  gameboard.onkeypress = stopPropagation;
  gameboard.onkeyup = function (evt) {
    var e = window.event || evt;
    if (this.keyStates.hasOwnProperty(e.keyCode)) {
      this.keyStates[e.keyCode].isUp = true;
    }
    return stopPropagation(e);
  };
  gameboard.onkeydown = function (evt) {
    var e = window.event || evt;
    if (!this.keyStates.hasOwnProperty(e.keyCode)) {
      this.keyStates[e.keyCode] = {
        isUp: false,
        isDown: true,
        elapsedTime: 0
      };
    }
    return stopPropagation(e);
  };

  gameboard.collides = function (piece) {
    if (!piece) return false;
    for (var row=0; row<piece.rows; row++) {
      for (var col=0; col<piece.cols; col++) {
        if (this.tetrominoes[piece.name][row][piece.orientation][col] > 0 &&
            this.pile[row+piece.row][col+piece.col] > 0) {
          return true;
        }
      }
    }
    return false;
  };

  gameboard.commit = function (piece) {
    for (var row=0; row<piece.rows; row++) {
      for (var col=0; col<piece.cols; col++) {
        var c = this.tetrominoes[piece.name][row][piece.orientation][col];
        if (c > 0) {
          this.pile[row+piece.row][col+piece.col] = c;
        }
      }
    }
    piece.committed = true;
  };

  gameboard.isFullRow = function (row) {
    for (var col=0; col<this.cols; col++) {
      if (row[col] === 0) return false;
    }
    return true;
  };

  gameboard.shiftDownPile = function (row) {
    for (var last=row; last>=-4; last--) {
      this.pile[last] = clone(this.pile[last-1]);
    }
  };

  gameboard.drawPile = function (ctx) {
    ctx.save();
    for (var row=0; row < this.rows; row++) {
      for (var col=0; col < this.cols; col++) {
        var c = this.pile[row][col];
        ctx.fillStyle = this.colors[c];
        ctx.fillRect(col * this.tileWidth, row * this.tileHeight, this.tileWidth, this.tileHeight);
        ctx.strokeStyle = 'rgba(0,0,0,0.3)';
        ctx.strokeRect(col * this.tileWidth, row * this.tileHeight, this.tileWidth, this.tileHeight);
      }
    }
    ctx.restore();
  };
  
  gameboard.drawScore = function (ctx) {
    ctx.save();
     ctx.font = "bold 11px Arial";
     ctx.shadowBlur = 1;
     ctx.shadowColor = "black";
     ctx.fillStyle = 'rgba(210,210,100,0.9)';
     ctx.fillText(this.eliminatedLines * 10, 5, 15);
    ctx.restore();
  };

  gameboard.play = function () {
    var clonedPiece = clone(this.piece);
    // Read keys and Update object state //
    for (var keyCode in this.keyStates) {
      if (this.keyStates[keyCode].elapsedTime === 0 ||
          this.keyStates[keyCode].elapsedTime >= 300) {
        if (now >= this.waitPeriods[keyCode]) {
          if (keyCode in this.piece.keyHandlers) {
            this.piece.keyHandlers[keyCode].call(this.piece);
          }
          this.waitPeriods[keyCode] = now + dt * this.waitFactors[keyCode];
        }
      }
    }
    if (this.collides(this.piece)) {
      this.piece = clonedPiece; // restore
    }
    if (this.collides(this.piece)) {
      this.setState(this.restart);
    }
    if (now >= this.piece.fallingPeriod) {
      this.piece.moveDown();
      if (this.collides(this.piece)) {
        this.piece.moveUp();
        // landed
        this.commit(this.piece);
        this.setState(this.findFullRow);
      }
    }
  };

  gameboard.spawnRandomPiece = function () {
    var piece = {};
    piece.__proto__ = this.Tetromino;
    piece.col = 3;
    piece.row = -1;
    piece.orientation = 0;
    piece.name = ['O', 'I', 'S', 'Z', 'L', 'J', 'T'][Math.floor(Math.random()*7)];
    piece.committed = false;
    return piece;
  };

  gameboard.findFullRow = function () {
    this.fullrow = -1;
    for (var row=0; row<this.rows; row++) {
      if (this.isFullRow(this.pile[row])) {
        this.fullrow = row;
        break;
      }
    }
    this.setState(this.animateFullRow);
  };

  gameboard.animateFullRow = function () {
    this.setState(this.eliminateFullRow);
  };

  gameboard.eliminateFullRow = function () {
    if (this.fullrow > -1) {
      this.shiftDownPile(this.fullrow);
      this.eliminatedLines++;
      if (this.eliminatedLines % 10 == 0 && this.fallingFactor > 6) {
        this.fallingFactor--;
      }
      this.setState(this.findFullRow);
    } else {
      this.piece = this.nextpiece;
        if (!this.piece) this.piece = this.spawnRandomPiece();
        this.piece.fallingPeriod = now + 350;
        this.nextpiece = this.spawnRandomPiece();
        this.smallpiece = clone(this.nextpiece);
        this.smallpiece.tileWidth = 7;
        this.smallpiece.tileHeight = 7;
        this.smallpiece.col = 2*(this.cols-2);
        this.smallpiece.row = 0;
      this.setState(this.play);
    }
  };

  gameboard.clearPile = function () {
    this.pile = [];
    for (var row = -5; row < this.rows + 4; row++) {
      this.pile[row]= [];
      for (var col = -4; col < this.cols + 4; col++) {
        this.pile[row][col] = 0;
      }
    }
    // walls
    for (var col = 0; col < this.cols; col++) {
      this.pile[this.rows][col] = 1;
    }
    for (var row = -5; row < this.rows; row++) {
      this.pile[row][-1] = 1;
      this.pile[row][this.cols] = 1;
    }
  };

  gameboard.setState = function (state) {
    this.execState = state;
  };

  (gameboard.restart = function () {
    this.clearPile();
    this.eliminatedLines = 0;
    this.fallingFactor = 15;
    this.setState(this.findFullRow);
  }).call(gameboard);

  gameboard.interval = setInterval(
    function () {
      var ctx;
      now = (new Date).getTime();
      gameboard.execState();
      // Clear/Reset key states //
      for (var keyCode in gameboard.keyStates) {
        gameboard.keyStates[keyCode].elapsedTime += dt;
        if (gameboard.keyStates[keyCode].isUp) {
          gameboard.waitPeriods[keyCode] = now;
          delete gameboard.keyStates[keyCode];
        }
      }
      // Draw //
      if (gameboard.getContext) {
        ctx = gameboard.getContext('2d');
        gameboard.drawPile(ctx);
        if (gameboard.piece) gameboard.piece.draw(ctx);
        if (gameboard.smallpiece) gameboard.smallpiece.draw(ctx);
        gameboard.drawScore(ctx);
      }
    }, dt);
  return arguments.callee;
})('tetris');
