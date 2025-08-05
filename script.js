// 全局变量
let currentWidth = 600
let currentTheme = "light"

// 初始化应用
function init() {
  updatePreview()
  setupWidthControl()
  setupThemeControl()
}

// 设置宽度控制
function setupWidthControl() {
  const slider = document.getElementById("widthSlider")
  const valueDisplay = document.getElementById("widthValue")
  const previewContent = document.getElementById("previewContent")
  const widthIndicator = document.getElementById("widthIndicator")
  previewContent.style.width = currentWidth + "px"

  slider.addEventListener("input", function () {
    currentWidth = parseInt(this.value)
    valueDisplay.textContent = currentWidth + "px"
    previewContent.style.width = currentWidth + "px"
    widthIndicator.textContent = currentWidth + "px"
  })
}

// 设置主题控制
function setupThemeControl() {
  const themeSelector = document.getElementById("themeSelector")
  themeSelector.value = currentTheme
  applyTheme(currentTheme)
}

// 切换主题
function changeTheme() {
  const themeSelector = document.getElementById("themeSelector")
  currentTheme = themeSelector.value
  applyTheme(currentTheme)
}

// 应用主题
function applyTheme(theme) {
  const previewContent = document.getElementById("previewContent")
  const markdownBody = document.getElementById("markdownOutput")

  if (theme === "dark") {
    previewContent.classList.add("theme-dark")
    markdownBody.classList.add("theme-dark")
  } else {
    previewContent.classList.remove("theme-dark")
    markdownBody.classList.remove("theme-dark")
  }
}

// 更新预览内容 - 增强版：支持数学公式渲染
function updatePreview() {
  const input = document.getElementById("markdownInput").value
  const output = document.getElementById("markdownOutput")

  try {
    // 检查输入是否为空
    if (!input.trim()) {
      output.innerHTML =
        '<div style="color: #666; font-style: italic; text-align: center; padding: 40px;">开始输入 Markdown 文本，这里将显示实时预览...</div>'
      return
    }

    // 预处理：保护数学公式不被Markdown解析器破坏
    // 将\[...\]和\(...\)替换为临时占位符
    let processedText = input
    const mathBlocks = []
    const mathInlines = []

    // 保存块级数学公式
    processedText = processedText.replace(
      /\\\[([\s\S]*?)\\\]/g,
      (match, formula) => {
        mathBlocks.push(formula)
        return `%%MATHBLOCK${mathBlocks.length - 1}%%`
      }
    )

    // 保存行内数学公式
    processedText = processedText.replace(
      /\\\(([\s\S]*?)\\\)/g,
      (match, formula) => {
        mathInlines.push(formula)
        return `%%MATHINLINE${mathInlines.length - 1}%%`
      }
    )

    // 使用marked解析Markdown
    let html = marked.parse(processedText)

    // 还原数学公式
    html = html.replace(/%%MATHBLOCK(\d+)%%/g, (match, index) => {
      return `\\[${mathBlocks[index]}\\]`
    })

    html = html.replace(/%%MATHINLINE(\d+)%%/g, (match, index) => {
      return `\\(${mathInlines[index]}\\)`
    })

    // 设置渲染结果
    output.innerHTML = html

    // 应用当前主题
    applyTheme(currentTheme)

    // 使用KaTeX渲染数学公式
    // renderMathInElement是KaTeX的自动渲染函数，会查找并渲染所有数学公式
    renderMathInElement(output, {
      delimiters: [
        { left: "\\[", right: "\\]", display: true }, // LaTeX块级公式
        { left: "\\(", right: "\\)", display: false }, // LaTeX行内公式
      ],
      throwOnError: false, // 遇到错误不抛出异常，而是显示错误信息
      errorColor: "#ff6b6b", // 错误显示颜色
      strict: false, // 宽松模式
      trust: true, // 信任所有输入（内部使用）
    })

    // 后处理：将标准的 <hr> 标签替换为自定义分割线
    const hrElements = output.querySelectorAll("hr")
    hrElements.forEach((hr) => {
      const dividerLine = document.createElement("div")
      dividerLine.className = "divider-line"
      dividerLine.setAttribute("data-divider", "true")
      hr.parentNode.replaceChild(dividerLine, hr)
    })
  } catch (error) {
    console.error("Markdown parsing error:", error)
    output.innerHTML = `
      <div style="color: #ff6b6b; background: #2a1f1f; padding: 20px; border-radius: 8px; border-left: 4px solid #ff6b6b;">
        <h4 style="margin: 0 0 10px 0; color: #ff6b6b;">⚠️ Markdown 格式解析异常</h4>
        <p style="margin: 0; font-size: 14px; line-height: 1.5;">
          当前输入的文本无法正确解析。请检查语法是否正确，
          特别注意数学公式的格式（使用 \( ... \) 表示行内公式，\[ ... \] 表示块级公式）。
        </p>
        <details style="margin-top: 10px;">
          <summary style="cursor: pointer; color: #ff8a8a;">查看技术详情</summary>
          <code style="display: block; margin-top: 8px; padding: 8px; background: #1a1a1a; border-radius: 4px; font-size: 12px;">
            ${error.message}
          </code>
        </details>
      </div>
    `
  }
}

