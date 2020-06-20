### Vue的模板编译

#### 前言

在Vue中我们经常会有: 1. template 2. render，两种写法。Vue生命周期中会有三个维度的解析:

1. 存在render函数则使用render函数。
2. 不存在render函数则看是否提供template属性模板， 如果也没有则使用el挂载元素作为模板。

模板最终会被编译为render函数。(性能较差)

vue2 中模板编译可以选择性的添加**runtimeOnly**只在运行时使用（无法解析用户传递template属性 ） **runtime with compiler** （可以实现模板编译的）

#### 步骤

1. 实现一个解析器，将html模板解析为ast语法树。
2. 标记静态树，比如 **<span>123<span>** 这就是一个纯静态的节点，**<span>{{msg}}</span>**就不是， 主要是做性能优化，后续比对，静态的可忽略。
3. 通过ast语法树转化成render。


#### ast语法树

指使用一个树的结构描述语法

        {
            tag: "div",
            attrs: [
                {
                    name: "class",
                    value: "a"
                }
            ],
            children: [
                .
                .
                .
            ]
        }

看起来和虚拟DOM很像， 但是ast是用来描述一种语法，而虚拟DOM可以描述一些自定义的属性。


