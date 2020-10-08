const express = require('express'); // server framework for Node.js
const bodyParser = require('body-parser'); // to use HTTP POST data in express
const { v4: uuidv4 } = require('uuid'); // universally unique identifier to get unique id

const app = express(); // server framework for Node.js
const port = 3000;

app.use(bodyParser.json()); // allow app to accept json

const bcrypt = require('bcryptjs'); // to encrypt password by hashing
const passport = require('passport'); // general framework to use different authentication strategies

const BasicStrategy = require('passport-http').BasicStrategy; // to use HTTPBasic strategy

const jwt = require('jsonwebtoken'); // to use JSON Web Tokens
const JwtStrategy = require('passport-jwt').Strategy, // to use json web token strategy
      ExtractJwt = require('passport-jwt').ExtractJwt;
const jwtSecretKey = require('./jwt-key.json'); // secret key

const fs = require('fs'); // file system
const multer  = require('multer') // multipart/form-data to upload files
const multerUpload = multer({ 
    dest: 'images/', // destination folder for files
    limits: {
        fileSize : 1024 * 1024 * 5, // max file size 5mb
        files: 4 // max files 4
    },
    fileFilter: (req, file, cb) => { // filter by image type
        if(file.mimetype != "image/jpeg" && file.mimetype != "image/png") {
            cb(null, false); // don't show error, don't save file
        }
        cb(null, true); // don't show error, save file
    }
})

let options = {};
options.jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken();
options.secretOrKey = jwtSecretKey.secret;

let users = [
    {
        userId: 'acb9ed30-070f-4295-b860-6a61d6f4ec69',
        username: 'admin',
        password: '$2a$10$OsNlWgKMgApu9Ncfl1N5T.qEL4o.d.Dewb/862LUymgsXCk9.R6RW', // admin
        token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyIjp7InVzZXJJZCI6ImM2NTQ0NTUxLTJlNjMtNDRmNS1hZjFkLTc1NGVmNGMxZGM2NyJ9LCJpYXQiOjE2MDE2NjY0ODIsImV4cCI6MzMxNTkyNjY0ODJ9.1tByMPBiyOHQgyCKaXouBXAFMTOFj6Tjcbndb2TkVuo"
    }, {
        userId: 'c6544551-2e63-44f5-af1d-754ef4c1dc67',
        username: 'testUser',
        password: '$2a$10$5B268DKBC2E7enPOi6D02uIgIfpZ5XN9917ZeqfyRbjuOjmIE8wIi', // password123
        token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyIjp7InVzZXJJZCI6ImM2NTQ0NTUxLTJlNjMtNDRmNS1hZjFkLTc1NGVmNGMxZGM2NyJ9LCJpYXQiOjE2MDE2NjQwOTUsImV4cCI6NDc1NzQyNDA5NX0.lCCc6EqwjNboCmcpvRA3WELAJiSrmotJ5BSb5xUbo4c"
    }, {
        userId: 'a25da9d8-25bb-4125-9bd8-7af2c69ae5f9',
        username: 'secondUser',
        password: "$2a$06$d.4vZ4fVJznARWbX3J7SieJXKw6ckGUR23TgoiP4lkmFrKlNHDQA6", // second
        token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyIjp7InVzZXJJZCI6ImM2NTQ0NTUxLTJlNjMtNDRmNS1hZjFkLTc1NGVmNGMxZGM2NyJ9LCJpYXQiOjE2MDE2NjczMTgsImV4cCI6MTYwMTY2NzMyOH0.O8AnTwJgo-zjj8KoQXqdXkQ5XcA68FS2Dy1sfOZvYvs" // expired token
    }
];

let userInfos = [
    {
        userId: 'acb9ed30-070f-4295-b860-6a61d6f4ec69',
        location: {
            country: 'Adminland',
            city: 'Admin',
            postalCode: 00000,
            address: 'Admin street 1'
        },
        contactInfo: {
            email: 'admin@gmail.com',
            phoneNumber: '0123456789'
        }
    }, {
        userId: 'c6544551-2e63-44f5-af1d-754ef4c1dc67',
        location: {
            country: 'Finland',
            city: 'Oulu',
            postalCode: 90715,
            address: 'Pihatie 13'
        },
        contactInfo: {
            email: 'john.doe@gmail.com',
            phoneNumber: '0406482410'
        }
    }, {
        userId: 'a25da9d8-25bb-4125-9bd8-7af2c69ae5f9',
        location: {
            country: 'Finland',
            city: 'Helsinki',
            postalCode: 18964,
            address: 'Torikuja 2'
        },
        contactInfo: {
            email: 'hesa@hotmail.com',
            phoneNumber: '0409476445'
        }
    }
];

