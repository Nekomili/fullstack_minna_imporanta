const { expect } = require('@playwright/test')

const loginWith = async (page, username, password) => {
  await page.getByTestId('username-input').fill(username)
  await page.getByTestId('password-input').fill(password)
  await page.getByRole('button', { name: 'login' }).click()
}

const createBlog = async (page, title, author, url) => {
  await page.getByTestId('toggle-blog-form-button').click()
  await page.getByPlaceholder('title').fill(title)
  await page.getByPlaceholder('author').fill(author)
  await page.getByPlaceholder('url').fill(url)
  await page.getByRole('button', { name: 'create' }).click()
  await expect(page.getByText(`a new blog ${title} by ${author} added`)).toBeVisible()
  await expect(page.getByPlaceholder('title')).not.toBeVisible()
}

module.exports = {
  loginWith,
  createBlog
}
