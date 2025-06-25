process.env.SECRET = 'testsecret'

const assert = require('assert')
const mongoose = require('mongoose')
const supertest = require('supertest')
const app = require('../app')
const Blog = require('../models/blog')
const User = require('../models/user')
const bcrypt = require('bcryptjs')

const api = supertest(app)

before(async () => {
  await User.deleteMany({})
  await Blog.deleteMany({})

  const passwordHash = await bcrypt.hash('sekret', 10)
  const initialUser = new User({ username: 'initialuser', name: 'Initial User', passwordHash })
  await initialUser.save()

  const initialBlogs = [
    { title: 'First Blog', author: 'Author One', url: 'http://firstblog.com', likes: 2, user: initialUser._id },
    { title: 'Second Blog', author: 'Author Two', url: 'http://secondblog.com', likes: 3, user: initialUser._id }
  ]
  await Blog.insertMany(initialBlogs)
})

describe('Blog API tests', () => {
  it('blogs are returned as json', async () => {
    await api.get('/api/blogs')
      .expect(200)
      .expect('Content-Type', /application\/json/)
  })

  it('correct number of blogs is returned', async () => {
    const response = await api.get('/api/blogs')
    assert.strictEqual(response.body.length, 2)
  })

  it('unique identifier is named id', async () => {
    const response = await api.get('/api/blogs')
    assert.ok(response.body[0].id)
  })

  describe('when adding a new blog', () => {
    let token = null
    let user = null

    beforeEach(async () => {
      await Blog.deleteMany({})
      await User.deleteMany({})

      const passwordHash = await bcrypt.hash('secretpass', 10)
      user = new User({ username: 'testadder', name: 'Test Adder', passwordHash })
      await user.save()

      const loginResponse = await api
        .post('/api/login')
        .send({ username: 'testadder', password: 'secretpass' })
      token = loginResponse.body.token
    })

    it('a valid blog can be added with token', async () => {
      const newBlog = {
        title: 'New Blog with Token',
        author: 'Test Author',
        url: 'http://testblog.com',
        likes: 7
      }

      const response = await api
        .post('/api/blogs')
        .set('Authorization', `Bearer ${token}`)
        .send(newBlog)
        .expect(201)
        .expect('Content-Type', /application\/json/)

      assert.strictEqual(response.body.title, 'New Blog with Token')
      assert.strictEqual(response.body.user.username, 'testadder')

      const blogsAfter = await Blog.find({})
      assert.strictEqual(blogsAfter.length, 1)
    })

    it('if likes is missing, it defaults to 0', async () => {
      const newBlog = {
        title: 'No Likes Blog',
        author: 'No Likes',
        url: 'http://nolikes.com'
      }

      const response = await api
        .post('/api/blogs')
        .set('Authorization', `Bearer ${token}`)
        .send(newBlog)
        .expect(201)
        .expect('Content-Type', /application\/json/)

      assert.strictEqual(response.body.likes, 0)
      assert.strictEqual(response.body.user.username, 'testadder')
    })

    it('blog without title and url is not added', async () => {
      const newBlog = {
        author: 'No title or url',
        likes: 3
      }

      await api
        .post('/api/blogs')
        .set('Authorization', `Bearer ${token}`)
        .send(newBlog)
        .expect(400)
    })

    it('adding a blog without token fails with 401', async () => {
      const newBlog = {
        title: 'Unauthorized Blog',
        author: 'Auth Test',
        url: 'http://unauth.com',
        likes: 1
      }

      await api
        .post('/api/blogs')
        .send(newBlog)
        .expect(401)
    })
  })

  describe('when deleting a blog', () => {
    let blogToDeleteId = null
    let deleterUser = null
    let deleterToken = null
    let anotherUserId = null

    beforeEach(async () => {
      await Blog.deleteMany({})
      await User.deleteMany({})

      const deleterPasswordHash = await bcrypt.hash('deleterpass', 10)
      deleterUser = new User({ username: 'deleteruser', name: 'Deleter User', passwordHash: deleterPasswordHash })
      await deleterUser.save()
      const deleterLoginResponse = await api.post('/api/login').send({ username: 'deleteruser', password: 'deleterpass' })
      deleterToken = deleterLoginResponse.body.token

      const anotherPasswordHash = await bcrypt.hash('anotherpass', 10)
      const anotherUser = new User({ username: 'anotheruser', name: 'Another User', passwordHash: anotherPasswordHash })
      await anotherUser.save()
      anotherUserId = anotherUser._id
      
      const anotherLoginResponse = await api.post('/api/login').send({ username: 'anotheruser', password: 'anotherpass' })
      const anotherUserToken = anotherLoginResponse.body.token

      const blog = new Blog({
        title: 'Blog to Delete',
        author: 'Deleter Author',
        url: 'http://todelete.com',
        likes: 5,
        user: deleterUser._id
      })
      const savedBlog = await blog.save()
      blogToDeleteId = savedBlog._id
      deleterUser.blogs = deleterUser.blogs.concat(savedBlog._id)
      await deleterUser.save()

      const anotherBlog = new Blog({
        title: 'Another Users Blog',
        author: 'Another Author',
        url: 'http://another.com',
        likes: 1,
        user: anotherUserId
      })
      await anotherBlog.save()
      anotherUser.blogs = anotherUser.blogs.concat(anotherBlog._id)
      await anotherUser.save()
    })

    it('a blog can be deleted by its creator', async () => {
      await api
        .delete(`/api/blogs/${blogToDeleteId}`)
        .set('Authorization', `Bearer ${deleterToken}`)
        .expect(204)

      const blogsAfter = await Blog.find({}).populate('user', { username: 1, name: 1 })
      assert.strictEqual(blogsAfter.length, 1)
      assert.strictEqual(blogsAfter[0].user.id.toString(), anotherUserId.toString())
    })

    it('a blog cannot be deleted by a non-creator', async () => {
      const loginResponse = await api.post('/api/login').send({ username: 'anotheruser', password: 'anotherpass' })
      const anotherUserToken = loginResponse.body.token

      await api
        .delete(`/api/blogs/${blogToDeleteId}`)
        .set('Authorization', `Bearer ${anotherUserToken}`)
        .expect(401)

      const blogsAfter = await Blog.find({})
      assert.strictEqual(blogsAfter.length, 2)
    })

    it('deleting a blog without token fails with 401', async () => {
      await api
        .delete(`/api/blogs/${blogToDeleteId}`)
        .expect(401)
    })
  })

  it('likes of a blog can be updated', async () => {
    await Blog.deleteMany({});
    await User.deleteMany({});
    const passwordHash = await bcrypt.hash('updaterpass', 10);
    const updaterUser = new User({ username: 'updateruser', name: 'Updater User', passwordHash });
    await updaterUser.save();
    
    const blogToUpdate = new Blog({
      title: 'Update Me',
      author: 'Updater',
      url: 'http://updateme.com',
      likes: 10,
      user: updaterUser._id
    });
    const savedBlog = await blogToUpdate.save();

    const updatedBlog = {
      title: savedBlog.title,
      author: savedBlog.author,
      url: savedBlog.url,
      likes: savedBlog.likes + 1
    };

    const response = await api
      .put(`/api/blogs/${savedBlog.id}`)
      .send(updatedBlog)
      .expect(200)
      .expect('Content-Type', /application\/json/)

    assert.strictEqual(response.body.likes, savedBlog.likes + 1)
  })
})

