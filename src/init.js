import {initState} from './state';
export function initMixin(Vue){
    Vue.prototype._init = function(options){
        // Vue的内部 $options 就是用户传递的所有参数
        const vm = this;
        vm.$options = options;
        // 初始化状态
        initState(vm);
    };
}