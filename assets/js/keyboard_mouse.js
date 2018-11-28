function keyboard(keyCode) {
    let key = {};
    key.code = keyCode;
    key.isDown = false;
    key.isUp = true;
    key.press = undefined;
    key.release = undefined;
    //The `downHandler`
    key.downHandler = event => {
      if (event.keyCode === key.code) {
        if (key.isUp && key.press) key.press();
        key.isDown = true;
        key.isUp = false;
      }
      event.preventDefault();
    };
  
    //The `upHandler`
    key.upHandler = event => {
      if (event.keyCode === key.code) {
        if (key.isDown && key.release) key.release();
        key.isDown = false;
        key.isUp = true;
      }
      event.preventDefault();
    };
  
    //Attach event listeners
    window.addEventListener(
      "keydown", key.downHandler.bind(key), false
    );
    window.addEventListener(
      "keyup", key.upHandler.bind(key), false
    );
    return key;
}

function KeyboardListener(){
  // 添加按键监听
  var left  = keyboard(KEY_LEFT),
      up    = keyboard(KEY_UP),
      right = keyboard(KEY_RIGHT),
      down  = keyboard(KEY_DOWN);

  left.press = function () {
    Chara_Rachel.vx = -5;
    Chara_Rachel.vy = 0;
    Chara_Rachel.direction = DIRECTION_LEFT;
  };
  left.release = function () {
    if (!right.isDown && Chara_Rachel.vy === 0) {
        Chara_Rachel.vx = 0;
    }
  };

  up.press = function () {
    Chara_Rachel.vy = -5;
    Chara_Rachel.vx = 0;
    Chara_Rachel.direction = DIRECTION_UP;
  };
  up.release = function () {
  if (!down.isDown && Chara_Rachel.vx === 0) {
    Chara_Rachel.vy = 0;
  }
  };

  right.press = function () {
    Chara_Rachel.vx = 5;
    Chara_Rachel.vy = 0;
    Chara_Rachel.direction = DIRECTION_RIGHT;
  };
  right.release = function () {
  if (!left.isDown && Chara_Rachel.vy === 0) {
    Chara_Rachel.vx = 0;
  }
  };

  down.press = function () {
    Chara_Rachel.vy = 5;
    Chara_Rachel.vx = 0;
    Chara_Rachel.direction = DIRECTION_DOWN;
  };
  down.release = function () {
    if (!up.isDown && Chara_Rachel.vx === 0) {
        Chara_Rachel.vy = 0;
    }
  };
}

function onStartButtonClick(){

  GAME_STATE = GamePlay;
}
function onGameOverButtonClick(){
  GAME_STATE = GameOver;
}
function onGameRestartButtonClick(){
  GAME_STATE = GameStart;
}