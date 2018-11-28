class Mycoordinate{ 
    constructor(x, y){
        this.x = x; 
        this.y = y;
    }
};

class MapProducer{

    //地图数组为map，可以根据this.height，this.width调整长宽, 
    //var mp = new MapProducer(25, 35, 50, 1, 1, 5);
    //map的0指的是墙，1指的是能走的路，2指的是楼梯， 3指的是宝箱，4指的是敌人
    constructor(height, width, zero_possi, stairNUM, boxNum, enermyNUM){
        this.height     = height;//地图高度  default 25
        this.width      = width;//地图宽度   default 35
        this.ZEROPOSSI  = zero_possi;//初始化过程中生成墙的概率 default 50
        this.stairNUM   = stairNUM;//楼梯数量 default 1
        this.boxNUM     = boxNum;//宝箱数量 default 1
        this.enermyNUM  = enermyNUM;//敌人数量 default 5
        this.map        = new Array();//地图数组
        this.needBOX    = new Array();//箱子数组，存储坐标形式(x,y)，长度为boxNUM
        this.needSTAIR  = new Array();//楼梯数组
        this.needENERMY = new Array();//敌人数组

        this.MapIsChecked = new Array();//地图数组
        this.BlockNum = 0
        this.len = 0;
        this.BlockTree = new Array();
        this.pointer1 = 0;
        this.pointer2 = 0;
        this.EnermyPossiblePos = new Array();
        this.BoxPossiblePos = new Array();
        this.StairPossiblePos = new Array();
        this.initialize();
    };

    max(a, b) { if (a > b) return a; else return b; }
    min(a, b) { if (a < b) return a; else return b; }
    abs(a) { if (a < 0) return -a; else return a; }
    normalizearr(arr, origin) {
        for (var x = 0; x < this.height; x++)
            for (var y = 0; y < this.width; y++)
                arr[x][y] = origin;
    }
    ZeroPossi(zero_possi) {
        //生成地图时要设置黑色或者白色出现的概率
        //0 is wall,1 is road
        var x = Math.floor(Math.random() * 100);
        if (x <= zero_possi) {
            return 0;
        } else {
            return 1;
        }
    }
    initialize(){
        for (var x = 0; x < this.height; x++) {
            this.map[x] = new Array(); this.MapIsChecked[x] = new Array();
            for (var y = 0; y < this.width; y++) {
                if (x == 0 || y == 0 || x == this.height - 1 || y == this.width - 1) this.map[x][y] = 0;
                else this.map[x][y] = this.ZeroPossi(this.ZEROPOSSI);
                this.MapIsChecked[x][y] = 0;
            }
        }
        this.BlockTree[this.BlockNum] = new Array();
    }

        
    //这个部分是在地图上显示黑白地图，由于没用注释掉
    /*
    function draw_line(v) {
    //生成零一数组后对指定位置(小方块）进行黑白填色，返回map数组的某一行元素
        var square = document.createElement("div");
        square.style.cssFloat = "left";
        square.style.this.width = 8;
        square.style.this.height = 8;
        if (v == 1)
            square.style.backgroundColor = "white";
        else if (v == 0)
            square.style.backgroundColor = "black";
        else if (v == 2)
            square.style.backgroundColor = "red";
        else if (v == 3)
            square.style.backgroundColor = "yellow";
        else if (v == 4)
            square.style.backgroundColor = "blue";
        square.style.border = ("1px solid #C0C0C0");
        return square;
    }
    function draw_square(arr) {
    //大方块填充，将map数组的每一行拼接起来
        for (var y = 0; y < this.width; y++) {
            var line = document.createElement("div");
            line.style.this.width = 10 * this.height;
            for (var x = 0; x < this.height; x++)
                line.appendChild(draw_line(arr[x][y]));
            document.body.appendChild(line);
        }
    }
    */
    //扩充白色区域
    BiggerWhite() {
        this.normalizearr(this.MapIsChecked, 0);
        for (var x = 0; x < this.height; x++) {
            for (var y = 0; y < this.width; y++) {
                if (this.map[x][y] == 1 && this.MapIsChecked[x][y] == 0) {
                    this.MapIsChecked[x][y] = 1;
                    for (var i = x - 1; i <= x + 1; i++) {
                        if (i < 0 || i >= this.height) continue;
                        for (j = y - 1; j <= y + 1; j++) {
                            if (j < 0 || j >= this.width) continue;
                            this.map[i][j] = this.MapIsChecked[i][j]=1;
                        }
                    }
                }
            }
        }
    }

