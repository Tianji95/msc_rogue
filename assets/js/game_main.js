var type = "WebGL";
if (!PIXI.utils.isWebGLSupported()) {
    type = "canvas";
}
PIXI.utils.sayHello(type);

var renderer  = PIXI.autoDetectRenderer(512, 512);
var stage     = new PIXI.Container();
//var keyObject = keyboard(asciiKeyCodeNumber);

document.body.appendChild(renderer.view);  
PIXI.loader.add("assets/img/treasureHunter.json").load(setup);


// keyObject.press = () => {
//   //key object pressed
// };
// keyObject.release = () => {
//   //key object released
// };

setup();

function setup() {

  gameScene = new PIXI.Container();
  stage.addChild(gameScene);

  // 获取所有加载的素材
  id = PIXI.loader.resources["assets/img/treasureHunter.json"].textures;
  // 获取地牢素材并创建对应的 sprite
  dungeon = new PIXI.Sprite(id["dungeon.png"]);
  // 添加到场景中
  gameScene.addChild(dungeon);
  // 添加门
  door = new PIXI.Sprite(id["door.png"]);
  door.position.set(32, 0);
  gameScene.addChild(door);
  // 添加探险家
  explorer = new PIXI.Sprite(id["explorer.png"]);
  explorer.x = 68;
  explorer.y = gameScene.height / 2 - explorer.height / 2;
  explorer.vx = 0;
  explorer.vy = 0;
  gameScene.addChild(explorer);
  // 添加宝箱
  treasure = new PIXI.Sprite(id["treasure.png"]);
  treasure.x = gameScene.width - treasure.width - 48;
  treasure.y = gameScene.height / 2 - treasure.height / 2;
  gameScene.addChild(treasure);

  var numberOfBlobs = 6,
      spacing = 48,   // 怪物之间的间隔
      xOffset = 150,  // x 坐标 offset
      speed = 2,      // 运动时的速度
      direction = 1;  // 运动方向

  blobs = [];

  for (var i = 0; i < numberOfBlobs; i++) {
      var blob = new PIXI.Sprite(id["blob.png"]);

      var x = spacing * i + xOffset;

      var y = randomInt(0, stage.height - blob.height);   // randomInt 随机生成指定范围的整数，自定义

      blob.x = x;
      blob.y = y;

      blob.vy = speed * direction;

      direction *= -1;

      blobs.push(blob);

      gameScene.addChild(blob);
  }

  // 添加血条,创建一个容器
  healthBar = new PIXI.Container();
  healthBar.position.set(stage.width - 170, 6);
  gameScene.addChild(healthBar);
  // 添加底层黑色矩形，在血条不断降低时显示这个
  var innerBar = new PIXI.Graphics();
  innerBar.beginFill(0x000000);
  innerBar.drawRect(0, 0, 128, 8);
  innerBar.endFill();
  healthBar.addChild(innerBar);
  // 添加外层红色血条
  var outerBar = new PIXI.Graphics();
  outerBar.beginFill(0xFF3300);
  outerBar.drawRect(0, 0, 128, 8);
  outerBar.endFill();
  healthBar.addChild(outerBar);
  // 设置为外层
  healthBar.outer = outerBar;


  // 创建 `gameOverScene` 组
  gameOverScene = new PIXI.Container();
  gameOverScene.visible = false;

  stage.addChild(gameOverScene);

  // 添加 game over 提示语
  message = new PIXI.Text(
      "The End!",
      {fontFamily: "64px Futura", fill: "white"}
  );

  message.x = 120;
  message.y = stage.height / 2 - 32;

  gameOverScene.addChild(message);


  // 渲染舞台，暂时为了查看效果，后面会把这个移到其他的地方
  renderer.render(stage);

  state = play;
  keyboardListener();
  gameLoop();
}

function gameLoop() {
  requestAnimationFrame(gameLoop);
  // 通过改变 state 的不同值，达到切换状态的目的
  state();
  renderer.render(stage);
}



