const fs = require('fs');
const content = fs.readFileSync('tunnel_url.txt', 'utf8');
const match = content.match(/https:\/\/[a-z0-9.-]+\.tunnelmole\.net/);
if (match) {
    console.log('URL:', match[0]);
} else {
    console.log('URL not found');
}
