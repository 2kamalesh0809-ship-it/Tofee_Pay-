const fs = require('fs');
const content = fs.readFileSync('tunnel_url.txt', 'utf16le'); // Try UTF-16
const match = content.match(/https:\/\/[a-z0-9.-]+\.tunnelmole\.net/);
if (match) {
    console.log('URL:', match[0]);
} else {
    // Try regular utf8
    const content2 = fs.readFileSync('tunnel_url.txt', 'utf8');
    const match2 = content2.match(/https:\/\/[a-z0-9.-]+\.tunnelmole\.net/);
    if (match2) {
        console.log('URL:', match2[0]);
    } else {
        console.log('URL not found');
    }
}
