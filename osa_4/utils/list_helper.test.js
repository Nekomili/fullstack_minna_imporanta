const { test, describe } = require('node:test')
const assert = require('node:assert')
const listHelper = require('../utils/list_helper')

test('dummy returns one', () => {
  const blogs = []
  const result = listHelper.dummy(blogs)
  assert.strictEqual(result, 1)
})

describe('total likes', () => {
  test('of empty list is zero', () => {
    assert.strictEqual(listHelper.totalLikes([]), 0)
  })

  test('of one blog equals the likes of that', () => {
    const listWithOne = [{ likes: 7 }]
    assert.strictEqual(listHelper.totalLikes(listWithOne), 7)
  })

  test('of many blogs is calculated right', () => {
    const blogs = [
      { likes: 1 },
      { likes: 2 },
      { likes: 3 },
    ]
    assert.strictEqual(listHelper.totalLikes(blogs), 6)
  })
})

describe('favorite blog', () => {
  const blogs = [
    { title: 'A', likes: 1 },
    { title: 'B', likes: 9 },
    { title: 'C', likes: 5 }
  ]

  test('returns the blog with most likes', () => {
    assert.deepStrictEqual(listHelper.favoriteBlog(blogs), blogs[1])
  })

  test('of empty list is null', () => {
    assert.strictEqual(listHelper.favoriteBlog([]), null)
  })
})

describe('most blogs', () => {
  const blogs = [
    { author: 'Robert C. Martin' },
    { author: 'Robert C. Martin' },
    { author: 'Edsger W. Dijkstra' },
    { author: 'Robert C. Martin' },
    { author: 'Edsger W. Dijkstra' },
  ]

  test('returns the author with most blogs', () => {
    assert.deepStrictEqual(listHelper.mostBlogs(blogs), {
      author: 'Robert C. Martin',
      blogs: 3
    })
  })
})

describe('most likes', () => {
  const blogs = [
    { author: 'Edsger W. Dijkstra', likes: 10 },
    { author: 'Robert C. Martin', likes: 5 },
    { author: 'Edsger W. Dijkstra', likes: 7 },
    { author: 'Robert C. Martin', likes: 3 },
  ]

  test('returns the author whose blogs have the most likes', () => {
    assert.deepStrictEqual(listHelper.mostLikes(blogs), {
      author: 'Edsger W. Dijkstra',
      likes: 17
    })
  })
})
