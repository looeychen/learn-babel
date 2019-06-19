/**
 * 语法分析 - 根据javascript语法，将tokens数组转换为AST(抽象语法树)
 * [{ type: 'name', value: 'const' }, ...]   =>   { type: 'Program', body: [...] }
 * @param {*} tokens 
 */
function parser(tokens) {
  let current = 0;

  function walk() {
    let token = tokens[current];

    // 变量声明
    if (token && token.type === 'name' && token.value === 'const') {
      let node = {
        type: 'VariableDeclaration',
        kind: token.value,
        declarations: []
      };

      token = tokens[++current];

      if (token && token.type === 'name') {
        node.declarations.push({
          type: 'VariableDeclarator',
          id: {
            type: 'Identifier',
            name: token.value
          },
          init: undefined
        })
      }

      token = tokens[++current];

      if (node.declarations.length > 0 && token && token.type === 'equals_sign' && token.value === '=') {
        token = tokens[++current];
        if (token && token.type === 'string') {
          node.declarations[0].init = {
            type: 'Literal',
            value: token.value
          }
        }
      }

      current++;

      return node;
    }

    throw new TypeError(token.type);
  }

  let ast = {
    type: 'Program',
    body: [],
  };

  while (current < tokens.length) {
    ast.body.push(walk());
  }

  console.log('ast:', JSON.stringify(ast))
  return ast;
}

module.exports = parser;