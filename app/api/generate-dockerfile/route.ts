import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { analysisResult } = await request.json()
    
    if (!analysisResult) {
      return NextResponse.json({ error: 'No analysis result provided' }, { status: 400 })
    }

    const dockerfile = generateDockerfile(analysisResult)
    
    return NextResponse.json({ dockerfile })
  } catch (error) {
    console.error('Dockerfile generation error:', error)
    return NextResponse.json(
      { error: 'Dockerfile generation failed' },
      { status: 500 }
    )
  }
}

function generateDockerfile(analysis: any): string {
  const { language, framework, version, startCmd, installCmd, detectedLanguages, languageAnalysisResults } = analysis
  
  // 處理多語言項目
  if (language === 'multiple' && detectedLanguages && detectedLanguages.length > 0) {
    // 選擇第一個檢測到的語言作為主要語言
    const primaryLanguage = detectedLanguages[0]
    console.log(`多語言項目，選擇主要語言: ${primaryLanguage}`)
    
    // 如果有詳細的分析結果，使用第一個語言的結果
    if (languageAnalysisResults && languageAnalysisResults.length > 0) {
      const primaryAnalysis = languageAnalysisResults[0].analysisResult
      return generateDockerfileByLanguage(primaryLanguage, primaryAnalysis)
    }
    
    // 否則使用默認配置
    return generateDockerfileByLanguage(primaryLanguage, { framework, version, startCmd, installCmd })
  }
  
  // 處理原始輸出
  if (language === 'raw') {
    // 嘗試從檢測到的語言中推斷
    if (detectedLanguages && detectedLanguages.length > 0) {
      const primaryLanguage = detectedLanguages[0]
      console.log(`原始輸出，推斷語言: ${primaryLanguage}`)
      return generateDockerfileByLanguage(primaryLanguage, { framework, version, startCmd, installCmd })
    }
    
    // 如果無法推斷，拋出錯誤
    throw new Error(`無法推斷語言類型，檢測到的語言: ${detectedLanguages?.join(', ') || '無'}`)
  }
  
  return generateDockerfileByLanguage(language, { framework, version, startCmd, installCmd })
}

function generateDockerfileByLanguage(language: string, analysis: any): string {
  const { framework, version, startCmd, installCmd } = analysis
  
  switch (language) {
    case 'nodejs':
      return generateNodejsDockerfile(framework, version, startCmd, installCmd)
    case 'python':
      return generatePythonDockerfile(framework, version, startCmd, installCmd)
    case 'go':
      return generateGoDockerfile(version, startCmd, installCmd)
    case 'java':
      return generateJavaDockerfile(version, startCmd, installCmd)
    case 'rust':
      return generateRustDockerfile(version, startCmd, installCmd)
    default:
      throw new Error(`不支援的語言類型: ${language}`)
  }
}

function generateNodejsDockerfile(framework: string, version: string, startCmd: string, installCmd: string): string {
  const baseImage = `node:${version}-alpine`
  const workDir = '/app'
  const port = framework === 'nextjs' ? '3000' : '8080'
  
  // 根據框架優化配置
  const buildCommand = framework === 'nextjs' ? 'RUN npm run build' : 
                      framework === 'react' ? 'RUN npm run build' : ''
  
  const copyCommand = framework === 'nextjs' ? 
    `# Copy source code
COPY . .

# Build for production
${buildCommand}

# Copy built files for production
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static` :
    `# Copy source code
COPY . .

# Build for production (if needed)
${buildCommand}`
  
  return `FROM ${baseImage}

WORKDIR ${workDir}

# Copy package files
COPY package*.json ./

# Install dependencies
RUN ${installCmd}

${copyCommand}

# Create non-root user
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Change ownership
RUN chown -R nextjs:nodejs ${workDir}
USER nextjs

# Expose port
EXPOSE ${port}

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \\
  CMD curl -f http://localhost:${port}/health || exit 1

# Start command
CMD ["${startCmd}"]`
}

