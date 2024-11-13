const axios = require('axios');
const fs = require('fs-extra');
const path = require('path');

// Function to handle the image/video upload to Imgur
exports.Imgur = async (link) => {
  if (!link) {
    throw new Error('Missing data to launch the program'); // Missing link
  }

  try {
    const { filePath, type } = await dl(link);

    if (type !== 'image' && type !== 'video') {
      await fs.remove(filePath);
      throw new Error('Only images or videos are supported'); // Only images or videos supported
    }

    const options = {
      method: 'POST',
      url: 'https://api.imgur.com/3/upload',
      headers: {
        'Authorization': 'Client-ID c76eb7edd1459f3',
      },
      data: {
        [type]: fs.createReadStream(filePath), // Upload either 'image' or 'video'
      },
    };

    try {
      const response = await axios(options);
      await fs.remove(filePath); // Delete the file after upload

      if (response.data.success) {
        return {
          status: 'success',
          image: response.data.data.link,
          author: 'IMRAN AHMED',
        };
      } else {
        throw new Error('Unable to upload to Imgur');
      }
    } catch (error) {
      await fs.remove(filePath); // Clean up in case of error
      throw new Error('Something went wrong with your link');
    }

  } catch (error) {
    throw new Error('An error occurred while downloading the file'); // Error downloading file
  }
};

// Function to download the file from the provided URL
async function dl(url) {
  return new Promise((resolve, reject) => {
    let filePath;
    axios.get(url, { responseType: 'stream' })
      .then(response => {
        const contentType = response.headers['content-type'];
        const ext = contentType.split('/')[1];
        filePath = path.join(__dirname, `/cache/${Date.now()}.${ext}`);

        // Check if the file is an image or video
        const type = contentType.split('/')[0];

        if (type !== 'image' && type !== 'video') {
          return reject(new Error('Unsupported file type'));
        }

        response.data.pipe(fs.createWriteStream(filePath)).on('finish', () => {
          resolve({ filePath, type });
        });
      })
      .catch(err => {
        reject(err);
      });
  });
}