    //接下来这个部分是将杂乱生成的随机黑白图变得趋近于洞穴
    CountWallSurround(arr, pos_x, pos_y, CountWidth) {
        //统计地图中，以某个位置的方块为圆心，this.width为半径的区域内有多少墙
        var count = 0;
        for (var i = pos_x - CountWidth; i <= pos_x + CountWidth; i++) {
            if (i < 0 || i >= this.height) continue;
            for (var j = pos_y - CountWidth; j <= pos_y + CountWidth; j++) {
                if (j < 0 || j >= this.width) continue;
                count += arr[i][j];
            }
        }
        return count;
    }
    TrueCountWallSurround(arr, pos_x, pos_y, CountWidth) {
        //统计地图中，以某个位置的方块为圆心，this.width为半径的区域内有多少墙
        var count = 0;
        for (var i = pos_x - CountWidth; i <= pos_x + CountWidth; i++) {
            if (i < 0 || i >= this.height) continue;
            for (var j = pos_y - CountWidth; j <= pos_y + CountWidth; j++) {
                if (j < 0 || j >= this.width) continue;
                count += !arr[i][j];
            }
        }
        return count;
    }
    ChangeMap(posx, posy) {
        //生成地图后对其进行操作使之更加逼近洞穴
        //对于一个方块，如果周围方块中墙的数量超过某个值，则其变成方块；反之，变成道路
        //暂时性地图数组，以防函数中同时修改map的值和检查map墙的数量
        var TempMap = new Array();
        for (var x = 0; x < this.height; x++) {
            TempMap[x] = new Array();
            for (var y = 0; y < this.width; y++)
                TempMap[x][y] = this.map[x][y];
        }
        for (var x = 0; x < this.height; x++) {
            for (var y = 0; y < this.width; y++) {
                var WallSurround = this.CountWallSurround(this.map, x, y, 1);
                if (TempMap[x][y] == 0) TempMap[x][y] = (WallSurround >= 4) ? 0 : 1;
                else TempMap[x][y] = (WallSurround >= 5) ? 0 : 1;
            }
        }
        this.map = TempMap;
    }
    //接下来这部分是将较小的联通区域填充为墙
    //接下来这部分是将较小的联通区域填充为墙
    //接下来这部分是将较小的联通区域填充为墙
    //首先要定义函数CountConnectedBlock返回包含某个方块的联通块有多大
    //自然地，在检查的时候要用到向四个方向递归搜索的算法
    //检查过的要将对应的this.MapIsChecked掷为true，防止重复递归
    //统计联通块大小的函数
    //else体里面说明map中的[posx,posy]为路，则将其设为检查过
    //返回四个方向的联通块个数
    CountConnectBlock(posx, posy) {
        if (posx < 0 || posx >= this.height || posy < 0 || posy >= this.width || this.map[posx][posy] == 0 || this.MapIsChecked[posx][posy] == true) return 0;
        else {
            this.MapIsChecked[posx][posy] = true;
            return 1 + this.CountConnectBlock(posx - 1, posy) + this.CountConnectBlock(posx + 1, posy) + this.CountConnectBlock(posx, posy - 1) + this.CountConnectBlock(posx, posy + 1);
        }
    }
    //将包含(posx,posy)的联通块填充的函数
    BlockFill(posx, posy) {
        if (posx < 0 || posx >= this.height || posy < 0 || posy >= this.width || this.map[posx][posy] == 0) return 0;
        else {
            this.map[posx][posy] = 0;
            return this.BlockFill(posx - 1, posy) + this.BlockFill(posx + 1, posy) + this.BlockFill(posx, posy - 1) + this.BlockFill(posx, posy + 1);
        }
    }
    //检索map填充block
    CheckAndFill(size_atleast) {
        this.normalizearr(this.MapIsChecked, 0);
        for (var x = 0; x < this.height; x++) {
            for (var y = 0; y < this.width; y++) {
                if (this.map[x][y] == 1 && this.MapIsChecked[x][y] == false) {
                    if (this.CountConnectBlock(x, y) < size_atleast) this.BlockFill(x, y);
                }
            }
        }
    }
    //接下这部分使用bezier连接各个不相连的block
    //接下这部分使用bezier连接各个不相连的block
    //接下这部分使用bezier连接各个不相连的block
    //首先建立this.BlockTree储存block，this.BlockNum表示存在的Blocks的个数
    //AddNode就是把某个像素块添加到所属的this.BlockTree中，每个Block有自己的编号

    
    AddNode(posx, posy) {
        if (posx < 0 || posx >= this.height || posy < 0 || posy >= this.width || this.map[posx][posy] == 0 || this.MapIsChecked[posx][posy] == true) return 0;
        else {
            this.MapIsChecked[posx][posy] = 1;
            this.BlockTree[this.BlockNum][this.len] = new Mycoordinate(posx, posy);
            this.len++;
            return this.AddNode(posx - 1, posy) + this.AddNode(posx + 1, posy) + this.AddNode(posx, posy - 1) + this.AddNode(posx, posy + 1);
        }
    }
    BuildTree() {
        this.normalizearr(this.MapIsChecked, 0);
        for (var x = 0; x < this.height; x++) {
            for (var y = 0; y < this.width; y++)
                if (this.map[x][y] == 1 && this.MapIsChecked[x][y] == false) { this.AddNode(x, y); this.BlockTree[++this.BlockNum] = new Array(); this.len = 0; }
        }
    }
    bezeier(p1, p2, p0, arr) {
        var xtp = Math.round(p1.x), xt, ytp = Math.round(p1.y), yt;
        for (var t = 0; t <= 1; t += 0.005) {
            xt = (1 - t) * (1 - t) * p1.x + 2 * t * (1 - t) * p0.x + t * t * p2.x;
            yt = (1 - t) * (1 - t) * p1.y + 2 * t * (1 - t) * p0.y + t * t * p2.y;
            xt = Math.round(xt), yt = Math.round(yt);
            //console.log(t, xt, yt);
            arr[xt][yt] = 1;
            if (xt > 0 && xt < this.height - 1 && yt > 0 && yt < this.width - 1) {
                arr[xt + 1][yt - 1] = 1;
                arr[xt][yt - 1] = 1;
                arr[xt + 1][yt] = 1;
                arr[xt + 1][yt + 1] = 1;
            }
        }
    }
    UnitBlock() {
        this.BuildTree();
        if (this.BlockNum < 2) return 0;
        //将编号为i和i+1的区域块联通
        for (var i = 0; i < this.BlockNum - 1; i++) {
            var pick_1 = this.BlockTree[i].pop();
            var pick_2 = this.BlockTree[i + 1].pop();
            //连接pick_1和pick_2
            var p0 = new Mycoordinate();
            var x1 = pick_1.x, y1 = pick_1.x, x2 = pick_2.x, y2 = pick_2.y;
            var x0, y0;
            if (x1 != this.min(x1, x2)) { var c = x1; x1 = x2; x2 = c; c = y1; y1 = y2; y2 = c; }
            x0 = x1, y0 = y2;
            if (x2 - x1 <= 3 && this.abs(y2 - y1) <= 3) { }
            else if (x2 - x1 <= 4) {
                if (x1 < this.height - x2) { x0 += (this.height - x2 - 3) };
                if (x1 >= this.height - x2) x0 = 3;
            }
            else if (this.abs(y2 - y1) <= 4) {
                var y22 = y2, y11 = y1;
                if (y11 > y22) { var c = y11; y11 = y22; y22 = c; }
                if (y11 < this.width - y22) { y0 += (this.height - y22 - 3) };
                if (y11 >= this.width - y22) y0 = 3;
            }
            p0.x = x0; p0.y = y0;
            this.bezeier(pick_1, pick_2, p0, this.map);
            this.BlockTree[i].push(pick_1); this.BlockTree[i + 1].push(pick_2);
        }
    }

