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
    }

    for (var key in data) {
      proxy(vm, '_data', key);
    } // 观察数据


    observe(data);
  }

  function initMixin(Vue) {
    Vue.prototype._init = function (options) {
      // Vue的内部 $options 就是用户传递的所有参数
      var vm = this;
      vm.$options = options; // 初始化状态

      initState(vm);
    };
  }

  function Vue(options) {
    // 一个Vue实例生成，最先要做初始化操作；
    this._init(options); // 整个项目的初始化

  } // 给Vue的原型链上混入初始化方法


  initMixin(Vue);

  return Vue;

})));
//# sourceMappingURL=vue.js.map
