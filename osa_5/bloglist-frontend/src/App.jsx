import { useState, useEffect, useRef } from 'react'
import loginService from './services/login'
import blogService from './services/blogs'
import Notification from './components/Notification'
import Togglable from './components/Togglable'
import BlogForm from './components/BlogForm'
import Blog from './components/Blog'
import './App.css'

const App = () => {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [user, setUser] = useState(null)
  const [blogs, setBlogs] = useState([])
  const [notificationMessage, setNotificationMessage] = useState(null)
  const [notificationType, setNotificationType] = useState(null)

  const blogFormRef = useRef()

  useEffect(() => {
    const loggedUserJSON = window.localStorage.getItem('loggedBlogappUser')
    if (loggedUserJSON) {
      const user = JSON.parse(loggedUserJSON)
      setUser(user)
      blogService.setToken(user.token)
    }
  }, [])

  useEffect(() => {
    if (user) {
      blogService.getAll().then(data => {
        setBlogs(data)
      })
    }
  }, [user])

  const showNotification = (message, type) => {
    setNotificationMessage(message)
    setNotificationType(type)
    setTimeout(() => {
      setNotificationMessage(null)
      setNotificationType(null)
    }, 5000)
  }

  const handleLogin = async (event) => {
    event.preventDefault()
    try {
      const user = await loginService.login({ username, password })
      window.localStorage.setItem(
        'loggedBlogappUser', JSON.stringify(user)
      )
      blogService.setToken(user.token)
      setUser(user)
      setUsername('')
      setPassword('')
    } catch {
      showNotification('wrong username or password', 'error')
      console.error('Wrong credentials')
    }
  }

  const handleLogout = () => {
    window.localStorage.removeItem('loggedBlogappUser')
    setUser(null)
    blogService.setToken(null)
    showNotification('Logged out successfully', 'success')
  }

  const addBlog = async (blogObject) => {
    try {
      blogFormRef.current.toggleVisibility()
      const returnedBlog = await blogService.create(blogObject)
      setBlogs(blogs.concat(returnedBlog))
      showNotification(`a new blog ${returnedBlog.title} by ${returnedBlog.author} added`, 'success')
    } catch (exception) {
      showNotification('Failed to create a new blog', 'error')
      console.error('Error creating blog:', exception)
    }
  }

  const updateBlog = async (blogToUpdate) => {
    try {
      const idToUpdate = blogToUpdate.id || blogToUpdate._id
      const returnedBlog = await blogService.update(idToUpdate, blogToUpdate)

      setBlogs(
        blogs.map(blog => {
          if ((blog.id || blog._id) === idToUpdate) {
            return returnedBlog
          }
          return blog
        })
      )
      showNotification(`Blog ${returnedBlog.title} likes updated`, 'success')
    } catch (exception) {
      showNotification('Failed to update blog', 'error')
      console.error('Error updating blog:', exception)
    }
  }

  const removeBlog = async (blogToRemove) => {
    try {
      await blogService.remove(blogToRemove.id)
      setBlogs(blogs.filter(blog => blog.id !== blogToRemove.id))
      showNotification(`Blog ${blogToRemove.title} by ${blogToRemove.author} removed`, 'success')
    } catch (exception) {
      showNotification('Failed to remove blog', 'error')
      console.error('Error removing blog:', exception)
    }
  }

  if (!user) {
    return (
      <div>
        <Notification message={notificationMessage} type={notificationType} />
        <h2>log in to application</h2>
        <form onSubmit={handleLogin}>
          <div>
            username
            <input
              type="text"
              value={username}
              name="Username"
              onChange={({ target }) => setUsername(target.value)}
            />
          </div>
          <div>
            password
            <input
              type="password"
              value={password}
              name="Password"
              onChange={({ target }) => setPassword(target.value)}
            />
          </div>
          <button type="submit">login</button>
        </form>
      </div>
    )
  }

  const sortedBlogs = [...blogs].sort((a, b) => b.likes - a.likes)

  return (
    <div>
      <Notification message={notificationMessage} type={notificationType} />
      <h2>blogs</h2>
      <p>
        {user.name} logged in
        <button onClick={handleLogout}>logout</button>
      </p>
      <Togglable buttonLabel="new blog" ref={blogFormRef}>
        <h2>create new</h2>
        <BlogForm createBlog={addBlog} />
      </Togglable>
      {sortedBlogs.map(blog =>
        <Blog key={blog.id || blog._id} blog={blog} updateBlog={updateBlog} removeBlog={removeBlog} user={user} />
      )}
    </div>
  )
}

export default App

