/*! 				Project Leek - Copyright 2012 ThePinkuProject				*/
/*! -------------------------- External requeriments -------------------------- */

var hash = require('./external/sha256-min.js');

/*!								MySQL initialization							*/
function Table(table,primary){
	this.table = table;
	this.database = db.database;
	this.primary = primary;
}
// 'account_id'		: 'int',
// 'userid' 		: 'int',
// 'pass'			: 'string',
// 'sex'			: 'string',
// 'map'			: 'int',
// 'x'				: 'int',
// 'y'				: 'int',
// 'last_ip'		: 'string',
// 'unban_time'	: 'int',
// 'login_count'	: 'int',
// 'birthdate'		: 'datetime',
// 'email'			: 'string'
Table.prototype.where = function(d,c){ //receive obj with properties and values {'field':'value'}
	var query = 'SELECT * FROM '+this.database+'.'+this.table+' AS t0 WHERE ';
	var counter = 1;
	for(n in d){
		query+=((counter>1)?' AND ':'')+'t0.'+n+' = '+db.escape(d[n]);
		counter++;
	}
	//[(query+=((counter>1)?' AND ':'')+'? = ?';counter++;) for each (t in p)];
	//log(query);
	if(typeof c == 'function')db.query(query,c);
	else db.query(query,function(e,r){if(e) log(e); else console.log(r);});
	return this;
}
Table.prototype.load = function(id,v,c){ //Load data for the requested 'field' (uniqueID recommended) in the instance object 'data'
	var query = 'SELECT * FROM '+this.database+'.'+this.table+' AS t0 WHERE t0.'+id+' = ? LIMIT 1';
	//log(query);
	if(typeof c == 'function') db.query(query,[v],c);
	else db.query(query,[v],function(e,r){if(e) log(e); else console.log(r[0]);});
	//return this;
}
Table.prototype.online = function(id,connid,ip,c){ //Set player ID online and connection id
	var query = 'UPDATE '+this.database+'.'+this.table+' AS t0 SET t0.online = 1, t0.conn_id = ?, t0.last_ip=INET_ATON(?) WHERE t0.account_id = ? LIMIT 1';
	//log(ip);
	if(typeof c == 'function') db.query(query,[connid,ip,id],c);
	else db.query(query,[connid,ip,id],function(e,r){if(e) log(e);});
	//return this;
}
Table.prototype.offline = function(connid,c){ //Set player ID offline
	var query = 'UPDATE '+this.database+'.'+this.table+' AS t0 SET t0.online = 0 WHERE t0.conn_id = ? LIMIT 1';
	//log(query);
	if(typeof c == 'function') db.query(query,[connid],c);
	else db.query(query,[connid],function(e,r){if(e) log(e);});
	//return this;
}
Table.prototype.q = function(op,q,arg,c){ //Set player ID offline
	var query = op+' '+this.database+'.'+this.table+' '+q;
	if(typeof c == 'function') db.query(query,arg,c);
	else db.query(query,arg,function(e,r){if(e) log(e);});
	//return this;
}
//Table.prototype.__defineSetter__('data',function
var db = require("mysql").createClient({
	host : 'localhost',
	port : '3306',
	user : 'projectleek',
	password : 'iliekleeks',
	database : 'leek'
});
log('Connecting to Database...');
db.ping(function(e,r){
	if(e){log('Database '+e);return;}
	log('Database Connected.');
	Char = new Table('char','account_id');
	Char.q('UPDATE','SET online = ? WHERE online = ?',[0,1],function(e,r){if(r.affectedRows)log(r.affectedRows+' players were set as online, now set offline.');});
	// Setting all players offline in case of server whited out
	initSocketIO();
}); // Testing connection 
db.on('error',function(e){log('Database '+e);});
// var arg = db.query('select * from '+dbName+'.char',function(e,r){
	// console.log(e);
	// console.log(r);
// });

