const { test, expect, beforeEach, describe } = require('@playwright/test')
const { loginWith, createBlog } = require('./helper')

describe('Blog app', () => {
  beforeEach(async ({ page, request }) => {
    await request.post('http://localhost:3003/api/testing/reset')
    await request.post('http://localhost:3003/api/users', {
      data: {
        name: 'Test User',
        username: 'uusi_testi',
        password: 'salasana123'
      }
    })
    await request.post('http://localhost:3003/api/users', {
      data: {
        name: 'Normal User',
        username: 'normal',
        password: 'password'
      }
    })

    await page.goto('http://localhost:5173')
  })

  test('Login form is shown', async ({ page }) => {
    await expect(page.getByText('log in to application')).toBeVisible()
    await expect(page.getByTestId('username-input')).toBeVisible()
    await expect(page.getByTestId('password-input')).toBeVisible()
    await expect(page.getByRole('button', { name: 'login' })).toBeVisible()
  })

  describe('Login', () => {
    test('succeeds with correct credentials', async ({ page }) => {
      await loginWith(page, 'uusi_testi', 'salasana123')
      await expect(page.getByText('Test User logged in')).toBeVisible()
      await expect(page.getByTestId('toggle-blog-form-button')).toBeVisible()
    })

    test('fails with wrong credentials', async ({ page }) => {
      await loginWith(page, 'uusi_testi', 'wrong')

      const errorDiv = page.locator('.error')
      await expect(errorDiv).toContainText('wrong username or password')
      await expect(errorDiv).toHaveCSS('border-color', 'rgb(255, 0, 0)')
      await expect(page.getByText('Test User logged in')).not.toBeVisible()
      await expect(page.getByTestId('toggle-blog-form-button')).not.toBeVisible()
    })
  })

  describe('When logged in', () => {
    beforeEach(async ({ page }) => {
      await loginWith(page, 'uusi_testi', 'salasana123')
      await expect(page.getByTestId('toggle-blog-form-button')).toBeVisible()
    })

    test('a new blog can be created', async ({ page }) => {
      await createBlog(page, 'Test Blog Title', 'Test Author', 'http://testurl.com')
      await expect(page.locator('.blog').filter({ hasText: 'Test Blog Title Test Author' })).toBeVisible()

      await expect(page.getByText('a new blog Test Blog Title by Test Author added')).toBeVisible()
      await expect(page.getByText('Test Blog Title Test Author')).toBeVisible()
    })

    test('blog can be liked', async ({ page }) => {
      await createBlog(page, 'Blog to be liked', 'Like Author', 'http://likeurl.com')
      const blogLocator = page.locator('.blog').filter({ hasText: 'Blog to be liked Like Author' })
      await expect(blogLocator).toBeVisible()
      await blogLocator.getByRole('button', { name: 'view' }).click()

      const initialLikesElement = await blogLocator.getByText('likes').textContent()
      const initialLikesMatch = initialLikesElement.match(/likes (\d+)/)
      const currentLikes = initialLikesMatch ? parseInt(initialLikesMatch[1]) : 0

      await blogLocator.getByRole('button', { name: 'like' }).click()
      await expect(blogLocator.getByText(`likes ${currentLikes + 1}`)).toBeVisible()

      await blogLocator.getByRole('button', { name: 'like' }).click()
      await expect(blogLocator.getByText(`likes ${currentLikes + 2}`)).toBeVisible()
    })

    test('blog by user can be deleted', async ({ page }) => {
      await createBlog(page, 'Blog to be deleted', 'Delete Author', 'http://deleteurl.com')
      const blogLocator = page.locator('.blog').filter({ hasText: 'Blog to be deleted Delete Author' })
      await expect(blogLocator).toBeVisible()

      await blogLocator.getByRole('button', { name: 'view' }).click()

      page.on('dialog', async dialog => {
        expect(dialog.type()).toContain('confirm')
        expect(dialog.message()).toContain('Remove blog Blog to be deleted by Delete Author')
        await dialog.accept()
      })

      await blogLocator.getByRole('button', { name: 'remove' }).click()
      await expect(blogLocator).not.toBeVisible()
    })

    test('only the creator can see the delete button', async ({ page, request }) => {
      await createBlog(page, 'Blog by Test User', 'Test Author', 'http://testuser.com')
      const testUserBlog = page.locator('.blog').filter({ hasText: 'Blog by Test User Test Author' })
      await expect(testUserBlog).toBeVisible()

      await page.getByRole('button', { name: 'logout' }).click()

      await loginWith(page, 'normal', 'password')
      await expect(page.getByText('Normal User logged in')).toBeVisible()

      const testUserBlogAfterLogin = page.locator('.blog').filter({ hasText: 'Blog by Test User Test Author' })
      await expect(testUserBlogAfterLogin).toBeVisible()
      await testUserBlogAfterLogin.getByRole('button', { name: 'view' }).click()
      await expect(testUserBlogAfterLogin.getByRole('button', { name: 'remove' })).not.toBeVisible()

      await page.getByRole('button', { name: 'logout' }).click()

      await loginWith(page, 'uusi_testi', 'salasana123')
      await expect(page.getByTestId('toggle-blog-form-button')).toBeVisible()
      const testUserBlogAgain = page.locator('.blog').filter({ hasText: 'Blog by Test User Test Author' })
      await expect(testUserBlogAgain).toBeVisible()
      await testUserBlogAgain.getByRole('button', { name: 'view' }).click()
      await expect(testUserBlogAgain.getByRole('button', { name: 'remove' })).toBeVisible()
    })

    test('blogs are ordered by likes in descending order', async ({ page, request }) => {
      await createBlog(page, 'Blog A title', 'Author A', 'http://a.com')
      const blogA = page.locator('.blog').filter({ hasText: 'Blog A title Author A' })
      await expect(blogA).toBeVisible()
      await blogA.getByRole('button', { name: 'view' }).click()
      await blogA.getByRole('button', { name: 'like' }).click()
      await expect(blogA.getByText('likes 1')).toBeVisible()
      await blogA.getByRole('button', { name: 'like' }).click() // 2 likes
      await expect(blogA.getByText('likes 2')).toBeVisible()

      await createBlog(page, 'Blog B title', 'Author B', 'http://b.com')
      const blogB = page.locator('.blog').filter({ hasText: 'Blog B title Author B' })
      await expect(blogB).toBeVisible()
      await blogB.getByRole('button', { name: 'view' }).click()
      await blogB.getByRole('button', { name: 'like' }).click() // 1 like
      await expect(blogB.getByText('likes 1')).toBeVisible()

      await createBlog(page, 'Blog C title', 'Author C', 'http://c.com')
      const blogC = page.locator('.blog').filter({ hasText: 'Blog C title Author C' })
      await expect(blogC).toBeVisible()
      await blogC.getByRole('button', { name: 'view' }).click()
      await expect(blogC.getByText('likes 0')).toBeVisible()
      await page.reload()
      await expect(page.locator('.blog')).toHaveCount(3)

      const allBlogElements = await page.locator('.blog').all()
      for (const blogElem of allBlogElements) {
        const viewButton = blogElem.getByRole('button', { name: 'view' })
        await expect(viewButton).toBeVisible()
        await viewButton.click()
        await expect(blogElem.locator('.blog-likes')).toBeVisible()
      }

      const actualBlogTitles = await page.locator('.blog .blog-title').allTextContents()

      expect(actualBlogTitles[0]).toContain('Blog A title')
      expect(actualBlogTitles[1]).toContain('Blog B title')
      expect(actualBlogTitles[2]).toContain('Blog C title')


      const blogALikes = await page.locator('.blog').filter({ hasText: 'Blog A title' }).locator('.blog-likes').textContent()
      const blogBLikes = await page.locator('.blog').filter({ hasText: 'Blog B title' }).locator('.blog-likes').textContent()
      const blogCLikes = await page.locator('.blog').filter({ hasText: 'Blog C title' }).locator('.blog-likes').textContent()

      expect(parseInt(blogALikes.split(' ')[1])).toBe(2)
      expect(parseInt(blogBLikes.split(' ')[1])).toBe(1)
      expect(parseInt(blogCLikes.split(' ')[1])).toBe(0)
    })
  })
})

