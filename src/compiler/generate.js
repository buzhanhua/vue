// 匹配动态变量的  +? 尽可能少匹配
const defaultTagRE = /\{\{((?:.|\r?\n)+?)\}\}/g;

function genProps(attrs){
    let str = '';
    for( let i = 0 ; i < attrs.length ;i++){
        let attr = attrs[i];
        if(attr.name === 'style'){
            let obj = {};
            attr.value.split(';').forEach(item => {
                let [key,value] = item.split(':');
                obj[key] = value
            })
            attr.value = obj;
        }
        str += `${attr.name}:${JSON.stringify(attr.value)},`;
    }

    return `{${str.slice(0,-1)}}`
}

function gen(el){
    if(el.type === 1){
        return generate(el)
    }else{
        // 处理文本
        let text = el.text;
        if(!defaultTagRE.test(text)){
            return `_v(${JSON.stringify(text)})`;
        }else{
            // 注意：正则添加全局匹配后，每一次匹配后，正则的lastIndex属性都会变为上次捕获的下标
            let tokens = [];
            let lastIndex = defaultTagRE.lastIndex = 0;
            let match,index;

            while(match = defaultTagRE.exec(text)){
                index = match.index;

                tokens.push(JSON.stringify(text.slice(lastIndex,index)));
                tokens.push(`_s(${match[1].trim()})`);

                lastIndex = index + match[0].length;
            }

            if(lastIndex < text.length){
                tokens.push(JSON.stringify(text.slice(lastIndex)));
            }

            return `_v(${tokens.join('+')})`
        }
    }
}

function genChildren(el){
    if(el.children.length > 0){
        return el.children.map(c => gen(c)).join(',')
    }else{
        return false;
    }
}

export function generate(el){
    let children = genChildren(el);
    let code = `
        _c("${el.tag}",${el.attrs.length ? genProps(el.attrs) : undefined} ${children? `,${children}`:''})
    `
    return code;
}