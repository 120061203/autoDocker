import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    console.log('收到分析請求')
    const formData = await request.formData()
    const files = formData.getAll('files') as File[]
    const selectedLanguage = formData.get('selectedLanguage') as string

    console.log('接收到的文件數量:', files.length)
    console.log('用戶選擇的語言:', selectedLanguage)
    files.forEach(file => {
      console.log('文件:', file.name, file.size, file.type)
    })

    if (!files || files.length === 0) {
      console.log('沒有提供文件')
      return NextResponse.json({ error: 'No files provided' }, { status: 400 })
    }

    // 這裡應該調用實際的 zbpack 分析邏輯
    // 由於 zbpack 是 Go 程序，我們需要通過子進程或 API 調用
    console.log('開始分析...')
    const analysisResult = await analyzeWithZbpack(files, selectedLanguage)
    console.log('分析完成:', analysisResult)

    return NextResponse.json(analysisResult)
  } catch (error) {
    console.error('Analysis error:', error)
    return NextResponse.json(
      { error: 'Analysis failed', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

async function analyzeWithZbpack(files: File[], selectedLanguage?: string): Promise<any> {
  const fs = require('fs').promises
  const path = require('path')
  const os = require('os')
  const { exec } = require('child_process')
  const { promisify } = require('util')
  const execAsync = promisify(exec)
  
  // 首先手動檢測所有語言
  const detectedLanguages = []
  const fileNames = files.map(f => f.name.toLowerCase())
  
  // Node.js 項目檢測
  if (fileNames.some(name => name.includes('package.json'))) {
    detectedLanguages.push('nodejs')
  }
  
  // Python 項目檢測
  if (fileNames.some(name => name.includes('requirements.txt'))) {
    detectedLanguages.push('python')
  }
  
  // Go 項目檢測
  if (fileNames.some(name => name.includes('go.mod'))) {
    detectedLanguages.push('go')
  }
  
  // Java 項目檢測
  if (fileNames.some(name => name.includes('pom.xml'))) {
    detectedLanguages.push('java')
  }
  
  // Rust 項目檢測
  if (fileNames.some(name => name.includes('cargo.toml'))) {
    detectedLanguages.push('rust')
  }
  
  console.log('檢測到的語言:', detectedLanguages)
  
  // 如果檢測到多種語言，為每個語言分別分析
  if (detectedLanguages.length > 1) {
    console.log('檢測到多種語言，將為每個語言分別分析:', detectedLanguages)
    
    // 為每個語言創建單獨的分析結果
    const languageAnalysisResults = []
    
    for (const language of detectedLanguages) {
      console.log(`開始分析 ${language} 語言...`)
      
      // 創建臨時目錄
      const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), `zbpack-${language}-`))
      
      try {
        // 保存文件到臨時目錄
        for (const file of files) {
          const filePath = path.join(tempDir, file.name)
          const buffer = Buffer.from(await file.arrayBuffer())
          await fs.writeFile(filePath, buffer)
        }
        
        console.log(`調用 zbpack 分析 ${language}:`, tempDir)
        
        // 調用 zbpack 分析
        let output = ''
        try {
          console.log(`執行 zbpack --info "${tempDir}"`)
          const { stdout, stderr } = await execAsync(`zbpack --info "${tempDir}"`)
          
          console.log(`zbpack 標準輸出 (${language}):`, JSON.stringify(stdout))
          console.log(`zbpack 錯誤輸出 (${language}):`, JSON.stringify(stderr))
          
          // zbpack 的輸出可能在 stderr 中
          output = stdout || stderr || ''
          
          // 如果輸出為空，嘗試其他命令
          if (!output || output.trim() === '') {
            console.log('zbpack 輸出為空，嘗試其他命令...')
            try {
              console.log(`執行 zbpack "${tempDir}"`)
              const { stdout: stdout2, stderr: stderr2 } = await execAsync(`zbpack "${tempDir}"`)
              output = stdout2 || stderr2 || ''
              console.log('zbpack 備用命令輸出:', JSON.stringify(output))
            } catch (error2) {
              console.log('zbpack 備用命令也失敗:', error2)
            }
          }
        } catch (error) {
          console.error(`zbpack 執行失敗 (${language}):`, error)
          // 不要拋出錯誤，而是返回一個基本的分析結果
          const fallbackResult = {
            language: language,
            framework: 'none',
            version: 'latest',
            packageManager: 'unknown',
            startCmd: 'echo "zbpack failed"',
            installCmd: 'echo "zbpack failed"'
          }
          
          const analysisResult = {
            ...fallbackResult,
            detectedLanguages: [language],
            rawOutput: `zbpack 執行失敗: ${error.message}`,
            buildPlan: {
              provider: language,
              startCmd: fallbackResult.startCmd,
              packageManager: fallbackResult.packageManager,
              framework: fallbackResult.framework,
              version: fallbackResult.version,
              installCmd: fallbackResult.installCmd
            }
          }
          
          languageAnalysisResults.push({
            language,
            analysisResult
          })
          
          continue // 繼續處理下一個語言
        }
        
             // 解析 zbpack 輸出並返回原始輸出
             let parsedResult = parseZbpackOutput(output)
             
             // 如果 zbpack 輸出為空，拋出錯誤
             if (!output || output.trim() === '') {
               throw new Error(`zbpack 輸出為空，無法分析 ${language} 項目`)
             }
             
             // 如果解析結果的語言與預期不符，使用預期的語言
             if (parsedResult.language !== language && language !== 'unknown') {
               parsedResult.language = language
               console.log(`修正語言從 ${parsedResult.language} 到 ${language}`)
             }
             
             const analysisResult = {
               ...parsedResult,
               detectedLanguages: [language],
               rawOutput: output, // 添加原始輸出
               buildPlan: {
                 provider: parsedResult.language,
                 startCmd: parsedResult.startCmd,
                 packageManager: parsedResult.packageManager,
                 framework: parsedResult.framework,
                 version: parsedResult.version,
                 installCmd: parsedResult.installCmd
               }
             }
        
        languageAnalysisResults.push({
          language,
          analysisResult
        })
        
      } finally {
        // 清理臨時目錄
        try {
          await fs.rm(tempDir, { recursive: true })
        } catch (error) {
          console.error(`清理臨時目錄失敗 (${language}):`, error)
        }
      }
    }
    
    // 返回多語言分析結果
    return {
      language: 'multiple',
      framework: 'none',
      version: 'latest',
      packageManager: 'none',
      startCmd: 'echo "Multiple languages detected"',
      installCmd: 'echo "Multiple languages detected"',
      detectedLanguages,
      languageAnalysisResults, // 包含每個語言的詳細分析結果
      requiresSelection: false,
      buildPlan: {
        provider: 'multiple',
        startCmd: 'echo "Multiple languages detected"',
        packageManager: 'none',
        framework: 'none',
        version: 'latest',
        installCmd: 'echo "Multiple languages detected"'
      }
    }
  }
  
  // 創建臨時目錄
  const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'zbpack-'))
  
  try {
    // 保存文件到臨時目錄
    for (const file of files) {
      const filePath = path.join(tempDir, file.name)
      const buffer = Buffer.from(await file.arrayBuffer())
      await fs.writeFile(filePath, buffer)
    }
    
    console.log('調用 zbpack 分析:', tempDir)
    
    // 調用 zbpack 分析
    let output = ''
    try {
      const { stdout, stderr } = await execAsync(`zbpack --info "${tempDir}"`)
      
      console.log('zbpack 標準輸出:', stdout)
      console.log('zbpack 錯誤輸出:', stderr)
      
      // zbpack 的輸出可能在 stderr 中，所以我們需要檢查兩個輸出
      output = stdout || stderr || ''
    } catch (error) {
      console.error('zbpack 執行失敗:', error)
      // 如果 zbpack 失敗，返回基本分析結果
      const fallbackResult = {
        language: detectedLanguages.length > 0 ? detectedLanguages[0] : 'nodejs',
        framework: 'none',
        version: 'latest',
        packageManager: 'unknown',
        startCmd: 'echo "zbpack failed"',
        installCmd: 'echo "zbpack failed"'
      }
      
      const analysisResult = {
        ...fallbackResult,
        detectedLanguages: detectedLanguages.length > 0 ? detectedLanguages : [fallbackResult.language],
        rawOutput: `zbpack 執行失敗: ${error.message}`,
        buildPlan: {
          provider: fallbackResult.language,
          startCmd: fallbackResult.startCmd,
          packageManager: fallbackResult.packageManager,
          framework: fallbackResult.framework,
          version: fallbackResult.version,
          installCmd: fallbackResult.installCmd
        }
      }
      
      console.log('分析完成 (備用結果):', analysisResult)
      return analysisResult
    }
    
             // 解析 zbpack 輸出並返回原始輸出
             const parsedResult = parseZbpackOutput(output)
             
             // 如果解析失敗或語言未知，使用檢測到的語言
             let finalLanguage = parsedResult.language
             if (finalLanguage === 'unknown' || finalLanguage === 'raw' || !finalLanguage) {
               if (detectedLanguages.length > 0) {
                 finalLanguage = detectedLanguages[0]
                 console.log(`語言推斷: ${parsedResult.language} -> ${finalLanguage}`)
               } else {
                 throw new Error(`無法從 zbpack 輸出中識別語言類型`)
               }
             }
             
             const analysisResult = {
               ...parsedResult,
               language: finalLanguage, // 使用推斷的語言
               detectedLanguages: detectedLanguages.length > 0 ? detectedLanguages : [finalLanguage],
               rawOutput: output, // 添加原始輸出
               buildPlan: {
                 provider: finalLanguage,
                 startCmd: parsedResult.startCmd,
                 packageManager: parsedResult.packageManager,
                 framework: parsedResult.framework,
                 version: parsedResult.version,
                 installCmd: parsedResult.installCmd
               }
             }
    
    console.log('分析完成 (原始輸出):', analysisResult)
    
    return analysisResult
    
  } finally {
    // 清理臨時目錄
    try {
      await fs.rm(tempDir, { recursive: true })
    } catch (error) {
      console.error('清理臨時目錄失敗:', error)
    }
  }
}


