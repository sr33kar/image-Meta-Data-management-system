const express = require('express');
const mongoose = require('mongoose');
const multer = require('multer');
const path = require('path');

const ejs = require('ejs');


const app = express();
var ExifImage = require('exif').ExifImage;

app.set('view engine', 'ejs');




// Connect to MongoDB
const options = {
    autoIndex: false, // Don't build indexes
    reconnectTries: 30, // Retry up to 30 times
    reconnectInterval: 500, // Reconnect every 500ms
    poolSize: 10, // Maintain up to 10 socket connections
    // If not connected, return errors immediately rather than waiting for reconnect
    bufferMaxEntries: 0
}

const connectWithRetry = () => {
    console.log('MongoDB connection with retry')
    mongoose.connect("mongodb://mongo:27017/docker-node-mongo", options).then(() => {
        console.log('MongoDB is connected')
    }).catch(err => {
        console.log(err)
        console.log('MongoDB connection unsuccessful, retry after 5 seconds.')
        setTimeout(connectWithRetry, 5000)
    })
}

connectWithRetry()





const ImageData = require('./models/imageData')
const Item = require('./models/Item');
const User = require('./models/user');
const imageData = require('./models/imageData');



// Public Folder
app.use(express.static(path.join(__dirname, './public/')));
app.use(express.urlencoded({ extended: false }));
//set storage engine
const storage = multer.diskStorage({
    destination: function(req, file, cb) {
        cb(null, path.join(__dirname, './public/uploads'))
    },
    filename: function(req, file, cb) {
        var fileName = file.fieldname + '-' + Date.now() + path.extname(file.originalname);
        try {
            //console.log("entered");
            new ExifImage({ image: path.join('public/uploads/', fileName) }, function(error, exifData) {
                if (error) {
                    console.log('Error: ' + error.message);
                } else {
                    //console.log(exifData); // Do something with your data!
                    exifData.path = path.join('public/uploads/', fileName);
                    //console.log(exifData);
                    const newImage = new ImageData(exifData);
                    newImage.save().then(item => res.redirect('/loggedIn'));
                }

                //console.log('here')
            });
        } catch (error) {
            console.log('Error: ' + error.message);
        }
        cb(null, fileName);
    }
});
//init upload
const upload = multer({
    storage: storage,
    fileFilter: function(req, file, cb) {
        checkFileType(file, cb);
    }
}).single('myImage');
// Check File Type
function checkFileType(file, cb) {
    // Allowed ext
    const filetypes = /jpeg/;
    // Check ext
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    // Check mime
    const mimetype = filetypes.test(file.mimetype);

    if (mimetype && extname) {
        return cb(null, true);
    } else {
        cb('Error: Images Only!');
    }
}
app.post('/upload', (req, res) => {
    var async_func = async function(req, res) {
        upload(req, res, (err) => {
            if (err) {
                res.render('logged', {
                    msg: err
                });
            } else {
                if (req.file == undefined) {
                    res.render('logged', {
                        msg: 'Error: No File Selected!'
                    });
                } else {
                    //console.log(req.file);
                    res.render('logged', {
                        msg: 'File Uploaded!',
                        file: `uploads/${req.file.filename}`
                    });

                }
            }
        });
    }
    async_func(req, res);
});



app.get('/', (req, res) => {
    var msg = '';
    var msgTop = '';
    res.render('index.ejs', { msgTop, msg });
});
app.get('/loggedIn', (req, res) => {
    Item.find()
        .then(items => res.render('logged', { items }))
        .catch(err => res.status(404).json({ msg: 'No items found' }));
});
app.get('/loggedIn', function(req, res) {
    res.render('logged.ejs');
});

app.post('/item/auth', (req, res) => {
    var uname = req.body.name;
    var pass = req.body.prop;
    global.found;
    global.found = 0;
    if (uname == "guest" && pass == "guest") {
        return res.redirect('/loggedIn');
    } else {
        var f = 0;
        /*f = function(err, User) {
            User.find()
                .then(users => {
                    console.log(users);
                    async.forEach(users, (element) => {
                        if (uname == element['name'] && pass == element['pass']) {
                            f = 1;
                        }
                        console.log(element['name']);
                    });
                })
                .catch(err => res.status(404).json({ msg: 'No items found' }));
        }*/
        User.count({ name: uname, pass: pass }, function(err, count) {
            if (count > 0) {
                //document exists });
                return res.redirect('/loggedIn');
            } else {
                var msgTop = 'Wrong Credentials';
                var msg = '';
                return res.render('index.ejs', { msgTop, msg });
            }
        });
        /*
        const result = User.find({ name: uname, pass: pass });
        //console.log(result);
        var url = '/';
        if (result != null) {
            url = '/loggdIn';
            //console.log("fgsherujrul");
            return res.redirect('/loggedIn');
        }
        return res.redirect('/');*/
    }
});
app.post('/item/addUser', (req, res) => {
    const newUser = new User({
        name: req.body.name,
        pass: req.body.pass
    });
    var uname = req.body.name;
    User.count({ name: uname }, function(err, count) {
        if (count > 0) {
            //document exists });
            var msgTop = '';
            var msg = 'Username Already Taken!!'
            return res.render('index', { msgTop, msg });
        } else {
            newUser.save().then(user => res.redirect('/'));
        }
    });
});
app.post('/item/Add', (req, res) => {
    const newItem = new Item({
        name: req.body.name,
        prop: req.body.prop
    });
    path.join('public/uploads/', file.originalname)
    newItem.save().then(item => res.redirect('/loggedIn'));
});
app.post('/item/authAdmin', (req, res) => {
    var uname = req.body.name;
    var pass = req.body.prop;
    if (uname == 'admin' && pass == 'admin') {
        res.redirect('/loggedIn');
    } else {
        res.redirect('/');
    }
});



app.post('/find', (req, res) => {
    ImageData.find({}, function(err, docs) {
        if (err) { res.json(err); } else {
            var name1 = req.body.name1;
            var name2 = req.body.name2;
            var prop = req.body.prop;
            var result = [];
            var i = 0;
            if (name2 == "") {
                docs.forEach((doc) => {
                    var ob = JSON.parse(JSON.stringify(doc));
                    if (ob[name1] == prop) {
                        result.push(String(ob['path']).substr(7));
                    }
                });
                console.log(result);
            } else {
                docs.forEach((doc) => {
                    var ob = JSON.parse(JSON.stringify(doc));
                    if (ob[name1][name2] == prop) {
                        result.push(String(ob['path']).substr(7));
                    }
                });
                console.log(result);
            }
            //console.log(JSON.parse(JSON.stringify(docs[0]))['path']);
            res.render('list', { items: result, layout: false });
        }
    });
});;





const port = 3000;

app.listen(port, () => console.log('Server running...'));