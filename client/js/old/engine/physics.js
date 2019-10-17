function newPhysicsEngine(){
	var p_e = {
		tiles: 0, tile_width: 0, tile_height: 0,
		bodies: new Array(), collidable_bodies: new Array(),
		ingnore_collide: false,
		init: function(tiles, tileWidth, tileHeight, mapWidth, mapHeight){
			p_e.tiles = tiles;
			p_e.tile_width = tileWidth;
			p_e.tile_height = tileHeight;
			p_e.map_width = mapWidth;
			p_e.map_height = mapHeight;
		},
		to_unit: function(i, unit){
			return Math.floor(i/ unit) * unit
		},
		collide: function(){
			for(var i=0, l=p_e.collidable_bodies_length; i<l; i++){
				var body1 = p_e.collidable_bodies[i];
				if(body1.ingnore_collide)
						continue;
				for(var j=i+1; j<l; j++){
					var body2 = p_e.collidable_bodies[j]
					if(body2.ingnore_collide)
						continue;
					var  x = body1.x - body2.x,
							y = body1.y - body2.y,
							slength = x*x+y*y,
							length = Math.sqrt(slength),
							target = body1.width + body2.width;

					if(length < target){
						var factor = (length-target)/length;
						body1.x -= x*factor*0.5;
						body1.y -= y*factor*0.5;
						body2.x += x*factor*0.5;
						body2.y += y*factor*0.5;
					}
				}
			}
		},
		barrier_collide_x: function (body, x, y){
          	var to_y = body.y+body.height,
          		this_y = y,
				this_x = (body.dx > 0) ? p_e.to_unit(x+body.width, p_e.tile_width) : x
          	do{
            	p_e.tiles[this_x][this_y].darker = 0.4;
            	if(p_e.tiles[this_x][this_y].physicsID != 0){
              		body.setX(body.dx >= 0 ? this_x-p_e.tile_width:this_x+p_e.tile_width);
              		return true;
            	}
          	}while((this_y += p_e.tile_height) < to_y)
          	return false;
        },
    	barrier_collide_y: function (body, x, y){
          	var to_x = body.x+body.width,
          		this_x = x,
          		this_y = (body.dy < 0) ? p_e.to_unit(y+body.height,p_e.tile_height) : y;
          	do{
            	p_e.tiles[this_x][this_y].darker = 0.4;
            	if(p_e.tiles[this_x][this_y].physicsID != 0){
              		body.setY(body.dy >= 0 ? this_y+p_e.tile_height:this_y-p_e.tile_height);
              		return true;
            	}
          	}while((this_x += p_e.tile_width) < to_x)
          	return false;
        },
		barrier_collide: function(delta){
			var i = p_e.collidable_bodies_length
			while(i--){
				var body = p_e.collidable_bodies[i],
		            x = p_e.to_unit(body.x, p_e.tile_width),
		            y = p_e.to_unit(body.y, p_e.tile_height);
		        if(Math.abs(body.dx) > Math.abs(body.dy)){
		        	p_e.barrier_collide_x(body,x,y);
		        	p_e.barrier_collide_y(body,x,y);
		        }else{
		        	p_e.barrier_collide_y(body,x,y);
		        	p_e.barrier_collide_x(body,x,y);
		        }
			}
		},
		border_collide: function(){
			var i = p_e.collidable_bodies_length
			while(i--){
				var body = p_e.collidable_bodies[i],
					width = body.width,
					height = body.height,
					x = body.x,
					y = body.y;

				if(x < 0){
					body.x = 0;
				}else if(x + width > p_e.map_width){
					body.x = p_e.map_width - (width+0.01);
				}
				if(y < 0){
					body.y = 0;
				}else if(y + height > p_e.map_height){
					body.y = p_e.map_height-(height+0.01);
				}
			}
		},
		gravity: function(){
			var i = p_e.bodies_length
			while(i--){
				p_e.bodies[i].dx *= p_e.bodies[i].decay;
				p_e.bodies[i].dy *= p_e.bodies[i].decay;
			}
		},
		accelerate: function(delta){
			var i = p_e.bodies_length
			while(i--){
				p_e.bodies[i].accelerate(delta);
			}
		},
		inertia: function(delta){
			var i = p_e.bodies_length
			while(i--){
				p_e.bodies[i].inertia(delta);
			}
		},
	    update: function(){
			var i = p_e.bodies_length
			while(i--){
	        	if(p_e.bodies[i].update)
	          		p_e.bodies[i].update();
				}
			},
		integrate: function(delta){
			p_e.gravity();
			p_e.accelerate(delta);
			p_e.collide();
			p_e.border_collide();
			p_e.barrier_collide(delta);
			p_e.inertia(delta);
			p_e.update();
		},
		add_actor: function(actor, x, y, width, height, ingnore_collide){
			var body = Body(x, y, width, height);
			$.extend(actor, body);
			p_e.bodies.push(actor)
	      	if(!ingnore_collide)
	        	p_e.collidable_bodies.push(actor)
			p_e.bodies_length = p_e.bodies.length
			p_e.collidable_bodies_length = p_e.collidable_bodies.length
		}
	}
	return p_e;
}
function Body(x, y, width, height){
  var body = {
      x: x, y: y, px: x, py: y, dx: 0, dy: 0,
      width: width, height: height,
      decay: 0.97,
      setX: function(x){
        this.px = x;
        this.x = x;
      },
      setY: function(y){
        this.py = y;
        this.y = y;
      },
      accelerate: function(delta){
        if(this.director){
          this.dx = this.director.dx; 
          this.dy = this.director.dy;
        }
        this.x += this.dx * delta * delta;
        this.y -= this.dy * delta * delta;	
      },
      inertia: function(delta){
        var diffx = this.x - this.px;
        var diffy = this.y - this.py;
        this.px = this.x;
        this.py = this.y;
        this.x += diffx * this.decay;
        this.y += diffy * this.decay;
      }
    }
    return body;
}