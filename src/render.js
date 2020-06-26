import { createTextVNode, createElement} from './vdom/create-element';
export function renderMixin(Vue){
    Vue.prototype._render = function(){
        const vm = this;
        const { render } = vm.$options;

        Vue.prototype._c = function(){
            return createElement(...arguments);
        }

        Vue.prototype._v = function(text){
            //创建文本虚拟节点
            return createTextVNode(text);
        }

        Vue.prototype._s = function(val){
            return val == null? '': (typeof val === 'object' ? JSON.stringify(val) : val);
        }
        let vnode = render.call(this);
        return vnode
    }
}