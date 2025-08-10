import React from 'react'
import { render } from '@testing-library/react'
import App from './App'
import { createStore } from 'redux'
import counterReducer from './reducer'

test('renders App component without crashing', () => {
  const store = createStore(counterReducer)

  render(<App store={store} />)
})
