// 
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'
import fs from 'node:fs'
import { execSync } from 'node:child_process'

/** Per resume PDF, when it last changed: its latest git commit, else the file's mtime. */
function resumesUpdated(): Record<string, string> {
  const dir = path.resolve(__dirname, 'public/resumes')
  const dates: Record<string, string> = {}
  for (const file of fs.readdirSync(dir)) {
    let iso = ''
    try {
      iso = execSync(`git log -1 --format=%cI -- "public/resumes/${file}"`, { cwd: __dirname, encoding: 'utf8' }).trim()
    } catch {
      // not a git checkout: fall through to mtime
    }
    dates[file] = iso || new Date(fs.statSync(path.join(dir, file)).mtimeMs).toISOString()
  }
  return dates
}

export default defineConfig({
  define: {
    __RESUME_UPDATED__: JSON.stringify(resumesUpdated()),
  },
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 5173,
    open: true,
  },
  build: {
    outDir: 'dist',
  },
  esbuild: {
    drop: ['console', 'debugger'], // Optional: remove console logs in production
  },
})