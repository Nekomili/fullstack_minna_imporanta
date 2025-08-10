import { createSlice } from '@reduxjs/toolkit'

const notificationSlice = createSlice({
  name: 'notification',
  initialState: null,
  reducers: {
    showNotification(state, action) {
      return action.payload
    },
    hideNotification(state, action) {
      return null
    }
  }
})

export const { showNotification, hideNotification } = notificationSlice.actions

export const setNotification = (message, durationInSeconds) => {
  return async (dispatch) => {
    dispatch(showNotification(message))
    setTimeout(() => {
      dispatch(hideNotification())
    }, durationInSeconds * 1000)
  }
}

export default notificationSlice.reducer