// 手动插入分割线
function insertDivider() {
  const textarea = document.getElementById("markdownInput")
  const cursorPos = textarea.selectionStart
  const textBefore = textarea.value.substring(0, cursorPos)
  const textAfter = textarea.value.substring(cursorPos)

  const dividerText = "\n---\n"
  textarea.value = textBefore + dividerText + textAfter
  textarea.selectionStart = textarea.selectionEnd =
    cursorPos + dividerText.length
  textarea.focus()

  updatePreview()
}

// 清除所有分割线
function removeDividers() {
  const textarea = document.getElementById("markdownInput")
  textarea.value = textarea.value.replace(/\n---\n/g, "\n")
  updatePreview()
}

// 导出图片主函数 - 支持数学公式
async function exportImages() {
  try {
    // 第一步：验证基础条件
    const inputText = document.getElementById("markdownInput").value
    if (!inputText.trim()) {
      showUserMessage("请先输入 Markdown 文本内容再进行导出", "warning")
      return
    }

    const previewContent = document.getElementById("previewContent")
    if (!previewContent) {
      showUserMessage("预览区域未正确加载，请刷新页面重试", "error")
      return
    }

    const markdownBody = previewContent.querySelector(".markdown-body")
    if (!markdownBody || !markdownBody.children.length) {
      showUserMessage("预览内容为空，请检查 Markdown 格式是否正确", "warning")
      return
    }

    // 第二步：检查是否包含实际内容
    const hasRealContent = Array.from(markdownBody.children).some((child) => {
      return (
        child.textContent.trim() &&
        !child.textContent.includes("开始输入 Markdown") &&
        !child.classList.contains("divider-line")
      )
    })

    if (!hasRealContent) {
      showUserMessage(
        "当前只有占位提示文本，请输入实际的 Markdown 内容",
        "warning"
      )
      return
    }

    // 第三步：显示导出进度提示
    showUserMessage("正在生成图片，请稍候...", "info")

    // 等待数学公式渲染完成
    await new Promise((resolve) => setTimeout(resolve, 500))

    const dividers = previewContent.querySelectorAll(".divider-line")

    if (dividers.length === 0) {
      // 没有分割线，导出整个内容
      await exportSingleImage(previewContent, "mdImage.png")
      showUserMessage("图片导出成功！", "success")
    } else {
      // 有分割线，分段导出
      const exportedCount = await exportMultipleImages(previewContent, dividers)
      showUserMessage(`成功导出 ${exportedCount} 个图片文件！`, "success")
    }
  } catch (error) {
    console.error("Export error:", error)

    let userMessage = "图片导出过程中发生异常"

    if (error.name === "SecurityError") {
      userMessage = "由于浏览器安全限制，无法生成图片。请尝试使用其他浏览器"
    } else if (error.message.includes("html2canvas")) {
      userMessage = "图片渲染引擎出现问题，请刷新页面后重试"
    } else {
      userMessage = `导出失败：${error.message}`
    }

    showUserMessage(userMessage, "error")
  }
}