let items = [
    {
        userId: 'acb9ed30-070f-4295-b860-6a61d6f4ec69',
        itemId: 'f3f0f6b2-4970-4142-8bb0-6a00031125bd',
        title: 'admin',
        description: 'admins item',
        category: {
            phones: false,
            computers: true,
            components: false
        },
        images: [],
        askingPrice: '1000e',
        postingDate: '2020-03-10',
        deliveryType: {
            shipping: true,
            pickup: false
        }
    }, {
        userId: 'c6544551-2e63-44f5-af1d-754ef4c1dc67',
        itemId: 'd5a2c4ad-a879-46fc-8dfa-2d4726d1b2fe',
        title: 'Samsung Galaxy S7',
        description: 'Almost unused phone',
        category: {
            phones: true,
            computers: false,
            components: false
        },
        images: [],
        askingPrice: '260e',
        postingDate: '2018-05-21',
        deliveryType: {
            shipping: true,
            pickup: true
        }
    }, {
        userId: 'a25da9d8-25bb-4125-9bd8-7af2c69ae5f9',
        itemId: '2da237bd-8a69-43a9-b73a-9ec30b4c6eaa',
        title: 'i5 7600K',
        description: 'Brand new processor',
        category: {
            phones: false,
            computers: false,
            components: true
        },
        images: [],
        askingPrice: '130e',
        postingDate: '2019-12-04',
        deliveryType: {
            shipping: true,
            pickup: false
        }
    }
];

// HTTPBasic authentication
passport.use(new BasicStrategy(
    function(username, password, done) {
        const user = users.find(t => t.username == username);
        if(user == undefined) {
            return done(null, false, { message: "HTTP Basic username not found" });
        } else if(bcrypt.compareSync(password, user.password) == false) {
            return done(null, false, { message: "HTTP Basic password not found" });
        } else {
            return done(null, user);
        }
    }
));

// JWT authentication
passport.use(new JwtStrategy(options, function(jwt_payload, done) {
    const now = Date.now() / 1000;
    if(jwt_payload.exp > now) {
      done(null, jwt_payload.user);
    }
    else { // expired
      done(null, false);
    }
}));

// Get all items
app.get('/items', (req, res) => {
    // creates a copy of an object so that the original object wont get affected
    // when we delete some data that we don't want to show to others
    const showItems = JSON.parse(JSON.stringify(items));
    for(let i in showItems) {
        delete showItems[i].userId;
        delete showItems[i].itemId;
    }
    
    res.status(200).json(showItems);
});

