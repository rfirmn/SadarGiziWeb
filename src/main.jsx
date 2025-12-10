// FILE: src/main.jsx
// Entry point React - Render aplikasi ke DOM
// Menggunakan React 18 dengan createRoot API

import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App.jsx'
import { HistoryProvider } from './context/HistoryContext.jsx'
import './index.css'

// Render aplikasi dengan BrowserRouter untuk routing
// dan HistoryProvider untuk state management history
ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
        <BrowserRouter>
            <HistoryProvider>
                <App />
            </HistoryProvider>
        </BrowserRouter>
    </React.StrictMode>,
)
