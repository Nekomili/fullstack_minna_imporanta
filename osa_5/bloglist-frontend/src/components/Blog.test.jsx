import React from 'react'
import '@testing-library/jest-dom'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import Blog from './Blog'

describe('Blog component', () => {
  const blog = {
    title: 'Testing a blog post',
    author: 'Test Author',
    url: 'http://testurl.com',
    likes: 10,
    user: { name: 'Test User', username: 'testuser' }
  }

  let mockUpdateBlog
  let mockRemoveBlog
  let mockUser

  beforeEach(() => {
    mockUpdateBlog = jest.fn()
    mockRemoveBlog = jest.fn()
    mockUser = { username: 'testuser' }
  })

  test('renders title and author, but not URL or likes by default', () => {
    render(<Blog blog={blog} updateBlog={mockUpdateBlog} removeBlog={mockRemoveBlog} user={mockUser} />)

    const titleAndAuthor = screen.getByText('Testing a blog post Test Author')
    expect(titleAndAuthor).toBeDefined()

    const url = screen.queryByText('http://testurl.com')
    expect(url).toBeNull()

    const likes = screen.queryByText('likes 10')
    expect(likes).toBeNull()
  })

  test('URL and likes are shown when "view" button is clicked', async () => {
    render(<Blog blog={blog} updateBlog={mockUpdateBlog} removeBlog={mockRemoveBlog} user={mockUser} />)

    const user = userEvent.setup()
    const viewButton = screen.getByText('view')
    await user.click(viewButton)

    const url = screen.getByText('http://testurl.com')
    expect(url).toBeDefined()

    const likes = screen.getByText('likes 10')
    expect(likes).toBeDefined()

    const userElement = screen.getByText('Test User')
    expect(userElement).toBeDefined()
  })

  test('like button calls event handler twice if clicked twice', async () => {
    render(<Blog blog={blog} updateBlog={mockUpdateBlog} removeBlog={mockRemoveBlog} user={mockUser} />)

    const user = userEvent.setup()
    const viewButton = screen.getByText('view')
    await user.click(viewButton)

    const likeButton = screen.getByText('like')
    await user.click(likeButton)
    await user.click(likeButton)

    expect(mockUpdateBlog.mock.calls).toHaveLength(2)
  })
})

