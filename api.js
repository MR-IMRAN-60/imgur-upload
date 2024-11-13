const fs = require("fs");
const request = require('request');
const path = require('path');

// Function to handle the image/video upload to Imgur
exports.Imgur = async (link) => {
  if (!link) {
    throw new Error('Missing data to launch the program'); // Missing link
  }

  try {
    const { filePath, type } = await dl(link);

    if (type !== 'image' && type !== 'video') {
      fs.unlinkSync(filePath);
      throw new Error('Only images or videos are supported'); // Only images or videos supported
    }

    const options = {
      method: 'POST',
      url: 'https://api.imgur.com/3/upload',
      headers: {
        'Authorization': 'Client-ID c76eb7edd1459f3'
      },
      formData: {
                [type]: fs.createReadStream(filePath) // Upload either 'image' or 'video'
      }
    };

    return new Promise((resolve, reject) => {
      request(options, (error, response) => {
        if (error) {
          fs.unlinkSync(filePath);
          reject(new Error('Something went wrong with your link')); // Error with your link
        }

        const responseBody = JSON.parse(response.body);
        if (responseBody.success) {
          // Successfully uploaded to Imgur
          fs.unlinkSync(filePath); // Delete the file after upload
          resolve({
            status: 'success',
            image: responseBody.data.link,
            author: 'IMRAN AHMED',
          });
        } else {
          fs.unlinkSync(filePath);
          reject(new Error('Unable to upload to Imgur')); // Cannot upload to Imgur
        }
      });
    });

  } catch (error) {
    throw new Error('An error occurred while downloading the file'); // Error downloading file
  }
};

// Function to download the file from the provided URL
async function dl(url) {
  return new Promise((resolve, reject) => {
    let filePath;
    request(url).on('response', function(response) {
      const contentType = response.headers['content-type'];
      const ext = contentType.split('/')[1];

      // Define a temporary file path to save the downloaded content
      filePath = path.join(__dirname, `/cache/${Date.now()}.${ext}`);

      // Check if the file is an image or video
      const type = contentType.split('/')[0];

      if (type !== 'image' && type !== 'video') {
        return reject(new Error('Unsupported file type'));
      }

      response.pipe(fs.createWriteStream(filePath)).on('finish', () => {
        resolve({ filePath, type });
      });
    }).on('error', (err) => {
      reject(err);
    });
  });
}
