export function patch(oldVnode,newVnode){
    let isRealElement = oldVnode.nodeType;
    if(isRealElement){
        const oldElm = oldVnode; // 拿到当前页面的挂载元素
        const parentElm = oldElm.parentNode; // 拿到父节点
        let el = createElm(newVnode);
        // 操作DOM
        parentElm.insertBefore(el,oldElm.nextSibling);
        parentElm.removeChild(oldElm);
        return el;
    }else{
        //dom diff算法
    }
}

function createElm(vnode){
    let {tag,data,key,children,text} = vnode;

    if(typeof tag === 'string'){
        // 将虚拟节点和真实节点做个映射关系 （后面diff时如果元素相同直接复用老元素 ）
        vnode.el = document.createElement(tag);
        updateProperties(vnode);
        children.forEach(child => {
            // 递归渲染子节点，将子节点渲染进父节点
            vnode.el.appendChild(createElm(child));
        })

    }else{
        vnode.el = document.createTextNode(text);
    }
    return vnode.el;
}
// 更新属性
function updateProperties(vnode){
    let el = vnode.el;
    let newProps = vnode.data || {};

    for(let key in newProps){
        if(key === "style"){
            for(let styleKey in newProps.style){
                el.style[styleKey] = newProps.style[styleKey]
            }
        }else{
            el.setAttribute(key,newProps[key])
        }

    }
}