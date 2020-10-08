const chai = require('chai');
const chaiHttp = require('chai-http');
chai.use(chaiHttp);
const server = require('../server.js')

const expect = chai.expect;
const apiAddress = 'http://localhost:3000';

const fs = require('fs');

let token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyIjp7InVzZXJJZCI6ImM2NTQ0NTUxLTJlNjMtNDRmNS1hZjFkLTc1NGVmNGMxZGM2NyJ9LCJpYXQiOjE2MDE2NjY0ODIsImV4cCI6MzMxNTkyNjY0ODJ9.1tByMPBiyOHQgyCKaXouBXAFMTOFj6Tjcbndb2TkVuo";
let token2 = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyIjp7InVzZXJJZCI6ImM2NTQ0NTUxLTJlNjMtNDRmNS1hZjFkLTc1NGVmNGMxZGM2NyJ9LCJpYXQiOjE2MDE2NjQwOTUsImV4cCI6NDc1NzQyNDA5NX0.lCCc6EqwjNboCmcpvRA3WELAJiSrmotJ5BSb5xUbo4c";

describe('OnlineShop API test', function () {
    before(function() {
        server.start();
    });
    
    after(function() {
        server.stop();
    })
    
    describe('GET /items', function () {
        it('Should return all the items', async function () {
            await chai.request(apiAddress)
            .get('/items')
            .then(response => {
                expect(response.status).to.equal(200);
                
                expect(response.body).to.be.a('array');
                
                for(i in response.body) {
                    expect(response.body[i]).to.be.a('object');
                
                    expect(response.body[i]).to.have.a.property('title');
                    expect(response.body[i]).to.have.a.property('description');
                    expect(response.body[i]).to.have.a.property('category');
                    expect(response.body[i]).to.have.a.property('askingPrice');
                    expect(response.body[i]).to.have.a.property('postingDate');
                    expect(response.body[i]).to.have.a.property('deliveryType');
                    
                    expect(response.body[i].title).to.be.a('string');
                    expect(response.body[i].description).to.be.a('string');
                    expect(response.body[i].category).to.be.a('object');
                    expect(response.body[i].askingPrice).to.be.a('string');
                    expect(response.body[i].postingDate).to.be.a('string');
                    expect(response.body[i].deliveryType).to.be.a('object');
                    
                    expect(response.body[i].category).to.have.a.property('phones');
                    expect(response.body[i].category).to.have.a.property('computers');
                    expect(response.body[i].category).to.have.a.property('components');
                    
                    expect(response.body[i].category.phones).to.be.a('boolean');
                    expect(response.body[i].category.computers).to.be.a('boolean');
                    expect(response.body[i].category.components).to.be.a('boolean');
                    
                    expect(response.body[i].deliveryType).to.have.a.property('shipping');
                    expect(response.body[i].deliveryType).to.have.a.property('pickup');
                    
                    expect(response.body[i].deliveryType.shipping).to.be.a('boolean');
                    expect(response.body[i].deliveryType.pickup).to.be.a('boolean');
                }
            })
            .catch(error => {
                expect.fail(error)
            })
        })
    });
    
    describe('POST /items', function () {
        it('Should fail to post a new item bacause user doesnt have a token', async function () {
            await chai.request(apiAddress)
            .post('/items')
            .send({
                title: 'test item',
                description: 'testing',
                category: {
                    phones: false,
                    computers: true,
                    components: false
                },
                //images:
                askingPrice: 100,
                postingDate: '2006-01-01',
                deliveryType: {
                    shipping: true,
                    pickup: true
                }
            })
            .then(response => {
                expect(response.status).to.equal(401);
            })
            .catch(error => {
                expect.fail(error)
            })
        })
        
        it('Should fail to post a new item because token has expired', async function () {
            await chai.request(apiAddress)
            .post('/login')
            .auth('testUser', 'password123')
            .then(response => {
                expect(response.status).to.equal(200);
                return chai.request(apiAddress)
                .post('/items')
                .set({ Authorization: `Bearer ${token2}` })
                .send({
                    title: 'test item',
                    description: 'testing',
                    category: {
                        phones: false,
                        computers: true,
                        components: false
                    },
                    //images:
                    askingPrice: 100,
                    postingDate: '2006-01-01',
                    deliveryType: {
                        shipping: true,
                        pickup: true
                    }
                })
            })
            .then(response => {
                expect(response.status).to.equal(401);
            })
            .catch(error => {
                expect.fail(error)
            })
        })
        
        it('Should fail to post a new item because of missing information', async function () {
            await chai.request(apiAddress)
            .post('/items')
            .set({ Authorization: `Bearer ${token}` })
            .send({
                title: 'test item',
                description: 'testing',
                category: {
                    phones: false,
                    computers: true,
                    components: false
                }
            })
            .then(response => {
                expect(response.status).to.equal(400);
            })
            .catch(error => {
                expect.fail(error)
            })
        })
        
        it('Should fail to post a new item because of wrong format', async function () {
            await chai.request(apiAddress)
            .post('/items')
            .set({ Authorization: `Bearer ${token}` })
            .send({
                title: 1234,
                description: 'testing',
                category: {
                    phones: false,
                    computers: true,
                    components: false
                },
                //images:
                askingPrice: "100e",
                postingDate: '2006-01-01',
                deliveryType: {
                    shipping: true,
                    pickup: true
                }
            })
            .then(response => {
                expect(response.status).to.equal(400);
            })
            .catch(error => {
                expect.fail(error)
            })
        })
        
        it('Should fail to post a new item because category must be selected', async function () {
            await chai.request(apiAddress)
            .post('/items')
            .set({ Authorization: `Bearer ${token}` })
            .send({
                title: 'test item',
                description: 'testing',
                category: {
                    phones: false,
                    computers: false,
                    components: false
                },
                //images:
                askingPrice: "100e",
                postingDate: '2006-01-01',
                deliveryType: {
                    shipping: true,
                    pickup: true
                }
            })
            .then(response => {
                expect(response.status).to.equal(400);
            })
            .catch(error => {
                expect.fail(error)
            })
        })
        
        it('Should fail to post a new item because user can select only one category', async function () {
            await chai.request(apiAddress)
            .post('/items')
            .set({ Authorization: `Bearer ${token}` })
            .send({
                title: 'test item',
                description: 'testing',
                category: {
                    phones: true,
                    computers: true,
                    components: false
                },
                //images:
                askingPrice: "100e",
                postingDate: '2006-01-01',
                deliveryType: {
                    shipping: true,
                    pickup: true
                }
            })
            .then(response => {
                expect(response.status).to.equal(400);
            })
            .catch(error => {
                expect.fail(error)
            })
        })
        
        it('Should fail to post a new item because deliveryType must be selected', async function () {
            await chai.request(apiAddress)
            .post('/items')
            .set({ Authorization: `Bearer ${token}` })
            .send({
                title: 'test item',
                description: 'testing',
                category: {
                    phones: true,
                    computers: false,
                    components: false
                },
                //images:
                askingPrice: "100e",
                postingDate: '2006-01-01',
                deliveryType: {
                    shipping: false,
                    pickup: false
                }
            })
            .then(response => {
                expect(response.status).to.equal(400);
            })
            .catch(error => {
                expect.fail(error)
            })
        })
        
        it('Should fail to post a new item because extra info is added', async function () {
            await chai.request(apiAddress)
            .post('/items')
            .set({ Authorization: `Bearer ${token}` })
            .send({
                title: 'test item',
                description: 'testing',
                category: {
                    phones: true,
                    computers: false,
                    components: false
                },
                //images:
                askingPrice: "100e",
                postingDate: '2006-01-01',
                deliveryType: {
                    shipping: false,
                    pickup: false
                },
                extra: "info"
            })
            .then(response => {
                expect(response.status).to.equal(400);
            })
            .catch(error => {
                expect.fail(error)
            })
        })
        
        it('Should fail to post a new item because data cannot be left empty', async function () {
            await chai.request(apiAddress)
            .post('/items')
            .set({ Authorization: `Bearer ${token}` })
            .send({
                title: '',
                description: 'testing',
                category: {
                    phones: true,
                    computers: false,
                    components: false
                },
                //images:
                askingPrice: "100e",
                postingDate: '2006-01-01',
                deliveryType: {
                    shipping: false,
                    pickup: false
                }
            })
            .then(response => {
                expect(response.status).to.equal(400);
            })
            .catch(error => {
                expect.fail(error)
            })
        })
        
        it('Should post a new item', async function () {
            await chai.request(apiAddress)
            .post('/items')
            .set({ Authorization: `Bearer ${token}` })
            .send({
                title: 'test item',
                description: 'testing',
                category: {
                    phones: false,
                    computers: true,
                    components: false
                },
                //images:
                askingPrice: 100,
                postingDate: '2006-01-01',
                deliveryType: {
                    shipping: true,
                    pickup: true
                }
            })
            .then(response => {
                expect(response.status).to.equal(201);
            })
            .catch(error => {
                expect.fail(error)
            })
        })
    });
    
    describe('GET /items/{itemId}', function () {
        it('Should fail to get the item because itemId was not found', async function () {
            await chai.request(apiAddress)
            .get('/items/unknown-id')
            .then(response => {
                expect(response.status).to.equal(404);
            })
            .catch(error => {
                expect.fail(error)
            })
        })
        
        it('Should return full information of a specific item', async function () {
            await chai.request(apiAddress)
            .get('/items/f3f0f6b2-4970-4142-8bb0-6a00031125bd')
            .then(response => {
                expect(response.status).to.equal(200);
                
                expect(response.body).to.be.a('object');
                
                expect(response.body).to.have.a.property('item');
                expect(response.body).to.have.a.property('userInfo');
                
                expect(response.body.item).to.be.a('object');
                expect(response.body.userInfo).to.be.a('object');
                
                expect(response.body.item).to.have.a.property('title');
                expect(response.body.item).to.have.a.property('description');
                expect(response.body.item).to.have.a.property('category');
                expect(response.body.item).to.have.a.property('askingPrice');
                expect(response.body.item).to.have.a.property('postingDate');
                expect(response.body.item).to.have.a.property('deliveryType');
                
                expect(response.body.item.title).to.be.a('string');
                expect(response.body.item.description).to.be.a('string');
                expect(response.body.item.category).to.be.a('object');
                expect(response.body.item.askingPrice).to.be.a('string');
                expect(response.body.item.postingDate).to.be.a('string');
                expect(response.body.item.deliveryType).to.be.a('object');
                
                expect(response.body.item.category).to.have.a.property('phones');
                expect(response.body.item.category).to.have.a.property('computers');
                expect(response.body.item.category).to.have.a.property('components');
                
                expect(response.body.item.category.phones).to.be.a('boolean');
                expect(response.body.item.category.computers).to.be.a('boolean');
                expect(response.body.item.category.components).to.be.a('boolean');
                
                expect(response.body.item.deliveryType).to.have.a.property('shipping');
                expect(response.body.item.deliveryType).to.have.a.property('pickup');
                
                expect(response.body.item.deliveryType.shipping).to.be.a('boolean');
                expect(response.body.item.deliveryType.pickup).to.be.a('boolean');
                
                expect(response.body.userInfo).to.have.a.property('location');
                expect(response.body.userInfo).to.have.a.property('contactInfo');
                
                expect(response.body.userInfo.location).to.be.a('object');
                expect(response.body.userInfo.contactInfo).to.be.a('object');
                
                expect(response.body.userInfo.location).to.have.a.property('country');
                expect(response.body.userInfo.location).to.have.a.property('city');
                expect(response.body.userInfo.location).to.have.a.property('postalCode');
                expect(response.body.userInfo.location).to.have.a.property('address');
                
                expect(response.body.userInfo.location.country).to.be.a('string');
                expect(response.body.userInfo.location.city).to.be.a('string');
                expect(response.body.userInfo.location.postalCode).to.be.a('number');
                expect(response.body.userInfo.location.address).to.be.a('string');
                
                expect(response.body.userInfo.contactInfo).to.have.a.property('email');
                expect(response.body.userInfo.contactInfo).to.have.a.property('phoneNumber');
                
                expect(response.body.userInfo.contactInfo.email).to.be.a('string');
                expect(response.body.userInfo.contactInfo.phoneNumber).to.be.a('string');
            })
            .catch(error => {
                expect.fail(error)
            })
        })
    });
    
    describe('PUT /items/{itemId}', function () {
        it('Should fail to get the item because itemId was not found', async function () {
            await chai.request(apiAddress)
            .put('/items/unknown-id')
            .set({ Authorization: `Bearer ${token}` })
            .send({
                title: 'change item',
                description: 'changed',
                category: {
                    phones: false,
                    computers: true,
                    components: false
                },
                //images:
                askingPrice: 500,
                postingDate: '2020-15-6',
                deliveryType: {
                    shipping: true,
                    pickup: false
                }
            })
            .then(response => {
                expect(response.status).to.equal(404);
            })
            .catch(error => {
                expect.fail(error)
            })
        })
        
        it('Should fail to get the item because token was not given', async function () {
            await chai.request(apiAddress)
            .put('/items/f3f0f6b2-4970-4142-8bb0-6a00031125bd')
            .send({
                title: 'change item',
                description: 'changed',
                category: {
                    phones: false,
                    computers: true,
                    components: false
                },
                //images:
                askingPrice: 500,
                postingDate: '2020-15-6',
                deliveryType: {
                    shipping: true,
                    pickup: false
                }
            })
            .then(response => {
                expect(response.status).to.equal(401);
            })
            .catch(error => {
                expect.fail(error)
            })
        })
        
        it('Should fail to change the items info because the item doesnt belong to this user', async function () {
            await chai.request(apiAddress)
            .put('/items/f3f0f6b2-4970-4142-8bb0-6a00031125bd')
            .set({ Authorization: `Bearer ${token2}` })
            .send({
                title: 'change item',
                description: 'changed',
                category: {
                    phones: false,
                    computers: true,
                    components: false
                },
                //images:
                askingPrice: 500,
                postingDate: '2020-15-6',
                deliveryType: {
                    shipping: true,
                    pickup: false
                }
            })
            .then(response => {
                expect(response.status).to.equal(401);
            })
            .catch(error => {
                expect.fail(error)
            })
        })
        
        it('Should fail to change item information because token has expired', async function () {
            await chai.request(apiAddress)
            .post('/login')
            .auth('testUser', 'password123')
            .then(response => {
                expect(response.status).to.equal(200);
                return chai.request(apiAddress)
                .put('/items/d5a2c4ad-a879-46fc-8dfa-2d4726d1b2fe')
                .set({ Authorization: `Bearer ${token2}` })
                .send({
                    title: 'change item',
                    description: 'changed',
                    category: {
                        phones: false,
                        computers: true,
                        components: false
                    },
                    //images:
                    askingPrice: 500,
                    postingDate: '2020-15-6',
                    deliveryType: {
                        shipping: true,
                        pickup: false
                    }
                })
            })
            .then(response => {
                expect(response.status).to.equal(401);
            })
            .catch(error => {
                expect.fail(error)
            })
        })
        
        it('Should fail to change information because data type is wrong', async function () {
            await chai.request(apiAddress)
            .put('/items/f3f0f6b2-4970-4142-8bb0-6a00031125bd')
            .set({ Authorization: `Bearer ${token}` })
            .send({
                title: 'change item',
                description: 'changed',
                category: {
                    phones: "new",
                    computers: true,
                    components: false
                },
                //images:
                askingPrice: 500,
                postingDate: '2020-15-6',
                deliveryType: {
                    shipping: true,
                    pickup: false
                }
            })
            .then(response => {
                expect(response.status).to.equal(400);
            })
            .catch(error => {
                expect.fail(error)
            })
        })
        
        it('Should fail to change information because of extra data', async function () {
            await chai.request(apiAddress)
            .put('/items/f3f0f6b2-4970-4142-8bb0-6a00031125bd')
            .set({ Authorization: `Bearer ${token}` })
            .send({
                title: 'change item',
                description: 'changed',
                category: {
                    phones: false,
                    computers: true,
                    components: false
                },
                //images:
                askingPrice: 500,
                postingDate: '2020-15-6',
                deliveryType: {
                    shipping: true,
                    pickup: false
                },
                material: "metal"  
            })
            .then(response => {
                expect(response.status).to.equal(400);
            })
            .catch(error => {
                expect.fail(error)
            })
        })
        
        it('Should fail to change information because data was left empty', async function () {
            await chai.request(apiAddress)
            .put('/items/f3f0f6b2-4970-4142-8bb0-6a00031125bd')
            .set({ Authorization: `Bearer ${token}` })
            .send({
                title: '',
                description: 'changed',
                category: {
                    phones: false,
                    computers: true,
                    components: false
                },
                //images:
                askingPrice: 500,
                postingDate: '2020-15-6',
                deliveryType: {
                    shipping: true,
                    pickup: false
                } 
            })
            .then(response => {
                expect(response.status).to.equal(400);
            })
            .catch(error => {
                expect.fail(error)
            })
        })
        
        it('Should fail to change information because category must be selected', async function () {
            await chai.request(apiAddress)
            .put('/items/f3f0f6b2-4970-4142-8bb0-6a00031125bd')
            .set({ Authorization: `Bearer ${token}` })
            .send({
                title: 'change item',
                description: 'changed',
                category: {
                    phones: false,
                    computers: false,
                    components: false
                },
                //images:
                askingPrice: 500,
                postingDate: '2020-15-6',
                deliveryType: {
                    shipping: true,
                    pickup: false
                }
            })
            .then(response => {
                expect(response.status).to.equal(400);
            })
            .catch(error => {
                expect.fail(error)
            })
        })
        
        it('Should fail to change information because only one category can be selected', async function () {
            await chai.request(apiAddress)
            .put('/items/f3f0f6b2-4970-4142-8bb0-6a00031125bd')
            .set({ Authorization: `Bearer ${token}` })
            .send({
                title: 'change item',
                description: 'changed',
                category: {
                    phones: true,
                    computers: true,
                    components: false
                },
                //images:
                askingPrice: 500,
                postingDate: '2020-15-6',
                deliveryType: {
                    shipping: true,
                    pickup: false
                }
            })
            .then(response => {
                expect(response.status).to.equal(400);
            })
            .catch(error => {
                expect.fail(error)
            })
        })
        
        it('Should fail to change information because deliveryType must be selected', async function () {
            await chai.request(apiAddress)
            .put('/items/f3f0f6b2-4970-4142-8bb0-6a00031125bd')
            .set({ Authorization: `Bearer ${token}` })
            .send({
                title: 'change item',
                description: 'changed',
                category: {
                    phones: false,
                    computers: true,
                    components: false
                },
                //images:
                askingPrice: 500,
                postingDate: '2020-15-6',
                deliveryType: {
                    shipping: false,
                    pickup: false
                }
            })
            .then(response => {
                expect(response.status).to.equal(400);
            })
            .catch(error => {
                expect.fail(error)
            })
        })
        
        it('Should change items information', async function () {
            await chai.request(apiAddress)
            .put('/items/f3f0f6b2-4970-4142-8bb0-6a00031125bd')
            .set({ Authorization: `Bearer ${token}` })
            .send({
                askingPrice: 500
            })
            .then(response => {
                expect(response.status).to.equal(200);
            })
            .catch(error => {
                expect.fail(error)
            })
        })
        
        it('Should change all the items information', async function () {
            await chai.request(apiAddress)
            .put('/items/f3f0f6b2-4970-4142-8bb0-6a00031125bd')
            .set({ Authorization: `Bearer ${token}` })
            .send({
                title: 'change item',
                description: 'changed',
                category: {
                    phones: false,
                    computers: true,
                    components: false
                },
                //images:
                askingPrice: 500,
                postingDate: '2020-15-6',
                deliveryType: {
                    shipping: true,
                    pickup: false
                }
            })
            .then(response => {
                expect(response.status).to.equal(200);
            })
            .catch(error => {
                expect.fail(error)
            })
        })
    });
    
    describe('PUT /items/{itemId}/images', function () {
        it('Should fail to change items images because user can add only 4 images', async function () {
            await chai.request(apiAddress)
            .put('/items/f3f0f6b2-4970-4142-8bb0-6a00031125bd/images')
            .set({ Authorization: `Bearer ${token}` })
            .attach('images',
                fs.readFileSync('./testImages/Android.jpg'),
                'Android.jpg')
            .attach('images',
                fs.readFileSync('./testImages/Black Alistar.png'),
                'Black Alistar.png')
            .attach('images',
                fs.readFileSync('./testImages/Black Android.jpg'),
                'Black Android.jpg')
            .attach('images',
                fs.readFileSync('./testImages/Pantheon.jpg'),
                'Pantheon.jpg')
            .attach('images',
                fs.readFileSync('./testImages/Wukong.jpg'),
                'Wukong.jpg')
            .then(response => {
                expect(response.status).to.equal(500);
            })
            .catch(error => {
                expect.fail(error)
            })
        })
        
        it('Should change items image', async function () {
            await chai.request(apiAddress)
            .put('/items/f3f0f6b2-4970-4142-8bb0-6a00031125bd/images')
            .set({ Authorization: `Bearer ${token}` })
            .attach('images',
                fs.readFileSync('./testImages/Android.jpg'),
                'Android.jpg')
            .then(response => {
                expect(response.status).to.equal(200);
            })
            .catch(error => {
                expect.fail(error)
            })
        })
    });
    
    describe('DELETE /items/{itemId}', function () {
        it('Should fail to get the item because itemId was not found', async function () {
            await chai.request(apiAddress)
            .delete('/items/unknown-id')
            .set({ Authorization: `Bearer ${token}` })
            .then(response => {
                expect(response.status).to.equal(404);
            })
            .catch(error => {
                expect.fail(error)
            })
        })
        
        it('Should fail to get the item because token was not given', async function () {
            await chai.request(apiAddress)
            .delete('/items/f3f0f6b2-4970-4142-8bb0-6a00031125bd')
            .then(response => {
                expect(response.status).to.equal(401);
            })
            .catch(error => {
                expect.fail(error)
            })
        })
        
        it('Should fail to delete the items info because the item doesnt belong to this user', async function () {
            await chai.request(apiAddress)
            .put('/items/f3f0f6b2-4970-4142-8bb0-6a00031125bd')
            .set({ Authorization: `Bearer ${token2}` })
            .then(response => {
                expect(response.status).to.equal(401);
            })
            .catch(error => {
                expect.fail(error)
            })
        })
        
        it('Should fail to delete the item because token has expired', async function () {
            await chai.request(apiAddress)
            .post('/login')
            .auth('testUser', 'password123')
            .then(response => {
                expect(response.status).to.equal(200);
                return chai.request(apiAddress)
                .put('/items/d5a2c4ad-a879-46fc-8dfa-2d4726d1b2fe')
                .set({ Authorization: `Bearer ${token2}` })
            })
            .then(response => {
                expect(response.status).to.equal(401);
            })
            .catch(error => {
                expect.fail(error)
            })
        })
        
        it('Should delete this item', async function () {
            await chai.request(apiAddress)
            .put('/items/f3f0f6b2-4970-4142-8bb0-6a00031125bd')
            .set({ Authorization: `Bearer ${token}` })
            .then(response => {
                expect(response.status).to.equal(200);
            })
            .catch(error => {
                expect.fail(error)
            })
        })
    });
    
    describe('POST /login', function () {
        it('Should fail to login because of a wrong username', async function () {
            await chai.request(apiAddress)
            .post('/login')
            .auth('wrong', 'password123')
            .then(response => {
                expect(response.status).to.equal(401);
            })
            .catch(error => {
                expect.fail(error)
            })
        })
        
        it('Should fail to login because of wrong a password', async function () {
            await chai.request(apiAddress)
            .post('/login')
            .auth('testUser', 'wrong')
            .then(response => {
                expect(response.status).to.equal(401);
            })
            .catch(error => {
                expect.fail(error)
            })
        })
        
        it('Should have a succesful login', async function () {
            await chai.request(apiAddress)
            .post('/login')
            .auth('testUser', 'password123')
            .then(response => {
                expect(response.status).to.equal(200);
            })
            .catch(error => {
                expect.fail(error)
            })
        })
    });
    
    describe('GET /search', function () {
        it('Should return all items because filter was not set', async function () {
            await chai.request(apiAddress)
            .get('/search')
            .then(response => {
                expect(response.status).to.equal(200);
                
                expect(response.body).to.be.a('array');
                
                for(i in response.body) {
                    expect(response.body[i]).to.be.a('object');
                
                    expect(response.body[i]).to.have.a.property('title');
                    expect(response.body[i]).to.have.a.property('description');
                    expect(response.body[i]).to.have.a.property('category');
                    expect(response.body[i]).to.have.a.property('askingPrice');
                    expect(response.body[i]).to.have.a.property('postingDate');
                    expect(response.body[i]).to.have.a.property('deliveryType');
                    
                    expect(response.body[i].title).to.be.a('string');
                    expect(response.body[i].description).to.be.a('string');
                    expect(response.body[i].category).to.be.a('object');
                    expect(response.body[i].askingPrice).to.be.a('string');
                    expect(response.body[i].postingDate).to.be.a('string');
                    expect(response.body[i].deliveryType).to.be.a('object');
                    
                    expect(response.body[i].category).to.have.a.property('phones');
                    expect(response.body[i].category).to.have.a.property('computers');
                    expect(response.body[i].category).to.have.a.property('components');
                    
                    expect(response.body[i].category.phones).to.be.a('boolean');
                    expect(response.body[i].category.computers).to.be.a('boolean');
                    expect(response.body[i].category.components).to.be.a('boolean');
                    
                    expect(response.body[i].deliveryType).to.have.a.property('shipping');
                    expect(response.body[i].deliveryType).to.have.a.property('pickup');
                    
                    expect(response.body[i].deliveryType.shipping).to.be.a('boolean');
                    expect(response.body[i].deliveryType.pickup).to.be.a('boolean');
                }
            })
            .catch(error => {
                expect.fail(error)
            })
        })
        
        it('Should fail to search because query params are not category, location or postingDate', async function () {
            await chai.request(apiAddress)
            .get('/search')
            .query({ price: '20e', location: 'Finland', postingDate: '2010-06-15' })
            .then(response => {
                expect(response.status).to.equal(400);
            })
            .catch(error => {
                expect.fail(error)
            })
        })
        
        it('Should fail to search because no category must be either phones, computers or components', async function () {
            await chai.request(apiAddress)
            .get('/search')
            .query({ category: 'lollipops' })
            .then(response => {
                expect(response.status).to.equal(400);
            })
            .catch(error => {
                expect.fail(error)
            })
        })
        
        it('Should fail to search because there are no newer posts than filtered date', async function () {
            await chai.request(apiAddress)
            .get('/search')
            .query({ postingDate: '2520-12-30' })
            .then(response => {
                expect(response.status).to.equal(404);
            })
            .catch(error => {
                expect.fail(error)
            })
        })
        
        it('Should fail to search because no items were found with given filter', async function () {
            await chai.request(apiAddress)
            .get('/search')
            .query({ location: 'madeUpLand' })
            .then(response => {
                expect(response.status).to.equal(404);
            })
            .catch(error => {
                expect.fail(error)
            })
        })
        
        it('Should return all items based on filter', async function () {
            await chai.request(apiAddress)
            .get('/search')
            .query({ category: 'phones' })
            .then(response => {
                expect(response.status).to.equal(200);
                
                expect(response.body).to.be.a('array');
                
                for(i in response.body) {
                    expect(response.body[i]).to.be.a('object');
                
                    expect(response.body[i]).to.have.a.property('title');
                    expect(response.body[i]).to.have.a.property('description');
                    expect(response.body[i]).to.have.a.property('category');
                    expect(response.body[i]).to.have.a.property('askingPrice');
                    expect(response.body[i]).to.have.a.property('postingDate');
                    expect(response.body[i]).to.have.a.property('deliveryType');
                    
                    expect(response.body[i].title).to.be.a('string');
                    expect(response.body[i].description).to.be.a('string');
                    expect(response.body[i].category).to.be.a('object');
                    expect(response.body[i].askingPrice).to.be.a('string');
                    expect(response.body[i].postingDate).to.be.a('string');
                    expect(response.body[i].deliveryType).to.be.a('object');
                    
                    expect(response.body[i].category).to.have.a.property('phones');
                    expect(response.body[i].category).to.have.a.property('computers');
                    expect(response.body[i].category).to.have.a.property('components');
                    
                    expect(response.body[i].category.phones).to.be.a('boolean');
                    expect(response.body[i].category.computers).to.be.a('boolean');
                    expect(response.body[i].category.components).to.be.a('boolean');
                    
                    expect(response.body[i].deliveryType).to.have.a.property('shipping');
                    expect(response.body[i].deliveryType).to.have.a.property('pickup');
                    
                    expect(response.body[i].deliveryType.shipping).to.be.a('boolean');
                    expect(response.body[i].deliveryType.pickup).to.be.a('boolean');
                }
            })
            .catch(error => {
                expect.fail(error)
            })
        })
        
        it('Should return all items based on filters', async function () {
            await chai.request(apiAddress)
            .get('/search')
            .query({ category: 'phones', location: 'Finland', postingDate: '2010-06-15' })
            .then(response => {
                expect(response.status).to.equal(200);
                
                expect(response.body).to.be.a('array');
                
                for(i in response.body) {
                    expect(response.body[i]).to.be.a('object');
                
                    expect(response.body[i]).to.have.a.property('title');
                    expect(response.body[i]).to.have.a.property('description');
                    expect(response.body[i]).to.have.a.property('category');
                    expect(response.body[i]).to.have.a.property('askingPrice');
                    expect(response.body[i]).to.have.a.property('postingDate');
                    expect(response.body[i]).to.have.a.property('deliveryType');
                    
                    expect(response.body[i].title).to.be.a('string');
                    expect(response.body[i].description).to.be.a('string');
                    expect(response.body[i].category).to.be.a('object');
                    expect(response.body[i].askingPrice).to.be.a('string');
                    expect(response.body[i].postingDate).to.be.a('string');
                    expect(response.body[i].deliveryType).to.be.a('object');
                    
                    expect(response.body[i].category).to.have.a.property('phones');
                    expect(response.body[i].category).to.have.a.property('computers');
                    expect(response.body[i].category).to.have.a.property('components');
                    
                    expect(response.body[i].category.phones).to.be.a('boolean');
                    expect(response.body[i].category.computers).to.be.a('boolean');
                    expect(response.body[i].category.components).to.be.a('boolean');
                    
                    expect(response.body[i].deliveryType).to.have.a.property('shipping');
                    expect(response.body[i].deliveryType).to.have.a.property('pickup');
                    
                    expect(response.body[i].deliveryType.shipping).to.be.a('boolean');
                    expect(response.body[i].deliveryType.pickup).to.be.a('boolean');
                }
            })
            .catch(error => {
                expect.fail(error)
            })
        })
    });
    
    describe('POST /users', function () {
        it('Should fail to create new user because of missing information', async function () {
            await chai.request(apiAddress)
            .post('/users')
            .send({
                username: 'test',
                location: {
                    country: 'Finland',
                    city: 'Oulu'
                }
            })
            .then(response => {
                expect(response.status).to.equal(400);
            })
            .catch(error => {
                expect.fail(error)
            })
        })
        
        it('Should fail to create new user because of an extra information', async function () {
            await chai.request(apiAddress)
            .post('/users')
            .send({
                username: 'test',
                password:'test123',
                
                location: {
                    country: 'Finland',
                    city: 'Oulu',
                    postalCode: 15015,
                    address: 'Taaplaajankatu 6'
                },
                contactInfo: {
                    email: 'test@gmail.com',
                    phoneNumber: '0401234567'
                },
                
                status: 'student'
            })
            .then(response => {
                expect(response.status).to.equal(400);
            })
            .catch(error => {
                expect.fail(error)
            })
        })
        
        it('Should fail to create new user because data is in wrong format', async function () {
            await chai.request(apiAddress)
            .post('/users')
            .send({
                username: 'testUser',
                password: 135416581123,
                
                location: {
                    country: 'Finland',
                    city: 'Oulu',
                    postalCode: 15015,
                    address: 'Taaplaajankatu 6'
                },
                contactInfo: {
                    email: 'test@gmail.com',
                    phoneNumber: '0401234567'
                }
            })
            .then(response => {
                expect(response.status).to.equal(400);
            })
            .catch(error => {
                expect.fail(error)
            })
        })
        
        it('Should fail to create new user because data is left empty', async function () {
            await chai.request(apiAddress)
            .post('/users')
            .send({
                username: '',
                password: "password123",
                
                location: {
                    country: 'Finland',
                    city: 'Oulu',
                    postalCode: 15015,
                    address: 'Taaplaajankatu 6'
                },
                contactInfo: {
                    email: 'test@gmail.com',
                    phoneNumber: '0401234567'
                }
            })
            .then(response => {
                expect(response.status).to.equal(400);
            })
            .catch(error => {
                expect.fail(error)
            })
        })
        
        it('Should create new user', async function () {
            await chai.request(apiAddress)
            .post('/users')
            .send({
                username: 'test',
                password:'test123',
                
                location: {
                    country: 'Finland',
                    city: 'Oulu',
                    postalCode: 15015,
                    address: 'Taaplaajankatu 6'
                },
                contactInfo: {
                    email: 'test@gmail.com',
                    phoneNumber: '0401234567'
                }
            })
            .then(response => {
                expect(response.status).to.equal(201);
            })
            .catch(error => {
                expect.fail(error)
            })
        })
        
        it('Should fail to create new user because username is taken', async function () {
            await chai.request(apiAddress)
            .post('/users')
            .send({
                username: 'test',
                password:'test123',
                
                location: {
                    country: 'Finland',
                    city: 'Oulu',
                    postalCode: 15015,
                    address: 'Taaplaajankatu 6'
                },
                contactInfo: {
                    email: 'test@gmail.com',
                    phoneNumber: '0401234567'
                }
            })
            .then(response => {
                expect(response.status).to.equal(400);
            })
            .catch(error => {
                expect.fail(error)
            })
        })
    });
    
    describe('GET /users/{userId}', function () {
        it('Should fail to get the user because userId was not found', async function () {
            await chai.request(apiAddress)
            .get('/users/unknown-id')
            .set({ Authorization: `Bearer ${token}` })
            .then(response => {
                expect(response.status).to.equal(404);
            })
            .catch(error => {
                expect.fail(error)
            })
        })
        
        it('Should fail to get the user because token was not given', async function () {
            await chai.request(apiAddress)
            .get('/users/acb9ed30-070f-4295-b860-6a61d6f4ec69')
            .then(response => {
                expect(response.status).to.equal(401);
            })
            .catch(error => {
                expect.fail(error)
            })
        })
        
        it('Should fail to get the user because the user data doesnt belong to this user', async function () {
            await chai.request(apiAddress)
            .get('/users/acb9ed30-070f-4295-b860-6a61d6f4ec69')
            .set({ Authorization: `Bearer ${token2}` })
            .then(response => {
                expect(response.status).to.equal(401);
            })
            .catch(error => {
                expect.fail(error)
            })
        })
        
        it('Should fail to get the user because token has expired', async function () {
            await chai.request(apiAddress)
            .post('/login')
            .auth('testUser', 'password123')
            .then(response => {
                expect(response.status).to.equal(200);
                return chai.request(apiAddress)
                .get('/users/c6544551-2e63-44f5-af1d-754ef4c1dc67')
            .set({ Authorization: `Bearer ${token2}` })
            })
            .then(response => {
                expect(response.status).to.equal(401);
            })
            .catch(error => {
                expect.fail(error)
            })
        })
        
        it('Should return full information of a specific user', async function () {
            await chai.request(apiAddress)
            .get('/users/acb9ed30-070f-4295-b860-6a61d6f4ec69')
            .set({ Authorization: `Bearer ${token}` })
            .then(response => {
                expect(response.status).to.equal(200);
                
                expect(response.body).to.be.a('object');
                
                expect(response.body).to.have.a.property('user');
                expect(response.body).to.have.a.property('userInfo');
                
                expect(response.body.user).to.be.a('object');
                expect(response.body.userInfo).to.be.a('object');
                
                expect(response.body.user).to.have.a.property('username');
                expect(response.body.user).to.have.a.property('password');
                
                expect(response.body.user.username).to.be.a('string');
                expect(response.body.user.password).to.be.a('string');
                
                expect(response.body.userInfo).to.have.a.property('location');
                expect(response.body.userInfo).to.have.a.property('contactInfo');
                
                expect(response.body.userInfo.location).to.be.a('object');
                expect(response.body.userInfo.contactInfo).to.be.a('object');
                
                expect(response.body.userInfo.location).to.have.a.property('country');
                expect(response.body.userInfo.location).to.have.a.property('city');
                expect(response.body.userInfo.location).to.have.a.property('postalCode');
                expect(response.body.userInfo.location).to.have.a.property('address');
                
                expect(response.body.userInfo.location.country).to.be.a('string');
                expect(response.body.userInfo.location.city).to.be.a('string');
                expect(response.body.userInfo.location.postalCode).to.be.a('number');
                expect(response.body.userInfo.location.address).to.be.a('string');
                
                expect(response.body.userInfo.contactInfo).to.have.a.property('email');
                expect(response.body.userInfo.contactInfo).to.have.a.property('phoneNumber');
                
                expect(response.body.userInfo.contactInfo.email).to.be.a('string');
                expect(response.body.userInfo.contactInfo.phoneNumber).to.be.a('string');
            })
            .catch(error => {
                expect.fail(error)
            })
        })
    });
    
    describe('PUT /users/{userId}', function () {
        it('Should fail to change the user data because userId was not found', async function () {
            await chai.request(apiAddress)
            .put('/users/unknown-id')
            .set({ Authorization: `Bearer ${token}` })
            .send({
                username: 'test',
                password:'test123',
                
                location: {
                    country: 'Finland',
                    city: 'Oulu',
                    postalCode: 15015,
                    address: 'Taaplaajankatu 6'
                },
                contactInfo: {
                    email: 'test@gmail.com',
                    phoneNumber: '0401234567'
                }
            })
            .then(response => {
                expect(response.status).to.equal(404);
            })
            .catch(error => {
                expect.fail(error)
            })
        })
        
        it('Should fail to change the user data because token was not given', async function () {
            await chai.request(apiAddress)
            .put('/users/acb9ed30-070f-4295-b860-6a61d6f4ec69')
            .send({
                username: 'test',
                password:'test123',
                
                location: {
                    country: 'Finland',
                    city: 'Oulu',
                    postalCode: 15015,
                    address: 'Taaplaajankatu 6'
                },
                contactInfo: {
                    email: 'test@gmail.com',
                    phoneNumber: '0401234567'
                }
            })
            .then(response => {
                expect(response.status).to.equal(401);
            })
            .catch(error => {
                expect.fail(error)
            })
        })
        
        it('Should fail to change the user data because the user data doesnt belong to this user', async function () {
            await chai.request(apiAddress)
            .put('/users/acb9ed30-070f-4295-b860-6a61d6f4ec69')
            .set({ Authorization: `Bearer ${token2}` })
            .send({
                username: 'test',
                password:'test123',
                
                location: {
                    country: 'Finland',
                    city: 'Oulu',
                    postalCode: 15015,
                    address: 'Taaplaajankatu 6'
                },
                contactInfo: {
                    email: 'test@gmail.com',
                    phoneNumber: '0401234567'
                }
            })
            .then(response => {
                expect(response.status).to.equal(401);
            })
            .catch(error => {
                expect.fail(error)
            })
        })
        
        it('Should fail to change the user data because token has expired', async function () {
            await chai.request(apiAddress)
            .post('/login')
            .auth('testUser', 'password123')
            .then(response => {
                expect(response.status).to.equal(200);
                return chai.request(apiAddress)
                .put('/users/c6544551-2e63-44f5-af1d-754ef4c1dc67')
                .set({ Authorization: `Bearer ${token2}` })
                .send({
                    username: 'test',
                    password:'test123',
                    
                    location: {
                        country: 'Finland',
                        city: 'Oulu',
                        postalCode: 15015,
                        address: 'Taaplaajankatu 6'
                    },
                    contactInfo: {
                        email: 'test@gmail.com',
                        phoneNumber: '0401234567'
                    }
                })
            })
            .then(response => {
                expect(response.status).to.equal(401);
            })
            .catch(error => {
                expect.fail(error)
            })
        })
        
        it('Should fail to change the user data because data is in wrong format', async function () {
            await chai.request(apiAddress)
            .put('/users/acb9ed30-070f-4295-b860-6a61d6f4ec69')
            .set({ Authorization: `Bearer ${token}` })
            .send({
                username: 'test',
                password:'test123',
                
                location: {
                    country: 123,
                    city: 'Oulu',
                    postalCode: 15015,
                    address: 'Taaplaajankatu 6'
                },
                contactInfo: {
                    email: 'test@gmail.com',
                    phoneNumber: '0401234567'
                }
            })
            .then(response => {
                expect(response.status).to.equal(400);
            })
            .catch(error => {
                expect.fail(error)
            })
        })
        
        it('Should fail to change the user data because extra data was given', async function () {
            await chai.request(apiAddress)
            .put('/users/acb9ed30-070f-4295-b860-6a61d6f4ec69')
            .set({ Authorization: `Bearer ${token}` })
            .send({
                username: 'test',
                password:'test123',
                
                location: {
                    country: 123,
                    city: 'Oulu',
                    postalCode: 15015,
                    address: 'Taaplaajankatu 6'
                },
                contactInfo: {
                    email: 'test@gmail.com',
                    phoneNumber: '0401234567'
                },
                gender: "male"
            })
            .then(response => {
                expect(response.status).to.equal(400);
            })
            .catch(error => {
                expect.fail(error)
            })
        })
        
        it('Should fail to change the user data because data was left empty', async function () {
            await chai.request(apiAddress)
            .put('/users/acb9ed30-070f-4295-b860-6a61d6f4ec69')
            .set({ Authorization: `Bearer ${token}` })
            .send({
                username: 'test',
                password:'',
                
                location: {
                    country: 123,
                    city: 'Oulu',
                    postalCode: 15015,
                    address: 'Taaplaajankatu 6'
                },
                contactInfo: {
                    email: 'test@gmail.com',
                    phoneNumber: '0401234567'
                }
            })
            .then(response => {
                expect(response.status).to.equal(400);
            })
            .catch(error => {
                expect.fail(error)
            })
        })
        
        it('Should change information of a specific user', async function () {
            await chai.request(apiAddress)
            .put('/users/acb9ed30-070f-4295-b860-6a61d6f4ec69')
            .set({ Authorization: `Bearer ${token}` })
            .send({
                password:'test123'
            })
            .then(response => {
                expect(response.status).to.equal(200);
            })
            .catch(error => {
                expect.fail(error)
            })
        })
        
        it('Should change full information of a specific user', async function () {
            await chai.request(apiAddress)
            .put('/users/acb9ed30-070f-4295-b860-6a61d6f4ec69')
            .set({ Authorization: `Bearer ${token}` })
            .send({
                username: 'test',
                password:'test123',
                
                location: {
                    country: 'Finland',
                    city: 'Oulu',
                    postalCode: 15015,
                    address: 'Taaplaajankatu 6'
                },
                contactInfo: {
                    email: 'test@gmail.com',
                    phoneNumber: '0401234567'
                }
            })
            .then(response => {
                expect(response.status).to.equal(200);
            })
            .catch(error => {
                expect.fail(error)
            })
        })
    });
    
    describe('DELETE /users/{userId}', function () {
        it('Should fail to get the user because userId was not found', async function () {
            await chai.request(apiAddress)
            .delete('/users/unknown-id')
            .set({ Authorization: `Bearer ${token}` })
            .then(response => {
                expect(response.status).to.equal(404);
            })
            .catch(error => {
                expect.fail(error)
            })
        })
        
        it('Should fail to get the user because token was not given', async function () {
            await chai.request(apiAddress)
            .delete('/users/acb9ed30-070f-4295-b860-6a61d6f4ec69')
            .then(response => {
                expect(response.status).to.equal(401);
            })
            .catch(error => {
                expect.fail(error)
            })
        })
        
        it('Should fail to delete the user because the user doesnt belong to this user', async function () {
            await chai.request(apiAddress)
            .put('/users/acb9ed30-070f-4295-b860-6a61d6f4ec69')
            .set({ Authorization: `Bearer ${token2}` })
            .then(response => {
                expect(response.status).to.equal(401);
            })
            .catch(error => {
                expect.fail(error)
            })
        })
        
        it('Should fail to delete the user because token has expired', async function () {
            await chai.request(apiAddress)
            .post('/login')
            .auth('testUser', 'password123')
            .then(response => {
                expect(response.status).to.equal(200);
                return chai.request(apiAddress)
                .put('/users/c6544551-2e63-44f5-af1d-754ef4c1dc67')
                .set({ Authorization: `Bearer ${token2}` })
            })
            .then(response => {
                expect(response.status).to.equal(401);
            })
            .catch(error => {
                expect.fail(error)
            })
        })
        
        it('Should delete this user', async function () {
            await chai.request(apiAddress)
            .put('/users/acb9ed30-070f-4295-b860-6a61d6f4ec69')
            .set({ Authorization: `Bearer ${token}` })
            .then(response => {
                expect(response.status).to.equal(200);
            })
            .catch(error => {
                expect.fail(error)
            })
        })
    });
    
    describe('GET /users/{userId}/items', function () {
        it('Should fail to get the items because userId was not found', async function () {
            await chai.request(apiAddress)
            .get('/users/unknown-id/items')
            .then(response => {
                expect(response.status).to.equal(404);
            })
            .catch(error => {
                expect.fail(error)
            })
        })
        
        it('Should get all specific users items', async function () {
            await chai.request(apiAddress)
            .get('/users/acb9ed30-070f-4295-b860-6a61d6f4ec69/items')
            .then(response => {
                expect(response.status).to.equal(200);
                
                expect(response.body).to.be.a('array');
                
                for(i in response.body) {
                    expect(response.body[i]).to.be.a('object');
                
                    expect(response.body[i]).to.have.a.property('title');
                    expect(response.body[i]).to.have.a.property('description');
                    expect(response.body[i]).to.have.a.property('category');
                    expect(response.body[i]).to.have.a.property('askingPrice');
                    expect(response.body[i]).to.have.a.property('postingDate');
                    expect(response.body[i]).to.have.a.property('deliveryType');
                    
                    expect(response.body[i].title).to.be.a('string');
                    expect(response.body[i].description).to.be.a('string');
                    expect(response.body[i].category).to.be.a('object');
                    expect(response.body[i].askingPrice).to.be.a('string');
                    expect(response.body[i].postingDate).to.be.a('string');
                    expect(response.body[i].deliveryType).to.be.a('object');
                    
                    expect(response.body[i].category).to.have.a.property('phones');
                    expect(response.body[i].category).to.have.a.property('computers');
                    expect(response.body[i].category).to.have.a.property('components');
                    
                    expect(response.body[i].category.phones).to.be.a('boolean');
                    expect(response.body[i].category.computers).to.be.a('boolean');
                    expect(response.body[i].category.components).to.be.a('boolean');
                    
                    expect(response.body[i].deliveryType).to.have.a.property('shipping');
                    expect(response.body[i].deliveryType).to.have.a.property('pickup');
                    
                    expect(response.body[i].deliveryType.shipping).to.be.a('boolean');
                    expect(response.body[i].deliveryType.pickup).to.be.a('boolean');
                }
            })
            .catch(error => {
                expect.fail(error)
            })
        })
    });
});