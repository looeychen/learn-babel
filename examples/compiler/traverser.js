/**
 * 遍历器 - 对ast对象进行遍历
 * @param {*} ast 
 * @param {*} visitor 
 */
function traverser(ast, visitor) {
  function traverseArray(array, parent) {
    array.forEach(child => {
      traverseNode(child, parent);
    });
  }

  function traverseNode(node, parent) {
    let methods = visitor[node.type];

    //访问节点时，根据节点类型调用对应的enter方法
    if (methods && methods.enter) {
      methods.enter(node, parent);
    }

    switch (node.type) {
      case 'Program':
        traverseArray(node.body, node);
        break;

      case 'VariableDeclaration':
        traverseArray(node.declarations, node);
        break;

      case 'VariableDeclarator':
        traverseNode(node.id, node)
        traverseNode(node.init, node)
        break;

      case 'Identifier':
      case 'Literal':
        break;

      default:
        throw new TypeError(node.type);
    }

    //访问节点结束时，根据节点类型调用对应的exit方法
    if (methods && methods.exit) {
      methods.exit(node, parent);
    }
  }

  traverseNode(ast, null);
}

module.exports = traverser;