// 导出单个图片 - 增强数学公式支持
async function exportSingleImage(element, filename, returnData = false) {
  if (!element) {
    throw new Error("导出元素不存在")
  }

  // 确保元素在视窗中可见
  const originalStyles = {
    position: element.style.position,
    left: element.style.left,
    top: element.style.top,
    visibility: element.style.visibility,
  }

  element.style.position = "static"
  element.style.left = "auto"
  element.style.top = "auto"
  element.style.visibility = "visible"

  // 获取需要临时隐藏的装饰元素
  const widthIndicator = element.querySelector(".width-indicator")
  const dividers = element.querySelectorAll(".divider-line")

  // 临时隐藏装饰元素
  const hiddenElements = []
  if (widthIndicator) {
    hiddenElements.push({
      el: widthIndicator,
      display: widthIndicator.style.display,
    })
    widthIndicator.style.display = "none"
  }

  dividers.forEach((div) => {
    if (div && div.style) {
      hiddenElements.push({ el: div, display: div.style.display })
      div.style.display = "none"
    }
  })

  try {
    // 等待元素重新渲染（包括数学公式）
    await new Promise((resolve) => setTimeout(resolve, 300))

    // 获取元素的实际尺寸
    const rect = element.getBoundingClientRect()
    console.log("Element dimensions:", rect.width, "x", rect.height)

    if (rect.width === 0 || rect.height === 0) {
      throw new Error("元素尺寸为零，无法生成图片")
    }

    // 使用优化的 html2canvas 配置
    const canvasBg = currentTheme === "dark" ? "#0d1117" : "#ffffff"
    const canvas = await html2canvas(element, {
      backgroundColor: canvasBg,
      scale: 2, // 高分辨率输出，确保数学公式清晰
      useCORS: true,
      allowTaint: true,
      logging: false,
      width: rect.width,
      height: rect.height,
      scrollX: 0,
      scrollY: 0,
      windowWidth: rect.width,
      windowHeight: rect.height,
      // 忽略某些可能导致问题的元素
      ignoreElements: (element) => {
        return (
          element.classList && element.classList.contains("width-indicator")
        )
      },
    })

    if (!canvas || canvas.width === 0 || canvas.height === 0) {
      throw new Error("无法创建有效的图片画布")
    }

    console.log("Canvas created:", canvas.width, "x", canvas.height)

    // 根据 returnData 参数决定返回数据还是直接下载
    if (returnData) {
      return new Promise((resolve) => {
        canvas.toBlob(
          (blob) => {
            resolve({ filename: filename, blob: blob })
          },
          "image/png",
          1.0
        )
      })
    } else {
      const dataURL = canvas.toDataURL("image/png", 1.0)
      if (!dataURL || dataURL === "data:," || dataURL.length < 100) {
        throw new Error("图片数据生成失败或为空")
      }

      const link = document.createElement("a")
      link.download = filename
      link.href = dataURL
      link.style.display = "none"
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)

      console.log("Image exported successfully:", filename)
    }
  } finally {
    // 恢复所有元素的原始状态
    element.style.position = originalStyles.position
    element.style.left = originalStyles.left
    element.style.top = originalStyles.top
    element.style.visibility = originalStyles.visibility

    hiddenElements.forEach((item) => {
      if (item.el && item.el.style) {
        item.el.style.display = item.display
      }
    })
  }
}

