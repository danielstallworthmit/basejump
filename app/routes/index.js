'use strict';

var path = process.cwd();
var ClickHandler = require(path + '/app/controllers/clickHandler.server.js');
var url = require('url');

module.exports = function (app, passport) {

	function isLoggedIn (req, res, next) {
		if (req.isAuthenticated()) {
			return next();
		} else {
			res.redirect('/parser');
		}
	}

	var clickHandler = new ClickHandler();

	app.route('/')
		.get(isLoggedIn, function (req, res) {
			res.sendFile(path + '/public/index.html');
		});
	
	app.route('/parser')
		.get(function (req, res) {
			var head = req.headers;
			//console.log(req.connection.remoteAddress);
			var browserinfo = {
                "ip": head['x-forwarded-for'],
                "language": head['accept-language'].split(',')[0],
                "Operating System": head['user-agent']
                 }
                 
                res.send(JSON.stringify(browserinfo));
		});
		
	app.route('/time')
		.get(function (req, res) {
			res.sendFile(path + '/public/time.html');
		});
		
	app.route('/time/:times')
		.get(function(req, res) {
			var timepart = req.url.split('/')[2].split('%20').join(' ');
			if(!isNaN(new Date(timepart).getTime())){
				var date = new Date(timepart);
			} else {
				var date = new Date(Number(timepart));
			}
			
			console.log(timepart);
			console.log(date);
//         var date = new Date(parser.query.substr(4)); console.log(date);
//         // if(parser.pathname === '/api/parsetime'){
// //              date = new Date(parser.query.iso);
                //res.writeHead(200, { 'Content-Type': 'application/json' });
                var options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
                var isotime = {
                "unix": date.getTime(),
                "natural": date.toLocaleDateString('en-US', options)
                 }
                res.send(JSON.stringify(isotime));
        // }
		   //res.send(date); 
		});

	app.route('/login')
		.get(function (req, res) {
			res.sendFile(path + '/public/login.html');
		});

	app.route('/logout')
		.get(function (req, res) {
			req.logout();
			res.redirect('/login');
		});

	app.route('/profile')
		.get(isLoggedIn, function (req, res) {
			res.sendFile(path + '/public/profile.html');
		});

	app.route('/api/:id')
		.get(isLoggedIn, function (req, res) {
			res.json(req.user.github);
		});

	app.route('/auth/github')
		.get(passport.authenticate('github'));

	app.route('/auth/github/callback')
		.get(passport.authenticate('github', {
			successRedirect: '/',
			failureRedirect: '/login'
		}));

	app.route('/api/:id/clicks')
		.get(isLoggedIn, clickHandler.getClicks)
		.post(isLoggedIn, clickHandler.addClick)
		.delete(isLoggedIn, clickHandler.resetClicks);
};
