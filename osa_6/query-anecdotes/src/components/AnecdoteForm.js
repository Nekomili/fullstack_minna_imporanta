import { useMutation, useQueryClient } from '@tanstack/react-query'
import { createAnecdote } from '../requests'
import { useNotificationDispatch } from '../NotificationContext'

const AnecdoteForm = () => {
  const queryClient = useQueryClient()
  const dispatch = useNotificationDispatch()

  const newAnecdoteMutation = useMutation({
    mutationFn: createAnecdote,
    onSuccess: (newAnecdote) => {
      queryClient.invalidateQueries({ queryKey: ['anecdotes'] })
      dispatch({ type: 'SHOW', payload: `anecdote '${newAnecdote.content}' created` })
      setTimeout(() => {
        dispatch({ type: 'HIDE' })
      }, 5000)
    },
    onError: (error) => {
      const errorMessage = error.response?.data?.error || 'an error occurred while creating the anecdote'
      dispatch({ type: 'SHOW', payload: errorMessage })
      setTimeout(() => {
        dispatch({ type: 'HIDE' })
      }, 5000)
    }
  })

  const onCreate = (event) => {
    event.preventDefault()
    const content = event.target.anecdote.value
    event.target.anecdote.value = ''

    if (content.length < 5) {
      dispatch({ type: 'SHOW', payload: 'too short anecdote, must have length 5 or more' })
      setTimeout(() => {
        dispatch({ type: 'HIDE' })
      }, 5000)
      return
    }
    
    newAnecdoteMutation.mutate({ content, votes: 0 })
  }

  return (
    <div>
      <h3>create new</h3>
      <form onSubmit={onCreate}>
        <input name='anecdote' />
        <button type="submit">create</button>
      </form>
    </div>
  )
}

export default AnecdoteForm

