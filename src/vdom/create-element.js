export function createElement(tag,data = {},...children){
    // vue中的key 不会作为属性传递给组件
    let key = data.key;
    if(key){
        delete data.key;
    }
    return vnode(tag,data,key,children)
}

export function createTextVNode(text){
    return vnode(undefined,undefined,undefined,undefined,text)
}

function vnode(tag,data,key,children,text){
    return {
        tag,
        data,
        key,
        children,
        text
    }
}