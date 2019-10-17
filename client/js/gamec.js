function initSprites() {
	MAP_TILES = {
		// water		: [ 0, 0],
		//'water_r'		: [ 1, 0],
		// water_l		: [ 2, 0],
		// water_b		: [ 3, 0],
		// water_t		: [ 4, 0],
		// water_b_r	: [ 5, 0],
		// water_b_l	: [ 6, 0],
		// water_t_r	: [ 7, 0],
		// water_t_l	: [ 8, 0],
		// water_alt	: [ 0, 1],
		// water_c_b_r	: [ 1, 1],
		// water_c_b_l	: [ 2, 1],
		// water_c_t_r	: [ 3, 1],
		// water_c_t_l	: [ 4, 1],
		// water_d_b_r	: [ 5, 1],
		// water_d_b_l	: [ 6, 1],
		// water_d_t_r	: [ 7, 1],
		// water_d_t_l	: [ 8, 1],
		// sand		: [ 0, 2]
		
		'0'		: [ 0, 0],
		'1'		: [ 1, 0],
		'2'		: [ 2, 0],
		'3'		: [ 3, 0],
		'4'		: [ 4, 0],
		'5'		: [ 5, 0],
		'6'		: [ 6, 0],
		'7'		: [ 7, 0],
		'8'		: [ 8, 0],
		'9'		: [ 0, 1],
		'10'	: [ 1, 1],
		'11'	: [ 2, 1],
		'12'	: [ 3, 1],
		'13'	: [ 4, 1],
		'14'	: [ 5, 1],
		'15'	: [ 6, 1],
		'16'	: [ 7, 1],
		'17'	: [ 8, 1],
		'18'	: [ 0, 2]
	};
	POK = {
		'pok_137'		: [ 0, 2],
		'pok_239'		: [ 2, 2],
		'pok_471'		: [ 4, 2]
	};
	Crafty.sprite(19,26, 'img/player/F.png', {'Female': [0,0]},1);
	Crafty.sprite(19,26, 'img/player/M.png', {'Male':[0,0]},1);
	Crafty.sprite(32, 'img/pok/pokes.png', POK);
	Crafty.sprite(32, 'img/map/test_map.png', MAP_TILES,1);
}
var MAP_COL = {},
	W = 560,//520,
	H = 360,//320,
	//MAP_X=640,
	//MAP_Y=640,
	HW = W / 2,
	HH = H / 2,
	me,
	LAST,
	CURRENT,
	RENDER_METHOD = 'DOM';

window.onload = function() {
	Crafty.init(W,H);
	//Crafty.canvas.init();
	Crafty.scene('loading');
	Crafty.load(['img/map/test_map.png','img/player/F.png','img/pok/pokes.png','img/player/M.png'], function() {
		initSprites();
		Crafty.scene('main');
		//clearInterval(inter);
	});
};
/* var playa = {
	class : "Female",
	animations : {"walk_down":[[1,0],[0,0],[2,0],[0,0]],"walk_up":[[1,1],[0,1],[2,1],[0,1]],"walk_right":[[4,0],[3,0],[5,0],[3,0]],"walk_left":[[4,1],[3,1],[5,1],[3,1]],"run_down":[[0,2],[1,2],[0,2],[2,2]],"run_up":[[0,3],[1,3],[0,3],[2,3]],"run_right":[[4,2],[3,2],[5,2],[3,2]],"run_left":[[4,3],[3,3],[5,3],[3,3]],"stop_down":[[0,0]],"stop_up":[[0,1]],"stop_right":[[3,0]],"stop_left":[[3,1]]},
	polygon : [[6,24],[2,21],[2,20],[6,17],[13,17],[16,20],[16,21],[16,24]],
	map: 0,
	x:150,
	y:150
}; */
Crafty.scene('loading', function() {		
	// Black background with some loading text
	Crafty.background('#222');
	cosa = Crafty.e('2D, DOM, Text').attr({w:W,h:100,x: 0, y: (H/2)-20})
	  .text('Loading')
	  .origin('center')
	  .css({'text-align': 'center',
		  'font-family':'Open Sans',
		  'font-size':'3em',
		  'font-weight':'bold'
		  //'color':'#6BC3B7'
	})
	  .textColor('#FFFFFF',1);
	  //.textFont({weight:'bold',size:'20px'});
	//Crafty.canvas.context.font = '3em Open Sans';
	//cosa.textFont();
	var puntos = '';
	inter = setInterval(function(){
		cosa.text('Loading'+((puntos.length > 2)?puntos='':puntos+='.'));
	},200);
},function(){
	clearInterval(inter);
});
Crafty.scene('main',function(){
	Crafty.background('#222');
	Crafty.e('2D, DOM, Text')
	  .attr({w:400,h:60,x: (W/2)-200, y: (H/2)-20})
	  .text('Leek Ready')
	  .css({'text-align': 'center',
		  'font-family':"'Open Sans'",
		  'font-size':'3em',
		  'font-weight':'bold',
		  //'color':'#6BC3B7',
		  'margin':'0px auto'})
	  .textColor('#FFFFFF',1);
});
Crafty.scene('overworld',function(){
	Crafty.background('');
},function(){
	player=null;
	trainers={};
	clearInterval(movement);
});

