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

    // 清除定时器
    var clearTimer = function(timer, f) {
        clearInterval(timer);
        timer = null;
        if (f && typeof f == 'function') f();
    };

    // 选择器
    function selectEl(selector) {
        var pr = selector.substring(0, 1);
        var s = selector.substring(1);
        if (pr == '#') {
            return document.getElementById(s);
        } else if (pr == '.') {
            var allE = document.getElementsByTagName('*');
            var arr = [];
            var reg = new RegExp("(^|\\s)" + s + "($|\\s)");
            for (var i = 0; i < allE.length; i++) {
                if (reg.test(allE[i].className)) arr.push(allE[i]);
            }
            return arr[0];
        } else {
            return document.getElementsByTagName(selector);
        }
    }
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
    var swiper = (function() {
        // 构造函数
        function Banner(el, arr, options) {
            this.el = el;
            this.arr = arr;
            this.options = options;
            this.timer = null;
            this.cTimer = null;
            this.index = options.index + arr.length;
            this.w = css(arr[0], 'width');
            this.h = css(arr[0], 'height');
            this.status = 1;
            this.max = arr.length * 3;
        }
        //动画效果 
        Banner.prototype.animation = function(el, o, t, f, dw) {
            var self = this;
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
            for (var i = 0; i < arr.length; i++) {
                var x = arr[i];
                self.cTimer = setInterval(function() {
                    if (css(el, x.key) !== x.to) {
                        el.style[x.key] = parseInt(x.from) + x.n + dw;
                        x.from = css(el, x.key);
                    } else {
                        clearTimer(self.cTimer, f);
                    }
                }, 10)
            }
        };
        // 结构生成
        Banner.prototype.structure = function() {
            var self = this;
            var op = this.options;
            var el = this.el;
            var arr = this.arr.concat(this.arr).concat(this.arr);
            var x = document.createElement('div');
            x.className = "swiper";
            var box = document.createElement('div');
            box.className = 'box';
            this.box = box;
            var w = parseInt(css(arr[0], 'width')) * arr.length;
            for (var i = 0; i < arr.length; i++) {
                box.appendChild(arr[i].cloneNode(true));
            }

            // 加上前后箭头
            if (op.arrow) {
                var arrowP = document.createElement('button');
                var arrowN = document.createElement('button');
                arrowP.className = 'pre';
                arrowP.innerHTML = '上一个';
                arrowN.className = 'next';
                arrowN.innerHTML = '下一个';
                self.pre = arrowP;
                self.next = arrowN;
                x.appendChild(arrowP);
                x.appendChild(arrowN);
            }
            x.appendChild(box)
            el.innerHTML = '';
            el.appendChild(x);
            css(x, {
                'width': self.w,
                'height': self.h,
                'overflow': 'hidden'
            })
            if (op.way == 'move' && !op.vertical)
                css(box, {
                    'width': w + 'px',
                    'left': -self.index * parseInt(self.w) + 'px'
                });

            return this;
        };

        //绑定事件 
        Banner.prototype.bindEvent = function() {
            var self = this;
            this.el.onmouseenter = function() {
                clearTimer(self.timer);
            };
            this.el.onmouseleave = function() {
                self.offset();
            };
            this.pre.onclick = function() {
                self.index--;
                self.animation(self.box, {
                    'left': -self.index * parseInt(self.w) + 'px'
                }, self.options.tTime, function() {
                    self.status = 1;
                }, 'px');
                self.judge(function() {
                    css(self.box, 'left', -(self.index - 1) * parseInt(self.w) + 'px')
                    console.log('现在是:' + self.index);
                })
            }
            return this;
        };

        // 轮播效果
        Banner.prototype.offset = function() {
            var op = this.options;
            if (op.way === 'fade') {
                return this;
            } else if (!op.vertical) {
                this.move();
                return this;
            }
        };

        // 判断迭代是否重置
        Banner.prototype.judge = function(f) {
            if (this.index >= this.max) {
                this.index = this.arr.length;
                f();
            } else if (this.index <= 0) {
                this.index = this.arr.length + 1;
                f();
            }
        };

        // 水平移动的效果 
        Banner.prototype.move = function() {
            var box = this.box;
            var self = this;
            this.timer = setInterval(function() {
                if (self.status != 1) return;
                self.status = 0;
                self.index++;
                self.judge(function() {
                    css(box, 'left', -(self.index - 1) * parseInt(self.w) + 'px')
                })
                self.animation(box, {
                    'left': -self.index * parseInt(self.w) + 'px'
                }, self.options.tTime, function() {
                    self.status = 1;
                }, 'px');
            }, self.options.wTime + self.options.tTime);
        };
        //设置定时器
        // Banner.prototype.setTimer = function(o) {
        //     var box = this.box;
        //     var self = this;
        //     this.timer = setInterval(function() {
        //         if (self.status != 1) return;
        //         self.status = 0;
        //         self.index++;
        //         if (self.index >= self.arr.length * 3) {
        //             self.index = self.arr.length;
        //             css(box, 'left', -(self.index - 1) * parseInt(self.w) + 'px')
        //         }
        //         self.animation(box, {
        //             'left': -self.index * parseInt(self.w) + 'px'
        //         }, self.options.tTime, function() {
        //             self.status = 1;
        //         });
        //     }, self.options.wTime + self.options.tTime);
        // };



        // 默认值
        var defaultO = {
            vertical: false,
            way: 'move',
            tTime: 500,
            index: 0,
            wTime: 2000,
            arrow: true
        };

        // 初始化
        var init = function(options) {
            var op = extend(defaultO, options);
            var wrap = selectEl(options.el);
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
        el: '.wrap'
    })
}
