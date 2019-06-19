/**
 * 词法分析 - 拆分为tokens数组
 * const a="hello"   =>   [{ type: 'name', value: 'const' }, ...]
 * @param {*} input 
 */
function tokenizer(input) {
  let current = 0;
  let tokens = [];

  while (current < input.length) {
    let char = input[current];

    // 空格
    if (/\s/.test(char)) {
      current++;
      continue;
    }

    // 有意义的字符
    const LETTERS = /[a-z]/i
    if (LETTERS.test(char)) {
      let value = '';
      while (LETTERS.test(char)) {
        value += char;
        char = input[++current];
      }
      tokens.push({ type: 'name', value });
      continue;
    }

    // 等号
    if (char === '=') {
      tokens.push({ type: 'equals_sign', value: '=' });
      current++;
      continue;
    }

    // 字符串
    if (char === '"') {
      let value = '';
      char = input[++current];
      while (char !== '"') {
        value += char;
        char = input[++current];
      }
      char = input[++current];
      tokens.push({ type: 'string', value });
      continue;
    }
    throw new TypeError('I dont know what this character is: ' + char);
  }

  console.log('tokens:', JSON.stringify(tokens))
  return tokens;
}

module.exports = tokenizer;