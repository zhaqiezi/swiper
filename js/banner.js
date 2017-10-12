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
    var addHandler = function(element, type, handler) {
            if (element.addEventListener) {
                element.addEventListener(type, handler, false);
            } else if (element.attachEvent) {
                element.attachEvent('on' + type, handler);
            } else {
                element['on' + type] = handler;
            }
        }
        // 选择器
    function selectEl(selector, parent) {
        var pr = selector.substring(0, 1);
        var s = selector.substring(1);
        var arr = [];
        if (pr == '#') {
            arr.push(document.getElementById(s))
        } else if (pr == '.') {
            var allE = parent ? parent.getElementsByTagName('*') : document.getElementsByTagName('*');
            var reg = new RegExp("(^|\\s)" + s + "($|\\s)");
            for (var i = 0; i < allE.length; i++) {
                if (reg.test(allE[i].className)) arr.push(allE[i]);
            }
            return arr;
        } else {
            arr = parent ? parent.getElementsByTagName(selector) : document.getElementsByTagName(selector);
        }
        return arr;
    }

    // 合并两个对象的函数
    var combineObj = function(o, p) {
        var obj = {};
        for (prop in o) {
            obj[prop] = o[prop];
        }
        for (prop in p) {
            obj[prop] = p[prop];
        }
        return obj;
    }

    //添加class
    var addClass = function(el, cls) {
        var reg = new RegExp("(^|\\s)" + cls + "($|\\s)");
        if (!reg.test(el.className)) {
            el.className += " " + cls;
        }
    }

    //清除class
    var removeClass = function(el, cls) {
        var reg = new RegExp("(^|\\s)" + cls + "($|\\s)");
        if (reg.test(el.className)) {
            el.className = el.className.replace(reg, '');
        }
    }

    var swiper = (function() {
        // 构造函数
        function Banner(el, arr, options) {
            this.el = el; //最外层元素
            this.arr = arr; //原始的几个轮播项
            this.options = options; //配置
            this.timer = null; //轮播定时器
            this.cTimer = null; //动画效果定时器
            this.index = options.index + arr.length - 1; //轮播的索引
            this.w = css(arr[0], 'width'); //宽度
            this.h = css(arr[0], 'height'); //高度
            this.status = 1; //定时器运行的状态
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
                        clearInterval(self.cTimer)
                        self.cTimer = null;
                        f();
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
            //加上导航 
            if (op.dots) {
                var dotList = document.createElement('ul');
                dotList.className = 'dots-list';
                var dots = '';
                for (var i = 0; i < self.arr.length; i++) {
                    dots = dots + '<li class="dot-item">' + (i + 1) + '</li>';
                }
                dotList.innerHTML = dots;
                this.dots = selectEl('.dot-item', dotList);
                x.appendChild(dotList);
            }
            x.appendChild(box)
            el.innerHTML = '';
            el.appendChild(x);
            css(x, {
                'width': self.w,
                'height': self.h,
                'overflow': 'hidden'
            })
            if (op.way == 'move' && !op.vertical) {
                css(box, {
                    'width': w + 'px',
                    'left': -self.index * parseInt(self.w) + 'px'
                });
                self.dotChange();
            }

            return this;
        };

        //绑定事件 
        Banner.prototype.bindEvent = function() {
            var self = this;
            this.el.onmouseenter = function() {
                clearInterval(self.timer);
                self.timer = null;
            };
            this.el.onmouseleave = function() {
                self.offset();
            };
            addHandler(self.pre, self.options.event, function() {
                if (self.status) {
                    self.status = 0;
                    self.index--;
                    self.judge(function() {
                        css(self.box, 'left', -(self.index + 1) * parseInt(self.w) + 'px');
                    })
                    self.dotChange();
                    self.animation(self.box, {
                        'left': -self.index * parseInt(self.w) + 'px'
                    }, self.options.tTime, function() {
                        self.status = 1;
                    }, 'px');
                }
            });
            addHandler(this.next, self.options.event, function() {
                self.levelMove(self);
            });
            for (var i = 0; i < this.dots.length; i++) {
                this.dots[i].index = i + this.arr.length;
                addHandler(this.dots[i], self.options.event, function() {
                    if (self.status) {
                        self.index = this.index;
                        self.status = 0;
                        self.dotChange();
                        addClass(this, 'active');
                        self.animation(self.box, {
                            'left': -self.index * parseInt(self.w) + 'px'
                        }, self.options.tTime, function() {
                            self.status = 1;
                        }, 'px');
                    }
                })
            }
            return this;
        };

        // 改变分页器选中样式
        Banner.prototype.dotChange = function() {
            var self = this;
            if (self.dots) {
                for (var i = 0; i < self.dots.length; i++) {
                    removeClass(self.dots[i], 'active')
                }
                addClass(self.dots[self.index - self.arr.length], 'active');
            }
        }

        // 配置
        Banner.prototype.offset = function() {
            var self = this;
            var op = this.options;
            if (op.way === 'fade') {
                return this;
            } else if (!op.vertical) {
                this.setTimer(function() {
                    self.levelMove(self);
                });
                return this;
            }
        };

        // 判断迭代是否重置
        Banner.prototype.judge = function(f) {
            if (this.index >= this.arr.length * 2) {
                this.index = this.arr.length;
                f();
            } else if (this.index <= this.arr.length - 1) {
                this.index = this.arr.length * 2 - 1;
                f();
            }
        };

        // 水平移动的效果 
        Banner.prototype.levelMove = function(self) {
            if (self.status) {
                self.status = 0;
                self.index++;
                self.judge(function() {
                    css(self.box, 'left', -(self.index - 1) * parseInt(self.w) + 'px')
                })
                self.dotChange();
                self.animation(self.box, {
                    'left': -self.index * parseInt(self.w) + 'px'
                }, self.options.tTime, function() {
                    self.status = 1;
                }, 'px');
            }
        };

        // 设置定时器
        Banner.prototype.setTimer = function(f) {
            // var box = this.box;
            var self = this;
            this.timer = setInterval(f, self.options.wTime + self.options.tTime);
        };

        // 默认值
        var defaultO = {
            vertical: false,
            way: 'move',
            tTime: 500,
            index: 1,
            wTime: 2000,
            arrow: true,
            dots: true,
            event: 'click'
        };

        // 初始化
        var init = function(options) {
            var op = combineObj(defaultO, options);
            var wrap = selectEl(options.el)[0];
            var el = wrap.getElementsByTagName('*');
            var arr = [];
            for (var i = 0; i < el.length; i++) {
                if (el[i].parentNode == wrap) {
                    arr.push(el[i]);
                }
            }
            var banner = (new Banner(wrap, arr, op)).structure().offset().bindEvent();
            console.log(banner);
        };
        return init;
    }());
    swiper({
        el: '.wrap',
        arrow: false
    })
}