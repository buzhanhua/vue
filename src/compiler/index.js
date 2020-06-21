import { parserHTML } from './parser';
import { generate } from './generate';
export function compileToFunctions(template){
    
    let ast = parserHTML(template); // 将模板变为ast语法树

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
    let code = generate(ast); // 代码生成

    code = `with(this){return ${code}}`;

    // 合成事件 自闭和标签
    let render = new Function(code);
    
    return render;
}