var canvas = document.querySelector("#canvas");
var drawingSurface = canvas.getContext("2d");

var spriteObject = {
  x: 0,
  y: 0,
  width: 64,
  height: 64,

  sourceX: 0,
  sourceY: 0,
  sourceWidth: 472,
  sourceHeight: 511,
  texture: "black",
  currentFrame: 0,
  numberOfFrames: 20,

  centerX: function(){
    return this.x + this.width/2;
  },
  centerY: function(){
    return this.y + this.height/2;
  }
};

var LOADING = 0;
var RUNNING = 1;
var ENDGAME = 2;
var GAME_STATE = LOADING;

var spawnRate = 100;
var obstacleTimer = 0;
var obstacles = [];
var obstacleVelocity = 8;

var hero;
var herodied = false;
var sprites = [];
var score = 0;

var image = new Image();
image.src = "run.png";
image.addEventListener("load", loadHandler, false);

function loadHandler(){
  console.log("loaded");
  GAME_STATE = RUNNING;
}

//physics
var gravity = 1;
var ground_coord = 400;

//keycodes
var UP = 38;
var DOWN = 40;

//hero variables
var jump = false;
var upKeyPressed = false;

var crouch = false;
var downKeyPressed = false;



window.addEventListener("keydown", function(event){
  switch (event.keyCode) {
    case UP:
      if(!upKeyPressed){
        jump = true;
        upKeyPressed = true;
      }
      break;
    case DOWN:
      if(!downKeyPressed){
        crouch = true;
        downKeyPressed = true;
      }
  }
});

window.addEventListener("keyup", function(event){
  switch(event.keyCode){
    case UP:
      upKeyPressed = false;
      break;
    case DOWN:
      crouch = false;
      downKeyPressed = false;
      break;
  }
});

update();

function update(){
  requestAnimationFrame(update, "canvas");
  switch(GAME_STATE){
    case LOADING:
      console.log("loading..");
      loadAll();
      break;
    case RUNNING:
      playGame();
      break;
    case ENDGAME:
      endGame();
      break;
  }
  render();
}

function loadAll(){
  hero = Object.create(spriteObject);
  hero.width = 64;
  hero.height = 256;
  hero.x = 20;
  hero.y = ground_coord;
  hero.texture = "blue";
  hero.isOnGround = true;
  hero.isOnAir = true;
  hero.velocityX = 0;
  hero.velocityY = 0;
  hero.IDLE = 0;
  hero.RUNNING = 1;
  hero.STATE = RUNNING;
  hero.animationRate = 1;
  hero.animationTimer = 0;
  sprites.push(hero);
}

function playGame(){
  updateHero();
  updateObstacle();
  score++;
}

function updateHero(){
  if(jump && hero.isOnGround){
    heroJump();
    jump = false;
  }

  if(crouch && hero.isOnGround){
    heroCrouch();
  }

  if(!upKeyPressed){
    if(hero.velocityY < -10){
      hero.velocityY = -10;
    }
  }

  if(!downKeyPressed){
    hero.height = 64;
  }

  hero.y += hero.velocityY;
  hero.velocityY += gravity;

  if(hero.y >= ground_coord){
    hero.y = ground_coord;
    hero.velocityY = 0;
    hero.isOnGround = true;
  }

  //animation
  if(hero.STATE == hero.RUNNING){
    if(hero.currentFrame >= hero.numberOfFrames - 1){
      hero.currentFrame = 0;
    } else {
      hero.animationTimer++;
      if(hero.animationTimer > hero.animationRate){
        hero.animationTimer = 0;
        hero.currentFrame++;
      }
      hero.sourceX = (image.width / hero.numberOfFrames) * hero.currentFrame;
      console.log(hero.currentFrame);
      console.log(hero.sourceX);
    }
  }
}

function updateObstacle(){
  obstacleTimer ++;
  if(obstacleTimer > spawnRate){
    var obstacle = Object.create(spriteObject);
    obstacle.x = canvas.width + obstacle.width;
    obstacle.y = ground_coord;
    obstacle.velocityX = obstacleVelocity;
    obstacleTimer = 0;
    if(spawnRate > 40){
      spawnRate -= 15;
    }
    var additionalSpawnRate = Math.random() * 20;
    spawnRate += additionalSpawnRate;
    if(obstacleVelocity < 15){
      obstacleVelocity += 0.5;
    }
    obstacles.push(obstacle);
  }

  if(obstacles.length > 0){
    for(var i = 0;i < obstacles.length; i++){
      var currentObstacle = obstacles[i];
      currentObstacle.x -= currentObstacle.velocityX;
      if(currentObstacle.x < 0){
        obstacles.splice(i, 1);
      }
      var collided = collideRectangle(hero, currentObstacle);
      if(collided){
        GAME_STATE = ENDGAME;
      }
    }
  }

}

function collideRectangle(firstRectangle, secondRectangle){
  var vectorX = secondRectangle.centerX() - firstRectangle.centerX();
  var vectorY = secondRectangle.centerY() - firstRectangle.centerY();

  var combinedHalfWidth = firstRectangle.width/2 + secondRectangle.width/2;
  var combinedHalfHeight = firstRectangle.height/2 + secondRectangle.height/2;

  if(vectorX < combinedHalfWidth){
    if(vectorY < combinedHalfHeight){
      return true;
    }
  }
  return false;
}

function heroJump(){
  hero.velocityY = -20;
  hero.isOnGround = false;
}

function heroCrouch(){
  console.log("Crouching");
  hero.height = 32;
}

function render(){
  drawingSurface.fillStyle = "green";
  drawingSurface.fillRect(0, 0, canvas.width, canvas.height);
  drawingSurface.fillStyle = "blue";
  drawingSurface.fillRect(0, ground_coord + 64, canvas.width, canvas.height);
  for(var i = 0; i < sprites.length; i++){
    var currentSprite = sprites[i];
    if(currentSprite == hero){
      drawingSurface.drawImage(image, currentSprite.sourceX, currentSprite.sourceY, currentSprite.sourceWidth, currentSprite.sourceHeight, currentSprite.x, currentSprite.y, currentSprite.width, currentSprite.height);
      continue;
    }
  }
  for(i = 0; i < obstacles.length; i++){
    var currentObstacle = obstacles[i];
    drawingSurface.fillStyle = currentObstacle.texture;
    drawingSurface.fillRect(currentObstacle.x, currentObstacle.y, currentObstacle.width, currentObstacle.height);
  }
  if(herodied){
    drawingSurface.fillStyle = "blue";
    drawingSurface.font = "normal bolder 40px Helvetica";
    drawingSurface.textBaseline = "top";
    drawingSurface.fillText("Game Over", canvas.width/2 - 40*2, canvas.height/2);
  }
  drawingSurface.fillStyle = "blue";
  drawingSurface.font = "normal 20px Helvetica";
  drawingSurface.fillText("Score: " + score, canvas.width/2 - 30, 20);
}

function endGame(){
  herodied = true;
}
