
// 我们重写数组方法的目的是：当用户使用部分数组方法操作数据的时候，对需要加以观测的数据进行观测。
// 所以: 1. 不能直接更改数组原型，影响其他Array的使用。
//       2. 重写后的数组，还可以拿到数组所有的方法。

let oldArrayMethods = Array.prototype; // 获取数组原型上的方法。

// 创建一个全新的对象(__proto__指向数组的原型) 可以找到数组原型上所有的方法, 而且修改对象不会影响
// 数组原型方法

export let arrayMethods = Object.create(oldArrayMethods);

let methods = [ // 这七个方法都会改变原数组， 不改变原数组，我们没必要重写（对数据不产生影响）
    'push',
    'pop',
    'shift',
    'unshift',
    'sort',
    'reverse',
    'splice'
];

methods.forEach(method => {
    arrayMethods[method] = function(...args){ // 函数劫持 AOP的思想
        // 当用户调用数组方法时 会先执行我自己改造的逻辑 在执行数组默认的逻辑
        const ob = this.__ob__;
        let result = oldArrayMethods[method].apply(this,args);
        let inserted;
        console.log('劫持',args)
        // push unshift splice 都可以新增属性 （新增的属性可能是一个对象）,对这种对象Vue,也做了观测
        switch(method){
            case 'push':
            case 'unshift':
                inserted = args;
                break;
            case 'splice':
                inserted = args.slice(2); // splice第三个参数开始才是新增的
                break;
            default:
                break;
        };

        inserted && ob.observeArray(inserted);

        return result;

    }
})

