import fs from 'fs';
import path from 'path';

async function testUpload() {
  const formData = new FormData();
  const fileContent = Buffer.from('test image content');
  const blob = new Blob([fileContent], { type: 'image/jpeg' });
  formData.append('image', blob, 'test.jpg');

  try {
    const res = await fetch('http://localhost:3000/api/upload', {
      method: 'POST',
      body: formData
    });
    
    console.log('Status:', res.status);
    console.log('Response:', await res.text());
  } catch (err) {
    console.error('Error:', err);
  }
}

testUpload();
