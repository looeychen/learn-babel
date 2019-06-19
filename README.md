![learn-babel](https://www.babeljs.cn/img/babel.svg)

## Babel进阶
本文适合对babel有一定了解的前端开发人员阅读。

- [编译器原理](#compiler)
- [babel解析](#architecture)

## <a id="compiler">编译器原理</a>

Babel是使用下一代JavaScript语法编程的编译器，整个编译过程同其他语言的编译基本一致，分为三个阶段：
* ***解析阶段(Parsing)*** : 将代码字符串解析成抽象语法树AST

* ***转换阶段(Transformation)*** : 对抽象语法树进行转换操作

* ***生成阶段(Code Generation)*** : 根据变换后的抽象语法树再生产代码字符串

![compilation-process](https://raw.githubusercontent.com/learnfe/learn-babel/master/static/images/compilation-process.png)

接下来以一个具体案例，手动实现一个简单的Compiler来深入理解编译器的基本原理。

案例：把使用ES6语法的变量声明语句编译为ES5语法，并格式化代码。
```
const a="hello"  =>  var a = 'hello';
```

### 1、代码解析
解析阶段有2个步骤：词法分析(Lexical Analysis) 和 语法分析(Syntactic Analysis)

* 词法分析

    使用分词器(tokenizer)将代码拆分为一个个称为token的独立的有意义的语法单元，可以是数字、标签、标点符号、运算符等等。

* 语法分析

    根据语言的语法规则（案例是javascript语法)，将tokens数组转换为符合ES规范的抽象语法树AST。

第1步: 调用分词器方法 [_tokenizer_](https://github.com/learnfe/learn-babel/blob/master/examples/compiler/tokenizer.js)

```
var input = 'const a="hello"'
var tokens = tokenizer(input)
```
输出tokens数组：
```
[{
  "type": "name",
  "value": "const"
}, {
  "type": "name",
  "value": "a"
}, {
  "type": "equals_sign",
  "value": "="
}, {
  "type": "string",
  "value": "hello"
}]
```

第2步：调用语法分析方法 [_parser_](https://github.com/learnfe/learn-babel/blob/master/examples/compiler/parser.js)

```
var ast = parser(tokens)
```

输出抽象语法树AST
```
{
  "type": "Program",
  "body": [{
    "type": "VariableDeclaration",
    "kind": "const",
    "declarations": [{
      "type": "VariableDeclarator",
      "id": {
        "type": "Identifier",
        "name": "a"
      },
      "init": {
        "type": "Literal",
        "value": "hello"
       }
    }]
  }]
}
```

至此代码解析阶段完成，利用javascript解析器parser, 生成一个抽象语法树AST。

### 2、抽象语法树转换

转换阶段主要是调用遍历方法 [_traverser_](https://github.com/learnfe/learn-babel/blob/master/examples/compiler/traverser.js) 对抽象语法树AST的每个节点进行操作。

traverser对多节点对象的操作，应用了设计模式中的 [_访问者模式_](https://baike.baidu.com/item/%E8%AE%BF%E9%97%AE%E8%80%85%E6%A8%A1%E5%BC%8F/1571621?fr=aladdin) 。调用时传入 ast 和 visitor对象, 当访问到ast中的某个节点时，如果visitor对象存在该节点类型的enter方法，则执行enter方法对节点具体操作。

```
var visitor = {
  nodeType1:{
    enter(node,parent){
      // 对该节点类型为nodeType1的节点进行操作
    }
  },
  nodeType2:{
    enter(node,parent){
      // 对该节点类型为nodeType2的节点进行操作
    }
  }
}

traverser(ast, visitor)
```

第3步：调用转换方法 [_transformer_](https://github.com/learnfe/learn-babel/blob/master/examples/compiler/transformer.js) ，内部引用traverser方法对抽象语法树操作。

本次转换的目的是把VariableDeclaration节点类型的kind属性值const修改为var。

```
var newAst = transformer(ast)
```

输出变换后的新AST

```
{
  "type": "Program",
  "body": [{
    "type": "VariableDeclaration",
    "kind": "var",
    "declarations": [{
      "type": "VariableDeclarator",
      "id": {
        "type": "Identifier",
        "name": "a"
      },
      "init": {
        "type": "Literal",
        "value": "hello"
      }
    }]
  }]
}
```

### 3、生成最新代码

第4步：调用代码生成方法 [_codeGenerator_](https://github.com/learnfe/learn-babel/blob/master/examples/compiler/code-generator.js) ，把最新的抽象语法树AST生成代码字符串。 
同时对代码进行了格式化，如字符串使用单引号、操作符前后插入空格、变量声明语句后面添加分号。

```
function codeGenerator(node) {
  switch (node.type) {
    case 'Program':
      return node.body.map(codeGenerator).join('\n');

    case 'VariableDeclaration':
      return (
        node.kind + ' ' + node.declarations.map(codeGenerator).join(', ') + ';' //加分号
      )

    case 'VariableDeclarator':
      return (
        codeGenerator(node.id) + ' = ' + codeGenerator(node.init) // 操作符前后插入空格
      )

    case 'Identifier':
      return node.name

    case 'Literal':
      return "'" + node.value + "'"; //字符串替换为单引号

    default:
      throw new TypeError(node.type);
  }
}

var output = codeGenerator(newAst)
```

输出最新的代码字符串

```
var a = 'hello';
```


## <a id="architecture">babel解析</a>

babel核心功能主要包括：语法转换、polyfill的引入包装。

### 1. 语法转换

babel语法转换遵循着编译器的工作流程：解析Parsing、转换Transformation、生成Code Generation。

babel采用monorepo包管理的方式，把编译相关的功能拆分为不同的模块

* babel-core

    babel编译器的核心，提供了transform api，如babel.transform(code, options)。
    
    工作流程如下：
    
    ![babel-core](https://raw.githubusercontent.com/learnfe/learn-babel/master/static/images/babel-core.jpeg)


* babel-parser

    javascript解析器，默认支持ECMAScript 2017规范，同时支持jsx、typescript等语法解析。
    
    主要基于 [acorn](https://github.com/acornjs/acorn) 这个javascript解析器开源库。
    
    对javascript代码解析，遵守的ast节点类型规范，如下：
    
    https://github.com/babel/babel/blob/master/packages/babel-parser/ast/spec.md
    
    如StringLiteral节点类型：
    
    ```
    interface StringLiteral <: Literal {
      type: "StringLiteral";
      value: string;
    }
    ```

* babel-plugin-transform-xxx

    babel转译器扩展了插件机制，在转换阶段Transformation应用转换插件babel-plugin-transform-xxx。
    
    如 babel-plugin-transform-classes：
    
    ```
    {
        name: "transform-classes",
    
        visitor: {
          ExportDefaultDeclaration(path: NodePath) {
            if (!path.get("declaration").isClassDeclaration()) return;
            splitExportDeclaration(path);
          },
    
          ClassDeclaration(path: NodePath) {
            const { node } = path;
    
            const ref = node.id || path.scope.generateUidIdentifier("class");
    
            path.replaceWith(
              t.variableDeclaration("let", [
                t.variableDeclarator(ref, t.toExpression(node)),
              ]),
            );
          },
    
          ClassExpression(path: NodePath, state: any) {
            const { node } = path;
            if (node[VISITED]) return;
    
            const inferred = nameFunction(path);
            if (inferred && inferred !== node) {
              path.replaceWith(inferred);
              return;
            }
    
            node[VISITED] = true;
    
            path.replaceWith(
              transformClass(path, state.file, builtinClasses, loose),
            );
    
            if (path.isCallExpression()) {
              annotateAsPure(path);
              if (path.get("callee").isArrowFunctionExpression()) {
                path.get("callee").arrowFunctionToExpression();
              }
            }
          },
        },    
     }
    ```
 
* babel-generator

   babel编译器代码生成Code Generation
   
    ```
    import generate from '@babel/generator';
    
    const output = generate(ast, { /* options */ }, code);
    ```
    
    
### 2. Polyfill引入包装

babel主要负责javascript新语法的编译，对一些内置函数（如promise）、静态方法（如Array.from）、实例方法（Array.prototype.includes）等需要引入polyfill，来模拟一个完整的es2015+环境。

babel提供了babel-polyfill 和 babel-runtime系列包装库，核心引用了 [core-js](https://github.com/zloirock/core-js) 和 [regenerator-runtime](https://github.com/facebook/regenerator/tree/master/packages/regenerator-runtime) 库。

* core-js

    包括了截止2019年的ECMAScript版本的polyfills 

* regenerator-runtime

    编译生成器和异步函数的独立运行时
    
### babel-polyfill

包含了core-js@2、regenerator-runtime，polyfill被添加在全局作用域和原型上，从babel7.4版本开始该包已废弃。

### babel-runtime、babel-runtime-corejs2、babel-runtime-corejs3

包含了core-js、regenerator-runtime和运行时helper。

babel 对一些公共方法使用了非常小的辅助代码，比如 _extend。默认情况下会被添加到每一个需要它的文件。

为了避免重复注入，搭配@babel/plugin-transform-runtime使用。

-------
***阅读原文: https://github.com/learnfe/learn-babel***
