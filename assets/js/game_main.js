//global variable, global variable must be defined here!!!!!
//!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
//所有文件的全局变量必须在这里定义，否则不同文件会造成全局变量污染！！！！！

var KEY_LEFT  = 37;
var KEY_UP    = 38;
var KEY_RIGHT = 39;
var KEY_DOWN  = 40;

var GAME_STATE   = GameStart;
var WAIT_TIME    = 0;
var SCENE        = "title";
var SCENE_STATE  = 0;
var Chara_Rachel = 0;
var TYPE         = "WebGL";
var HEIGHT       = window.screen.availHeight;
var WIDTH        = window.screen.availWidth;
var IMG_WIDTH    = 64;
var IMG_HEIGHT   = 64;


if (!PIXI.utils.isWebGLSupported()) {
    TYPE = "canvas";
}
PIXI.utils.sayHello(TYPE);

var RENDERER         = PIXI.autoDetectRenderer(WIDTH, HEIGHT);
var STAGE            = new PIXI.Container();
var GAME_SCENE       = new PIXI.Container();
var GAME_OVER_SCENE  = new PIXI.Container();
var GAME_START_SCENE = new PIXI.Container();

document.body.appendChild(RENDERER.view);  

PIXI.loader.add([
            "assets/img/Chara_Rachel.png",
            "assets/img/Game_Start.png",
            "assets/img/Game_Over.png",
            "assets/img/Game_Restart.png",
            "assets/img/Tile_Ground.png",
            "assets/img/Tile_Lava.png",
            "assets/img/Tile_Wall.png",
            "assets/img/Tile_Water.png",
            "assets/img/Chara_Enemy1.png",
            "assets/img/Chara_Enemy2.png",
            "assets/img/Chara_Enemy3.png",
            "assets/img/Chara_Enemy4.png",
            "assets/img/Chara_Enemy5.png",
            "assets/img/Chara_Enemy6.png",
            "assets/img/Chara_Enemy7.png",
            "assets/img/Chara_Enemy8.png"])
            .add('back_music1',   'assets/music/Komiku_-_03_-_Mushrooms.mp3')
           .load(Setup);

function Setup() {

  STAGE.addChild(GAME_SCENE);
  STAGE.addChild(GAME_START_SCENE);
  STAGE.addChild(GAME_OVER_SCENE);

  for(var w = 0; w < WIDTH / IMG_WIDTH; w++){
    for(var h = 0; h < HEIGHT / IMG_HEIGHT; h++){
      var maptile = new PIXI.Sprite(PIXI.loader.resources["assets/img/Tile_Ground.png"].texture);
      maptile.x = w * IMG_WIDTH;
      maptile.y = h * IMG_HEIGHT;
      GAME_SCENE.addChild(maptile);
    }
  }

  Chara_Rachel = new PIXI.Sprite(PIXI.loader.resources["assets/img/Chara_Rachel.png"].texture);
  Chara_Rachel.x = 0;
  Chara_Rachel.y = 0;
  Chara_Rachel.vx = 0;
  Chara_Rachel.vy = 0;
  GAME_SCENE.addChild(Chara_Rachel);
  RENDERER.render(STAGE);

  GAME_STATE = GameStart;
  PIXI.sound.play('back_music1');
  KeyboardListener();
  //MouseListener();

  //延迟加载，减少初始化时间
  PIXI.loader.add('back_music2',   'assets/music/Komiku_-_09_-_Glouglou.mp3')
             .add('back_music3',   'assets/music/Rolemusic_-_01_-_Spell.mp3')
             .add('back_music4',   'assets/music/Rolemusic_-_01_-_The_White_Kitty.mp3')
             .add('back_music5',   'assets/music/Rolemusic_-_04_-_The_Black_Kitty.mp3')
             .add('back_music6',   'assets/music/Rolemusic_-_09_-_The_Little_Broth.mp3')
             .add('attack_music1', 'assets/sound_effect/SE_Attack1.wav')
             .add('attack_music2', 'assets/sound_effect/SE_Attack2.wav')
             .add('item_music',    'assets/sound_effect/SE_Item.wav')
             .add('levelup_music', 'assets/sound_effect/SE_Levelup.wav')
             .add('skill_music',   'assets/sound_effect/SE_Skill.wav')
             .add('step_music',    'assets/sound_effect/SE_Step.wav');

  GameLoop();
}

function GameLoop() {
  requestAnimationFrame(GameLoop);
  GAME_STATE(); // 通过改变 state 的不同值，达到切换状态的目的
  UpdateRender();
}

function GameStart(){
  var startButton = new PIXI.Sprite(PIXI.loader.resources["assets/img/Game_Start.png"].texture);
  startButton.buttonMode = true;
  startButton.interactive = true;
  startButton.x = WIDTH / 2;
  startButton.y = HEIGHT / 2;
  startButton.on('pointerdown', onStartButtonClick)
  
  GAME_START_SCENE.addChild(startButton);

  GAME_START_SCENE.visible = true;
  GAME_SCENE.visible       = false;
  GAME_OVER_SCENE.visible  = false;
}


function GamePlay() {
  Chara_Rachel.x += Chara_Rachel.vx;
  Chara_Rachel.y += Chara_Rachel.vy;
  contain(Chara_Rachel, {x: 28, y: 10, width: WIDTH, height: HEIGHT});

  var gameOverButton = new PIXI.Sprite(PIXI.loader.resources["assets/img/Game_Over.png"].texture);
  gameOverButton.buttonMode = true;
  gameOverButton.interactive = true;
  gameOverButton.x = WIDTH / 2;
  gameOverButton.y = HEIGHT / 2;
  gameOverButton.on('pointerdown', onGameOverButtonClick)
  GAME_SCENE.addChild(gameOverButton);

  GAME_START_SCENE.visible = false;
  GAME_SCENE.visible       = true;
  GAME_OVER_SCENE.visible  = false;
}

function GameOver() {
  // 游戏结束处理逻辑
  // 添加 game over 提示语
  message = new PIXI.Text(
      "The End!",
      {fontFamily: "64px Futura", fill: "white"}
  );
  message.x = 120;
  message.y = STAGE.height / 2 - 32;

  var gameRestartButton = new PIXI.Sprite(PIXI.loader.resources["assets/img/Game_Restart.png"].texture);
  gameRestartButton.buttonMode = true;
  gameRestartButton.interactive = true;
  gameRestartButton.x = WIDTH / 2;
  gameRestartButton.y = HEIGHT / 2;
  gameRestartButton.on('pointerdown', onGameRestartButtonClick)
  GAME_OVER_SCENE.addChild(gameRestartButton);

  GAME_OVER_SCENE.addChild(message);
  GAME_START_SCENE.visible = false;
  GAME_SCENE.visible       = false;
  GAME_OVER_SCENE.visible  = true;

}

function UpdateRender()
{
    RENDERER.render(STAGE);
}