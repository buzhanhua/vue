import { observe,Observer } from './observer/index';
export function initState(vm){
    const opts = vm.$options;
    if(opts.props){
        initProps(vm);
    }
    if(opts.methods){
        initMethods(vm);
    }
    if(opts.data){
        initData(vm);
    }
}

function initProps(){};
function initMethods(){};
// 代理
function proxy(vm,source,key){
    Object.defineProperty(vm,key,{
        get(){
            return vm[source][key]
        },
        set(newValue){
            vm[source][key] = newValue;
        }
    })
}

function initData(vm){
    // 数据响应式原理
    let data = vm.$options.data;
    data = vm._data = typeof data === 'function' ? data.call(vm) : data;

    if(data.__ob__ instanceof Observer){ // 防止数据被多次观测
        return ;
    }
    // 将属性代理到实例上
    for(let key in data){
        proxy(vm,'_data',key);
    }

    // 观察数据
    observe(data);
};
