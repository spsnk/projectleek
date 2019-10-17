var socket,
	conn = false,
	trainers = {},
	load = $('<img />')
	.attr({src:'/static/img/leek/leek_load2.gif',height:'16px',width:'16px'})
	.css({display:'inline','vertical-align':'text-top'});
function connect(){
	var unexcpectedClose = false;
	if(conn)return;
	conn = true;
	$('#b').html(load).attr('disabled','disabled');
	//console.log('trying to connect');
	if(typeof io == 'undefined') {mA('#m','Server offline.');conn = false;return;}
	//socket = io.connect('http://pinkuproject.net:9000',{
	socket = io.connect('http://127.0.0.1:9000',{
		'force new connection':true,
		'reconnect':false,
		'connect timeout':5000
	});
	var timer = setTimeout(function(){
		socket.disconnect();
		socket.$events.connect_failed();
		},10000);
	socket.on('connect_failed', function() {
		mA('#m','Could not connect to server.');
		$('#b').html('Connect').removeAttr('disabled');
		conn = false;
		unexcpectedClose = false;
	});
	socket.on('connect', function(e) {
		clearTimeout(timer);
		socket.emit('login',{u:$('#u').val(),p:$('#p').val()});
	});
	socket.on('loggedin', function(d) {
		slides();
		mA('#m','Connected to Project Leek server.');
		$('#cw').css({display:'inline-block'});
		unexcpectedClose = true;
		//console.log(d);
		//window.onbeforeunload = function(){return 'If you do not logout first you may lose data!'}; //disconnects anyway...
		//Crafty.scene('loading');
		//loading = setTimeout(function(){
			Crafty.scene('overworld');
			loadPlayer(d);
	//},100);
		/***/
		//request and receive map data from server -- not anymore? client based maps?
	});
	socket.on('g', function(m) {
		mA('#m',m.a);
	});
	socket.on('cc', function(m) {
		$('#cn').text(m.a);
	});
	socket.on('ch', function(d) {
		mA('#m','<b>'+d.u+'</b> says: '+d.m);
		trainers[d.id].talk(d.m);
	});
	socket.on('m', function(m) {
		mA('#m',m.a);
	});
	socket.on('debug', function(m) {
		console.log(m);
	});
	socket.on('sync',function(m){
		console.log(m);
	});
	socket.on('loggedout', function (m) {
		if(m.a)
			mA('#m',m.a);
		slides();
		$('#cw').css({display:'none'});
		unexcpectedClose = false;
	});
	//socket.on('login_failed', function (m) {
		//$('#cx').toggle(500);
		//$('#dx').toggle(500);
		//$('#cw').css({display:'none'});
	//});
	socket.on('disconnect', function (m) {
		if(unexcpectedClose){
			mA('#m','Looks like the server whited out.');
			slides();
			$('#cw').css({display:'none'});
		} else
			mA('#m','Disconnected from server.');
		$('#b').html('Connect').removeAttr('disabled');
		if(typeof loading != 'undefined') clearTimeout(loading);
		Crafty.scene('main');
		conn = false;
		unexcpectedClose = false;
	});
	socket.on('new_players',function(players){
		for(pobj in players){
			trainers[pobj] = Crafty.e('Trainer').Trainer(players[pobj]);
		}
		//console.log(players);
	});
	socket.on('player_leave',function(d){
		//console.log(trainers[d.id]);
		trainers[d.id].destroy();
		delete trainers[d.id];
		//console.log(trainers);
	});
	socket.on('move',function(d){
		//console.log(d);
		trainers[d.id].moveTo(d.x,d.y,d.spd,d.face);
		//trainers[d.id].x = d.x;
		//trainers[d.id].y = d.y;
	});
}
function send(e) {
	if (e.keyCode == 13 && $('#msg').val() != '') {
		e.preventDefault();
		socket.emit('ch',{a:$('#msg').val()});
		$('#msg').val('');
		return false;
	}
}
function mA(s,t){
	var li = $('<div></div>')/*.css({display:'none'})*/.html(t);
	$(s).append(li);
	//li.toggle(250);
	$('#m').scrollTop($('#m')[0].scrollHeight);
}
function logout(){
	socket.emit('logout');
}
function slides(cb){
	$('#cx').slideToggle(500);
	if(typeof cb == 'function')
		$('#dx').slideToggle(500,cb);
	else 
		$('#dx').slideToggle(500);
	//$('#map').slideToggle(500);
}