function parseZbpackOutput(output: string): any {
  console.log('解析 zbpack 輸出:', output)
  
  const lines = output.split('\n')
  let language = 'unknown'
  let framework = 'none'
  let version = 'latest'
  let packageManager = 'none'
  let startCmd = 'echo "No start command"'
  let installCmd = 'echo "No install command"'
  
  // 解析 zbpack 的表格輸出
  for (const line of lines) {
    console.log('檢查行:', line)
    
    // 檢查 provider 行
    if (line.includes('│ provider') && line.includes('│')) {
      const match = line.match(/│\s*(\w+)\s*│/)
      if (match) {
        language = match[1]
        console.log('找到語言:', language)
      }
    }
    // 檢查 provider 行（另一種格式）
    else if (line.includes('provider') && line.includes('│') && line.includes('python')) {
      language = 'python'
      console.log('找到語言 (格式2):', language)
    }
    // 檢查 provider 行（Node.js 格式）
    else if (line.includes('provider') && line.includes('│') && line.includes('nodejs')) {
      language = 'nodejs'
      console.log('找到語言 (Node.js 格式):', language)
    }
    // 檢查 provider 行（Node.js 格式，另一種）
    else if (line.includes('│ provider') && line.includes('│') && line.includes('nodejs')) {
      language = 'nodejs'
      console.log('找到語言 (Node.js 格式2):', language)
    }
    // 檢查 nodeVersion 行
    else if (line.includes('│ nodeVersion') && line.includes('│')) {
      const match = line.match(/│\s*(\d+)\s*│/)
      if (match) {
        version = match[1]
        console.log('找到 Node 版本:', version)
      }
    }
    // 檢查 nodeVersion 行（另一種格式）
    else if (line.includes('nodeVersion') && line.includes('│')) {
      const match = line.match(/│\s*(\d+)\s*│/)
      if (match) {
        version = match[1]
        console.log('找到 Node 版本 (格式2):', version)
      }
    }
    // 檢查 pythonVersion 行
    else if (line.includes('│ pythonVersion') && line.includes('│')) {
      const match = line.match(/│\s*(\d+\.\d+)\s*│/)
      if (match) {
        version = match[1]
        console.log('找到 Python 版本:', version)
      }
    }
    // 檢查 pythonVersion 行（另一種格式）
    else if (line.includes('pythonVersion') && line.includes('│') && line.includes('3.13')) {
      version = '3.13'
      console.log('找到 Python 版本 (格式2):', version)
    }
    // 檢查 framework 行
    else if (line.includes('│ framework') && line.includes('│')) {
      const match = line.match(/│\s*(\w+)\s*│/)
      if (match && match[1] !== 'none') {
        framework = match[1]
        console.log('找到框架:', framework)
      }
    }
    // 檢查 framework 行（另一種格式）
    else if (line.includes('framework') && line.includes('│') && line.includes('flask')) {
      framework = 'flask'
      console.log('找到框架 (格式2):', framework)
    }
    // 檢查 packageManager 行
    else if (line.includes('│ packageManager') && line.includes('│')) {
      const match = line.match(/│\s*(\w+)\s*│/)
      if (match && match[1] !== 'unknown') {
        packageManager = match[1]
        console.log('找到包管理器:', packageManager)
      }
    }
    // 檢查 packageManager 行（另一種格式）
    else if (line.includes('packageManager') && line.includes('│') && line.includes('pip')) {
      packageManager = 'pip'
      console.log('找到包管理器 (格式2):', packageManager)
    }
    // 檢查 packageManager 行（Node.js 格式）
    else if (line.includes('packageManager') && line.includes('│') && line.includes('unknown')) {
      packageManager = 'npm' // Node.js 默認使用 npm
      console.log('找到包管理器 (Node.js 格式):', packageManager)
    }
    // 檢查 packageManager 行（Node.js 格式，另一種）
    else if (line.includes('│ packageManager') && line.includes('│') && line.includes('unknown')) {
      packageManager = 'npm' // Node.js 默認使用 npm
      console.log('找到包管理器 (Node.js 格式2):', packageManager)
    }
    // 檢查 start 行
    else if (line.includes('│ start') && line.includes('│')) {
      const match = line.match(/│\s*(.+?)\s*│/)
      if (match) {
        startCmd = match[1].trim()
        console.log('找到啟動命令:', startCmd)
      }
    }
    // 檢查 startCmd 行（Node.js 格式）
    else if (line.includes('│ startCmd') && line.includes('│')) {
      const match = line.match(/│\s*(.+?)\s*│/)
      if (match) {
        startCmd = match[1].trim()
        console.log('找到啟動命令 (Node.js 格式):', startCmd)
      }
    }
    // 檢查 startCmd 行（Node.js 格式，另一種）
    else if (line.includes('startCmd') && line.includes('│') && line.includes('yarn')) {
      startCmd = 'yarn start'
      console.log('找到啟動命令 (Node.js yarn 格式):', startCmd)
    }
    // 檢查 startCmd 行（Node.js 格式，另一種）
    else if (line.includes('│ startCmd') && line.includes('│') && line.includes('yarn')) {
      startCmd = 'yarn start'
      console.log('找到啟動命令 (Node.js yarn 格式2):', startCmd)
    }
    // 檢查 start 行（另一種格式）
    else if (line.includes('start') && line.includes('│') && line.includes('_startup')) {
      startCmd = '_startup() { gunicorn --bind :8080 app:app; }; _startup'
      console.log('找到啟動命令 (格式2):', startCmd)
    }
    // 檢查 build 行
    else if (line.includes('│ build') && line.includes('│')) {
      const match = line.match(/│\s*(.+?)\s*│/)
      if (match) {
        installCmd = match[1].trim()
        console.log('找到構建命令:', installCmd)
      }
    }
    // 檢查 installCmd 行（Node.js 格式）
    else if (line.includes('│ installCmd') && line.includes('│')) {
      const match = line.match(/│\s*(.+?)\s*│/)
      if (match) {
        installCmd = match[1].trim()
        console.log('找到安裝命令 (Node.js 格式):', installCmd)
      }
    }
    // 檢查 installCmd 行（Node.js 格式，另一種）
    else if (line.includes('installCmd') && line.includes('│') && line.includes('yarn')) {
      installCmd = 'yarn install'
      console.log('找到安裝命令 (Node.js yarn 格式):', installCmd)
    }
    // 檢查 installCmd 行（Node.js 格式，另一種）
    else if (line.includes('│ installCmd') && line.includes('│') && line.includes('yarn')) {
      installCmd = 'yarn install'
      console.log('找到安裝命令 (Node.js yarn 格式2):', installCmd)
    }
    // 檢查 build 行（另一種格式）
    else if (line.includes('build') && line.includes('│') && line.includes('pip install')) {
      installCmd = 'pip install -r requirements.txt'
      console.log('找到構建命令 (格式2):', installCmd)
    }
    // 檢查 install 行
    else if (line.includes('│ install') && line.includes('│')) {
      const match = line.match(/│\s*(.+?)\s*│/)
      if (match) {
        installCmd = match[1].trim()
        console.log('找到安裝命令:', installCmd)
      }
    }
    // 檢查 install 行（另一種格式）
    else if (line.includes('install') && line.includes('│') && line.includes('pip install')) {
      installCmd = 'pip install -r requirements.txt'
      console.log('找到安裝命令 (格式2):', installCmd)
    }
  }
  
  // 根據語言類型調整包管理器和命令
  if (language === 'nodejs') {
    if (packageManager === 'unknown' || packageManager === 'none') {
      packageManager = 'npm'
    }
    if (startCmd === 'echo "No start command"') {
      startCmd = 'npm start'
    }
    if (installCmd === 'echo "No install command"') {
      installCmd = 'npm install'
    }
  } else if (language === 'python') {
    packageManager = 'pip'
    if (startCmd === 'echo "No start command"') {
      startCmd = 'python app.py'
    }
    if (installCmd === 'echo "No install command"') {
      installCmd = 'pip install -r requirements.txt'
    }
  } else if (language === 'go') {
    packageManager = 'go mod'
    if (startCmd === 'echo "No start command"') {
      startCmd = './main'
    }
    if (installCmd === 'echo "No install command"') {
      installCmd = 'go mod download'
    }
  } else if (language === 'java') {
    packageManager = 'maven'
    if (startCmd === 'echo "No start command"') {
      startCmd = 'java -jar target/app.jar'
    }
    if (installCmd === 'echo "No install command"') {
      installCmd = 'mvn install'
    }
  } else if (language === 'rust') {
    packageManager = 'cargo'
    if (startCmd === 'echo "No start command"') {
      startCmd = './target/release/app'
    }
    if (installCmd === 'echo "No install command"') {
      installCmd = 'cargo build --release'
    }
  }
  
  return {
    language,
    framework,
    version,
    packageManager,
    startCmd,
    installCmd,
    detectedLanguages: [language],
    buildPlan: {
      provider: language,
      startCmd,
      packageManager,
      framework,
      version,
      installCmd
    }
  }
}
