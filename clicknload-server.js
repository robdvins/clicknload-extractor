const { createServer } = require('http')
const { decode } = require('querystring')
const { createDecipheriv } = require('crypto');

function decodeKey(funcString) {
    const encodedKey = eval(`(${funcString})`)();
    return Buffer.from(encodedKey, 'hex').toString('utf8');
}

function decryptData(key, data) {
    const decipher = createDecipheriv('aes-128-cbc', key, key);
    decipher.setAutoPadding(false);

    return decipher.update(data, 'base64', 'utf8') + decipher.final('utf8');
}

const server = createServer((req, res) => {
    let reqData = ''

    req.on('data', chunk => reqData += chunk)
    req.on('end', () => {
        const { jk, crypted } = decode(reqData)

        const rawLinks = decryptData(decodeKey(jk), crypted)
        const links = rawLinks.split('\r')
        const formattedLinks = links.flatMap(link => link.trim())
        formattedLinks.shift()
        formattedLinks.pop()

        res.writeHead(200, { 'Content-Type': 'application/json' })
        res.write(JSON.stringify({ links: formattedLinks }))
        return res.end()
    })

})

const host = 'localhost'
const port = 9666

server.listen(9666, 'localhost', () => {
    console.log(`Server running on http://${host}:${port}`);
})