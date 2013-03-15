/*jslint browser:true */
/**
 * [ description]
 * @param  {[type]} my){  "use strict";	var my = {};	return my;} ( ChessBoard || {} ) [description]
 * @return {[type]}
 */
var Chess = (function (my) {
	"use strict";
	var ctx,
		canvas,
		showNum = false, //show number on chessman
		cSteps,          //stack of chessman
		cBoard,          //state array of board 
		cType = 1,       //chessman default is Black
		margin = 30,     //margin for chessboard
		padding = 15,    //padding for chessboard
		lineCount = 15,  //line count of chessboard
		cHeight = 350,   //canvas height
		cWidth = 550;    //canvas width
	/**
	 * [CHESSTYPE 棋子类型]
	 * @type {Object}
	 */
	my.CHESSTYPE = {
		BLACK : 1,
		WHITE : 2,
		SMALL : 3,
		NONE : 0
	};
	/**
	 * [Stone 棋子类]
	 * @param {int} x    [x坐标]
	 * @param {int} y    [y坐标]
	 * @param {chesstype} type [棋子类型]
	 */
	function Stone(x, y, type, step) {
		this.x = x;
		this.y = y;
		this.type = type || 0;
		this.step = step || -1;
		this.postion = x * lineCount + y;
	}
	/**
	 * [relMouseCoords 获取鼠标在canvas中的相对位置]
	 * @param  {event} event [鼠标点击事件]
	 * @return {object}       [x:postionx,y:postiony]
	 */
	function relMouseCoords(event) {
	    var totalOffsetX = 0, totalOffsetY = 0, canvasX = 0, canvasY = 0, posx = 0, posy = 0, currentElement = canvas;

	    do {
	        totalOffsetX += currentElement.offsetLeft - currentElement.scrollLeft;
	        totalOffsetY += currentElement.offsetTop - currentElement.scrollTop;
	        currentElement = currentElement.offsetParent;
	    } while (currentElement);

		if (event.pageX || event.pageY) {
			posx = event.pageX;
			posy = event.pageY;
		} else if (event.clientX || event.clientY) {
			posx = event.clientX + document.body.scrollLeft + document.documentElement.scrollLeft;
			posy = event.clientY + document.body.scrollTop + document.documentElement.scrollTop;
		}

	    canvasX = posx - totalOffsetX;
	    canvasY = posy - totalOffsetY;

	    return {x: canvasX, y: canvasY};
	}
	/**
	 * [drawLine 绘制清晰线]
	 * @param  {[type]} x1 [起点x]
	 * @param  {[type]} x2 [起点Y]
	 * @param  {[type]} x3 [终点x]
	 * @param  {[type]} x4 [终点y]
	 */
	function drawLine(x1, x2, x3, x4) {
		x1 = 0.5 + Math.round(x1);
		x2 = 0.5 + Math.round(x2);
		x3 = 0.5 + Math.round(x3);
		x4 = 0.5 + Math.round(x4);
		ctx.moveTo(x1, x2);
		ctx.lineTo(x3, x4);
	}
	/**
	 * [getPostion 获取棋子棋盘坐标,左下为元点]
	 * @param  {int} posx [屏幕x坐标]
	 * @param  {int} posy [屏幕y坐标]
	 * @return {[int, int]}      [棋盘x坐标,棋盘y坐标]
	 */
	function getRealPostion(posx, posy) {
		var realx, realy, interv;
		interv = (cHeight - (margin + padding) * 2) / (lineCount - 1);
		realx = Math.round((posx - (margin + padding)) / interv);
		realy = Math.round((posy - (margin + padding)) / interv);
		return [realx, realy];
	}
	/**
	 * [getProjPostion 从棋盘坐标投影真实坐标]
	 * @param  {int} posx [棋盘x坐标]
	 * @param  {int} posy [棋盘y坐标]
	 * @return {[int,int]}      [真实x坐标,真实y坐标]
	 */
	function getProjPostion(posx, posy) {
		var projx, projy, interv;
		interv = (cHeight - (margin + padding) * 2) / (lineCount - 1);
		projx = posx * interv + margin + padding;
		projy = posy * interv + margin + padding;
		return [projx, projy];
	}
	/**
	 * [drawChess 绘制棋子]
	 * @param  {number} x    [棋子横坐标]
	 * @param  {number} y    [棋子纵坐标]
	 * @param  {number} type [棋子类型]
	 * @return {[type]}      [description]
	 */
	function drawChess(x, y, type, step) {
		var radius, realpos = [];
		ctx.save();
		radius = 0.4 * (cHeight - (margin + padding) * 2) / (lineCount - 1);
		realpos = getProjPostion(x, y);
		switch (type) {
		case my.CHESSTYPE.BLACK:
			ctx.fillStyle = "#000000";
			break;
		case my.CHESSTYPE.WHITE:
			ctx.fillStyle = "#ffffff";
			break;
		case my.CHESSTYPE.SMALL:
			ctx.fillStyle = "#000000";
			radius *= 0.3;
			break;
		case my.CHESSTYPE.NONE:
			return;
		default:
			break;
		}
		ctx.beginPath();
		ctx.arc(realpos[0], realpos[1], radius, 0, Math.PI * 2, false);
		ctx.fill();
		ctx.stroke();
		if (showNum && type !== 3 && step) {
			ctx.fillStyle = type === 1 ? "#ffffff" : "#000000";
			ctx.textAlign = "center";
			ctx.textBaseline = "middle";
			ctx.fillText(step, realpos[0], realpos[1]);
		}
		ctx.restore();
	}
	/**
	 * [drawDecoration 绘制装饰点]
	 */
	function drawDecoration() {
		var cpos, upos, dpos;
		if (lineCount % 2 !== 0 && lineCount >= 9) {
			cpos = lineCount / 2 - 0.5;
			upos = 3;
			dpos = lineCount - 4;
			drawChess(cpos, cpos, Chess.CHESSTYPE.SMALL);
			drawChess(upos, upos, Chess.CHESSTYPE.SMALL);
			drawChess(upos, dpos, Chess.CHESSTYPE.SMALL);
			drawChess(dpos, upos, Chess.CHESSTYPE.SMALL);
			drawChess(dpos, dpos, Chess.CHESSTYPE.SMALL);
			if (lineCount !== 15) {
				drawChess(cpos, upos, Chess.CHESSTYPE.SMALL);
				drawChess(cpos, dpos, Chess.CHESSTYPE.SMALL);
				drawChess(dpos, cpos, Chess.CHESSTYPE.SMALL);
				drawChess(upos, cpos, Chess.CHESSTYPE.SMALL);
			}
		}
	}
	/**
	 * [drawBoard 绘制棋盘]
	 */
	function drawBoard() {
		ctx.save();
		ctx.font = '15px sans-serif';
		ctx.textBaseline = 'middle';
		var interv, end, addint, i;
		interv = (cHeight - (margin + padding) * 2) / (lineCount - 1);
		end = cHeight - (padding + margin);
		ctx.beginPath();
		for (i = lineCount - 1; i >= 0; i -= 1) {
			//绘制横线
			addint = interv * i + margin + padding;
			drawLine(margin + padding, addint, end, addint);
			//绘制纵线
			drawLine(addint, margin + padding, addint, end);
			//横向注释
			ctx.fillText(lineCount - i, end + padding * 2, addint);
			//纵向注释
			ctx.fillText(String.fromCharCode(97 + i), addint, end + padding * 2);
		}
		ctx.stroke();
		ctx.lineWidth = 2;
		ctx.strokeRect(margin, margin, cHeight - margin * 2, cHeight - margin * 2);
		drawDecoration();
		ctx.restore();
	}
	/**
	 * [ReDrawBoard 重绘棋盘]
	 * @param {Array} cArray [step array]
	 */
	function reDrawBoard(sArray) {
		var i, stone, dtype = 1;
		ctx.clearRect(0, 0, cHeight, cWidth);
		cBoard = [];
		drawBoard();
		for (i = 0; i < sArray.length; i += 1) {
			if (!sArray[i].type) {
				sArray[i].type = dtype;
				dtype = dtype === 1 ? 2 : 1;
			}
			drawChess(sArray[i].x, sArray[i].y, sArray[i].type, sArray[i].step);
			cBoard[sArray[i].postion] = sArray[i].type;
		}
	}
	/**
	 * [unDrawChess 取消绘制棋子]
	 * @param  {number} x    [棋子横坐标]
	 * @param  {number} y    [棋子纵坐标]
	 * @return {[type]} [description]
	 */
	function unDrawChess() {
		var i, stone;
		if (cSteps.length === 0) {
			return;
		}
		stone = cSteps.pop();
		reDrawBoard(cSteps);
		cType = cType === 1 ? 2 : 1;
	}
	/**
	 * [setStone 设置棋子]
	 * @param {[type]} event [description]
	 */
	function setStone(event) {
		var postion, cell, x, y, stone;
		cell = relMouseCoords(event);
		postion = getRealPostion(cell.x, cell.y);
		if (postion[0] < lineCount && postion[1] < lineCount && postion[0] > -1 && postion[1] > -1) {
			stone = new Stone(postion[0], postion[1], cType, cSteps.length + 1);
			if (cBoard[stone.postion] && cBoard[stone.postion].type !== 0) {return; }
			drawChess(postion[0], postion[1], cType, cSteps.length + 1);
			cSteps.push(stone);
			cBoard[stone.postion] = stone.type;
			cType = cType === 1 ? 2 : 1;
		} else {
			unDrawChess();
		}
	}
	/**
	 * [resize 重置canvas高度/宽度]
	 * @param  {number} height [高]
	 * @param  {Number} width  [宽]
	 */
	function resize(height, width) {
		if (width < height) {
			width = height + 200;
		}
		canvas.setAttribute('height', height);
		canvas.setAttribute('width', width);
		cWidth = width;
		cHeight = height;
	}
	/**
	 * [setCTX 设置canvas上下文]
	 * @param {string} elemId [canvas元素ID]
	 */
	function setCTX(elemId) {
		canvas = document.getElementById(elemId);
		if (!canvas) {
			throw "can't get the element";
		}
		ctx = canvas.getContext("2d");
		if (!ctx) {
			throw "can't get Context";
		}
	}
	/**
	 * [domLoaded domReady]
	 * @param  {Function} callback [description]
	 * @return {[type]}            [description]
	 */
	my.domLoaded = function (f) {
		var foo = /in/.test(document.readyState) ? setTimeout('Chess.domLoaded(' + f + ')', 9) : f();
	};
	/**
	 * [init 初始化棋盘]
	 * @param  {string} elemid  [canvasID]
	 * @param  {int} hei     [高度]
	 * @param  {int} wid     [宽度]
	 * @param  {int} lineNum [线数]
	 * @param  {bool} showN [showNumber]
	 * @return {[type]}         [description]
	 */
	my.init = function (elemid, hei, wid, lineNum, showN) {
		cSteps = [];
		cBoard = new Array(lineNum * lineNum);
		setCTX(elemid);
		lineCount = lineNum;
		resize(hei, wid);
		drawBoard();
		if (showN) {showNum = true; }
		if (!canvas.addEventListener) {
		    canvas.attachEvent("onclick", setStone);
		} else {
		    canvas.addEventListener("click", setStone, false);
		}
	};
	/**
	 * [exportPng 导出PNG]
	 */
	my.exportPng = function () {
		window.open(canvas.toDataURL("image/png"), "chessboard");
	};
	/**
	 * [reDrawBoard 对外绘制接口]
	 * @param  {[type]} array [数组]
	 */
	my.reDrawBoard = function (array) {
		var i, str, x, y, type = 1, step = 1, stones = [];
		if (Object.prototype.toString.apply(array) !== '[object Array]') { return; }
		for (i = 0; i < array.length; i += 1, step += 1, type = type === 1 ? 2 : 1) {
			x = array[i].charCodeAt(0) > 90 ? array[i].charCodeAt(0) - 97 : array[i].charCodeAt(0) - 65;
			y = lineCount - parseInt(array[i].substr(1), 10);
			stones.push(new Stone(x, y, type, step));
		}
		reDrawBoard(stones);
		if (!canvas.removeEventListener) {
		    canvas.detachEvent("onclick", setStone);
		} else {
		    canvas.removeEventListener("click", setStone, false);
		}
	};

	return my;
}(Chess || {}));
//function r(f){/in/.test(document.readyState)?setTimeout('r('+f+')',9):f()}
Chess.domLoaded(function () {
	"use strict";
	Chess.init("chessboard", 500, 200, 15, 1);
	//Chess.reDrawBoard(["a1", "b2", "C13", "D4"]);
});
