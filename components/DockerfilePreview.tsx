'use client'

import { useState } from 'react'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { tomorrow } from 'react-syntax-highlighter/dist/esm/styles/prism'
import { Copy, Download } from 'lucide-react'

interface DockerfilePreviewProps {
  dockerfile: string
}

export default function DockerfilePreview({ dockerfile }: DockerfilePreviewProps) {
  const [copied, setCopied] = useState(false)

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(dockerfile)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('複製失敗:', err)
    }
  }

  const downloadDockerfile = () => {
    const blob = new Blob([dockerfile], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'Dockerfile'
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  return (
    <div className="bg-white rounded-lg shadow-md">
      <div className="flex items-center justify-between p-4 border-b">
        <h3 className="text-lg font-semibold">生成的 Dockerfile</h3>
              <div className="flex items-center space-x-2">
                <button
                  onClick={copyToClipboard}
                  className="flex items-center space-x-1 px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
                >
                  <Copy className="h-4 w-4" />
                  <span>{copied ? '已複製' : '複製'}</span>
                </button>
                <button
                  onClick={downloadDockerfile}
                  className="flex items-center space-x-1 px-3 py-1 text-sm bg-green-100 text-green-700 rounded hover:bg-green-200"
                >
                  <Download className="h-4 w-4" />
                  <span>下載</span>
                </button>
              </div>
      </div>
      
      <div className="p-4">
        <SyntaxHighlighter
          language="dockerfile"
          style={tomorrow}
          customStyle={{
            margin: 0,
            borderRadius: '0.5rem',
            fontSize: '14px',
            lineHeight: '1.5'
          }}
          showLineNumbers
        >
          {dockerfile}
        </SyntaxHighlighter>
      </div>
    </div>
  )
}