// post new item
app.post('/items', passport.authenticate('jwt', { session: false }), (req, res) => {
    if( // checks for mandatory parameters
        'title' in req.body == false ||
        'category' in req.body == false ||
        'phones' in req.body.category == false ||
        'computers' in req.body.category == false ||
        'components' in req.body.category == false ||
        'askingPrice' in req.body == false ||
        'deliveryType' in req.body == false ||
        'shipping' in req.body.deliveryType == false ||
        'pickup' in req.body.deliveryType == false ||
        req.body.title.length == 0
    ) {
        return res.status(400).json("Missing data from body");
    }
    
    // checks if user is trying to import extra data or data type doesn't match
    for(let i in req.body) {
        if(i == 'askingPrice') {
            if(typeof req.body[i] != 'number') {
                return res.status(400).json("askingPrise must be a number");
            }
        } else if(items[0][i] == undefined || typeof items[0][i] != typeof req.body[i]) {
            return res.status(400).json(["Bad request from body", i]);
        } else if(i == 'category') {
            for(let j in req.body.category) {
                if(items[0].category[j] == undefined || 
                    typeof items[0].category[j] != typeof req.body.category[j]) 
                {
                    return res.status(400).json(["Bad request from body", j]);
                } else if(j == 'components') {
                    if(req.body.category.phones == true && req.body.category.computers == true) {
                        return res.status(400).json("Only one category can be set to true");
                    } else if (req.body.category.computers == true && req.body.category.components == true) {
                        return res.status(400).json("Only one category can be set to true");
                    } else if (req.body.category.phones == true && req.body.category.components == true) {
                        return res.status(400).json("Only one category can be set to true");
                    } else if (req.body.category.phones == false && 
                        req.body.category.computers == false && 
                        req.body.category.components == false) {
                        return res.status(400).json("You must select a category");
                    }
                }
            }
        } else if(i == 'deliveryType') {
            for(let j in req.body.deliveryType) {
                if(items[0].deliveryType[j] == undefined || 
                    typeof items[0].deliveryType[j] != typeof req.body.deliveryType[j]) 
                {
                    return res.status(400).json(["Bad request from body", j]);
                } else if (j == 'pickup') {
                    if(req.body.deliveryType.shipping == false && req.body.deliveryType[j] == false) {
                        return res.status(400).json("You must select a delivery type");
                    }
                }
            }
        }
    }
    
    // checks what is the token the user has inputed
    const authorization = req.get('authorization');
    const currentToken = authorization.split('Bearer ')[1];
    const currentUser = users.find(t => t.token == currentToken);
    
    if(currentUser == undefined) {
        return res.status(401).json("Token has expired");
    }
    
    // create current date in 2020-05-20 format
    let date = new Date().toISOString().slice(0,10);
    
    items.push({
        userId: currentUser.userId,
        itemId: uuidv4(),
        title: req.body.title,
        description: req.body.description,
        category: {
            phones: req.body.category.phones,
            computers: req.body.category.computers,
            components: req.body.category.components
        },
        images: {},
        askingPrice: req.body.askingPrice.toString()+'e',
        postingDate: date,
        deliveryType: {
            shipping: req.body.deliveryType.shipping,
            pickup: req.body.deliveryType.pickup
        }
    });
        
    // description isn't mandatory but if its left out from the body, 
    // it will be set with empty value
    if(items[items.length - 1].description == undefined) {
        items[items.length - 1].description = "";
    }
    
    res.sendStatus(201);
});

// Get specific item
app.get('/items/:itemId', (req, res) => {
    const find = items.find(t => t.itemId == req.params.itemId);
    if(find == undefined) {
        res.status(404).json("Item not found");
    } else {
        const item = JSON.parse(JSON.stringify(find));
        delete item.userId;
        delete item.itemId;
        
        const userInfo = JSON.parse(JSON.stringify(userInfos.find(t => t.userId == find.userId)));
        delete userInfo.userId;
        
        res.status(200).json({item, userInfo});
    }
});

// Update posted item
app.put('/items/:itemId', passport.authenticate('jwt', { session: false }), (req, res) => {
    const item = items.find(t => t.itemId == req.params.itemId);
    if(item == undefined) {
        return res.status(404).json("Item not found");
    }
    
    const authorization = req.get('authorization');
    const currentToken = authorization.split('Bearer ')[1];
    const currentUser = users.find(t => t.token == currentToken);
    
    if(currentUser == undefined) {
        return res.status(401).json("Token has expired");
    }
    
    if(item.userId != currentUser.userId) {
        return res.status(401).json("You cannot change someone elses post");
    }
    
    if(req.body.title != undefined && req.body.title.length == 0) {
        return res.status(400).json("Title can't be left empty");
    }
    
    // checks for bad requests
    // if not, then update the data
    for(let i in req.body) {
        if(i == 'askingPrice') {
            if(typeof req.body[i] != 'number') {
                return res.status(400).json("askingPrise must be a number");
            } else {
                item[i] = req.body[i].toString()+'e';
            }
        } else if(item[i] == undefined || typeof item[i] != typeof req.body[i]) {
            return res.status(400).json(["Bad request from body", i]);
        } else if(i != 'category' && i != 'deliveryType') {
            item[i] = req.body[i];
        } else if(i == 'category'){
            for(let j in req.body.category) {
                if(item.category[j] == undefined || 
                    typeof item.category[j] != typeof req.body.category[j]) 
                {
                    return res.status(400).json(["Bad request from body", j]);
                } else if(j == 'components') {
                    if(req.body.category.phones == true && req.body.category.computers == true) {
                        return res.status(400).json("Only one category can be set to true");
                    } else if (req.body.category.computers == true && req.body.category.components == true) {
                        return res.status(400).json("Only one category can be set to true");
                    } else if (req.body.category.phones == true && req.body.category.components == true) {
                        return res.status(400).json("Only one category can be set to true");
                    } else if (req.body.category.phones == false && 
                        req.body.category.computers == false && 
                        req.body.category.components == false) {
                        return res.status(400).json("You must select a category");
                    }
                }
            }
            for(let j in req.body.category) {
                item.category[j] = req.body.category[j];
            }
        } else if(i == 'deliveryType') {
            for(let j in req.body.deliveryType) {
                if(item.deliveryType[j] == undefined || 
                    typeof item.deliveryType[j] != typeof req.body.deliveryType[j]) 
                {
                    return res.status(400).json(["Bad request from body", j]);
                } else if (j == 'pickup') {
                    if(req.body.deliveryType.shipping == false && req.body.deliveryType[j] == false) {
                        return res.status(400).json("You must select a delivery type");
                    } else {
                        item.deliveryType[j] = req.body.deliveryType[j];
                    }
                } 
            }
        }
    }
    res.sendStatus(200);
});

