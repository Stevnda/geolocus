import React from 'react'
import ReactDOM from 'react-dom/client'
import './mapbox-gl.css'
import App from './page/App'
import { BrowserRouter } from 'react-router-dom'
import { StyleProvider } from '@ant-design/cssinjs'

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <BrowserRouter>
      <StyleProvider layer>
        <App />
      </StyleProvider>
    </BrowserRouter>
  </React.StrictMode>,
)
