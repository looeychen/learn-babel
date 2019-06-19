/**
 * 根据AST生成代码
 * @param {*} node 
 */
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

module.exports = codeGenerator;