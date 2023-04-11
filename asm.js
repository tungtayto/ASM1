var express = require('express');
var app = express();
var expressHbs = require('express-handlebars');
const multer = require('multer');
const session = require('express-session');
const mongodb = require('mongodb');
const fs = require("fs");
const mongoose = require('mongoose');
const uri = 'mongodb+srv://tungktph27675:tung07daidong@cluster0.e6ajppi.mongodb.net/asm?retryWrites=true&w=majority';
const ProductModel = require('./ProductModel');
const UserModel = require('./UserModel');

app.engine('.hbs', expressHbs.engine({
	extname: 'hbs',
	defaultLayout: 'main',
}));

app.use(express.static('public'));
app.use(express.static('assets'));

app.set('view engine', '.hbs');

app.get('/', function (req, res) {
	res.render('home', {
		layout: 'main',
		showFailLogin: false,
	});
})

app.use(session({
	secret: 'mySecretKey',
	resave: false,
	saveUninitialized: true,
	cookie: { secure: false }
}));

const isAuthenticated = (req, res, next) => {
	if (req.session && req.session.user) {
		return next();
	} else {
		res.redirect('/userProfile')
	}
}

var storage = multer.diskStorage({
	destination: function (req, file, cb) {
		cb(null, 'uploads')
	},
	filename: function (req, file, cb) {
		let fileName = file.originalname;
		console.log(fileName);

		let arr = fileName.split('.');
		let newFileName = arr[0] + '-' + Date.now() + '.' + arr[1];

		cb(null, newFileName)
	}
})

var upload = multer({ storage: storage })

app.get('/userProfile', isAuthenticated, async function (req, res) {
	const isAdmin = req.session.user.isAdmin;
	const userEmail = req.session.user.emailUser;
	console.log(isAdmin)
	await mongoose.connect(uri);
	console.log('Ket noi DB thanh cong');
	const userList = await UserModel.find().lean();

	const data = await UserModel.findOne({ emailUser: userEmail }).lean();
	if (isAdmin) {
		res.render('defaultView', {
			layout: 'listUser',
			userList,
		})
	} else {
		res.render('layouts/main', {
			layout: 'Profile',
			data1: data,
		})
		console.log(data)
	}
});

app.get('/login', async (req, res) => {

	await mongoose.connect(uri, {
		useNewUrlParser: true,
		useUnifiedTopology: true,
	});

	const email = req.query.email;
	const username = req.query.username;
	const password = req.query.password;
	console.log(email);

	UserModel.findOne({
		emailUser: email,
	})
		.then(data => {
			if (data) {
				console.log('tài khoản đã tồn tại')
			} else {
				return UserModel.create({
					nameUser: username,
					emailUser: email,
					passUser: password,

				})
					.then(data => {
						console.log('thành công')
						res.render('layouts/main', {
							layout: 'sign_in.hbs'
						})
					})
			}
		})
		.catch(err => {
			res.status(500).json('tạo thất bại');
		})
})

app.get('/goSignIn', async function (req, res) {
	res.render('defaultView', {
		layout: 'sign_in.hbs',
	})
})
app.get('/goSignUp', async function (req, res) {
	res.render('defaultView', {
		layout: 'main.hbs',
	})
})

app.get('/signin', async function (req, res) {
	await mongoose.connect(uri, {
		useNewUrlParser: true,
		useUnifiedTopology: true,
	});
	const name = req.query.username;
	const password = req.query.password;
	UserModel.findOne({
		nameUser: name,
		passUser: password,
	})
		.then(async data => {
			if (data) {
				req.session.user = data;
				const productList = await ProductModel.find().lean();
				res.render('defaultView', {
					layout: 'listProduct.hbs',
					productList,

				})
			} else {
				res.json('Thất bại')
			}
		})


	// Save user in session

});
app.get('/listUser', async function (req, res) {
	await mongoose.connect(uri);
	const userList = await UserModel.find().lean();
	res.render('defaultView', {
		layout: 'listUser.hbs',
		userList,
	})
})

app.get('/listProduct', async function (req, res) {
	await mongoose.connect(uri);
	const productList = await ProductModel.find().lean();
	res.render('defaultView', {
		layout: 'listProduct.hbs',
		productList,
	})
})

