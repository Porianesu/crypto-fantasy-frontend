import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

// 获取当前文件目录
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// 匹配所有 -[数字px]，但排除 text-[数字px]
const regex = /(?<!text)-\[(\d+(?:\.\d+)?)px\]/g

// 递归获取所有 .module.css 文件
function getAllCssFiles(dir: string, fileList: string[] = []) {
  const files = fs.readdirSync(dir)
  files.forEach((file) => {
    const filePath = path.join(dir, file)
    const stat = fs.statSync(filePath)
    if (stat.isDirectory()) {
      getAllCssFiles(filePath, fileList)
    } else if (file.endsWith('.module.css')) {
      fileList.push(filePath)
    }
  })
  return fileList
}

// 取整或.5的四舍五入函数
function roundToHalf(num: number) {
  return Math.round(num * 2) / 2
}

// 替换逻辑
function replaceInFile(filePath: string) {
  const data = fs.readFileSync(filePath, 'utf8')
  const result = data.replace(regex, (match, p1) => {
    const px = parseFloat(p1)
    const tw = roundToHalf(px / 4)
    // 保证整数或.5
    return match.replace(/-\[.*?\]/, `-${tw}`)
  })
  fs.writeFileSync(filePath, result, 'utf8')
  console.log(`${filePath} 替换完成！`)
}

const cssFiles = getAllCssFiles(path.join(__dirname, 'src'))
console.log('找到的 CSS 文件:', cssFiles)
cssFiles.forEach(replaceInFile)
