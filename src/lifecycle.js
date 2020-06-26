import Watcher from './observer/watcher';
import { patch} from './vdom/patch';
export function lifeCycleMixin(Vue){
    Vue.prototype._update = function(vnode){
        const vm = this;
        vm.$el = patch(vm.$el,vnode);
    }
}

export function mountComponent(vm,el){
    // Vue并不是MVVM框架，但是遵循响应式数据原理
    // Vue在渲染过程中会创建一个 "渲染Watcher" 可以简单地理解为回调， 每次数据变化， 就会重新执行
    // updateComponent方法，进行更新操作。


    const updateComponent = () => {
        // vm._render 中会调用render方法， 生成虚拟DOM
        // vm._update 会将虚拟DOM转化为真实DOM
        vm._update(vm._render());
    };

    new Watcher(vm,updateComponent,() => {},true);

}