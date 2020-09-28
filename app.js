// REQUIRE NODE MODULES
// 3rd party
// const http = require('http');
const express = require("express");
const app = express();
// const { rejects } = require('assert');
const bodyParser = require('body-parser');
const expressFileUpload = require('express-fileupload');
// native
const fs = require('fs');
// const { resolve } = require('path');
const path = require('path');

// set up application level middleware
app.use(bodyParser.urlencoded({extended: false}));
app.use(expressFileUpload());

// set up obj cache
let cache = {};

// cache location
const directory = __dirname + path.sep + 'cache';

// set up functions that are promises

// FSwriteFile
function uploadFile(name, data) {
    return new Promise((resolve, reject) => {
        fs.writeFile(directory + path.sep + name, data, (err) => {
            if (err) {
                return rejects(err);
            } else {
                resolve(name);
            }
        });
    }).then(downloadFile);
    
}
// FSreadFile
function downloadFile(fileName) {
    return new Promise((resolve, reject) => {
        fs.readFile(directory + path.sep + fileName, (err, body) => {
            if (err) {
                return reject(err);
            } else {
                resolve(body);
            }
        });
    });
}


app.use('/', (req, res, next) => {
    console.log(req.url);
    console.log(req.method);
    next();
})

// route handler === middleware
app.use(express.static('public'));
// app.use(express.static('download'));
// app.get('/', (req, res) => {
//     res.sendFile(__dirname + '/index.html');
// })

// user uploading file to cache
app.post('/upload', (req, res) => {
    // more than one file is uploaded
    // console.log(req.files);
    // {
    //     'Choose File': [
    //       {
    //         name: 'Screenshot 2020-09-24 at 2.51.23 PM.png',
    //         data: <Buffer 89 50 4e 47 0d 0a 1a 0a 00 00 00 0d 49 48 44 52 00 00 05 a0 00 00 03 84 08 06 00 00 00 57 4d 96 d2 00 00 18 7b 69 43 43 50 49 43 43 20 50 72 6f 66 69 ... 466896 more bytes>,
    //         size: 466946,
    //         encoding: '7bit',
    //         tempFilePath: '',
    //         truncated: false,
    //         mimetype: 'image/png',
    //         md5: 'e7199725e89450111dcb993bf2eba944',
    //         mv: [Function: mv]
    //       },
    //       {
    //         name: 'testingJPG.png',
    //         data: <Buffer 89 50 4e 47 0d 0a 1a 0a 00 00 00 0d 49 48 44 52 00 00 02 b6 00 00 01 3a 08 06 00 00 00 e3 99 11 d2 00 00 01 3e 69 43 43 50 49 43 43 20 50 72 6f 66 69 ... 39850 more bytes>,
    //         size: 39900,
    //         encoding: '7bit',
    //         tempFilePath: '',
    //         truncated: false,
    //         mimetype: 'image/png',
    //         md5: '290b3710d612b04795b957b536f03797',
    //         mv: [Function: mv]
    //       }
    //     ]
    //   }
    // just one file is uploaded
    // console.log(req.files);
    // {
    //     'Choose File': {
    //       name: 'testingJPG.png',
    //       data: <Buffer 89 50 4e 47 0d 0a 1a 0a 00 00 00 0d 49 48 44 52 00 00 02 b6 00 00 01 3a 08 06 00 00 00 e3 99 11 d2 00 00 01 3e 69 43 43 50 49 43 43 20 50 72 6f 66 69 ... 39850 more bytes>,
    //       size: 39900,
    //       encoding: '7bit',
    //       tempFilePath: '',
    //       truncated: false,
    //       mimetype: 'image/png',
    //       md5: '290b3710d612b04795b957b536f03797',
    //       mv: [Function: mv]
    //     }
    //   }
    if (Array.isArray(req.files['Choose File'])) {
    // more than one file is uploaded
        for (let i = 0; i < req.files['Choose File'].length; i++) {
            cache[req.files['Choose File'][i].name] = uploadFile(req.files['Choose File'][i].name, req.files['Choose File'][i].data);
            cache[req.files['Choose File'][i].name].then(()=> {
                res.sendFile(__dirname + '/public/download.html');
            })
            .catch((err) => {
                res.status(500).send(err);
            })
        }
    } else {
    // just one file is uploaded
        // console.log(req.files['Choose File'].name); // 'testingJPG.png'
        let fileNameUploaded = req.files['Choose File'].name;
        let fileUploaded = req.files['Choose File'].data;
        cache[fileNameUploaded] = uploadFile(fileNameUploaded, fileUploaded);
        cache[fileNameUploaded].then(() => {
            // res.send('url: localhost:3000/data/:file-name');
            res.sendFile(__dirname + '/public/download.html');
        })
        .catch((err) => {
            res.status(500).send(err);
        })
    }
})

// user downloading file to cache
app.get('/dl/:name', (req, res) => {
    if (cache[req.params.name] === null) {
        cache[req.params.name] = downloadFile(req.params.name);
    }
    cache[req.params.name].then((body) => {
        res.send(body); // downloading the file
    })
    .catch((err) => {
        res.status(500).send(err);
    })
})

// send filenames to backend for retrieval later in download.html --> create download links
app.get('/filenames', (req, res) => {
    res.send(Object.keys(cache));
})


app.listen(3000, () => {
    console.log('listening to 3000');
})

// thinking process
// prompt user to upload file (post method & readFile?? i.e. sending data to server)
// put the data in the cache obj
// allow user to download from cache (get method & writeFile?? returning data to user when they send req using url (params/ query??))

