import React from 'react'
import ReactDOM from 'react-dom/client'
import { createStore } from 'redux'
import App from './App'
import counterReducer from './reducer'

const store = createStore(counterReducer)

const root = ReactDOM.createRoot(document.getElementById('root'))

const renderApp = () => {
  root.render(
    <React.StrictMode>
      <App store={store} />
    </React.StrictMode>
  )
}

renderApp()
store.subscribe(renderApp)