// 导出多个图片并打包为ZIP - 支持数学公式
async function exportMultipleImages(element, dividers) {
  const markdownBody = element.querySelector(".markdown-body")
  if (!markdownBody) {
    throw new Error("无法找到 Markdown 内容区域")
  }

  const allElements = Array.from(markdownBody.children)
  console.log("All elements found:", allElements.length)

  if (allElements.length === 0) {
    throw new Error("没有可导出的内容")
  }

  // 找到所有分割线的索引位置
  const dividerIndices = []
  allElements.forEach((elem, index) => {
    if (
      elem.classList.contains("divider-line") ||
      elem.getAttribute("data-divider") === "true"
    ) {
      dividerIndices.push(index)
    }
  })

  console.log("Divider indices:", dividerIndices)

  // 根据分割线位置创建内容段落
  let sections = []
  let startIndex = 0

  // 处理每个分割线之前的内容
  dividerIndices.forEach((dividerIndex) => {
    if (startIndex < dividerIndex) {
      const sectionElements = allElements.slice(startIndex, dividerIndex)
      if (sectionElements.length > 0) {
        sections.push(sectionElements)
      }
    }
    startIndex = dividerIndex + 1
  })

  // 处理最后一段内容
  if (startIndex < allElements.length) {
    const lastSection = allElements.slice(startIndex)
    const filteredLastSection = lastSection.filter(
      (elem) =>
        !elem.classList.contains("divider-line") &&
        elem.getAttribute("data-divider") !== "true"
    )
    if (filteredLastSection.length > 0) {
      sections.push(filteredLastSection)
    }
  }

  console.log("Sections created:", sections.length)

  if (sections.length === 0) {
    throw new Error("分割后没有有效的内容段落")
  }

  // 创建ZIP打包器
  const zip = new JSZip()
  let successCount = 0

  // 为每个段落生成图片数据
  for (let i = 0; i < sections.length; i++) {
    try {
      const section = sections[i]
      console.log(`Processing section ${i + 1}, elements:`, section.length)

      // 过滤有效内容
      const validElements = section.filter((elem) => {
        const hasText = elem.textContent.trim().length > 0
        const notDivider =
          !elem.classList.contains("divider-line") &&
          elem.getAttribute("data-divider") !== "true"
        const notPlaceholder = !elem.textContent.includes("开始输入 Markdown")
        return hasText && notDivider && notPlaceholder
      })

      if (validElements.length === 0) {
        console.log(`Section ${i + 1} is empty, skipping`)
        continue
      }

      // 创建独立的预览容器用于截图
      const tempContainer = document.createElement("div")
      const containerBg = currentTheme === "dark" ? "#0d1117" : "#ffffff"
      tempContainer.style.cssText = `
        background: ${containerBg};
        width: ${currentWidth}px;
        border-radius: 8px;
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
        position: absolute;
        left: -9999px;
        top: 0;
        visibility: visible;
        z-index: -1;
      `

      const tempBody = document.createElement("div")
      tempBody.className = "markdown-body"
      if (currentTheme === "dark") {
        tempBody.classList.add("theme-dark")
      }
      tempBody.style.cssText = `
        padding: 30px;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif;
        font-size: 16px;
        line-height: 1.6;
        word-wrap: break-word;
      `

      // 深度复制内容并保持样式
      validElements.forEach((elem) => {
        const clonedElem = elem.cloneNode(true)
        tempBody.appendChild(clonedElem)
      })

      tempContainer.appendChild(tempBody)
      document.body.appendChild(tempContainer)

      // 重新渲染数学公式（关键步骤！）
      renderMathInElement(tempBody, {
        delimiters: [
          { left: "\\[", right: "\\]", display: true },
          { left: "\\(", right: "\\)", display: false },
        ],
        throwOnError: false,
        errorColor: "#ff6b6b",
      })

      // 等待DOM和数学公式完全渲染
      await new Promise((resolve) => setTimeout(resolve, 500))

      // 生成图片数据
      const filename = `mdImage_${String(i + 1).padStart(2, "0")}.png`
      const imageData = await exportSingleImage(tempContainer, filename, true)

      if (imageData && imageData.blob) {
        zip.file(imageData.filename, imageData.blob)
        successCount++
        console.log(`Section ${i + 1} added to ZIP successfully`)
      }

      // 清理临时容器
      document.body.removeChild(tempContainer)

      // 在段落之间添加短暂延迟
      await new Promise((resolve) => setTimeout(resolve, 100))
    } catch (sectionError) {
      console.error(`导出第 ${i + 1} 段时出错:`, sectionError)
    }
  }

  if (successCount === 0) {
    throw new Error("所有段落导出均失败，请检查内容格式")
  }

  // 生成ZIP文件并下载
  try {
    console.log("Generating ZIP file...")
    const zipBlob = await zip.generateAsync({
      type: "blob",
      compression: "DEFLATE",
      compressionOptions: { level: 6 },
    })

    const link = document.createElement("a")
    link.href = URL.createObjectURL(zipBlob)
    link.download = `mdImages_${new Date().toISOString().slice(0, 10)}.zip`
    link.style.display = "none"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)

    setTimeout(() => {
      URL.revokeObjectURL(link.href)
    }, 1000)

    console.log(`ZIP file with ${successCount} images downloaded successfully`)
  } catch (zipError) {
    console.error("ZIP generation failed:", zipError)
    throw new Error("打包ZIP文件时发生错误: " + zipError.message)
  }

  return successCount
}

