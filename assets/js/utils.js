function randomInt(minN, maxN){
    return Math.floor(Math.random() * (maxN - minN + 1)) + minN;
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
