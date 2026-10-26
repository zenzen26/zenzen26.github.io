// 
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'
import fs from 'node:fs'
import { execSync } from 'node:child_process'

/** When the resume PDFs last changed: latest git commit touching them, else newest file mtime. */
function resumesUpdated(): string {
  const dir = path.resolve(__dirname, 'public/resumes')
  try {
    const out = execSync('git log -1 --format=%cI -- public/resumes', { cwd: __dirname, encoding: 'utf8' }).trim()
    if (out) return out
  } catch {
    // not a git checkout: fall through to mtime
  }
  const newest = Math.max(...fs.readdirSync(dir).map((f) => fs.statSync(path.join(dir, f)).mtimeMs))
  return new Date(newest).toISOString()
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