describe('Login API tests', () => {
  beforeEach(async () => {
    await User.deleteMany({})
    const passwordHash = await bcrypt.hash('validpass', 10)
    const user = new User({ username: 'validuser', name: 'Valid User', passwordHash })
    await user.save()
  })

  it('login succeeds with valid credentials', async () => {
    const credentials = {
      username: 'validuser',
      password: 'validpass'
    }

    const response = await api
      .post('/api/login')
      .send(credentials)
      .expect(200)
      .expect('Content-Type', /application\/json/)

    assert.ok(response.body.token)
    assert.strictEqual(response.body.username, 'validuser')
    assert.strictEqual(response.body.name, 'Valid User')
  })

  it('login fails with invalid credentials', async () => {
    const credentials = {
      username: 'invaliduser',
      password: 'wrongpass'
    }

    await api
      .post('/api/login')
      .send(credentials)
      .expect(401)
  })
})

describe('User API tests', () => {
  beforeEach(async () => {
    await User.deleteMany({})
  })

  it('valid user can be created', async () => {
    const newUser = {
      username: 'newuser',
      name: 'New User',
      password: 'password123'
    }

    const initialUsers = await User.find({})
    const initialUserCount = initialUsers.length

    const response = await api
      .post('/api/users')
      .send(newUser)
      .expect(201)
      .expect('Content-Type', /application\/json/)

    assert.strictEqual(response.body.username, 'newuser')
    assert.strictEqual(response.body.name, 'New User')
    assert.ok(response.body.id)

    const usersAfter = await User.find({})
    assert.strictEqual(usersAfter.length, initialUserCount + 1)
  })
})

after(async () => {
  await mongoose.connection.close()
})
