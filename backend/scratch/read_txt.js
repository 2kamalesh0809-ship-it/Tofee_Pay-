const fs = require('fs');
const path = require('path');
const file = path.join(__dirname, '../tunnel_url.txt');
try {
    const data = fs.readFileSync(file, 'utf16le');
    console.log('UTF-16LE content:', data);
} catch (e) {
    try {
        const data = fs.readFileSync(file, 'utf8');
        console.log('UTF-8 content:', data);
    } catch (err) {
        console.error(err);
    }
}
