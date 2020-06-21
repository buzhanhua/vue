// 以字母a-zA-Z_开头  - . 数组小写字母 大写字母任意多个  
// 后续要放进RegExp构造器中，是个字符串， 所以使用两个 '/'
const ncname = `[a-zA-Z_][\\-\\.0-9_a-zA-Z]*`; // 标签名


// ?:匹配不捕获   <aaa:aaa>

// 正则子表达式 ： 子表达式是一个大的表达式的一部分， 把一个表达式划分为多个子表达式的目的是为了把那些子表达式当做一个独立的
// 元素来使用。 子表达式必须使用 （） 括起来。

// 字符串的 str.match(reg) 方法用于在字符串内检索指定的值，或者找到一个或者多个正则表达式的匹配
// 返回值 能匹配到返回一个存放匹配结果的数组 不能匹配到则返回null
// 能匹配到还分为两种情况 ：
// 1. 没有g。 该数组的第 0 个元素存放的是匹配文本，而其余的元素存放的是与正则表达式的子表达式匹配的文本。
//   除了这些常规的数组元素之外，返回的数组还含有两个对象属性。index 属性声明的是匹配文本的起始字符在 stringObject 中的位置，
//  input 属性声明的是对 stringObject 的引用。
// 2. 有g。 如果找到了一个或多个匹配子串，则返回一个数组。不过全局匹配返回的数组的内容与前者大不相同，它的数组元素中存放的是 stringObject 中所有的匹配子串，
//   而且也没有 index 属性或 input 属性。


// 解释 ：?:表示匹配不捕获 。 <aaa:aaa 的结果如下
// 1. 加?: ===> ["<aaa:aaa", "aaa:aaa", index: 0, input: "<aaa:aaa", groups: undefined]
// 2. 不加 ?: ===> ["<aaa:aaa", "aaa:aaa", "aaa:", index: 0, input: "<aaa:aaa", groups: undefined]

const qnameCapture = `((?:${ncname}\\:)?${ncname})`;
// startTagOpen 可以匹配到开始标签 正则捕获到的内容是 (标签名)
const startTagOpen = new RegExp(`^<${qnameCapture}`); // 标签开头的正则 捕获的内容是标签名
// 闭合标签 </xxxxxxx>  
const endTag = new RegExp(`^<\\/${qnameCapture}[^>]*>`); // 匹配标签结尾的 </div>
// <div aa   =   "123"  bb=123  cc='123'
// 捕获到的是 属性名 和 属性值 arguments[1] || arguments[2] || arguments[2]
const attribute = /^\s*([^\s"'<>\/=]+)(?:\s*(=)\s*(?:"([^"]*)"+|'([^']*)'+|([^\s"'=<>`]+)))?/; // 匹配属性的
// <div >   <br/>
const startTagClose = /^\s*(\/?)>/; // 匹配标签结束的 >



// 将模板变为ast语法树
// 1. 从字符串中读取数据，使用字符串从左到右（使用这个方向的原因是正则上做了限制）逐步截取
// 2. 组装树
export function parserHTML(html){
    // <div id="app" style="color:red"><span>nnnn{{age}}</span>wwwww<p></p></div>

    let root; // 根
    let currentParent = null; // 指当前解析的变量是谁
    let stack = []; // 建立栈结构，用于判断标签是否正常闭合


    function createASTElement(tagname,attrs){
        return {
            tag: tagname,
            attrs,
            children:[],
            parent:null,
            type:1 // 表示节点类型 1为html元素节点 3为文本节点
        }
    }

    function start(tagname,attrs){
        let element = createASTElement(tagname,attrs);

        if(!root){
            root = element;
        }

        currentParent = element;
        stack.push(element);
    }
    function end(tagname){
        // 在结束时确立父子关系
        let element = stack.pop(); // 拿到当前元素
        let parent = stack[stack.length - 1];
        // 需要对单标签进行特殊处理，目前没有处理
        // if(tagname !== element.tag){
        //     throw new Error('标签闭合错误')
        // }
        if(parent){
            element.parent = parent;
            parent.children.push(element)
        }
    }
    function chars(text){
        text = text.replace(/\s/g,''); // 去掉空格排除全是空格的文本节点
        if(text){
            currentParent.children.push({
                type:3,
                text
            })
        }
    }
    // 循环解析标签
    while(html){
        let textEnd = html.indexOf('<');
        if(textEnd === 0){
            const startTagMatch = parserStartTag();

            if(startTagMatch){
                start(startTagMatch.tagname,startTagMatch.attrs);
            }

            const endTagMatch = html.match(endTag);

            if(endTagMatch){
                advance(endTagMatch[0].length)
                end(endTagMatch[1]);
            }
        }
        // 如果不是0则说明是文本
        let text;
        if(textEnd > 0){
            text = html.substring(0,textEnd); // 文本截取
        }

        if(text){
            advance(text.length); // 删除文本
            chars(text)
        }
    }

    function advance(n){
        html = html.substring(n);
    }
    // 解析标签开头
    function parserStartTag(){
        const start = html.match(startTagOpen);
        if(start){
            const match = {
                tagname: start[1],
                attrs: []
            }

            advance(start[0].length);
            let end,attr;
            // 循环解析属性
            while(!(end = html.match(startTagClose)) && (attr = html.match(attribute))){
                advance(attr[0].length)
                match.attrs.push({
                    name: attr[1],
                    value: attr[3] || attr[4] || attr[5]
                })
                // [" style="color:red"", "style", "=", "color:red", undefined, undefined, index: 0, input: " style="color:red"><span>nnnn{{age}}</span>wwwww<p></p></div>", groups: undefined]
                // console.log(attr)
            }
            if(end){
                advance(end[0].length);
                return match;
            }
        }
    }

    return root;
}

