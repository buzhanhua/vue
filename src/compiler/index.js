import { parserHTML } from './parser';
export function compileToFunctions(template){
    
    let ast = parserHTML(template); // 将模板变为ast语法树
    console.log(ast)
}