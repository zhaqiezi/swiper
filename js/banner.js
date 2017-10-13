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

    //添加事件 
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
        var allE = null;
        if (pr == '#') {
            arr.push(document.getElementById(s))
        } else if (pr == '.') {
            allE = parent ? parent.getElementsByTagName('*') : document.getElementsByTagName('*');
            var reg = new RegExp("(^|\\s)" + s + "($|\\s)");
            for (var i = 0; i < allE.length; i++) {
                if (reg.test(allE[i].className)) arr.push(allE[i]);
            }
            return arr;
        } else if (pr == '>') {
            allE = parent.getElementsByTagName(s);
            for (var i = 0; i < allE.length; i++) {
                if (allE[i].parentNode == parent) arr.push(allE[i]);
            }
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

    // 继承方法
    var extend = function(parentClass, childClass) {
        var F = function() {};
        F.prototype = parentClass.prototype;
        childClass.prototype = new F();
    }

    // 动画
    var animation = function(el, o, t, f, dw) {
        var arr = [];
        var p = {};
        for (var key in o) {
            if (!o.hasOwnProperty(key)) continue;
            p = {};
            p.key = key;
            p.from = css(el, key);
            p.to = o[key];
            p.n = (parseInt(p.to) - parseInt(p.from)) * 10 / t;
            p.bool = 0;
            arr.push(p);
        }
        var timer = setInterval(function() {
            console.log(arr[0].n);
            for (var i = 0; i < arr.length; i++) {
                if (arr[i].from !== arr[i].to) {
                    el.style[arr[i].key] = parseInt(arr[i].from) + arr[i].n + dw;
                    arr[i].from = css(el, arr[i].key);
                } else {
                    arr[i].bool = 1;
                }
            }
            if (arr.every(function(item) {
                    return item.bool == 1;
                })) {
                clearInterval(timer)
                timer = null;
                f();
            }
        }, 10)
    };

    // 定义轮播图
    var swiper = (function() {
        // 构造函数
        function Banner(el, arr, options) {
            this.el = el; //最外层元素
            this.arr = arr; //原始的几个轮播项
            this.options = options; //配置
            this.timer = null; //轮播定时器
            this.cTimer = null; //动画效果定时器
            this.index = options.index + arr.length - 1; //轮播的索引
            this.w = css(el, 'width'); //宽度
            this.h = css(el, 'height'); //高度
            this.status = 1; //定时器运行的状态
        }

        // 结构生成
        Banner.prototype.structure = function() {
            var op = this.options;
            var el = this.el;
            var arr = this.arr.concat(this.arr).concat(this.arr);
            var x = document.createElement('div');
            x.className = "swiper";
            var box = document.createElement('div');
            box.className = 'box';
            this.box = box;
            for (var i = 0; i < arr.length; i++) {
                box.appendChild(arr[i].cloneNode(true));
            }

            // 箭头
            if (op.arrow) {
                var arrowP = document.createElement('button');
                var arrowN = document.createElement('button');
                arrowP.className = 'pre';
                arrowP.innerHTML = '<';
                arrowN.className = 'next';
                arrowN.innerHTML = '>';
                this.pre = arrowP;
                this.next = arrowN;
                x.appendChild(arrowP);
                x.appendChild(arrowN);
            }

            //分页器
            if (op.dots) {
                var dotList = document.createElement('ul');
                dotList.className = 'dots-list';
                var dots = '';
                for (var i = 0; i < this.arr.length; i++) {
                    dots = dots + '<li class="dot-item">' + (i + 1) + '</li>';
                }
                dotList.innerHTML = dots;
                this.dots = selectEl('.dot-item', dotList);
                x.appendChild(dotList);
                this.dotChange();
            }

            x.appendChild(box)
            el.innerHTML = '';
            el.appendChild(x);
            var allItem = selectEl('>*', box);
            for (var i = 0; i < allItem.length; i++) {
                css(allItem[i], { 'width': this.w, 'height': this.h });
            }
            return this;
        };

        //绑定事件 
        Banner.prototype.bindEvent = function() {
            var self = this;
            var ops = self.options;
            if (ops.autoPlay) {
                this.el.onmouseenter = function() {
                    clearInterval(self.timer);
                    self.timer = null;
                };
                this.el.onmouseleave = function() {
                    self.setTimer();
                };
            }
            if (ops.dots) {
                for (var i = 0; i < this.dots.length; i++) {
                    this.dots[i].index = i + this.arr.length;
                    addHandler(this.dots[i], self.options.event, function() {
                        self.index = this.index;
                        if (self.status) {
                            self.offset();
                        }
                    })
                }
            }
            if (ops.arrow) {
                addHandler(self.pre, 'click', function() {
                    if (self.status) {
                        self.index--;
                        self.offset();
                    }
                });
                addHandler(this.next, 'click', function() {
                    if (self.status) {
                        self.index++;
                        self.offset();
                    }
                });
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

        // 配置效果
        Banner.prototype.offset = function() {
            throw new Error('必须设置切换效果')
        };

        // 判断迭代是否重置
        Banner.prototype.judge = function() {
            throw new Error('必须设置判断边界的函数');
        };

        // 设置定时器
        Banner.prototype.setTimer = function() {
            var self = this;
            this.timer = setInterval(function() {
                if (self.status) {
                    self.index++;
                    self.offset();
                }
            }, self.options.wTime + self.options.tTime);
            return this;
        };

        // 水平方向平移
        function LevelMove(el, arr, op) {
            Banner.call(this, el, arr, op);
        }

        extend(Banner, LevelMove);

        // 设置单独样式
        LevelMove.prototype.setStyles = function() {
            css(this.box, {
                'height': '100%',
                'width': parseInt(this.w) * this.arr.length * 3 + 'px',
                'left': -this.index * parseInt(this.w) + 'px'
            });
            return this;
        }

        // 水平平移方向的动画效果
        LevelMove.prototype.offset = function() {
            var self = this;
            this.status = 0;
            this.judge();
            this.dotChange();
            animation(this.box, {
                'left': -this.index * parseInt(this.w) + 'px'
            }, this.options.tTime, function() {
                self.status = 1;
            }, 'px');
        }

        //水平平移效果的判断
        LevelMove.prototype.judge = function() {
            if (this.index >= this.arr.length * 2) {
                this.index = this.arr.length;
                css(this.box, 'left', -(this.index - 1) * parseInt(this.w) + 'px');
            } else if (this.index <= this.arr.length - 1) {
                this.index = this.arr.length * 2 - 1;
                css(this.box, 'left', -(this.index + 1) * parseInt(this.w) + 'px');
            }
        }


        // 垂直方向平移
        function VerticalMove(el, arr, op) {
            Banner.call(this, el, arr, op);
        }
        extend(Banner, VerticalMove);

        // 设置单独样式
        VerticalMove.prototype.setStyles = function() {
            css(this.box, {
                'width': '100%',
                'hight': parseInt(this.h) * this.arr.length * 3 + 'px',
                'top': -this.index * parseInt(this.h) + 'px'
            });
            return this;
        }

        // 垂直平移方向的动画效果
        VerticalMove.prototype.offset = function() {
            var self = this;
            this.status = 0;
            this.judge();
            this.dotChange();
            animation(this.box, {
                'top': -this.index * parseInt(this.h) + 'px'
            }, this.options.tTime, function() {
                self.status = 1;
            }, 'px');
        }

        //垂直平移效果的判断
        VerticalMove.prototype.judge = function() {
            if (this.index >= this.arr.length * 2) {
                this.index = this.arr.length;
                css(this.box, 'top', -(this.index - 1) * parseInt(this.h) + 'px');
            } else if (this.index <= this.arr.length - 1) {
                this.index = this.arr.length * 2 - 1;
                css(this.box, 'top', -(this.index + 1) * parseInt(this.h) + 'px');
            }
        }

        // 默认值
        var defaultO = {
            vertical: false,
            way: 'move',
            tTime: 500,
            index: 1,
            wTime: 2000,
            arrow: true,
            dots: true,
            event: 'click',
            autoPlay: true
        };

        // 初始化
        var init = function(options) {
            var op = combineObj(defaultO, options);
            var wrap = selectEl(options.el)[0];
            var el = wrap.getElementsByTagName('*');
            var arr = [];
            var banner;
            for (var i = 0; i < el.length; i++) {
                if (el[i].parentNode == wrap) {
                    arr.push(el[i]);
                }
            }
            if (op.way == 'move') {
                if (op.vertical) {
                    banner = new VerticalMove(wrap, arr, op);
                } else {
                    banner = new LevelMove(wrap, arr, op);
                }
            }
            banner.structure().setStyles().bindEvent();
            if (op.autoPlay) {
                banner.setTimer();
            }
            console.log(banner);
        };
        return init;
    }());
    swiper({
        el: '.wrap',
        // autoPlay: false,
        // vertical: true
        event: 'mouseover'
    })
}