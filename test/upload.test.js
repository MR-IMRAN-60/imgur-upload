const { Imgur } = require('../lib/upload');

test('Imgur upload returns success with a valid image URL', async () => {
  const result = await Imgur('https://example.com/image.jpg');
  expect(result.status).toBe('success');
  expect(result.image).toMatch(/^https:\/\/i\.imgur\.com/); // Basic Imgur URL check
});

test('Imgur upload throws an error when file type is unsupported', async () => {
  await expect(Imgur('https://example.com/file.txt')).rejects.toThrow('Only images or videos are supported');
});
