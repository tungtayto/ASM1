var express = require('express');

var app = express();
var expressHbs = require('express-handlebars');
app.engine('.hbs', expressHbs.engine({
    extname: 'hbs',
    defaultLayout:'main',
}));

app.use(express.static('public'));

app.set('view engine','.hbs');

// app.get('/' , function(req,res){
//     res.send('Hello World!')
// })

app.get('/' , function(req,res){
    res.render('home',{
        layout: 'main',
		showFailLogin: false,
		// customstyle: `<link rel="stylesheet" href="cssgiaodien.css">`
    });
})

app.get('/login' , function(req,res){
    var username = req.query.user;
	var password = req.query.pass;
	if(username == "admin" && password == "123"){
		res.render('layouts/main',{
			layout:'quantri.hbs',
		})
	} else{
		res.render('layouts/main',{
			showFailLogin:true,
		})
	}
})

app.listen(process.env.PORT || '3000');
//email pass name img