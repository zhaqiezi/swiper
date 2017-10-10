window.onload = function() {
	// 改变样式,查看样式
	var css = function(el, sty, val) {
		if (arguments.length == 2 && typeof arguments[1] == 'object') {
			var o = arguments[1];
			for (var prop in o) {
				if (!o.hasOwnProperty(prop)) continue;
				el.style[prop] = o[prop];
			}
			return;
		}
		if (!val) {
			return (el.currentStyle ? el.currentStyle : window.getComputedStyle(el, null))[sty];
		}
		el.style[sty] = val;
	}
	var animation = function(el, o, t) {
		var arr = [];
		for (var key in o) {
			if (!o.hasOwnProperty(key)) continue;
			var p = {};
			p.key = key;
			p.from = css(el, key);
			p.to = o[key];
			p.n = (parseInt(p.to) - parseInt(p.from)) * 10 / t;
			arr.push(p);
		}
		console.log(arr);
		for (var i = 0; i < arr.length; i++) {
			var x = arr[i];
			(function() {
				setInterval(function() {
					if (css(el, x.key !== x.to)) {
						el.style[x.key] = parseInt(x.from) + n + 'px';
						x.from = css(el, x.key);
					}
				}, 10)
			}())
		}
	};
	var swiper = (function() {
		// 构造函数
		function Banner(el, arr, options) {
			this.el = el;
			this.arr = arr;
			this.options = options;
			this.timer = null;
		}

		// 结构生成
		Banner.prototype.structure = function() {
			var self = this;
			var el = this.el;
			var arr = self.arr;
			var x = document.createElement('div');
			var w = parseInt(css(arr[0], 'width')) * arr.length;
			x.className = "swiper";
			this.box = x;
			var oStyle = window.getComputedStyle(arr[0], null);
			for (var i = 0; i < arr.length; i++) {
				x.append(arr[i]);
			}
			css(x, 'width', w + 'px');
			el.append(x);
			css(el, {
				'width': oStyle.width,
				'height': oStyle.height,
				'overflow': 'hidden',
				'position': 'relative'
			});
			return this;
		};

		//绑定事件 
		Banner.prototype.bindEvent = function() {
			var self = this;
			this.el.onmouseover = function() {
				self.clearTimer();
			};
			this.el.onmouseleave = function() {
				self.setTimer();
			};
			return this;
		};
		// 轮播效果
		Banner.prototype.offset = function() {
			var op = this.options;
			if (op.way === 'fade') {
				return this;
			} else if (!op.vertical) {
				this.setTimer();
				return this;
			}
		};

		//设置定时器
		Banner.prototype.setTimer = function() {
			var box = this.box;
			var self = this;
			this.timer = setInterval(function() {
				if (Math.abs(parseInt(window.getComputedStyle(box, null).left)) < parseInt(box.style.width)) {
					box.style.left = parseInt(window.getComputedStyle(box, null).left) - 1 + 'px';
				} else {
					console.log("end");
					self.clearTimer();
				}
			}, 10);
		};

		// 清除定时器
		Banner.prototype.clearTimer = function() {
			clearInterval(this.timer);
			this.timer = null;
		};

		// 默认值
		var defaultO = {
			vertical: false,
			way: 'move',
			time: 3000,
			index: 0
		};

		// 合并两个对象的函数
		var extend = function(o, p) {
				var obj = {};
				for (prop in o) {
					obj[prop] = o[prop];
				}
				for (prop in p) {
					obj[prop] = p[prop];
				}
				return obj;
			}
			// 初始化
		var init = function(options) {
			var op = extend(defaultO, options);
			var wrap = document.getElementById(options.id);
			var el = wrap.getElementsByTagName('*');
			var arr = [];
			for (var i = 0; i < el.length; i++) {
				if (el[i].parentNode == wrap) {
					arr.push(el[i]);
				}
			}
			var banner = new Banner(wrap, arr, op);
			banner.structure().offset().bindEvent();
			console.log(banner);
		};
		return init;
	}());
	swiper({
		id: 'wrap'
	})
}