// 用户消息提示系统
function showUserMessage(message, type = "info") {
  // 移除已存在的消息
  const existingMessage = document.querySelector(".user-message")
  if (existingMessage) {
    existingMessage.remove()
  }

  const messageEl = document.createElement("div")
  messageEl.className = "user-message"

  // 根据消息类型设置样式
  const styles = {
    success: {
      bg: "#1a4a2e",
      border: "#00ff88",
      text: "#00ff88",
      icon: "✅",
    },
    warning: {
      bg: "#4a3a1a",
      border: "#ffaa00",
      text: "#ffaa00",
      icon: "⚠️",
    },
    error: {
      bg: "#4a1a1a",
      border: "#ff6b6b",
      text: "#ff6b6b",
      icon: "❌",
    },
    info: {
      bg: "#1a2a4a",
      border: "#4a9eff",
      text: "#4a9eff",
      icon: "ℹ️",
    },
  }

  const style = styles[type] || styles.info

  messageEl.style.cssText = `
    position: fixed;
    top: 70px;
    right: 20px;
    background: ${style.bg};
    border: 1px solid ${style.border};
    color: ${style.text};
    padding: 12px 16px;
    border-radius: 6px;
    font-size: 13px;
    font-family: inherit;
    z-index: 1000;
    max-width: 350px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.4);
    animation: slideIn 0.3s ease-out;
  `

  messageEl.innerHTML = `${style.icon} ${message}`
  document.body.appendChild(messageEl)

  // 添加CSS动画
  if (!document.querySelector("#message-animations")) {
    const styleSheet = document.createElement("style")
    styleSheet.id = "message-animations"
    styleSheet.textContent = `
      @keyframes slideIn {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
      }
      @keyframes slideOut {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(100%); opacity: 0; }
      }
    `
    document.head.appendChild(styleSheet)
  }

  // 自动消失
  setTimeout(
    () => {
      if (messageEl.parentNode) {
        messageEl.style.animation = "slideOut 0.3s ease-in"
        setTimeout(() => {
          if (messageEl.parentNode) {
            messageEl.remove()
          }
        }, 300)
      }
    },
    type === "error" ? 5000 : 3000
  )
}

// 页面加载完成后初始化
document.addEventListener("DOMContentLoaded", init)
