(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
  typeof define === 'function' && define.amd ? define(factory) :
  (global = global || self, global.Vue = factory());
}(this, (function () { 'use strict';

  function _typeof(obj) {
    "@babel/helpers - typeof";

    if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") {
      _typeof = function (obj) {
        return typeof obj;
      };
    } else {
      _typeof = function (obj) {
        return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
      };
    }

    return _typeof(obj);
  }

  function _classCallCheck(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
      throw new TypeError("Cannot call a class as a function");
    }
  }

  function _defineProperties(target, props) {
    for (var i = 0; i < props.length; i++) {
      var descriptor = props[i];
      descriptor.enumerable = descriptor.enumerable || false;
      descriptor.configurable = true;
      if ("value" in descriptor) descriptor.writable = true;
      Object.defineProperty(target, descriptor.key, descriptor);
    }
  }

  function _createClass(Constructor, protoProps, staticProps) {
    if (protoProps) _defineProperties(Constructor.prototype, protoProps);
    if (staticProps) _defineProperties(Constructor, staticProps);
    return Constructor;
  }

  function _slicedToArray(arr, i) {
    return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _unsupportedIterableToArray(arr, i) || _nonIterableRest();
  }

  function _arrayWithHoles(arr) {
    if (Array.isArray(arr)) return arr;
  }

  function _iterableToArrayLimit(arr, i) {
    if (typeof Symbol === "undefined" || !(Symbol.iterator in Object(arr))) return;
    var _arr = [];
    var _n = true;
    var _d = false;
    var _e = undefined;

    try {
      for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) {
        _arr.push(_s.value);

        if (i && _arr.length === i) break;
      }
    } catch (err) {
      _d = true;
      _e = err;
    } finally {
      try {
        if (!_n && _i["return"] != null) _i["return"]();
      } finally {
        if (_d) throw _e;
      }
    }

    return _arr;
  }

  function _unsupportedIterableToArray(o, minLen) {
    if (!o) return;
    if (typeof o === "string") return _arrayLikeToArray(o, minLen);
    var n = Object.prototype.toString.call(o).slice(8, -1);
    if (n === "Object" && o.constructor) n = o.constructor.name;
    if (n === "Map" || n === "Set") return Array.from(o);
    if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen);
  }

  function _arrayLikeToArray(arr, len) {
    if (len == null || len > arr.length) len = arr.length;

    for (var i = 0, arr2 = new Array(len); i < len; i++) arr2[i] = arr[i];

    return arr2;
  }

  function _nonIterableRest() {
    throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
  }

  function isObject(obj) {
    // 使用typeof 这里可以将array判断为object；
    return _typeof(obj) === 'object' && obj !== null;
  }

  // 我们重写数组方法的目的是：当用户使用部分数组方法操作数据的时候，对需要加以观测的数据进行观测。
  // 所以: 1. 不能直接更改数组原型，影响其他Array的使用。
  //       2. 重写后的数组，还可以拿到数组所有的方法。
  var oldArrayMethods = Array.prototype; // 获取数组原型上的方法。
  // 创建一个全新的对象(__proto__指向数组的原型) 可以找到数组原型上所有的方法, 而且修改对象不会影响
  // 数组原型方法

  var arrayMethods = Object.create(oldArrayMethods);
  var methods = [// 这七个方法都会改变原数组， 不改变原数组，我们没必要重写（对数据不产生影响）
  'push', 'pop', 'shift', 'unshift', 'sort', 'reverse', 'splice'];
  methods.forEach(function (method) {
    arrayMethods[method] = function () {
      // 函数劫持 AOP的思想
      // 当用户调用数组方法时 会先执行我自己改造的逻辑 在执行数组默认的逻辑
      var ob = this.__ob__;

      for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
        args[_key] = arguments[_key];
      }

      var result = oldArrayMethods[method].apply(this, args);
      var inserted;
      console.log('劫持', args); // push unshift splice 都可以新增属性 （新增的属性可能是一个对象）,对这种对象Vue,也做了观测

      switch (method) {
        case 'push':
        case 'unshift':
          inserted = args;
          break;

        case 'splice':
          inserted = args.slice(2); // splice第三个参数开始才是新增的

          break;
      }
      inserted && ob.observeArray(inserted);
      return result;
    };
  });

  var Observer = /*#__PURE__*/function () {
    function Observer(data) {
      _classCallCheck(this, Observer);

      // __ob__ 是数据响应式的标识， 对象和数组都有， 存在则说明该数据已经被观测， 可以作为判断
      Object.defineProperty(data, '__ob__', {
        enumerable: false,
        // 表示不可枚举
        configurable: false,
        // 表示不可配置， 不可以改
        value: this
      }); //data.__ob__ = this; 相当于在数据上可以获取到__ob__这个属性 指代的是Observer的实例,死循环的问题

      if (Array.isArray(data)) {
        // 需要对数组进行特殊处理， 因为我们使用数组一般都是进行列表渲染， 很少用 arr[1] = xxx的情况
        // 不做特殊处理的话， 就会对数组每一项都添加递归添加get set。对大型数据，很影响性能。
        // 以检索的方式直接更改数据监测不到，Vue放弃检测以索引的方式的改动， 采用 "函数劫持" 的方式重写数组的方法。
        data.__proto__ = arrayMethods; // 改写数组类型的原型链，指向重写的方法。
        // Vue中可以监测到 [{a:1}] ===> [][0].a = 2 这种情况，简单的说， 数组的中的对象也是可以被监测到的

        this.observeArray(data);
      } else {
        this.walk(data); // 对数据每一项都添加get set， 一步步处理
      }
    }

    _createClass(Observer, [{
      key: "observeArray",
      value: function observeArray(data) {
        for (var i = 0; i < data.length; i++) {
          observe(data[i]);
        }
      }
    }, {
      key: "walk",
      value: function walk(data) {
        // 不要用 for in ，因为会对原型遍历
        Object.keys(data).forEach(function (key) {
          defineReactive(data, key, data[key]);
        });
      }
    }]);

    return Observer;
  }(); // 这里需要注意的是， 并没有改变被defineProperty重写对象的引用地址，所以重写后
  // 还是原来的关系拼接。
  // 这也是Vue2.0的性能问题， 递归重写get set， Vue3.0使用proxy

  function defineReactive(data, key, value) {
    observe(value); // 如果传入的值还是一个对象，就做递归循环检测

    Object.defineProperty(data, key, {
      get: function get() {
        return value;
      },
      set: function set(newValue) {
        if (value === newValue) return;
        observe(newValue); // 用户设置的值也可能是引用类型，也需要检测

        value = newValue;
      }
    });
  }

  function observe(data) {
    // 如果传入的数据是 非obj 或者 null时直接返回， 这么判断是基于初始是一个对象或者数组
    // 基本数据类型被上一层引用数据类型使用defineProperty改写， 添加了get set
    if (!isObject(data)) {
      return;
    } // 使用defineProperty进行重写


    return new Observer(data);
  }

  function initState(vm) {
    var opts = vm.$options;

    if (opts.props) ;

    if (opts.methods) ;

    if (opts.data) {
      initData(vm);
    }
  }

  function proxy(vm, source, key) {
    Object.defineProperty(vm, key, {
      get: function get() {
        return vm[source][key];
      },
      set: function set(newValue) {
        vm[source][key] = newValue;
      }
    });
  }

  function initData(vm) {
    // 数据响应式原理
    var data = vm.$options.data;
    data = vm._data = typeof data === 'function' ? data.call(vm) : data;

    if (data.__ob__ instanceof Observer) {
      // 防止数据被多次观测
      return;
    } // 将属性代理到实例上


    for (var key in data) {
      proxy(vm, '_data', key);
    } // 观察数据


    observe(data);
  }

  // 以字母a-zA-Z_开头  - . 数组小写字母 大写字母任意多个  
  // 后续要放进RegExp构造器中，是个字符串， 所以使用两个 '/'
  var ncname = "[a-zA-Z_][\\-\\.0-9_a-zA-Z]*"; // 标签名
  // ?:匹配不捕获   <aaa:aaa>
  // 正则子表达式 ： 子表达式是一个大的表达式的一部分， 把一个表达式划分为多个子表达式的目的是为了把那些子表达式当做一个独立的
  // 元素来使用。 子表达式必须使用 （） 括起来。
  // 字符串的 str.match(reg) 方法用于在字符串内检索指定的值，或者找到一个或者多个正则表达式的匹配
  // 返回值 能匹配到返回一个存放匹配结果的数组 不能匹配到则返回null
  // 能匹配到还分为两种情况 ：
  // 1. 没有g。 该数组的第 0 个元素存放的是匹配文本，而其余的元素存放的是与正则表达式的子表达式匹配的文本。
  //   除了这些常规的数组元素之外，返回的数组还含有两个对象属性。index 属性声明的是匹配文本的起始字符在 stringObject 中的位置，
  //  input 属性声明的是对 stringObject 的引用。
  // 2. 有g。 如果找到了一个或多个匹配子串，则返回一个数组。不过全局匹配返回的数组的内容与前者大不相同，它的数组元素中存放的是 stringObject 中所有的匹配子串，
  //   而且也没有 index 属性或 input 属性。
  // 解释 ：?:表示匹配不捕获 。 <aaa:aaa 的结果如下
  // 1. 加?: ===> ["<aaa:aaa", "aaa:aaa", index: 0, input: "<aaa:aaa", groups: undefined]
  // 2. 不加 ?: ===> ["<aaa:aaa", "aaa:aaa", "aaa:", index: 0, input: "<aaa:aaa", groups: undefined]

  var qnameCapture = "((?:".concat(ncname, "\\:)?").concat(ncname, ")"); // startTagOpen 可以匹配到开始标签 正则捕获到的内容是 (标签名)

  var startTagOpen = new RegExp("^<".concat(qnameCapture)); // 标签开头的正则 捕获的内容是标签名
  // 闭合标签 </xxxxxxx>  

  var endTag = new RegExp("^<\\/".concat(qnameCapture, "[^>]*>")); // 匹配标签结尾的 </div>
  // <div aa   =   "123"  bb=123  cc='123'
  // 捕获到的是 属性名 和 属性值 arguments[1] || arguments[2] || arguments[2]

  var attribute = /^\s*([^\s"'<>\/=]+)(?:\s*(=)\s*(?:"([^"]*)"+|'([^']*)'+|([^\s"'=<>`]+)))?/; // 匹配属性的
  // <div >   <br/>

  var startTagClose = /^\s*(\/?)>/; // 匹配标签结束的 >
  // 将模板变为ast语法树
  // 1. 从字符串中读取数据，使用字符串从左到右（使用这个方向的原因是正则上做了限制）逐步截取
  // 2. 组装树

  function parserHTML(html) {
    // <div id="app" style="color:red"><span>nnnn{{age}}</span>wwwww<p></p></div>
    var root; // 根

    var currentParent = null; // 指当前解析的变量是谁

    var stack = []; // 建立栈结构，用于判断标签是否正常闭合

    function createASTElement(tagname, attrs) {
      return {
        tag: tagname,
        attrs: attrs,
        children: [],
        parent: null,
        type: 1 // 表示节点类型 1为html元素节点 3为文本节点

      };
    }

    function start(tagname, attrs) {
      var element = createASTElement(tagname, attrs);

      if (!root) {
        root = element;
      }

      currentParent = element;
      stack.push(element);
    }

    function end(tagname) {
      // 在结束时确立父子关系
      var element = stack.pop(); // 拿到当前元素

      var parent = stack[stack.length - 1]; // 需要对单标签进行特殊处理，目前没有处理
      // if(tagname !== element.tag){
      //     throw new Error('标签闭合错误')
      // }

      if (parent) {
        element.parent = parent;
        parent.children.push(element);
      }
    }

    function chars(text) {
      text = text.replace(/\s/g, ''); // 去掉空格排除全是空格的文本节点

      if (text) {
        currentParent.children.push({
          type: 3,
          text: text
        });
      }
    } // 循环解析标签


    while (html) {
      var textEnd = html.indexOf('<');

      if (textEnd === 0) {
        var startTagMatch = parserStartTag();

        if (startTagMatch) {
          start(startTagMatch.tagname, startTagMatch.attrs);
        }

        var endTagMatch = html.match(endTag);

        if (endTagMatch) {
          advance(endTagMatch[0].length);
          end(endTagMatch[1]);
        }
      } // 如果不是0则说明是文本


      var text = void 0;

      if (textEnd > 0) {
        text = html.substring(0, textEnd); // 文本截取
      }

      if (text) {
        advance(text.length); // 删除文本

        chars(text);
      }
    }

    function advance(n) {
      html = html.substring(n);
    } // 解析标签开头


    function parserStartTag() {
      var start = html.match(startTagOpen);

      if (start) {
        var match = {
          tagname: start[1],
          attrs: []
        };
        advance(start[0].length);

        var _end, attr; // 循环解析属性


        while (!(_end = html.match(startTagClose)) && (attr = html.match(attribute))) {
          advance(attr[0].length);
          match.attrs.push({
            name: attr[1],
            value: attr[3] || attr[4] || attr[5]
          }); // [" style="color:red"", "style", "=", "color:red", undefined, undefined, index: 0, input: " style="color:red"><span>nnnn{{age}}</span>wwwww<p></p></div>", groups: undefined]
          // console.log(attr)
        }

        if (_end) {
          advance(_end[0].length);
          return match;
        }
      }
    }

    return root;
  }

  // 匹配动态变量的  +? 尽可能少匹配
  var defaultTagRE = /\{\{((?:.|\r?\n)+?)\}\}/g;

  function genProps(attrs) {
    var str = '';

    for (var i = 0; i < attrs.length; i++) {
      var attr = attrs[i];

      if (attr.name === 'style') {
        (function () {
          var obj = {};
          attr.value.split(';').forEach(function (item) {
            var _item$split = item.split(':'),
                _item$split2 = _slicedToArray(_item$split, 2),
                key = _item$split2[0],
                value = _item$split2[1];

            obj[key] = value;
          });
          attr.value = obj;
        })();
      }

      str += "".concat(attr.name, ":").concat(JSON.stringify(attr.value), ",");
    }

    return "{".concat(str.slice(0, -1), "}");
  }

  function gen(el) {
    if (el.type === 1) {
      return generate(el);
    } else {
      // 处理文本
      var text = el.text;

      if (!defaultTagRE.test(text)) {
        return "_v(".concat(JSON.stringify(text), ")");
      } else {
        // 注意：正则添加全局匹配后，每一次匹配后，正则的lastIndex属性都会变为上次捕获的下标
        var tokens = [];
        var lastIndex = defaultTagRE.lastIndex = 0;
        var match, index;

        while (match = defaultTagRE.exec(text)) {
          index = match.index;
          tokens.push(JSON.stringify(text.slice(lastIndex, index)));
          tokens.push("_s(".concat(match[1].trim(), ")"));
          lastIndex = index + match[0].length;
        }

        if (lastIndex < text.length) {
          tokens.push(JSON.stringify(text.slice(lastIndex)));
        }

        return "_v(".concat(tokens.join('+'), ")");
      }
    }
  }

  function genChildren(el) {
    if (el.children.length > 0) {
      return el.children.map(function (c) {
        return gen(c);
      }).join(',');
    } else {
      return false;
    }
  }

  function generate(el) {
    var children = genChildren(el);
    var code = "_c(\"".concat(el.tag, "\",").concat(el.attrs.length ? genProps(el.attrs) : undefined, " ").concat(children ? ",".concat(children) : '', ")");
    return code;
  }

  function compileToFunctions(template) {
    var ast = parserHTML(template); // 将模板变为ast语法树
    // 代码生成
    // template => render 函数

    /**
     * react 
     * render(){ 
        * with(this){
        *  return _c('div',{id:app,style:{color:red}},_c('span',undefined,_v("helloworld"+_s(msg)) ))
        * }
     * }
     * 
     */
    // 核心就是字符串拼接

    var code = generate(ast); // 代码生成

    code = "with(this){return ".concat(code, "}"); // 合成事件 自闭和标签

    var render = new Function(code);
    return render;
  }

  var Watcher = function Watcher(vm, exprOrFn, cb, options) {
    _classCallCheck(this, Watcher);

    exprOrFn();
  };

  function patch(oldVnode, newVnode) {
    var isRealElement = oldVnode.nodeType;

    if (isRealElement) {
      var oldElm = oldVnode; // 拿到当前页面的挂载元素

      var parentElm = oldElm.parentNode; // 拿到父节点

      var el = createElm(newVnode); // 操作DOM

      parentElm.insertBefore(el, oldElm.nextSibling);
      parentElm.removeChild(oldElm);
      return el;
    }
  }

  function createElm(vnode) {
    var tag = vnode.tag,
        data = vnode.data,
        key = vnode.key,
        children = vnode.children,
        text = vnode.text;

    if (typeof tag === 'string') {
      // 将虚拟节点和真实节点做个映射关系 （后面diff时如果元素相同直接复用老元素 ）
      vnode.el = document.createElement(tag);
      updateProperties(vnode);
      children.forEach(function (child) {
        // 递归渲染子节点，将子节点渲染进父节点
        vnode.el.appendChild(createElm(child));
      });
    } else {
      vnode.el = document.createTextNode(text);
    }

    return vnode.el;
  } // 更新属性


  function updateProperties(vnode) {
    var el = vnode.el;
    var newProps = vnode.data || {};

    for (var key in newProps) {
      if (key === "style") {
        for (var styleKey in newProps.style) {
          el.style[styleKey] = newProps.style[styleKey];
        }
      } else {
        el.setAttribute(key, newProps[key]);
      }
    }
  }

  function lifeCycleMixin(Vue) {
    Vue.prototype._update = function (vnode) {
      var vm = this;
      vm.$el = patch(vm.$el, vnode);
    };
  }
  function mountComponent(vm, el) {
    // Vue并不是MVVM框架，但是遵循响应式数据原理
    // Vue在渲染过程中会创建一个 "渲染Watcher" 可以简单地理解为回调， 每次数据变化， 就会重新执行
    // updateComponent方法，进行更新操作。
    var updateComponent = function updateComponent() {
      // vm._render 中会调用render方法， 生成虚拟DOM
      // vm._update 会将虚拟DOM转化为真实DOM
      vm._update(vm._render());
    };

    new Watcher(vm, updateComponent, function () {}, true);
  }

  function initMixin(Vue) {
    Vue.prototype._init = function (options) {
      // Vue的内部 $options 就是用户传递的所有参数
      var vm = this;
      vm.$options = options; // 初始化状态

      initState(vm);

      if (vm.$options.el) {
        this.$mount(vm.$options.el);
      }
    };

    Vue.prototype.$mount = function (el) {
      var vm = this;
      el = vm.$el = document.querySelector(el);
      var opts = vm.$options;

      if (!opts.render) {
        var template = opts.template;

        if (!template && el) {
          template = el.outerHTML; //包含innerHTML的全部内容外, 还包含对象标签本身 s是个字符串
        }

        var render = compileToFunctions(template); // 表示将模板编译为render函数

        opts.render = render;
      }

      mountComponent(vm); //opts.render();
    };
  }

  function createElement(tag) {
    var data = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
    // vue中的key 不会作为属性传递给组件
    var key = data.key;

    if (key) {
      delete data.key;
    }

    for (var _len = arguments.length, children = new Array(_len > 2 ? _len - 2 : 0), _key = 2; _key < _len; _key++) {
      children[_key - 2] = arguments[_key];
    }

    return vnode(tag, data, key, children);
  }
  function createTextVNode(text) {
    return vnode(undefined, undefined, undefined, undefined, text);
  }

  function vnode(tag, data, key, children, text) {
    return {
      tag: tag,
      data: data,
      key: key,
      children: children,
      text: text
    };
  }

  function renderMixin(Vue) {
    Vue.prototype._render = function () {
      var vm = this;
      var render = vm.$options.render;

      Vue.prototype._c = function () {
        return createElement.apply(void 0, arguments);
      };

      Vue.prototype._v = function (text) {
        //创建文本虚拟节点
        return createTextVNode(text);
      };

      Vue.prototype._s = function (val) {
        return val == null ? '' : _typeof(val) === 'object' ? JSON.stringify(val) : val;
      };

      var vnode = render.call(this);
      return vnode;
    };
  }

  function Vue(options) {
    // 一个Vue实例生成，最先要做初始化操作；
    this._init(options); // 整个项目的初始化

  } // 给Vue的原型链上混入初始化方法


  initMixin(Vue);
  renderMixin(Vue);
  lifeCycleMixin(Vue);

  return Vue;

})));
//# sourceMappingURL=vue.js.map