function generatePythonDockerfile(framework: string, version: string, startCmd: string, installCmd: string): string {
  const baseImage = `python:${version}-slim`
  const workDir = '/app'
  const port = framework === 'django' ? '8000' : '5000'
  
  // 根據框架優化配置
  const systemDeps = framework === 'django' ? 
    'gcc postgresql-client' : 
    framework === 'flask' ? 'gcc' : 'gcc'
  
  const healthCheck = framework === 'django' ?
    `# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \\
  CMD curl -f http://localhost:${port}/health/ || exit 1` :
    `# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \\
  CMD curl -f http://localhost:${port}/health || exit 1`
  
  return `FROM ${baseImage}

WORKDIR ${workDir}

# Install system dependencies
RUN apt-get update && apt-get install -y \\
    ${systemDeps} \\
    curl \\
    && rm -rf /var/lib/apt/lists/*

# Copy requirements
COPY requirements.txt .

# Install Python dependencies
RUN ${installCmd}

# Copy source code
COPY . .

# Create non-root user
RUN adduser --disabled-password --gecos '' appuser
RUN chown -R appuser:appuser ${workDir}
USER appuser

# Expose port
EXPOSE ${port}

${healthCheck}

# Start command
CMD ["${startCmd}"]`
}

function generateGoDockerfile(version: string, startCmd: string, installCmd: string): string {
  return `FROM golang:${version}-alpine AS builder

WORKDIR /app

# Install git and ca-certificates
RUN apk add --no-cache git ca-certificates

# Copy go mod files
COPY go.mod go.sum ./

# Download dependencies
RUN ${installCmd}

# Copy source code
COPY . .

# Build the application
RUN CGO_ENABLED=0 GOOS=linux go build -a -installsuffix cgo -o main .

# Final stage
FROM alpine:latest

RUN apk --no-cache add ca-certificates tzdata

# Create non-root user
RUN adduser -D -s /bin/sh appuser

WORKDIR /app

# Copy the binary
COPY --from=builder /app/main .

# Change ownership
RUN chown -R appuser:appuser /app
USER appuser

# Expose port
EXPOSE 8080

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \\
  CMD wget --no-verbose --tries=1 --spider http://localhost:8080/health || exit 1

# Start command
CMD ["./main"]`
}

function generateJavaDockerfile(version: string, startCmd: string, installCmd: string): string {
  return `FROM openjdk:${version}-jdk-slim AS builder

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \\
    curl \\
    && rm -rf /var/lib/apt/lists/*

# Copy pom.xml
COPY pom.xml .

# Download dependencies
RUN ${installCmd}

# Copy source code
COPY . .

# Build the application
RUN mvn package -DskipTests

# Final stage
FROM openjdk:${version}-jre-slim

WORKDIR /app

# Install runtime dependencies
RUN apt-get update && apt-get install -y \\
    curl \\
    && rm -rf /var/lib/apt/lists/*

# Create non-root user
RUN adduser --disabled-password --gecos '' appuser

# Copy the built JAR
COPY --from=builder /app/target/*.jar app.jar

# Change ownership
RUN chown -R appuser:appuser /app
USER appuser

# Expose port
EXPOSE 8080

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \\
  CMD curl -f http://localhost:8080/health || exit 1

# Start command
CMD ["${startCmd}"]`
}

function generateRustDockerfile(version: string, startCmd: string, installCmd: string): string {
  return `FROM rust:${version}-alpine AS builder

WORKDIR /app

# Install build dependencies
RUN apk add --no-cache musl-dev

# Copy Cargo files
COPY Cargo.toml Cargo.lock ./

# Download dependencies
RUN ${installCmd}

# Copy source code
COPY . .

# Build the application
RUN cargo build --release

# Final stage
FROM alpine:latest

RUN apk --no-cache add ca-certificates tzdata

# Create non-root user
RUN adduser -D -s /bin/sh appuser

WORKDIR /app

# Copy the binary
COPY --from=builder /app/target/release/app .

# Change ownership
RUN chown -R appuser:appuser /app
USER appuser

# Expose port
EXPOSE 8080

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \\
  CMD wget --no-verbose --tries=1 --spider http://localhost:8080/health || exit 1

# Start command
CMD ["./app"]`
}


