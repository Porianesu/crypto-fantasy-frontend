import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

// 获取当前文件目录
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const textRules = [
  {
    size: 12,
    text: 'xs',
  },
  {
    size: 14,
    text: 'sm',
  },
  {
    size: 16,
    text: 'base',
  },
  {
    size: 18,
    text: 'lg',
  },
  {
    size: 20,
    text: 'xl',
  },
  {
    size: 24,
    text: '2xl',
  },
  {
    size: 30,
    text: '3xl',
  },
  {
    size: 36,
    text: '4xl',
  },
  {
    size: 48,
    text: '5xl',
  },
  {
    size: 60,
    text: '6xl',
  },
  {
    size: 72,
    text: '7xl',
  },
  {
    size: 96,
    text: '8xl',
  },
  {
    size: 128,
    text: '9xl',
  },
]

// 匹配所有 -[数字px]，但排除 text-[数字px]
const regex = /(?<!text)-\[(\d+(?:\.\d+)?)px\]/g
// 匹配 text-[数字px] 格式
const textPxRegex = /text-\[(\d+(?:\.\d+)?)px\]/g

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

// 根据 textRules 找到最合适的 text 类名
function getTextClass(px: number) {
  // 先查找完全匹配
  for (const rule of textRules) {
    if (rule.size === px) return rule.text
  }
  // 没有完全匹配，找区间内较小的那个
  let last = textRules[0]
  for (const rule of textRules) {
    if (px < rule.size) break
    last = rule
  }
  return last.text
}

// 替换逻辑
function replaceInFile(filePath: string) {
  const data = fs.readFileSync(filePath, 'utf8')
  // 替换 text-[数字px] 为 text-{xx}
  const result = data.replace(textPxRegex, (match, p1) => {
    const px = parseFloat(p1)
    const textClass = getTextClass(px)
    return `text-${textClass}`
  })
  fs.writeFileSync(filePath, result, 'utf8')
  console.log(`${filePath} 替换完成！`)
}

const cssFiles = getAllCssFiles(path.join(__dirname, 'src'))
console.log('找到的 CSS 文件:', cssFiles)
cssFiles.forEach(replaceInFile)