// Update posted items images
app.put('/items/:itemId/images', passport.authenticate('jwt', { session: false }), 
multerUpload.array('images', 4), (req, res) => {
    const item = items.find(t => t.itemId == req.params.itemId);
    if(item == undefined) {
        return res.status(404).json("Item not found");
    }
    
    const authorization = req.get('authorization');
    const currentToken = authorization.split('Bearer ')[1];
    const currentUser = users.find(t => t.token == currentToken);
    
    if(currentUser == undefined) {
        return res.status(401).json("Token has expired");
    }
    
    if(item.userId != currentUser.userId) {
        return res.status(401).json("You cannot change someone elses post");
    }
    
    if(req.files == undefined) {
        return res.status(400).json("You didn't send any files, nothing has been changed");
    }
    
    if(req.files.length > 4) {
        return res.status(400).json("You can add only 4 pictures");
    }
    
    let images = [];
    req.files.forEach(f => { // checks image type
        if(f.mimetype != "image/jpeg" && f.mimetype != "image/png") {
            return res.status(400).json("Image must be jpg, jpeg or png");
        }
        
        fs.renameSync(f.path, './images/' + item.itemId + '_' + f.originalname) // name images with itemId
        images.push(f.originalname);
    })
    
    item.images = images;
    
    res.sendStatus(200);
});

// Delete posted item
app.delete('/items/:itemId', passport.authenticate('jwt', { session: false }), (req, res) => {
    const item = items.find(t => t.itemId == req.params.itemId);
    if(item == undefined) {
        return res.status(404).json("Item not found");
    }
    
    const authorization = req.get('authorization');
    const currentToken = authorization.split('Bearer ')[1];
    const currentUser = users.find(t => t.token == currentToken);
    
    if(currentUser == undefined) {
        return res.status(401).json("Token has expired");
    }
    
    if(item.userId != currentUser.userId) {
        return res.status(401).json("You cannot delete someone elses post");
    }
    
    const findIndex = items.findIndex(t => t.itemId == req.params.itemId);
    items.splice(findIndex, 1);
    res.sendStatus(200);
});

// When user logs in, create new token
app.post('/login', passport.authenticate('basic', { session: false }), (req, res) => {
    const body = { userId: req.user.userId };
    const payload = { user: body };
    const options = { expiresIn: '1d' };
    const token = jwt.sign(payload, jwtSecretKey.secret, options);
    
    const user = users.find(t => t.userId == req.user.userId)
    user.token = token;
    
    //console.log(token);
    
    res.sendStatus(200);
});

