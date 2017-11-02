// 一帧的时间,单位为ms
var DEFAULT_INTERVAL = 1000 / 60;
//设置一针时间的定时器
var requestAnimationFrame = (function() {
    return window.requestAnimationFrame ||
        window.webkitRequestAnimationFrame ||
        window.mozRequestAnimationFrame ||
        window.oRequestAnimationFrame ||
        function(callback) {
            return window.setTimeout(callback, callback.interval || DEFAULT_INTERVAL);
        }
})();

//清楚一帧时间的定时器
var cancelAnimationFrame = (function() {
    return window.cancelAnimationFrame ||
        window.webkitCancelAnimationFrame ||
        window.mozCancelAnimationFrame ||
        window.oCancelAnimationFrame ||
        function(id) {
            return window.clearTimeout(id);
        };
})();

//轮播图使用到的工具类
var swiperTools = {
    // 改变样式,查看样式
    css: function(el, sty, val) {
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
    },

    //添加事件 
    addHandler: function(element, type, handler) {
        if (element.addEventListener) {
            element.addEventListener(type, handler, false);
        } else if (element.attachEvent) {
            element.attachEvent('on' + type, handler);
        } else {
            element['on' + type] = handler;
        }
    },

    /**
     * 仿jquery的选择器
     * 支持类选择器，ID选择器和标签选择器，支持子元素选择，不支持多个类选择和关系选择。
     * @param {.class或者#id或者tag} selector 选择器,用来选择元素 
     * @param {dom元素} parent 选择器的父元素,用来精确选择,如果是子元素选择器,则是必须的
     * @returns 返回一个存储dom元素的数组,是数组,不是dom对象
     */
    selectEl: function(selector, parent) {
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
    },

    /**
     * 用原生js合并两个对象
     * @param {object} o 合并对象中的被覆盖对象 
     * @param {object} p 合并对象中的覆盖对象
     * @returns 返回一个合并后的新对象
     */
    combineObj: function(o, p) {
        var obj = {};
        for (prop in o) {
            obj[prop] = o[prop];
        }
        for (prop in p) {
            obj[prop] = p[prop];
        }
        return obj;
    },

    //添加class
    addClass: function(el, cls) {
        var reg = new RegExp("(^|\\s)" + cls + "($|\\s)");
        if (!reg.test(el.className)) {
            el.className += " " + cls;
        }
    },

    //清除class 
    removeClass: function(el, cls) {
        var reg = new RegExp("(^|\\s)" + cls + "($|\\s)");
        if (reg.test(el.className)) {
            el.className = el.className.replace(reg, '');
        }
    },

    // 继承方法
    extend: function(parentClass, childClass) {
        var F = function() {};
        F.prototype = parentClass.prototype;
        childClass.prototype = new F();
    },

    // 动画
    animation: function(el, o, t, f, dw) {
        var arr = [];
        var p = {};
        for (var key in o) {
            if (!o.hasOwnProperty(key)) continue;
            p = {};
            p.key = key;
            p.from = swiperTools.css(el, key);
            p.to = o[key];
            p.n = (parseInt(p.to) - parseInt(p.from)) * DEFAULT_INTERVAL / t;
            p.bool = 0;
            arr.push(p);
        }
        (function set() {
            requestAnimationFrame(function() {
                var status = 1;
                for (var i = 0; i < arr.length; i++) {
                    var item = arr[i];
                    if (Math.abs(parseInt(item.from) - parseInt(item.to)) > Math.abs(item.n)) {
                        el.style[item.key] = parseInt(item.from) + item.n + dw;
                        item.from = swiperTools.css(el, item.key);
                        status = 0;
                    } else {
                        item.bool = 1;
                        el.style[item.key] = item.to;
                    }
                }
                if (status) {
                    f();
                } else {
                    set();
                }
            })
        }())
    },

    /**
     * 设置元素的透明度
     * 
     * @param {dom} ele 需要设置透明度的元素
     * @param {number} opacity 透明度的值,0到100
     */
    setOpacity: function(ele, opacity) {
        if (ele.style.opacity != undefined) {
            ///兼容FF和GG和新版本IE 
            ele.style.opacity = opacity / 100;

        } else {
            ///兼容老版本ie 
            ele.style.filter = "alpha(opacity=" + opacity + ")";
        }
    },
    // 淡入效果
    fadeIn: function(el, t, f) {
        var opacity = 0;
        el.style.zIndex = 1;
        var time = t / 100;
        var timer = setInterval(function() {
            swiperTools.setOpacity(el, ++opacity);
            if (opacity >= 100) {
                clearInterval(timer);
                f && typeof f == 'function' && f();
            }
        }, time);
    },
    // 淡出效果
    fadeOut: function(el, t, f) {
        var opacity = 100;
        var time = t / 100;
        var timer = setInterval(function() {
            swiperTools.setOpacity(el, --opacity);
            if (opacity <= 0) {
                el.style.zIndex = -1;
                clearInterval(timer);
                f && typeof f == 'function' && f();
            }
        }, time);
    },
    /**
     * 为元素设置有浏览器前缀的属性,调用函数swiperTools.css
     * @param {dom元素} el 需要设置的元素 
     * @param {Object} styles 需要更改的样式,用对象的方式写 
     */
    fix: function(el, styles) {
        var ms = '-ms-';
        var moz = '-moz-';
        var webkit = '-webkit-';
        var o = '-o-';
        var oStyles = {};
        for (var key in styles) {
            if (!styles.hasOwnProperty(key)) continue;
            oStyles[key] = styles[key];
            oStyles[ms + key] = styles[key];
            oStyles[moz + key] = styles[key];
            oStyles[webkit + key] = styles[key];
            oStyles[o + key] = styles[key];
        }
        swiperTools.css(el, oStyles);
    },

    rotateIn: function(el, t, f) {
        var stys = {
            'transform': 'rotateY(0) translateX(0)',
            'transition': 'transform ' + t + 'ms'
        };
        swiperTools.fix(el, stys);
        f && typeof f == 'function' && setTimeout(f, t);
    },

    rotateOut: function(el, t, f) {
        var stys = {
            'transform': 'rotateY(-90deg) translateX(-100%)'
        }
        swiperTools.fix(el, stys);
        f && typeof f == 'function' && setTimeout(f, t);
    }
}

