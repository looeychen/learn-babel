var tokenizer = require('./tokenizer')
var parser = require('./parser')
var transformer = require('./transformer')
var codeGenerator = require('./code-generator')

/**
 * 编译器
 * 1. input  => tokenizer   => tokens
 * 2. tokens => parser      => ast
 * 3. ast    => transformer => newAst
 * 4. newAst => generator   => output
 */

function compiler(input) {
  var tokens = tokenizer(input);
  var ast = parser(tokens);
  var newAst = transformer(ast);
  var output = codeGenerator(newAst);
  return output;
}

/**
 * 实现 const a="hello" 转换为 var a = 'hello';
 */
var input = 'const a="hello"'
console.log('input:', input)

var output = compiler(input)
console.log('output:', output)