// Search by category, location and/or postingdDate
app.get('/search', (req, res) => {   
    for(let key in req.query) {
        if(key != 'category' && key != 'location' && key != 'postingDate') {
            return res.status(400).json("Query key must be either category. location or postingDate");
        }
    }
    
    let search = [];
    
    if(req.query.location != undefined) {
        const searchByLocation = userInfos.filter(t => t.location.country == req.query.location);
        for(let i in searchByLocation){
            let allUsersItems = items.filter(t => t.userId == searchByLocation[i].userId);
            for(let j in allUsersItems){
                search.push(allUsersItems[j]);
            }
        }
        
        if(search.length == 0) {
            return res.status(404).json("Items with this location was not found");
        }
    }
    
    if(req.query.category != undefined) {
        const value = req.query.category;
        if(value != 'phones' && value != 'computers' && value != 'components' ) {
            return res.status(400).json("Category must be either phones, computers or components");
        }
        
        if(search.length == 0) {
            search = items.filter(t => t.category[value] == true);
        } else {
            search = search.filter(t => t.category[value] == true);
        }
    }
    
    if(req.query.postingDate != undefined) {
        const value = req.query.postingDate;
        if(search.length == 0) {
            search = items.filter(t => Date.parse(t.postingDate) >= Date.parse(value));
        } else {
            search = search.filter(t => Date.parse(t.postingDate) >= Date.parse(value));
        }
        
        if(search.length == 0) {
            return res.status(404).json("There are no newer posts than filtered date");
        }
    }
    
    if(search.length == 0) {
        search = items;
    }
    
    const showSearch = JSON.parse(JSON.stringify(search));
    for(let i in showSearch) {
        delete showSearch[i].userId;
        delete showSearch[i].itemId;
    }
    
    res.json(showSearch);
});

// Create new user
app.post('/users', (req, res) => {
    if( // checks for mandatory parameters
        'username' in req.body == false ||
        'password' in req.body == false ||
        'location' in req.body == false ||
        'country' in req.body.location == false ||
        'city' in req.body.location == false ||
        'postalCode' in req.body.location == false ||
        'address' in req.body.location == false ||
        'contactInfo' in req.body == false ||
        'email' in req.body.contactInfo == false ||
        
        req.body.contactInfo.email.length == 0
    ) {
        return res.status(400).json("Missing data from body");
    }
    
    // checks for bad requests
    for(let i in req.body) {
        if(i == 'username') {
            if(typeof req.body.username != "string" || req.body.username.length == 0) {
                return res.status(400).json(["Bad request from body", i]);
            }
        } else if(i == 'password') {
            if(typeof req.body.password != "string" || req.body.password.length == 0) {
                return res.status(400).json(["Bad request from body", i]);
            }
        } else if(userInfos[0][i] == undefined || typeof userInfos[0][i] != typeof req.body[i]) {
            return res.status(400).json(["Bad request from body", i]);
        } else if(i == 'location') {
            for(let j in req.body.location) {
                if(userInfos[0].location[j] == undefined || 
                    typeof userInfos[0].location[j] != typeof req.body.location[j] || 
                    req.body.location[j].length == 0
                ) {
                    return res.status(400).json(["Bad request from body", j]);
                }
            }
        } else if(i == 'contactInfo') {
            for(let j in req.body.contactInfo) {
                if(userInfos[0].contactInfo[j] == undefined || 
                    typeof userInfos[0].contactInfo[j] != typeof req.body.contactInfo[j]
                ) {
                    return res.status(400).json(["Bad request from body", j]);
                }
            }
        }
    }
    
    if(users.find(t => t.username == req.body.username) != undefined) {
        return res.status(400).json("Username already exist");
    }
    
    const hashedPassword = bcrypt.hashSync(req.body.password, 10);
    
    users.push({
        userId: uuidv4(),
        username: req.body.username,
        password: hashedPassword
    });
    
    userInfos.push({
        userId: users[users.length - 1].userId,
        location: {
            country: req.body.location.country,
            city: req.body.location.city,
            postalCode: req.body.location.postalCode,
            address: req.body.location.address
        },
        contactInfo: {
            email: req.body.contactInfo.email,
            phoneNumber: req.body.contactInfo.phoneNumber
        }
    });
    
    if(userInfos[userInfos.length - 1].contactInfo.phoneNumber == undefined){
        userInfos[userInfos.length - 1].contactInfo.phoneNumber = "";
    }
    
    res.sendStatus(201);
    
    //console.log(users[users.length - 1]);
    //console.log(userInfos[userInfos.length - 1])
});

// Get specific user
app.get('/users/:userId', passport.authenticate('jwt', { session: false }), (req, res) => {
    const find = userInfos.find(t => t.userId == req.params.userId);
    if(find == undefined) {
        return res.status(404).json("User not found");
    }
    
    const authorization = req.get('authorization');
    const currentToken = authorization.split('Bearer ')[1];
    const currentUser = users.find(t => t.token == currentToken);
    
    if(currentUser == undefined) {
        return res.status(401).json("Token has expired");
    }
    
    if(find.userId != currentUser.userId) {
        return res.status(401).json("You cannot change someone elses user data");
    }
    
    const user = JSON.parse(JSON.stringify(users.find(t => t.userId == req.params.userId)));
    delete user.userId;
    delete user.token;
    
    const userInfo = JSON.parse(JSON.stringify(find));
    delete userInfo.userId;
    
    res.status(200).json({user, userInfo});
});

