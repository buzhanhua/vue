import {initState} from './state';
import { compileToFunctions } from './compiler/index';
import { mountComponent } from './lifecycle';
export function initMixin(Vue){
    Vue.prototype._init = function(options){
        // Vue的内部 $options 就是用户传递的所有参数
        const vm = this;
        vm.$options = options;
        // 初始化状态
        initState(vm);

        if(vm.$options.el){
            this.$mount(vm.$options.el);
        }
    };

    Vue.prototype.$mount = function(el){   
        const vm = this;
        el = vm.$el = document.querySelector(el);
        const opts = vm.$options;

        if(!opts.render){
            let template = opts.template;
            if(!template && el){
                template = el.outerHTML;//包含innerHTML的全部内容外, 还包含对象标签本身 s是个字符串
            }

            const render = compileToFunctions(template); // 表示将模板编译为render函数

            opts.render = render;
        }
        
        mountComponent(vm,el);
        
        //opts.render();
        
    }
}