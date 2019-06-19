var traverser = require('./traverser');

/**
 * 转换器 - 根据转换要求，把源AST转换为新的AST
 */
function transformer(ast) {
  const newAst = {
    type: 'Program',
    body: [],
  };

  ast._context = newAst.body;

  traverser(ast, {
    VariableDeclaration: {
      enter(node, parent) {
        const variableDeclaration = {
          type: 'VariableDeclaration',
          kind: 'var',                    //转换const为var
          declarations: []
        }
        node._context = variableDeclaration.declarations
        parent._context.push(variableDeclaration);
      }
    },

    VariableDeclarator: {
      enter(node, parent) {
        const variableDeclarator = {
          type: 'VariableDeclarator',
          id: {},
          init: {}
        }
        node._context = variableDeclarator
        parent._context.push(variableDeclarator)
      }
    },

    Identifier: {
      enter(node, parent) {
        parent._context.id = {
          type: 'Identifier',
          name: node.name
        }
      }
    },

    Literal: {
      enter(node, parent) {
        parent._context.init = {
          type: 'Literal',
          value: node.value
        }
      }
    }
  });

  console.log('newAst:', JSON.stringify(newAst))
  return newAst;
}

module.exports = transformer;