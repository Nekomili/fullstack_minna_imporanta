const Blog = require('../models/blog')

const initialBlogs = [
  {
    title: 'HTML is easy',
    author: 'Author 1',
    url: 'http://example.com',
    likes: 5
  },
  {
    title: 'JS is powerful',
    author: 'Author 2',
    url: 'http://js.com',
    likes: 10
  }
]

const blogsInDb = async () => {
  const blogs = await Blog.find({})
  return blogs.map(blog => blog.toJSON())
}

module.exports = {
  initialBlogs, blogsInDb
}
