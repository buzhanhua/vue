import { initMixin } from './init';
import { renderMixin } from './render';
import { lifeCycleMixin } from './lifecycle';
function Vue(options){
    // 一个Vue实例生成，最先要做初始化操作；
    this._init(options); // 整个项目的初始化
}
// 给Vue的原型链上混入初始化方法
initMixin(Vue);
renderMixin(Vue);
lifeCycleMixin(Vue);

export default Vue;