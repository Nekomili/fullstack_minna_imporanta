import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import anecdoteService from '../services/anecdotes'

export const initializeAnecdotes = createAsyncThunk(
  'anecdotes/fetchAll',
  async () => {
    const anecdotes = await anecdoteService.getAll()
    return anecdotes
  }
)

export const createAnecdote = createAsyncThunk(
  'anecdotes/createNew',
  async (content) => {
    const newAnecdote = await anecdoteService.createNew(content)
    return newAnecdote
  }
)

export const voteForAnecdote = createAsyncThunk(
  'anecdotes/vote',
  async (anecdote) => {
    const updatedAnecdote = {
      ...anecdote,
      votes: anecdote.votes + 1
    }
    const response = await anecdoteService.update(anecdote.id, updatedAnecdote)
    return response
  }
)

const anecdoteSlice = createSlice({
  name: 'anecdotes',
  initialState: [],
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(initializeAnecdotes.fulfilled, (state, action) => {
        return action.payload
      })
      .addCase(createAnecdote.fulfilled, (state, action) => {
        state.push(action.payload)
      })
      .addCase(voteForAnecdote.fulfilled, (state, action) => {
        const updated = action.payload
        return state.map(a => a.id !== updated.id ? a : updated)
      })
  }
})

export default anecdoteSlice.reducer

