const Blog = require('../models/blog')

const initialBlogs = [
  {
    title: 'Test blog 1',
    author: 'Author One',
    url: 'http://example.com/blog1',
    likes: 1,
  },
  {
    title: 'Test blog 2',
    author: 'Author Two',
    url: 'http://example.com/blog2',
    likes: 5,
  }
]

const blogsInDb = async () => {
  const blogs = await Blog.find({})
  return blogs.map(b => b.toJSON())
}

module.exports = {
  initialBlogs,
  blogsInDb,
}