function loadPlayer(playerObj){
	initMap(MAPS[playerObj.map]);
	player = Crafty.e('Trainer, Keyboard')
	  .Trainer(playerObj)
	  .attr({_hasMoved:false,_map:MAPS[playerObj.map]})
	  .bind("EnterFrame", function(e) {
			if(!this._active) return;
			var old_pos = {x:this.x,y:this.y};
			//var speed = this._speed; //hack prone?
			this._speed = 1;
			var running = 'walk';
			var frames = 20;
			if(this.isDown(Crafty.keys.SPACE)) {
				this._speed = this._speed * 3;
				running = 'run';
				frames = 10;
			}
			if(this.isDown(Crafty.keys.LEFT_ARROW)) {
				this.x += -this._speed;
				this._facing = 'left';
				if (!this.isPlaying(running+"_left"))
						this.stop().animate(running+"_left", frames);
			} else if(this.isDown(Crafty.keys.RIGHT_ARROW)) {
				this.x += this._speed;
				this._facing = 'right';
				if (!this.isPlaying(running+"_right"))
						this.stop().animate(running+"_right", frames);
			} else if(this.isDown(Crafty.keys.UP_ARROW)) {
				this.y += -this._speed;
				this._facing = 'up';
				if (!this.isPlaying(running+"_up"))
					this.stop().animate(running+"_up", frames);
			} else if(this.isDown(Crafty.keys.DOWN_ARROW)) {
				this.y += this._speed;
				this._facing = 'down';
				if (!this.isPlaying(running+"_down"))
					this.stop().animate(running+"_down", frames);
			}
			/*
			//check for collision with houses				
			if(this.hit("Solid") || this.hit("Trainer")) {
				this.x = old_pos.x;
				this.y = old_pos.y;
				//item = collision[0];
				// this.x += Math.ceil(item.normal.x * -item.overlap);
				// this.y += Math.ceil(item.normal.y * -item.overlap);
			}*/
			
			var collision = this.hit("Solid");
			//if(typeof collision == 'object') collision.concat(this.hit("Trainer"));
			//else collision = this.hit("Trainer");
			if(collision) {
				for(ind in collision){
					var item = collision[ind];
					if(item){
						this.x += Math.ceil(item.normal.x * -item.overlap);
						this.y += Math.ceil(item.normal.y * -item.overlap);
					}
				}
			}
			// if(this._lastsync < +new Date()){
				// this._lastsync = +new Date()+(1000*1.5);
				// console.log('sync sent');
				// socket.emit('move',{x:Math.floor(this._x),y:Math.floor(this._y)});
			// }
		})
	  .bind('KeyUp',function(e){
			this.stop().animate('stop_'+this._facing,5);
			this.x = Math.floor(this._x);
			this.y = Math.floor(this._y);
			//socket.emit('move',{x:this._x,y:this._y});
		})
	  .bind('Move',function(e){
			document.getElementById('info').innerHTML = 'x:'+this.x+'<br>y:'+this.y+'<br>vx:'+Crafty.viewport.x+'<br>vy:'+Crafty.viewport.y;
			camera();
			//socket.emit('move',{x:Math.floor(this._x),y:Math.floor(this._y)});
			this._hasMoved = true;
	});
	player.z=2;
	movement = setInterval(function(){
		if(player._hasMoved) {
			socket.emit('move',{x:Math.floor(player._x),y:Math.floor(player._y),spd:player._speed,face:player._facing});
			player._hasMoved = false;
		}
	},100);
	trainers[playerObj.id]=player;
	//Global viewport scrolling
	Crafty.viewport.centerOn(player,1);
	//Crafty.viewport.follow(player);
  	//Crafty.bind("EnterFrame", 
	function camera() {
		//if(!player) return;
		//position of the viewport
		var vpx = player._x - (Crafty.viewport.width/2),
			vpy = player._y - (Crafty.viewport.height/2);
		//Max map area - Crafty.viewport.width
		if(vpx > 0 && vpx < ((player._map.max_x) - Crafty.viewport.width) ){//&& (Crafty.viewport._x > -vpx+4 || Crafty.viewport._x <= -vpx-4)) {
			Crafty.viewport.x= -vpx;
		}
		if(vpy > 0 && vpy < ((player._map.max_y)- Crafty.viewport.height) ){//&& (Crafty.viewport._y > -vpy+4 || Crafty.viewport._y <= -vpy-4)) {
			Crafty.viewport.y= -vpy;
		}
	}
	//);
};
Crafty.c('Pokemon',{
	init: function(){
		this.addComponent('2D, '+RENDER_METHOD+', SpriteAnimation, Tween');
	},
	Pokemon: function(index,parent){
		this._parent = parent;
		this.addComponent('pok_'+index);
		for(a in POKEYMANS[index].animations){
			this.animate(a,Crafty.clone(POKEYMANS[index].animations[a]));
		}
		this.animate('down',20,-1)
		  .attr({x:this._parent._x-6,y:this._parent._y-this._h+8,_facing:'down'})
		  .bind('EnterFrame',function(){if(this._parent._facing!=this._facing)this._setFacing();});
		return this;
	},
	_setFacing: function(){
		if(this._parent._facing=='right'&&this._facing!='right'){
			this._facing = 'right';
			this
			  .moveTo(this._parent._x-(this._w-this._parent._w/3),'x')
			  .moveTo(this._parent._y-(this._h-this._parent._h),'y')
			  .stop().animate('right',20,-1);
		} else
		if(this._parent._facing=='left'&&this._facing!='left'){
			this._facing = 'left';
			this
			  .moveTo(this._parent._x+(this._parent._w/2),'x')
			  .moveTo(this._parent._y-(this._h-this._parent._h),'y')
			  .stop().animate('left',20,-1);
		} else
		if(this._parent._facing=='up'&&this._facing!='up'){
			this._facing = 'up';
			this
			  .moveTo(this._parent._x-6,'x')
			  .moveTo(this._parent._y+this._parent._h-10,'y')
			  .stop().animate('up',20,-1);
		} else
		if(this._parent._facing=='down'&&this._facing!='down'){
			this._facing = 'down';
			this
			  .moveTo(this._parent._x-6,'x')
			  .moveTo(this._parent._y-this._h+10,'y')
			  .stop().animate('down',20,-1);
		}
	},
	moveTo: function(coord,axis){
		if(axis=='x' && !(this._x ==coord)) {
			this.tween({x:coord},5);
		} else if(axis=='y' && !(this._y ==coord)){
			this.tween({y:coord},5);
		}
		return this;
	}
});
Crafty.c('Trainer',{
	init: function(){
		this.addComponent('2D, '+RENDER_METHOD+', SpriteAnimation, Collision, Tween, Mouse');
	},
	Trainer: function(trainerOjb){
		this.addComponent(trainerOjb['class'])
		  .attr({x: trainerOjb.x, y: trainerOjb.y, _active: true,_speed: 1.5,_facing:'down',_isMoving:false,_name:trainerOjb.name})
		  .collision(new Crafty.polygon(Crafty.clone(CLASSES[trainerOjb['class']].polygon)));
		for(a in CLASSES[trainerOjb['class']].animations){
			this.animate(a,Crafty.clone(CLASSES[trainerOjb['class']].animations[a]));
		}
		var pokeindex=137;
		if(this._name == 'Leek'){ pokeindex = 471;} else if(this._name == 'Cubi') {pokeindex = 239;}
		this._poke = Crafty.e('Pokemon').Pokemon(pokeindex,this);
		this.attach(this._poke);
		var nickw = (this._name.length*5)+11;
		this._nick = Crafty.e('2D, DOM, Text, Tween').attr({w:nickw,h:13,x: this._x+(this._w/2)-(nickw/2), y: this._y+this._h+2})
			  .text(trainerOjb.name)
			  //.origin('center')
			  .css({'text-align': 'center',
					'font-family':'Open Sans,sans-serif',
					'font-size':'9px',
					//'font-weight':'bold',
					'color':'#000000',
					'background-color':'#FFFFFF',
					'margin':'0px auto',
					'-webkit-border-radius':'2px',
					'-khtml-border-radius':'2px',
					'-moz-border-radius':'2px',
					'-ms-border-radius':'2px',
					'-o-border-radius':'2px',
					'border-radius':'2px'
				});
		//this._nick.visible = 0;
		this._nick.alpha = 0;
		this.attach(this._nick);
		this._chat = Crafty.e('2D, DOM, Text, Tween').attr({w:10,h:15,x: this._x+(this._w/2)-(nickw/2), y: this._y-20,_timer:0})
			  .text(' ')
			  .css({'text-align': 'center',
					'font-family':'Droid Sans Mono, monotype',
					'font-size':'11px',
					//'font-weight':'bold',
					'color':'#000000',
					'background-color':'#FFFFFF',
					'margin':'0px auto',
					'padding':'2px',
					'-webkit-border-radius':'2px',
					'-khtml-border-radius':'2px',
					'-moz-border-radius':'2px',
					'-ms-border-radius':'2px',
					'-o-border-radius':'2px',
					'border-radius':'2px'
				});
		this._chat.visible = 0;
		this._chat.bind('TweenEnd',function(){
			if(this._alpha == 0)
				this.visible = 0;
		});
		this.attach(this._chat);
		this.z=1;
		//this.areaMap(new Crafty.polygon([[0,0],[this._w,0],[this._w,this._h],[0,this._w]]));
		this.areaMap(new Crafty.circle(Math.floor(this._w/2),Math.floor(this._h/2),Math.floor(this._h/2)));
		this.bind('MouseOver',function(){
			this._nick.tween({alpha:0.7},3);
		}).bind('MouseOut',function(){
			this._nick.tween({alpha:0},70);
		});
		return this;
	},
	moveToProto: function(coord,axis){
		//this._isMoving = true;
		//console.log(axis+':'+coord);
		if(this.__c.Keyboard) return;
		if(axis=='x' && !(this._x ==coord)) {
			var total = Math.floor(Math.abs(coord-this._x)/3);
			this.tween({x:coord},total);
		} else if(axis=='y' && !(this._y ==coord)){
			var total = Math.floor(Math.abs(coord-this._y)/3);
			this.tween({y:coord},total);
		}
	},
	moveTo: function(x,y,spd,face){
		//this._isMoving = true;
		//console.log('x:'+x+' y:'+y+' spd:'+spd);
		if(this.__c.Keyboard) return;
		spd = (spd > 3 || spd == 'undefined') ? 3 : spd;
		var totalX = Math.floor(Math.abs(x-this._x)/spd);
		var totalY = Math.floor(Math.abs(y-this._y)/spd);
		var anim = ( (spd > 1.5)?'run_':'walk_')+face;
		var frm = (spd > 1.5)?10:20;
		if(Math.floor(this._x) != x && totalX > 2)
			this.tween({x:Math.floor(x)},totalX);
		if(Math.floor(this._y) != y && totalY > 2)
			this.tween({y:Math.floor(y)},totalY);
		if (!this.isPlaying(anim) && (totalX > 2||totalY > 2)) {
			this.stop().animate(anim,frm);
			this._facing = face;
		}
	},
	talk: function(msg){
		this._chat.z = 2;
		var chatw = (msg.length*7)+10;
		clearTimeout(this._chat._timer);
		this._chat.attr({w:chatw,x: this._x+(this._w/2)-(chatw/2)});
		this._chat.alpha = 0;
		this._chat.visible = 1;
		this._chat.text(msg).tween({alpha:0.75},5);
		var chat = this._chat;
		this._chat._timer = setTimeout(function(){
			chat.tween({alpha:0},70);
		},5000);
	}
});
/* var thing = function(este,aquel){
	var asd = MAPS[este].polygon[aquel].slice();
	console.log( MAPS[este].polygon[aquel]);
	return Crafty.clone(asd);
	return [[0,0],[27,0],[27,32],[0,32]];
}; */
function initMap(inputMap) {
	//var inputMap = MAPS[mapIndex];
	var data = inputMap.data;
	for(var obj in data) {
		var pos = obj.split(",");
		MAP_COL[obj] = Crafty.e('2D, '+RENDER_METHOD+', '+data[obj]).attr({x: pos[0] * 32, y: pos[1] * 32,visible:1});
		//make water solid
		// if(inputMap[obj] >= 0 && inputMap[obj] <= 17) {
			// MAP_COL[obj].addComponent("Solid, Collision").collision();
		// }
		if(typeof inputMap.polygon[data[obj]] == 'object') {
			//MAP_COL[obj].addComponent("Solid, Collision").collision(new Crafty.polygon(thing(mapIndex,data[obj])));
			MAP_COL[obj].addComponent("Solid, Collision").collision(new Crafty.polygon(Crafty.clone(inputMap.polygon[data[obj]])));
		} else if (inputMap.polygon[data[obj]] == 1){
			MAP_COL[obj].addComponent("Solid, Collision").collision();
		}
	}
}