// 定义轮播图
var swiper = (function() {
    // 构造函数
    function Banner(el, arr, options) {
        var length = arr.length;
        this.el = el; //最外层元素
        this.arr = arr; //原始的几个轮播项
        this.options = options; //配置
        this.timer = null; //轮播定时器
        this.cTimer = null; //动画效果定时器
        if (options.index > length) {
            options.index = 1;
            console.log('初始位置不能超过图片的数量！');
        }
        this.index = options.index + length - 1; //轮播的索引
        this.w = swiperTools.css(el, 'width'); //最外层的宽度
        if (options.showNum > length) {
            options.showNum = 1;
            console.log('一次显示的数量不能超过图片的数量！');
        }
        if (options.scrollNum > length) {
            options.scrollNum = 1;
            console.log('一次滚动的数量不能超过图片的数量！');
        }
        this.wShow = parseInt(this.w) / options.showNum + 'px'; //展示的项目的宽度
        this.h = swiperTools.css(el, 'height'); //最外层的高度
        this.hShow = parseInt(this.h) / options.showNum + 'px'; //展示的项目的高度
        this.status = 1; //定时器运行的状态
        this.pIndex = this.index; //前一个索引
        this.end = function() {
            this.options.end && typeof this.options.end == 'function' && this.options.end(this.index - this.arr.length);
        };
        if (options.lazy) {
            this.start = function(i) {
                var index = i ? i : this.index;
                var item = this.allItem[index];
                var item1 = this.allItem[index - arr.length];
                var item2 = this.allItem[index + arr.length];
                item.src = item.getAttribute('data-src');
                item1.src = item.getAttribute('data-src');
                item2.src = item.getAttribute('data-src');
                this.options.start && typeof this.options.start == 'function' && this.options.start(index);

            }

        } else {
            this.start = function(i) {
                var index = i ? i : this.index;
                this.options.start && typeof this.options.start == 'function' && this.options.start(index);
            }
        }
    }

    // 结构生成
    Banner.prototype.structure = function() {
        var op = this.options;
        var el = this.el;
        var arr = this.arr.concat(this.arr).concat(this.arr);
        var x = document.createElement('div');
        var box = document.createElement('div');
        var boxwrap = document.createElement('div');
        x.className = "swiper";
        boxwrap.className = 'boxwrap';
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
            arrowP.setAttribute('type', 'button');
            arrowP.innerHTML = '&lt';
            arrowN.className = 'next';
            arrowN.setAttribute('type', 'button');
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
            this.dots = swiperTools.selectEl('.dot-item', dotList);
            x.appendChild(dotList);
            this.dotChange();
        }
        boxwrap.appendChild(box);
        x.appendChild(boxwrap);
        el.innerHTML = '';
        el.appendChild(x);
        var allItem = swiperTools.selectEl('>*', box);
        this.allItem = allItem;
        for (var i = 0; i < allItem.length; i++) {
            swiperTools.css(allItem[i], {
                'width': this.w,
                'height': this.h
            });
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
                (function(i) {
                    var index = i + self.arr.length;
                    swiperTools.addHandler(self.dots[i], self.options.event, function() {
                        if (self.status) {
                            self.pIndex = self.index;
                            self.index = index;
                            self.offset();
                        }
                    })
                }(i));
            }
        }
        if (ops.arrow) {
            swiperTools.addHandler(self.pre, 'click', function() {
                if (self.status) {
                    self.pIndex = self.index;
                    self.index -= ops.scrollNum;
                    self.offset();
                }
            });
            swiperTools.addHandler(this.next, 'click', function() {
                if (self.status) {
                    self.pIndex = self.index;
                    self.index += ops.scrollNum;
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
                swiperTools.removeClass(self.dots[i], 'active')
            }
            swiperTools.addClass(self.dots[self.index - self.arr.length], 'active');
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
                self.pIndex = self.index;
                self.index += self.options.scrollNum;
                self.offset();
            }
        }, self.options.wTime + self.options.tTime);
        return this;
    };

    // 水平方向平移
    function LevelMove(el, arr, op) {
        Banner.call(this, el, arr, op);
    }

    swiperTools.extend(Banner, LevelMove);

    // 设置单独样式
    LevelMove.prototype.setStyles = function() {
        var w = this.wShow;
        for (var i = 0; i < this.allItem.length; i++) {
            swiperTools.css(this.allItem[i], 'width', w);
        }
        swiperTools.css(this.box, {
            'height': this.h,
            'width': parseInt(w) * this.arr.length * 3 + 'px',
            'left': -this.index * parseInt(w) + 'px'
        });
        return this;
    }

    // 水平平移方向的动画效果
    LevelMove.prototype.offset = function() {
        var self = this;
        this.status = 0;
        this.judge();
        this.dotChange();
        this.start();
        swiperTools.animation(this.box, {
            'left': -this.index * parseInt(this.wShow) + 'px'
        }, this.options.tTime, function() {
            self.status = 1;
            self.end();
        }, 'px');
    }

    //水平平移效果的判断
    LevelMove.prototype.judge = function() {
        var w = parseInt(this.wShow);
        var s = this.options.scrollNum;
        if (this.index >= this.arr.length * 2) {
            this.index -= this.arr.length;
            swiperTools.css(this.box, 'left', -(this.index - s) * w + 'px');
        } else if (this.index <= this.arr.length - 1) {
            this.index += this.arr.length;
            swiperTools.css(this.box, 'left', -(this.index + s) * w + 'px');
        }
    }


    // 垂直方向上移
    function VerticalUpMove(el, arr, op) {
        Banner.call(this, el, arr, op);
    }
    swiperTools.extend(Banner, VerticalUpMove);

    // 设置单独样式
    VerticalUpMove.prototype.setStyles = function() {
        var h = this.hShow;
        for (var i = 0; i < this.allItem.length; i++) {
            swiperTools.css(this.allItem[i], 'height', h);
        }
        swiperTools.css(this.box, {
            'width': this.w,
            'hight': parseInt(h) * this.arr.length * 3 + 'px',
            'top': -this.index * parseInt(h) + 'px'
        });
        return this;
    }

    // 垂直上移的动画效果
    VerticalUpMove.prototype.offset = function() {
        var self = this;
        this.status = 0;
        this.judge();
        this.dotChange();
        this.start();
        swiperTools.animation(this.box, {
            'top': -this.index * parseInt(this.hShow) + 'px'
        }, this.options.tTime, function() {
            self.status = 1;
            self.end();
        }, 'px');
    }

    //垂直上移效果的判断
    VerticalUpMove.prototype.judge = function() {
        var h = parseInt(this.hShow);
        var s = this.options.scrollNum;
        if (this.index >= this.arr.length * 2) {
            this.index -= this.arr.length;
            swiperTools.css(this.box, 'top', -(this.index - s) * h + 'px');
        } else if (this.index <= this.arr.length - 1) {
            this.index += this.arr.length;
            swiperTools.css(this.box, 'top', -(this.index + s) * h + 'px');
        }
    }



    // 垂直方向下移
    function VerticalDownMove(el, arr, op) {
        Banner.call(this, el, arr, op);
        this.curIndex = arr.length * 2 - op.index; //轮播的索引
    }
    swiperTools.extend(Banner, VerticalDownMove);

    // 设置单独样式
    VerticalDownMove.prototype.setStyles = function() {
        var arr = this.allItem;
        var h = this.hShow;
        arr.reverse();
        this.box.innerHTML = '';
        for (var i = 0; i < arr.length; i++) {
            swiperTools.css(arr[i], 'height', h);
            this.box.appendChild(arr[i].cloneNode(true));
        }
        swiperTools.css(this.box, {
            'width': this.w,
            'hight': parseInt(h) * this.arr.length * 3 + 'px',
            'top': -this.curIndex * parseInt(h) + 'px'
        });
        return this;
    }

    // 垂直下移的动画效果
    VerticalDownMove.prototype.offset = function() {
        var self = this;
        var s = this.options.scrollNum;
        this.status = 0;
        this.judge();
        this.curIndex = this.arr.length * 3 - 1 - this.index;
        this.dotChange();
        this.start(this.curIndex);
        swiperTools.animation(this.box, {
            'top': -this.curIndex * parseInt(this.hShow) + 'px'
        }, this.options.tTime, function() {
            self.status = 1;
            self.end();
        }, 'px');
    }

    //垂直下移效果的判断
    VerticalDownMove.prototype.judge = function() {
        var h = parseInt(this.hShow);
        var s = this.options.scrollNum;
        if (this.index >= this.arr.length * 2) {
            this.index -= this.arr.length;
            var curIndex = this.curIndex = this.arr.length * 3 - 1 - this.index;
            swiperTools.css(this.box, 'top', -(curIndex + s) * h + 'px');
        } else if (this.index <= this.arr.length - 1) {
            this.index += this.arr.length;
            var curIndex = this.curIndex = this.arr.length * 3 - 1 - this.index;
            swiperTools.css(this.box, 'top', -(curIndex - s) * h + 'px');
        }
    }

    // 淡入淡出效果
    function Fade(el, arr, op) {
        Banner.call(this, el, arr, op);
    }

    swiperTools.extend(Banner, Fade);

    // 设置单独样式
    Fade.prototype.setStyles = function() {
        var allItem = this.allItem;
        swiperTools.css(this.box, {
            'width': this.w,
            'hight': this.h
        });
        for (var i = 0; i < allItem.length; i++) {
            swiperTools.css(allItem[i], {
                'position': 'absolute',
                'left': '0',
                'top': '0',
                'zIndex': '-1'
            });
            swiperTools.setOpacity(allItem[i], 0);
        }
        swiperTools.setOpacity(allItem[this.index], 100);
        swiperTools.css(allItem[this.index], 'zIndex', '1');
        return this;
    }

    // 淡入淡出动画效果
    Fade.prototype.offset = function() {
        var self = this;
        var els = self.allItem;
        var t = self.options.tTime / 2;
        self.status = 0;
        self.judge();
        self.dotChange();
        this.start();
        for (var i = 0; i < els.length; i++) {
            swiperTools.setOpacity(els[i], 0);
            swiperTools.css(els[i], 'zIndex', '-1');
        }
        if (self.index == self.pIndex) {
            swiperTools.css(els[self.index], 'zIndex', '1');
            swiperTools.setOpacity(els[self.index], 100);
            self.status = 1;
        } else {
            swiperTools.css(els[self.pIndex], 'zIndex', '1');
            swiperTools.fadeOut(els[self.pIndex], t, function() {
                swiperTools.fadeIn(els[self.index], t, function() {
                    self.status = 1;
                    self.end();
                })
            })
        }
    }

    //淡入淡出效果的判断
    Fade.prototype.judge = function() {
        var self = this;
        var els = this.allItem;
        var s = self.options.scrollNum;
        if (this.index >= this.arr.length * 2) {
            self.pIndex = this.index - s;
            this.index -= this.arr.length;
            this.offset();
        } else if (this.index <= this.arr.length - 1) {
            self.pIndex = this.index + s;
            this.index -= this.arr.length * 2 - 1;
            this.offset();
        }
    }

    // 翻转效果
    function Rotate(el, arr, op) {
        Banner.call(this, el, arr, op);
    }

    swiperTools.extend(Banner, Rotate);

    // 设置单独样式
    Rotate.prototype.setStyles = function() {
        var allItem = this.allItem;
        swiperTools.css(this.box, {
            'width': '100%',
            'hight': '100%'
        });
        for (var i = 0; i < allItem.length; i++) {
            swiperTools.fix(allItem[i], {
                'position': 'absolute',
                'left': '0',
                'top': '0',
                'transform': 'rotateY(90deg)'
            })
        }
        swiperTools.fix(allItem[this.index], {
            'transform': 'rotateY(0) translateX(0)'
        })
        return this;
    }

    // 翻转动画效果
    Rotate.prototype.offset = function() {
        var self = this;
        var els = self.allItem;
        var t = self.options.tTime;
        self.status = 0;
        self.judge();
        self.dotChange();
        // for (var i = 0; i < els.length; i++) {
        //     swiperTools.setOpacity(els[i], 0);
        //     swiperTools.css(els[i], 'zIndex', '-1');
        // }
        if (self.index == self.pIndex) {
            self.status = 1;
        } else {
            // swiperTools.css(els[self.pIndex], 'zIndex', '1');
            // swiperTools.fadeOut(els[self.pIndex], t, function() {
            //     swiperTools.fadeIn(els[self.index], t, function() {
            //         self.status = 1;
            //     })
            // })
            swiperTools.rotateOut(els[self.pIndex], t, function() {
                swiperTools.fix(els[self.pIndex], {
                    'transform': 'rotateY(90deg)',
                    'transition': 'trasform 0s'
                })
            });
            swiperTools.rotateIn(els[self.index], t, function() {
                self.status = 1;
            });
        }

    }

    //翻转效果的判断
    Rotate.prototype.judge = function() {
        var self = this;
        var els = this.allItem;
        if (this.index >= this.arr.length * 2) {
            self.pIndex = this.index - 1;
            this.index = this.arr.length;
            // this.offset();
        } else if (this.index <= this.arr.length - 1) {
            self.pIndex = this.index + 1;
            this.index = this.arr.length * 2 - 1;
            // this.offset();
        }
    }


    // 默认值
    var defaultO = {
        way: 'left', //轮播方式
        tTime: 500, //一次轮播的时间
        index: 1, //初始位置
        wTime: 2000, //一次轮播结束后等待的时间
        arrow: true, //是否添加上下翻页箭头
        dots: true, //是否添加分页器
        event: 'click', //分页器的事件类型
        autoPlay: true, //是否自动播放
        lazy: false, //是否懒加载
        scrollNum: 1, //一次滚动多少张
        showNum: 1, //一次显示多少张
        end: function(i) {} //切换完成后执行的函数
    };

    //调用方式 
    var Way = {
        'up': VerticalUpMove,
        'left': LevelMove,
        'down': VerticalDownMove,
        'fade': Fade,
        // 'rotate': Rotate
    }

    // 初始化
    var init = function(options) {
        var op = swiperTools.combineObj(defaultO, options);
        var wraps = swiperTools.selectEl(options.el);
        var wrap;
        var banner; //存储实例
        var arr = []; //存储元素
        for (var n = 0; n < wraps.length; n++) {
            wrap = wraps[n];
            if (op.data) {
                if (op.lazy) {
                    for (var i = 0; i < op.data.length; i++) {
                        var img = document.createElement('img');
                        img.setAttribute('data-src', op.data[i]);
                        if (i == op.index - 1) {
                            img.src = op.data[i];
                        }
                        arr.push(img);
                    }
                } else {
                    for (var i = 0; i < op.data.length; i++) {
                        var img = document.createElement('img');
                        img.src = op.data[i];
                        arr.push(img);
                    }
                }
            } else {
                arr = swiperTools.selectEl('>*', wrap);
            }
            if (!Way[op.way]) {
                banner = new Way['left'](wrap, arr, op)
            } else {
                banner = new Way[op.way](wrap, arr, op);
            }
            banner.structure().setStyles().bindEvent();
            if (op.autoPlay) {
                banner.setTimer();
            }
            console.log(banner);
        }
    };
    return init;
}());
