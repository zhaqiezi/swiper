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

/**
 * 仿jquery的选择器
 * 支持类选择器，ID选择器和标签选择器，支持子元素选择，不支持多个类选择和关系选择。
 * @param {.class或者#id或者tag} selector 选择器,用来选择元素 
 * @param {dom元素} parent 选择器的父元素,用来精确选择,如果是子元素选择器,则是必须的
 * @returns 返回一个存储dom元素的数组,是数组,不是dom对象
 */
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

/**
 * 用原生js合并两个对象
 * @param {object} o 合并对象中的被覆盖对象 
 * @param {object} p 合并对象中的覆盖对象
 * @returns 返回一个合并后的新对象
 */
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
        for (var i = 0; i < arr.length; i++) {
            var item = arr[i];
            if (Math.abs(parseInt(item.from) - parseInt(item.to)) > Math.abs(item.n)) {
                el.style[item.key] = parseInt(item.from) + item.n + dw;
                item.from = css(el, item.key);
            } else {
                item.bool = 1;
                el.style[item.key] = item.to;
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

// 设置透明度
function setOpacity(ele, opacity) {
    if (ele.style.opacity != undefined) {
        ///兼容FF和GG和新版本IE 
        ele.style.opacity = opacity / 100;

    } else {
        ///兼容老版本ie 
        ele.style.filter = "alpha(opacity=" + opacity + ")";
    }
}
// 淡入效果
function fadeIn(el, t, f) {
    var opacity = 0;
    el.style.zIndex = 1;
    var time = t / 100;
    var timer = setInterval(function() {
        setOpacity(el, ++opacity);
        if (opacity >= 100) {
            clearInterval(timer);
            f && typeof f == 'function' && f();
        }
    }, time);
}
// 淡出效果
function fadeOut(el, t, f) {
    var opacity = 100;
    var time = t / 100;
    var timer = setInterval(function() {
        setOpacity(el, --opacity);
        if (opacity <= 0) {
            el.style.zIndex = -1;
            clearInterval(timer);
            f && typeof f == 'function' && f();
        }
    }, time);
}

function fix(el, styles) {
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
    css(el, oStyles);
}

function rotateIn(el, t, f) {
    var stys = {
        'transform': 'rotateY(0) translateX(0)',
        'transition': 'transform ' + t + 'ms'
    };
    fix(el, stys);
    f && typeof f == 'function' && setTimeout(f, t);
}

function rotateOut(el, t, f) {
    var stys = {
        'transform': 'rotateY(-90deg) translateX(-100%)'
    }
    fix(el, stys);
    f && typeof f == 'function' && setTimeout(f, t);
}
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
        this.w = css(el, 'width'); //最外层的宽度
        this.h = css(el, 'height'); //最外层的高度
        this.status = 1; //定时器运行的状态
        this.pIndex = this.index; //前一个索引
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
        this.allItem = allItem;
        for (var i = 0; i < allItem.length; i++) {
            css(allItem[i], {
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
                addHandler(this.dots[i], self.options.event, function() {
                    if (self.status) {
                        self.pIndex = self.index;
                        self.index = this.index;
                        self.offset();
                    }
                })
            }
        }
        if (ops.arrow) {
            addHandler(self.pre, 'click', function() {
                if (self.status) {
                    self.pIndex = self.index;
                    self.index--;
                    self.offset();
                }
            });
            addHandler(this.next, 'click', function() {
                if (self.status) {
                    self.pIndex = self.index;
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
                self.pIndex = self.index;
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
            'height': this.h,
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


    // 垂直方向上移
    function VerticalUpMove(el, arr, op) {
        Banner.call(this, el, arr, op);
    }
    extend(Banner, VerticalUpMove);

    // 设置单独样式
    VerticalUpMove.prototype.setStyles = function() {
        css(this.box, {
            'width': this.w,
            'hight': parseInt(this.h) * this.arr.length * 3 + 'px',
            'top': -this.index * parseInt(this.h) + 'px'
        });
        return this;
    }

    // 垂直上移的动画效果
    VerticalUpMove.prototype.offset = function() {
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

    //垂直上移效果的判断
    VerticalUpMove.prototype.judge = function() {
        if (this.index >= this.arr.length * 2) {
            this.index = this.arr.length;
            css(this.box, 'top', -(this.index - 1) * parseInt(this.h) + 'px');
        } else if (this.index <= this.arr.length - 1) {
            this.index = this.arr.length * 2 - 1;
            css(this.box, 'top', -(this.index + 1) * parseInt(this.h) + 'px');
        }
    }



    // 垂直方向下移
    function VerticalDownMove(el, arr, op) {
        Banner.call(this, el, arr, op);
        this.curIndex = arr.length * 2 - op.index; //轮播的索引
    }
    extend(Banner, VerticalDownMove);

    // 设置单独样式
    VerticalDownMove.prototype.setStyles = function() {
        var arr = this.allItem;
        arr.reverse();
        this.box.innerHTML = '';
        for (var i = 0; i < arr.length; i++) {
            this.box.appendChild(arr[i].cloneNode(true));
        }
        css(this.box, {
            'width': this.w,
            'hight': parseInt(this.h) * this.arr.length * 3 + 'px',
            'top': -this.curIndex * parseInt(this.h) + 'px'
        });
        return this;
    }

    // 垂直下移的动画效果
    VerticalDownMove.prototype.offset = function() {
        var self = this;
        this.status = 0;
        this.judge();
        this.curIndex = this.arr.length * 3 - 1 - this.index;
        this.dotChange();
        animation(this.box, {
            'top': -this.curIndex * parseInt(this.h) + 'px'
        }, this.options.tTime, function() {
            self.status = 1;
        }, 'px');
    }

    //垂直下移效果的判断
    VerticalDownMove.prototype.judge = function() {
        if (this.index >= this.arr.length * 2) {
            this.index = this.arr.length;
            var curIndex = this.curIndex = this.arr.length * 3 - 1 - this.index;
            css(this.box, 'top', -(curIndex + 1) * parseInt(this.h) + 'px');
        } else if (this.index <= this.arr.length - 1) {
            this.index = this.arr.length * 2 - 1;
            var curIndex = this.curIndex = this.arr.length * 3 - 1 - this.index;
            css(this.box, 'top', -(curIndex - 1) * parseInt(this.h) + 'px');
        }
    }

    // 淡入淡出效果
    function Fade(el, arr, op) {
        Banner.call(this, el, arr, op);
    }

    extend(Banner, Fade);

    // 设置单独样式
    Fade.prototype.setStyles = function() {
        var mask = document.createElement('div');
        css(mask, {
            'position': 'absolute',
            'left': '0',
            'top': '0',
            'width': this.w,
            'height': this.h,
            'zIndex': '0',
            'backgroundColor': '#ccc'
        });
        this.box.appendChild(mask);
        var allItem = this.allItem;
        css(this.box, {
            'width': '100%',
            'hight': '100%'
        });
        for (var i = 0; i < allItem.length; i++) {
            css(allItem[i], {
                'position': 'absolute',
                'left': '0',
                'top': '0',
                'zIndex': '-1'
            });
            setOpacity(allItem[i], 0);
        }
        setOpacity(allItem[this.index], 100);
        css(allItem[this.index], 'zIndex', '1');
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
        for (var i = 0; i < els.length; i++) {
            setOpacity(els[i], 0);
            css(els[i], 'zIndex', '-1');
        }
        if (self.index == self.pIndex) {
            css(els[self.index], 'zIndex', '1');
            setOpacity(els[self.index], 100);
            self.status = 1;
        } else {
            css(els[self.pIndex], 'zIndex', '1');
            fadeOut(els[self.pIndex], t, function() {
                fadeIn(els[self.index], t, function() {
                    self.status = 1;
                })
            })
        }
    }

    //淡入淡出效果的判断
    Fade.prototype.judge = function() {
        var self = this;
        var els = this.allItem;
        if (this.index >= this.arr.length * 2) {
            self.pIndex = this.index - 1;
            this.index = this.arr.length;
            this.offset();
        } else if (this.index <= this.arr.length - 1) {
            self.pIndex = this.index + 1;
            this.index = this.arr.length * 2 - 1;
            this.offset();
        }
    }

    // 翻转效果
    function Rotate(el, arr, op) {
        Banner.call(this, el, arr, op);
    }

    extend(Banner, Rotate);

    // 设置单独样式
    Rotate.prototype.setStyles = function() {
        var allItem = this.allItem;
        css(this.box, {
            'width': '100%',
            'hight': '100%'
        });
        for (var i = 0; i < allItem.length; i++) {
            fix(allItem[i], {
                'position': 'absolute',
                'left': '0',
                'top': '0',
                'transform': 'rotateY(90deg)'
            })
        }
        fix(allItem[this.index], {
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
        //     setOpacity(els[i], 0);
        //     css(els[i], 'zIndex', '-1');
        // }
        if (self.index == self.pIndex) {
            self.status = 1;
        } else {
            // css(els[self.pIndex], 'zIndex', '1');
            // fadeOut(els[self.pIndex], t, function() {
            //     fadeIn(els[self.index], t, function() {
            //         self.status = 1;
            //     })
            // })
            rotateOut(els[self.pIndex], t, function() {
                fix(els[self.pIndex], {
                    'transform': 'rotateY(90deg)',
                    'transition': 'trasform 0s'
                })
            });
            rotateIn(els[self.index], t, function() {
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
        lazy: false
    };

    //调用方式 
    var Way = {
        'up': VerticalUpMove,
        'left': LevelMove,
        'down': VerticalDownMove,
        'fade': Fade,
        'rotate': Rotate
    }

    // 初始化
    var init = function(options) {
        var op = combineObj(defaultO, options);
        var wraps = selectEl(options.el);
        var wrap;
        var banner; //存储实例
        var arr = []; //存储元素
        for (var n = 0; n < wraps.length; n++) {
            wrap = wraps[n];
            if (op.data) {
                for (var i = 0; i < op.data.length; i++) {
                    var img = document.createElement('img');
                    img.src = op.data[i];
                    arr.push(img);
                }
            } else {
                arr = selectEl('>*', wrap);
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