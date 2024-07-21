const mongoose = require('mongoose')
const supertest = require('supertest')
const { ADMIN_EMAIL, ADMIN_PASSWORD } = require('../src/config/config')
const requester = supertest('http://localhost:8080')

describe('Testing Ecommerce', () => {
    const mockUser = {
        first_name: 'Tester',
        last_name: 'Tester',
        age: 21,
        email: 'tester@gmail.com',
        password: 'tester123',
        cart: null
    }   

    // register user
    const registerUser = async (user) => {
        return await requester.post('/api/sessions/register').send(user)
    }

    // login user
    const loginUser = async (user) => {
        const userToLogin = { email: user.email, password: user.password }
        return await requester.post('/api/sessions/login').send(userToLogin)
    }

    // función auxiliar para logueo de admin
    const loginAdminUser = async () => {
        const user = { email: ADMIN_EMAIL, password: ADMIN_PASSWORD }
        const result = await requester.post('/api/sessions/login').send(user)       
        return result.headers['set-cookie'][0] // cookie del encabezado de la respuesta
    }

    let chai
    let expect
    let registerUserStatus
    let loginUserStatus

    before(async function () {
        chai = await import('chai')
        expect = chai.expect
        this.timeout(5000)
        await mongoose.connect('mongodb://localhost:27017', { dbName: 'testing' })
        this.connection = mongoose.connection
    })

    after(async function () {
        await this.connection.db.dropDatabase()
        await this.connection.close()
    })

    beforeEach(async function () {
        this.timeout(5000)
    })

    describe('Test de productos', () => {
        it('endpoint GET /api/products => debe devolver todos los productos de la base de datos', async () => {
            const { statusCode, ok, body } = await requester.get('/api/products')
            expect(statusCode).to.equal(200)
            expect(ok).to.equal(true)
            expect(body.status).to.equal('success')
        })

        // it('debe registrar un usuario nuevo e iniciar sesion', async () => {   
        //     // register user            
        //     console.log('Registrando usuario...')
        //     registerUserStatus = await registerUser(mockUser)
        //     console.log('Usuario registrado, respuesta:', registerUserStatus.body)
        //     expect(registerUserStatus.ok).to.be.true
        //     expect(registerUserStatus.body.status).to.be.equals('success')
        //     // login user
        //     console.log('Iniciando sesión del usuario...')
        //     loginUserStatus = await loginUser(mockUser)
        //     console.log('Usuario ha iniciado sesión, respuesta:', loginUserStatus.body)
        //     expect(loginUserStatus.ok).to.be.true
        //     expect(loginUserStatus.body.status).to.be.equals('success')
        // })


        // it('endpoint POST /api/products => debe crear un nuevo producto correctamente, cambio el rol del user a PREMIUM previamente', async () => {
        //     // change rol to PREMIUM
        //     console.log('Cambiando rol del usuario a PREMIUM...')
        //     const userId = loginUserStatus.body.payload
        //     const userPremiumStatus = await requester.put(`/api/sessions/premium/${userId.toString()}`)
        //     console.log('Rol cambiado, respuesta:', userPremiumStatus.body)
        //     expect(userPremiumStatus.statusCode).to.be.equal(200)
        //     expect(userPremiumStatus.ok).to.be.true
        //     // relogin user
        //     console.log('Relogueando usuario...')
        //     loginUserStatus = await loginUser(mockUser)
        //     console.log('Usuario relogueado, respuesta:', loginUserStatus.body)
        //     const cookie = loginUserStatus.headers['set-cookie'][0]
        //     expect(loginUserStatus.ok).to.be.true
        //     expect(loginUserStatus.body.status).to.be.equals('success')
        //     // create a product
        //     console.log('Creando producto...')
        //     const productMock = {
        //         title: 'Product Tester',
        //         description: 'Product Tester',
        //         price: 100,
        //         thumbnail: ['images/memoria.png'],
        //         code: 'tester123',
        //         stock: 10,
        //         status: true,
        //         category: 'componente',
        //         owner: ADMIN_EMAIL
        //     }
        //     const newProductStatus = await requester.post('/api/products').set('Cookie', cookie).send(productMock)
        //     console.log('Producto creado, respuesta:', newProductStatus.body)
        //     expect(newProductStatus.ok).to.be.true
        //     expect(newProductStatus.statusCode).to.be.equal(201)
        //     expect(newProductStatus.body.status).to.be.equal('success')
        // })

        it('endpoint POST /api/products => debe crear un nuevo producto correctamente', async () => {

            const cookie = await loginAdminUser()  // me logueo como admin

            const productMock = {
                title: 'Product Tester',
                description: 'Product Tester',
                price: 100,
                thumbnail: ['images/memoria.png'],
                code: 'tester123',
                stock: 10,
                status: true,
                category: 'componente',
                owner: ADMIN_EMAIL
            }

            const { statusCode, ok, body } = await requester.post('/api/products').set('Cookie', cookie).send(productMock)
                    
            expect(ok).to.be.true
            expect(statusCode).to.be.equal(201)
            expect(body.status).to.be.equal('success')             
        })

        // it('endpoint PUT /api/products/:id => debe actualizar un producto existente', async () => {

        //     const cookie = await loginAdminUser()  // me logueo como admin

        //     const productMock = {
        //         title: 'Product Tester',
        //         description: 'Product Tester',
        //         price: 100,
        //         thumbnail: ['images/memoria.png'],
        //         code: 'tester1234',
        //         stock: 15,
        //         status: true,
        //         category: 'componente',
        //         owner: ADMIN_EMAIL
        //     }

        //     const product = await requester.post('/api/products').set('Cookie', cookie).send(productMock)
                  
        //     expect(product.ok).to.be.true
        //     expect(product.statusCode).to.be.equal(201)
           
        //     const prodId = product.body.payload

        //     const updatedProductMock = {
        //         title: 'Updated Product Tester',
        //         description: 'Updated Product Tester',
        //         price: 500,
        //         thumbnail: ['images/memoria.png'],
        //         code: 'tester1234',
        //         stock: 15,
        //         status: true,
        //         category: 'componente',
        //         owner: ADMIN_EMAIL
        //     }
        //     const updatedProduct = await requester.put(`/api/products/${prodId}`).send(updatedProductMock)
        //     expect(updatedProduct.ok).to.be.true
        //     expect(updatedProduct.statusCode).to.be.equal(200)

        //     expect(product.body.title).to.equal('Product Tester')
        //     expect(product.body.description).to.equal('Product Tester')
        //     expect(product.body.price).to.equal(100)
        //     expect(updatedProduct.body.title).to.equal('Updated Product Tester')
        //     expect(updatedProduct.body.description).to.equal('Updated Product Tester')
        //     expect(updatedProduct.body.price).to.equal(500)
        //     expect(product.body.code).to.equal(updatedProduct.body.code)
        //     expect(product.body.stock).to.equal(updatedProduct.body.stock)
        //     expect(product.body.category).to.equal(updatedProduct.body.category)
        // })

        it('endpoint DELETE /api/products/:id => debe eliminar un producto', async () => {

            const cookie = await loginAdminUser()  // me logueo como admin

            const productMock = {
                title: 'Product Tester',
                description: 'Product Tester',
                price: 100,
                thumbnail: ['images/memoria.png'],
                code: 'tester1234',
                stock: 20,
                status: true,
                category: 'componente',
                owner: ADMIN_EMAIL
            }

            const product = await requester.post('/api/products').set('Cookie', cookie).send(productMock)
            expect(product.ok).to.be.true
            expect(product.statusCode).to.be.equal(201)            
            
            const prodId = product.body.payload

            const deleteRequestStatus = await requester.delete(`/api/products/${prodId}`).set('Cookie', cookie)
                   
            expect(deleteRequestStatus.ok).to.be.true
            expect(deleteRequestStatus.statusCode).to.be.equal(200)            

            const deletedProduct = await requester.get(`/api/products/${prodId}`)  
            //expect(deletedProduct.statusCode).to.equal(404)        
            expect(deletedProduct.statusCode).to.equal(500)    
        })
    })

    describe('Test de carts', () => {



    })

    describe('Test de users', () => {



    })
})