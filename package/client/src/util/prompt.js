import fs from 'fs'

// 读取 prompt.md 文件内容
fs.readFile(
  `D:/project/geolocus/package/client/src/util/prompt.md`,
  'utf8',
  (err, data) => {
    if (err) {
      console.error('无法读取文件:', err)
      return
    }

    // 将多行文本字符串转换为单行，使用 \n 作为换行符
    const singleLineText = data.replace(/\n/g, '\\n').replace(/'/g, '"')

    // 输出结果
    console.log(singleLineText)
  },
)
