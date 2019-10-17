var ENTS = {},
	W = 500,
	H = 400,
	HW = W / 2,
	HH = H / 2,
	me,
	LAST,
	CURRENT;

window.onload = function() {

	Crafty.load(["assets/sprites.png"], function() {
		initSprites();
		init();
	});

	function init() {
		Crafty.init(500, 400);
		Crafty.canvas.init();
		initMap();
		
		me = Crafty.e("2D, Canvas, player, Keyboard, Collision")
		.origin("center")
		.attr({x: 100, y: 100, _active: true})
		.collision(new Crafty.polygon([[1,19],[2,14],[9,14],[13,9],[22,10],[24,14],[31,15],[30,21],[2,20]]))
		.bind("EnterFrame", function(e) {
			if(!this._active) return;
			
			var angle = this._rotation * (Math.PI / 180),
				vx = Math.sin(angle),
				vy = -Math.cos(angle);
			
			if(this.isDown(Crafty.keys.W) || this.isDown(Crafty.keys.UP_ARROW)) {
				this.x += vx * 1.5;
				this.y += vy * 1.5;
			} else if(this.isDown(Crafty.keys.S) || this.isDown(Crafty.keys.DOWN_ARROW)) {
				this.x += -vx * 1.5;
				this.y += -vy * 1.5;
			}
			
			//check for collision with houses
			var collision = this.hit("Solid"),
				item;
				
			if(collision) {
				item = collision[0];
				
				this.x += Math.ceil(item.normal.x * -item.overlap);
				this.y += Math.ceil(item.normal.y * -item.overlap);
			}
			
		}).bind("KeyDown", function(e) {
			if(e.keyCode === Crafty.keys.ENTER || e.keyCode === Crafty.keys.F) {
				
				var search = this.mbr(),
					results = Crafty.map.search({
						_x: search._x - 20,
						_y: search._y - 20,
						_w: search._w + 20,
						_h: search._h + 20,
					}, true),
					i = 0, l = results.length;
				
				//loop over entities search for the first car				
				for(;i < l;++i) {
					if(results[i].has("Car")) {
						CURRENT = results[i];
						results[i]._active = true;
						this._active = false;
						this.visible = false;
						LAST = e.timeStamp;
						
						break;
					}
				}
			}
		});
		
		CURRENT = me;
		
		Crafty.addEvent(this, "mousemove", function(e) {
			var pos = Crafty.DOM.translate(e.clientX, e.clientY);
			me.rotation = ~~(Math.atan2(pos.y - me._y, pos.x - me._x) * (180 / Math.PI)) + 90;
		});
		
		car = Crafty.e("2D, Canvas, car_player, Car").attr({x: 500, y: 200});
		
		//Global viewport scrolling
		Crafty.bind("EnterFrame", function() {
			if(!CURRENT) return;
			
			//position of the viewport
			var vpx = (CURRENT._x - HW),
				vpy = (CURRENT._y - HH);
			
			//Max x in map * 32 - Crafty.viewport.width = 1164
			if(vpx > 0 && vpx < 1196) {
				Crafty.viewport.x = -vpx;
			}
			
			if(vpy > 0 && vpy < 368) {
				Crafty.viewport.y = -vpy;
			}
		});
	};

	Crafty.c("Car", {
		_speed: 0,
		_active: false,
		_maxSpeed: 8,
		_handling: 0.8,
		_acceleration: 0.15,
		
		init: function() {
			this.addComponent("Keyboard, Solid, Collision").origin("center");
			this.collision(new Crafty.polygon([[2,12],[7,5],[16,2],[27,7],[30,13],[29,42],[29,56],[24,65],[7,64],[1,56],[3,39],[2,20]]));
			
			this.bind("EnterFrame", function() {
				if(!this._active) return;
				var slide = 0;
				
				//forward
				if(this.isDown(Crafty.keys.W)) {
					this._speed += this._acceleration;
				}
				
				//decay speed
				this._speed = this._speed * 0.98;
				
				//reverse
				if(this.isDown(Crafty.keys.S)) {
					this._speed -= this._acceleration;
				}
				
				//handbrake
				if(this.isDown(Crafty.keys.SPACE)) {
					this._speed -= this._speed / 20;
					if(this._speed > this._maxSpeed / 2) slide = this._speed * 0.8;
				}
				
				//turning
				if(this.isDown(Crafty.keys.A)) {
					this.rotation -= this._speed * this._handling + slide;
				}
				
				if(this.isDown(Crafty.keys.D)) {
					this.rotation += this._speed * this._handling + slide;
				}
				
				//cap the values of the car
				if(this._speed > this._maxSpeed) {
					this._speed = this._maxSpeed;
				}
				if(this._speed < -2) {
					this._speed = -2;
				}
				
				this.x += Math.sin(this._rotation * Math.PI / 180) * this._speed;
				this.y += Math.cos(this._rotation * Math.PI / 180) * -this._speed;
				
				//check for collision with houses
				var collision = this.hit("Solid"),
					item, diff, length,
					normal = {x: 0, y: 0};
					
				if(collision) {
					item = collision[0];
					
					normal.x = Math.sin(this._rotation * Math.PI / 180);
					normal.y = Math.cos(this._rotation * Math.PI / 180);
					diff = Math.sqrt(Math.pow(Math.abs(normal.x - item.normal.x), 2) * Math.pow(Math.abs(normal.y - item.normal.y), 2));
					
					//slow down based on the difference between directions
					this._speed = diff;
					
					this.x += Math.ceil(item.normal.x * -item.overlap);
					this.y += Math.ceil(item.normal.y * -item.overlap);
					
				}
			}).bind("KeyDown", function(e) {
				//already processed this key event
				if(LAST === e.timeStamp || !this._active) return;
				
				if(e.keyCode === Crafty.keys.F || e.keyCode === Crafty.keys.ENTER) {
					
					if(Math.abs(this._speed) < 1) {
						this._active = false;
						
						me.visible = true;
						me._active = true;
						me.x = this._x;
						me.y = this._y;
						CURRENT = me;
					}
				}
			});
		}
	});
};



function initMap() {
	for(var obj in MAP) {
		var pos = obj.split(",");
		ENTS[obj] = Crafty.e("2D, Canvas, "+MAP[obj]).attr({x: pos[0] * 32, y: pos[1] * 32});
		
		//make houses solid
		if(MAP[obj].substr(0, 5) === "house") {
			ENTS[obj].addComponent("Solid, Collision").collision();
		}
	}
}