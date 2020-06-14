import {isObject} from '../util.js';
import {arrayMethods} from './array';

export class Observer{
    constructor(data){
        // __ob__ 是数据响应式的标识， 对象和数组都有， 存在则说明该数据已经被观测， 可以作为判断
        Object.defineProperty(data,'__ob__',{
            enumerable: false, // 表示不可枚举
            configurable: false, // 表示不可配置， 不可以改
            value: this
        })
        //data.__ob__ = this; 相当于在数据上可以获取到__ob__这个属性 指代的是Observer的实例,死循环的问题

        if(Array.isArray(data)){
            // 需要对数组进行特殊处理， 因为我们使用数组一般都是进行列表渲染， 很少用 arr[1] = xxx的情况
            // 不做特殊处理的话， 就会对数组每一项都添加递归添加get set。对大型数据，很影响性能。

            // 以检索的方式直接更改数据监测不到，Vue放弃检测以索引的方式的改动， 采用 "函数劫持" 的方式重写数组的方法。

            data.__proto__ = arrayMethods; // 改写数组类型的原型链，指向重写的方法。

            // Vue中可以监测到 [{a:1}] ===> [][0].a = 2 这种情况，简单的说， 数组的中的对象也是可以被监测到的

            this.observeArray(data);

        }else{
            this.walk(data);// 对数据每一项都添加get set， 一步步处理
        }

    }

    observeArray(data){
        for( let i = 0; i < data.length ; i++){
            observe(data[i]);
        }
    }

    walk(data){
        // 不要用 for in ，因为会对原型遍历
        Object.keys(data).forEach((key) => {
            defineReactive(data,key,data[key]);
        })
    }
}

// 这里需要注意的是， 并没有改变被defineProperty重写对象的引用地址，所以重写后
// 还是原来的关系拼接。
// 这也是Vue2.0的性能问题， 递归重写get set， Vue3.0使用proxy
function defineReactive(data,key,value){
    observe(value); // 如果传入的值还是一个对象，就做递归循环检测
    Object.defineProperty(data,key,{
        get(){
            return value;
        },
        set(newValue){
            if(value === newValue) return;
            observe(newValue); // 用户设置的值也可能是引用类型，也需要检测
            value = newValue;
        }
    })
}

export function observe(data){
    // 如果传入的数据是 非obj 或者 null时直接返回， 这么判断是基于初始是一个对象或者数组
    // 基本数据类型被上一层引用数据类型使用defineProperty改写， 添加了get set
    if(!isObject(data)){
        return;
    }
    // 使用defineProperty进行重写
    return new Observer(data);
}
