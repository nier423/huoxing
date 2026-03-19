const Jimp = require('jimp');

async function processImage() {
  console.log('Loading image e:\\星火\\public\\xinghuologo.png ...');
  const image = await Jimp.read('e:\\星火\\public\\xinghuologo.png');
  
  console.log('Scanning pixels...');
  image.scan(0, 0, image.bitmap.width, image.bitmap.height, function(x, y, idx) {
    const r = this.bitmap.data[idx + 0];
    const g = this.bitmap.data[idx + 1];
    const b = this.bitmap.data[idx + 2];
    
    // Calculate luminance
    const lum = 0.299 * r + 0.587 * g + 0.114 * b;
    
    // Typical paper texture threshold
    if (lum > 240) {
      this.bitmap.data[idx + 3] = 0; // Pure transparent
    } else if (lum > 150) {
      // Soft feathering alpha blending
      const alpha = Math.floor(255 * (240 - lum) / (240 - 150));
      this.bitmap.data[idx + 3] = alpha;
    }
  });
  
  console.log('Writing transparent image...');
  await image.writeAsync('e:\\星火\\public\\xinghuologo_trans.png');
  console.log('Done!');
}

processImage().catch(console.error);
