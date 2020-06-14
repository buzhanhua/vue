export function isObject(obj){
    // 使用typeof 这里可以将array判断为object；
    return typeof obj === 'object' && obj !== null;
}