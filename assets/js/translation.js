

var translationData = []

function translationAdd(obj, propName, deltaValue, duration)
{
	var tdata = {}
	tdata.obj = obj;
	tdata.action = function(t){ obj[propName] += deltaValue };
	tdata.timer = 0;
	tdata.tmax = duration;
	translationData.push(tdata);
}

function translationAddWithFinal(obj, propName, final, duration)
{
	var initial = obj[propName];
	var tdata = {}
	tdata.obj = obj;
	tdata.action = function(t){ obj[propName] = initial + (final - initial) * t / tdata.tmax; };
	tdata.timer = 0;
	tdata.tmax = duration;
	translationData.push(tdata);
}

function translationAddWithFunc(obj, func, duration)
{
	var tdata = {}
	tdata.obj = obj;
	tdata.action = func;
	tdata.timer = 0;
	tdata.tmax = duration;
	translationData.push(tdata);
}

function translationUpdate()
{
	for(var i = 0; i < translationData.length; ++i) {
		td = translationData[i];
		td.timer++;
		td.action(td.timer);
	}

	translationData = translationData.filter(function(td, idx) {
		return td.timer < td.tmax;
	});
}

// 使用方法 ============================================================
// obj1 = {x: 0, y: 0};
//
// 参数：对象，属性名称，每帧变化量，总的变化帧数
// translationAdd(obj1, "x", 1, 5);
// 或
// 参数：对象，属性名称，变化结束后的值，变化帧数
// translationAddWithFinal(obj1, "x", 5, 5);
// 或
// 参数：对象，每帧的操作函数，变化帧数
// translationAddWithFunc(obj1, function(t){ obj1.x = Math.pow(t, 2); }, 5);
//
// for(var frame = 0; frame < 10; ++frame) {
// 	translationUpdate();
//	console.log(translationData.length);
//	console.log(obj1.x);
//	console.log("==============");
//}
// ======================================================================