/*!								Socket.IO handling								*/
function initSocketIO(){
	log('Initialising Socket.IO...');
	var io = require('socket.io').listen(9000);
	io.configure(function(){
		//io.disable('browser client');
		io.enable('browser client minification');
		io.enable('browser client gzip');
		io.set('log level', 0);
		io.set('client store expiration', 10);
		io.set('transports', [ 'websocket', 'xhr-polling', 'htmlfile', 'jsonp-polling']);
	});
	//console.log(io);
	io.server.on('listening', function (){log('Socket.IO Listening.');});
	io.sockets.on('connection', function (client) {
		client.on('login',function(d){
			if(!d.u) d.u = "Guest"+(Math.floor(Math.random() * 90000) + 10000);
			Char.where({'userid':d.u,'pass':d.p},function(e,r){
				if(e){
					client.emit('m',{a:'Invalid username or Password.'});
					client.disconnect();
					log('Login error: '+e);
					return;
				} else if(r.length<1){
					client.emit('m',{a:'Invalid username or Password.'});
					//client.emit('login_failed');
					client.disconnect();
					log('Invalid username or Password: ´'+d.u+'´/´'+d.p+'´');
					return;
				} else if(r[0].online){
					client.emit('m',{a:'User already logged in.'});
					//client.emit('login_failed');
					client.disconnect();
					log('User already logged in: ´'+d.u+'´');
				} else {
					//log(r);
					//console.log(client.store.data);
					/* { user: 'leek',
					  char:
					   { account_id: 1,
						 userid: 'Leek',
						 pass: 'miau',
						 class: 'Female',
						 map: 'test1',
						 x: 150,
						 y: 150,
						 last_ip: null,
						 unban_time: null,
						 login_count: null,
						 birthdate: null,
						 email: 'null',
						 conn_id: 0,
						 online: 0 
						} 
					} */
					//Here save connection ID to DB for easy retrieval
					//sync(client);
					//console.log(io.sockets);
					//console.log(io);
					//console.log(io.rooms['/'+client.store.data.char.map]);
					Char.online(r[0].account_id,client.id,client.handshake.address.address);
					client.set('char',r[0]);
					io.sockets.emit('cc',{a:len(io.connected)});//Send current conections to all clients.
					var players_in_map = {};
					for(n in io.rooms['/'+client.store.data.char.map]){
						var id = io.rooms['/'+client.store.data.char.map][n];
						//console.log(io.sockets.sockets[id].store.data);
						var trnr = io.sockets.sockets[id].store.data.char;
						players_in_map[id] = {
							id		: id,
							name	: trnr.userid,
							map		: trnr.map,
							x		: trnr.x,
							y		: trnr.y,
							class	: trnr.class
						};
					}
					d.u = r[0].userid;
					client.set('user',d.u);
					client.join(client.store.data.char.map);
					var this_player = {
						id		: client.id,
						name	: client.store.data.char.userid,
						map		: client.store.data.char.map,
						x		: client.store.data.char.x,
						y		: client.store.data.char.y,
						class	: client.store.data.char.class
					};
					client.emit('loggedin',this_player);
					client.emit('new_players',players_in_map);
					var this_pObj = {};
					this_pObj[client.id] = this_player;
					client.broadcast.to(client.store.data.char.map).emit('new_players',this_pObj);
					//client.set('char',Char.load('account_id',r[0].account_id));
					io.sockets.emit('g',{a:'A wild <b>'+d.u+"</b> has appeared!"});
					//client.broadcast.emit('g',{a:'A wild <b>'+d.u+"</b> has appeared!"});
					log(d.u+' has logged in. Transport: '+io.transports[client.id].name/*+', ID:'+client.id*/);
				}
				//console.log(e);console.log(r);
			});
		});
		//client.emit('m',{type:io.transports[client.id].name,id:client.id,add:client.handshake.address});
		client.on('logout', function () {
			client.get('user',function(e,u){
				client.emit('loggedout',{a:'<b>'+u+'</b> got away safely!'});
				log(u+' has logged out.');
			});
			client.disconnect();
		});
		client.on('disconnect', function () {
			client.get('user',function(e,u){
				//console.log(u);
				if(u!=null){
					Char.offline(client.id);
					io.sockets.emit('g',{a:'The wild <b>'+u+'</b> has fainted!'});
					log(u+' has disconnected.');
					client.broadcast.to(client.store.data.char.map).emit('player_leave',{id:client.id});
				}
			});
			io.sockets.emit('cc',{a:len(io.connected)-1});//Send current conecctions to all clients.
		});
		client.on('ch', function (d) {
			client.get('user',function(e,u){
				io.sockets.emit('ch',{u:u,m:d.a,id:client.id});
			});
			// client.get('char',function(e,c){
				// console.log(c);
			// });
		});
		client.on('move', function (c) {
			//log(client.store.data.char.userid);
			//console.log(c);
			try {
				client.store.data.char.x = c.x;
				client.store.data.char.y = c.y;
				client.broadcast.to(client.store.data.char.map).volatile.emit('move',{id:client.id,x:c.x,y:c.y,spd:c.spd,face:c.face});
			} catch(e) {
				log('Probably client lost error!');
				log(e);
			}
		});
		client.on('close',function(){
			db.end(function(){log('Closed connection to database.');io.server.close();});
		});
	});
}
function sync(client){
	client.emit('sync',{
		map		: client.store.data.char.map,
		x		: client.store.data.char.x,
		y		: client.store.data.char.y,
		sex		: client.store.data.char.sex
	});
}