app.get('/goFormAddProduct', (req, res) => {
	res.render('layouts/main', { layout: 'formAddProducts' })
})

app.get('/addProduct', upload.single('imgRes'), async (req, res) => {
	let name = req.query.namePr
	// let img = req.query.img
	let color = req.query.color
	let typePr = req.query.typePr
	let price = Number(req.query.pricePr);

	// var img = fs.readFileSync(req.file);
	// var encode_img = img.toString('base64');
	// var final_img = {
	//     contentType:req.file.mimetype,
	//     image:new Buffer(encode_img,'base64')
	// };

	let product = new ProductModel({
		nameProduct: name,
		priceProduct: price,
		// img: final_img,
		color: color,
		typePr: typePr,
	})

	try {
		await product.save()
		res.redirect('/listProduct')
	} catch (error) {

	}
})

app.get('/updateProduct', async (req, res) => {
	let idUpdate = req.query.editId

	try {
		const list = await ProductModel.find().lean()
		let pr = await ProductModel.find({ _id: new mongodb.ObjectId(`${idUpdate}`) }).lean()
		// let arr =  nv.ten.split('');
		res.render('defaultView', { layout: 'formUpdateProducts', index: idUpdate, pr: pr[0], dataPr: list })
		// console.log(arr)
	} catch (error) {
		console.log(error);

	}
})

app.get('/upProduct', async (req, res) => {
	let name = req.query.namePr
	let price = req.query.pricePr
	let color = req.query.color
	let typePr = req.query.typePr
	let idPr = req.query.idProduct
	try {
		await mongoose.connect(uri)
		await ProductModel.collection.updateOne({ _id: new mongodb.ObjectId(`${idPr}`) }, { $set: { nameProduct: name, priceProduct: price, color: color, typePr: typePr } })
		res.redirect('/listProduct')
	} catch (error) {

	}
})

app.get('/deleteProduct', async (req, res) => {
	let deleteId = req.query.idPr;
	try {
		ProductModel.collection.deleteOne({ _id: new mongodb.ObjectId(`${deleteId}`) })
		res.redirect('/listProduct')
	} catch (error) {

	}
})

app.get('/goFormAddUser', (req, res) => {
	res.render('layouts/main', { layout: 'formAddUsers' })
})

app.get('/addUser', async (req, res) => {
	let name = req.query.nameUs
	let email = req.query.emailUs
	let pass = req.query.passUs
	let check = req.query.check
	let isAdmin = check?true:false
	let user = new UserModel({
		nameUser: name,
		emailUser: email,
		passUser: pass,
		isAdmin: isAdmin
	})

	try {
		await user.save()
		res.redirect('/listUser')
	} catch (error) {

	}
})

app.get('/updateUser', async (req, res) => {
	let idUpdate = req.query.idUs

	try {
		const list = await UserModel.find().lean()
		let pr = await UserModel.find({ _id: new mongodb.ObjectId(`${idUpdate}`) }).lean()
		// let arr =  nv.ten.split('');
		res.render('defaultView', { layout: 'formUpdateUser', index: idUpdate, pr: pr[0], dataPr: list })
		// console.log(arr)
	} catch (error) {
		console.log(error);

	}
})

app.get('/upUser', async (req, res) => {
	let name = req.query.nameUs
	let email = req.query.emailUs
	let pass = req.query.passUs
	let idUs = req.query.idProduct
	let check = req.query.check
	let isAdmin = check?true:false
	try {
		await mongoose.connect(uri)
		await UserModel.collection.updateOne({ _id: new mongodb.ObjectId(`${idUs}`) }, { $set: { nameUser: name, emailUser: email,passUser:pass, isAdmin: isAdmin } })
		res.redirect('/listUser')
	} catch (error) {

	}
})

app.get('/deleteUser', async (req, res) => {
	let deleteId = req.query.idUs;
	try {
		UserModel.collection.deleteOne({ _id: new mongodb.ObjectId(`${deleteId}`) })
		res.redirect('/listUser')
	} catch (error) {

	}
})

const port = 8080

app.listen(port, () => {
	console.log(`Example app listening on port ${port}`)
})