function play() {
  var explorerHit= false;
  explorer.x += explorer.vx;
  explorer.y += explorer.vy;
  contain(explorer, {x: 28, y: 10, width: 488, height: 480});

  blobs.forEach(function (blob) {
      blob.y += blob.vy;
      var blobHitsWall = contain(blob, {x: 28, y: 10, width: 488, height: 480});
      if (blobHitsWall === "top" || blobHitsWall === "bottom") {
          blob.vy *= -1;
      }
      // 如果探险家和怪物发生碰撞后，explorerHit 为 true
      if (hitTestRectangle(explorer, blob)) {
          explorerHit = true;
      }
  });

  if (explorerHit) {
      // 探险家透明度变为一半
      explorer.alpha = 0.5;
      // 血条不断下降
      healthBar.outer.width -= 1;
  } else {
      explorer.alpha = 1;
  }
  // 如果探险家碰撞到宝箱，则把探险家和宝箱绑定到一起
  if (hitTestRectangle(explorer, treasure)) {
      treasure.x = explorer.x + 8;
      treasure.y = explorer.y + 8;
  }
  // 如果宝箱碰到门后，则停止游戏，显示胜利
  if (hitTestRectangle(treasure, door)) {
      state = stop;
      message.text = "You won!";
  }
  // 如果血条下降为0后，停止游戏，显示失败.
  if (healthBar.outer.width < 0) {
      state = stop;
      message.text = "You lost!";
  }
}
function stop() {
  // 游戏结束处理逻辑
  gameScene.visible = false;
  gameOverScene.visible = true;
}


function contain(sprite, container) {

  var collision = undefined;

  // 如果 sprite 的 x 坐标小于控制范围的 x 坐标，这个时候判定 sprite 已经运动到最左边，x坐标等于控制范围的 x 坐标，并输出这个时候的冲突方向为 left
  if (sprite.x < container.x) {
      sprite.x = container.x;
      collision = "left";
  }

  //Top
  if (sprite.y < container.y) {
      sprite.y = container.y;
      collision = "top";
  }

  //Right
  if (sprite.x + sprite.width > container.width) {
      sprite.x = container.width - sprite.width;
      collision = "right";
  }

  //Bottom
  if (sprite.y + sprite.height > container.height) {
      sprite.y = container.height - sprite.height;
      collision = "bottom";
  }

  //Return the `collision` value
  return collision;
}

function keyboardListener(){
  // 添加按键监听
  var left = keyboard(37),
  up = keyboard(38),
  right = keyboard(39),
  down = keyboard(40);

  // 当按键按下时，设置速度为 -5 px
  left.press = function () {
  explorer.vx = -5;
  explorer.vy = 0;
  };
  // 当按键释放时，如果其他按键没有按下，设置速度为 0 
  left.release = function () {
  if (!right.isDown && explorer.vy === 0) {
      explorer.vx = 0;
  }
  };

  up.press = function () {
  explorer.vy = -5;
  explorer.vx = 0;
  };
  up.release = function () {
  if (!down.isDown && explorer.vx === 0) {
      explorer.vy = 0;
  }
  };

  right.press = function () {
  explorer.vx = 5;
  explorer.vy = 0;
  };
  right.release = function () {
  if (!left.isDown && explorer.vy === 0) {
      explorer.vx = 0;
  }
  };

  down.press = function () {
  explorer.vy = 5;
  explorer.vx = 0;
  };
  down.release = function () {
  if (!up.isDown && explorer.vx === 0) {
      explorer.vy = 0;
  }
  };
}


function hitTestRectangle(r1, r2) {

  var hit, combinedHalfWidths, combinedHalfHeights, vx, vy;
  // 默认没有碰撞
  hit = false;

  // 获取两个 sprite 的中心点在x,y轴上的值
  r1.centerX = r1.x + r1.width / 2;
  r1.centerY = r1.y + r1.height / 2;
  r2.centerX = r2.x + r2.width / 2;
  r2.centerY = r2.y + r2.height / 2;

  //获取 sprite 的半宽或半高
  r1.halfWidth = r1.width / 2;
  r1.halfHeight = r1.height / 2;
  r2.halfWidth = r2.width / 2;
  r2.halfHeight = r2.height / 2;

  // 计算两个 sprite 的 x y 轴的距离
  vx = r1.centerX - r2.centerX;
  vy = r1.centerY - r2.centerY;

  // 计算两个 sprite 的半宽之和及半高之和
  combinedHalfWidths = r1.halfWidth + r2.halfWidth;
  combinedHalfHeights = r1.halfHeight + r2.halfHeight;

  // 首先判断 x 轴方面，如果 x 轴中心点距离小于两个 sprit 的半宽和，则判断 y 轴方面
  if (Math.abs(vx) < combinedHalfWidths) {

      // 如果 y 轴方面半宽和也小于 y 轴中心点的距离，则判定为碰撞
      hit = Math.abs(vy) < combinedHalfHeights;
  } else {

      // 否则没有发生碰撞
      hit = false;
  }

  return hit;
}