/*!									Common Functions							*/

function log(s){
	if(typeof s == 'object'){
		//for(n in s)
		console.log(s);
	} else
		console.log('\033[36m'+now()+' - \033[39m'+s);
}
function len(obj){
	var length=0;
	for(var dummy in obj)
		length++;
	return length;
}
function now(){
	var n = new Date(),h=n.getHours(),min=n.getMinutes(),d=n.getDate(),m=n.getMonth(),s=n.getSeconds();
	return ((m < 10)?'0'+m:m)+'/'+((d < 10)?'0'+d:d)+'|'+((h < 10)?'0'+h:h)+':'+((min < 10)?'0'+min:min)+':'+((s < 10)?'0'+s:s);
}

/*!										Junk Code								*/

/* var persist = require('persist');
//var ty = persist.type;
//console.log(ty);
Char = persist.define('login', {
	'account_id'	: 'int',
	'userid' 		: 'int',
	'pass'			: 'string',
	'sex'			: 'string',
	'map'			: 'int',
	'x'				: 'int',
	'y'				: 'int',
	'last_ip'		: 'string',
	'unban_time'	: 'int',
	'login_count'	: 'int',
	'birthdate'		: 'datetime'
});
var Chars;
// Person = persist.define("Person", {
// "name": type.STRING
// }).hasMany(this.Phone);
var db = null;
persist.connect({
	driver: 	'mysql',
	database: 	'leek',
	host: 		'localhost',
	port:		'3306',
	user: 		'projectleek',
	password: 	'iliekleeks',
}, function(e, c) {
	if(e) {log(e+' |Error connecting to Database /'+c.db.database+'/ at '+c.db.host+':'+c.db.port); return;}
	db=c; 
	log('Connected to Database /'+c.db.database+'/ at '+c.db.host+':'+c.db.port);
	Chars = Char.using(c);
}); */

/* var Sequelize = require("sequelize");
var db = new Sequelize('leek', 'projectleek', 'iliekleeks', {
  // custom host; default: localhost
  host: 'localhost',
  // custom port; default: 3306
  port: 3306,
  // disable logging; default: true
  logging: true,
  // max concurrent database requests; default: 50
  maxConcurrentQueries: 50,
  // the sql dialect of the database
  // - default is 'mysql'
  // - currently supported: 'mysql', 'sqlite'
  dialect: 'mysql',
  // specify options, which are used when sequelize.define is called
  // the following example is basically the same as:
  // sequelize.define(name, attributes, { timestamps: false })
  // so defining the timestamps for each model will be not necessary
  //define: { timestamps: false },
  // similiar for sync: you can define this to always force sync for models
  //sync: { force: true }
});
var Char = db.define('char', {
	'account_id'	: Sequelize.INTEGER,
	'userid' 		: Sequelize.INTEGER,
	'pass'			: Sequelize.STRING,
	'sex'			: Sequelize.STRING,
	'map'			: Sequelize.INTEGER,
	'x'				: Sequelize.INTEGER,
	'y'				: Sequelize.INTEGER,
	'last_ip'		: Sequelize.STRING,
	'unban_time'	: Sequelize.INTEGER,
	'login_count'	: Sequelize.INTEGER,
	'birthdate'		: Sequelize.STRING
});
//db.query("select * from login").ok(function(a){console.log(a);}).error(function(a){console.log(a);}); */

// var db = require("mysql-native").createTCPClient('localhost','3306'); // localhost:3306 by default
// db.auto_prepare = true;
// db.auth("leek", "projectleek", "iliekleeks");
// function dump_rows(cmd){
   // cmd.addListener('row', function(r) { console.dir(r); } );
// }
// dump_rows(db.query("select 1+1,2,3,'4',length('hello')"));
// dump_rows(db.execute("select 1+1,2,3,'4',length(?)", ["hello"]));
// db.close();