// Update User
app.put('/users/:userId', passport.authenticate('jwt', { session: false }), (req, res) => {
    const userInfo = userInfos.find(t => t.userId == req.params.userId);
    if(userInfo == undefined) {
        return res.status(404).json("User not found");
    }
    
    const authorization = req.get('authorization');
    const currentToken = authorization.split('Bearer ')[1];
    const currentUser = users.find(t => t.token == currentToken);
    
    if(currentUser == undefined) {
        return res.status(401).json("Token has expired");
    }
    
    if(userInfo.userId != currentUser.userId) {
        return res.status(401).json("You cannot change someone elses user data");
    }
    
    const user = users.find(t => t.userId == req.params.userId);
    
    // checks for bad requests
    // if not, then update the data
    for(let i in req.body) {
        if(i == 'username') {
            if(typeof req.body.username != "string" || req.body.username.length == 0) {
                return res.status(400).json(["Bad request from body", i]);
            } else {
                user.username = req.body.username;
            }
        } else if(i == 'password') {
            if(typeof req.body.password != "string" || req.body.password.length == 0) {
                return res.status(400).json(["Bad request from body", i]);
            } else {
                user.password = req.body.password;
            }
        } else if(userInfo[i] == undefined || typeof userInfo[i] != typeof req.body[i]) {
            return res.status(400).json(["Bad request from body", i]);
        } else if(i == 'location') {
            for(let j in req.body.location) {
                if(userInfo.location[j] == undefined || 
                    typeof userInfo.location[j] != typeof req.body.location[j] || 
                    req.body.location[j].length == 0
                ) {
                    return res.status(400).json(["Bad request from body", j]);
                } else {
                    userInfo.location[j] = req.body.location[j];
                }
            }
        } else if(i == 'contactInfo') {
            for(let j in req.body.contactInfo) {
                if(userInfo.contactInfo[j] == undefined || 
                    typeof userInfo.contactInfo[j] != typeof req.body.contactInfo[j]
                ) {
                    return res.status(400).json(["Bad request from body", j]);
                } else {
                    userInfo.contactInfo[j] = req.body.contactInfo[j];
                }
            }
        }
    }
    res.sendStatus(200);
    
    //console.log(users[0], userInfos[0])
});

// Delete user
app.delete('/users/:userId', passport.authenticate('jwt', { session: false }), (req, res) => {
    const userInfo = userInfos.find(t => t.userId == req.params.userId);
    if(userInfo == undefined) {
        return res.status(404).json("User not found");
    }
    
    const authorization = req.get('authorization');
    const currentToken = authorization.split('Bearer ')[1];
    const currentUser = users.find(t => t.token == currentToken);
    
    if(currentUser == undefined) {
        return res.status(401).json("Token has expired");
    }
    
    if(userInfo.userId != currentUser.userId) {
        return res.status(401).json("You cannot delete someone elses account");
    }
    
    const findUserIndex = users.findIndex(t => t.userId == req.params.userId);
    const findUserInfoIndex = userInfos.findIndex(t => t.userId == req.params.userId);
    users.splice(findUserIndex, 1);
    userInfos.splice(findUserInfoIndex, 1);
    
    res.sendStatus(200);
});

// Get all the items that belong to a specific user
app.get('/users/:userId/items', (req, res) => {
    const usersItems = items.filter(t => t.userId == req.params.userId);
    
    if(usersItems.length == 0){
        res.status(404).json("User has not posted any items");
    } else {
        const showItems = JSON.parse(JSON.stringify(usersItems));
        for(let i in showItems) {
            delete showItems[i].userId;
            delete showItems[i].itemId;
        }
        
        res.status(200).json(showItems);
    }
});

let apiInstance = null;

exports.start = () => {
    apiInstance = app.listen(port, () => {
        console.log(`OnlineShop API listening at http://localhost:${port}`);
    });
}

exports.stop = () => {
    apiInstance.close();
}