    CheckSpecificPos(arr) {
        for (var i = 0; i < this.height; i++) {
            for (var j = 0; j < this.width; j++) {
                if (arr[i][j] && this.TrueCountWallSurround(arr, i, j, 1) == 0) {
                    this.EnermyPossiblePos[this.pointer1] = this.BoxPossiblePos[this.pointer1] = new Mycoordinate(i, j);
                    this.pointer1++;
                }
                else if (arr[i][j] && this.TrueCountWallSurround(arr, i, j, 1) == 3)
                    this.StairPossiblePos[this.pointer2++] = new Mycoordinate(i, j);
            }
        }
    }
    produceENERMY(arr) {
        var ispicked = new Array();
        for (var i = 0; i <= this.pointer1; i++)ispicked[i] = 0;
        for (var i = 0; i < this.enermyNUM; i++) {
            var index = Math.floor(Math.random() * this.pointer1);
            if (!ispicked[index]) {
                ispicked[index] = 0;
                var x_pos = this.EnermyPossiblePos[index].x;
                var y_pos = this.EnermyPossiblePos[index].y;
                this.needENERMY[i] = new Mycoordinate(x_pos, y_pos);
                arr[x_pos][y_pos] = 4;
            }
            else {
                i--;
            }
        }
    }
    produceBOX(arr) {
        var ispicked = new Array();
        for (var i = 0; i <= this.pointer1; i++)ispicked[i] = 0;
        for (var i = 0; i < this.boxNUM; i++) {
            var index = Math.floor(Math.random() * this.pointer1);
            if (!ispicked[index]) {
                ispicked[index] = 0;
                var x_pos = this.BoxPossiblePos[index].x;
                var y_pos = this.BoxPossiblePos[index].y;
                this.needBOX[i] = new Mycoordinate(x_pos, y_pos);
                arr[x_pos][y_pos] = 3;
            }
            else {
                i--;
            }
        }
    }
    produceSTAIR(arr) {
        var ispicked = new Array();
        for (var i = 0; i <= this.pointer2; i++)ispicked[i] = 0;
        for (var i = 0; i < this.stairNUM; i++) {
            var index = Math.floor(Math.random() * this.pointer2);
            if (!ispicked[index]) {
                ispicked[index] = 0;
                var x_pos = this.StairPossiblePos[index].x;
                var y_pos = this.StairPossiblePos[index].y;
                this.needSTAIR[i] = new Mycoordinate(x_pos, y_pos);
                arr[x_pos][y_pos] = 2;
            }
            else {
                i--;
            }
        }
    }
    //总函数, 可以重置台阶数量，箱子数量以及怪物数量
    produceMap(stairNUM, boxNum, enermyNUM) {
        if(stairNUM){
            this.stairNUM = stairNUM;
        }
        if(boxNum){
            this.boxNUM = boxNum;
        }
        if(enermyNUM){
            this.enermyNUM = enermyNUM;
        }
        
        var startx = Math.floor(this.height / 2), starty = Math.floor(this.width / 2);
        this.ChangeMap(startx, starty);
        this.ChangeMap(startx, starty);
        this.ChangeMap(startx, starty);
        this.ChangeMap(startx, starty);
        //draw_square(map);
        this.CheckAndFill(35);
        //draw_square(map);
        this.UnitBlock();

        this.CheckSpecificPos(this.map);
        this.produceENERMY(this.map);
        this.produceBOX(this.map);
        this.produceSTAIR(this.map);
    }
}