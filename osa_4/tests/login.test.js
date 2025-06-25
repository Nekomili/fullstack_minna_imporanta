process.env.SECRET = 'testsecret'

const assert = require('assert')
const mongoose = require('mongoose')
const supertest = require('supertest')
const app = require('../app')
const User = require('../models/user')
const bcrypt = require('bcryptjs')

const api = supertest(app)

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
  })

  it('login fails with invalid credentials', async () => {
    const credentials = {
      username: 'validuser',
      password: 'wrongpassword'
    }

    await api
      .post('/api/login')
      .send(credentials)
      .expect(401)
  })

  it('login fails with non-existent user', async () => {
    const credentials = {
      username: 'nonexistent',
      password: 'anypassword'
    }

    await api
      .post('/api/login')
      .send(credentials)
      .expect(401)
  })
})

after(async () => {
  await mongoose.connection.close()
})
