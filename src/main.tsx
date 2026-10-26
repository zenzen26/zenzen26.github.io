import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import { loadCSV } from './hooks/useCSVData.ts'
import './styles/global.css'

// Start the data requests now, in parallel with the route's code, instead of after the page component mounts
if (location.pathname === '/') {
  loadCSV('/data/projects.csv')
  loadCSV('/data/experience.csv')
} else if (location.pathname === '/projects') {
  loadCSV('/data/projects.csv')
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)