/*
	Lightweight Tile Engine For HTML5 Game Creation
    Copyright (C) 2010  John Graham
	Copyright (C) 2011  Tim Anema

    This program is free software: you can redistribute it and/or modify
    it under the terms of the GNU General Public License as published by
    the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.

    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU General Public License for more details.

    You should have received a copy of the GNU General Public License
    along with this program.  If not, see <http://www.gnu.org/licenses/>.
*/

function newTileEngine(){
	var TileEngine = { //main canvas and demo container
		canvas: 0, //main canvas object
		ctx: 0, //main canvas drawing context
		tiles: new Array(), //double dimenal array by coordinates
		zones: new Array(), //array of tile zones
		tileSource: 0, //array of tile source objects, one for each unique tile
		tileSourcesHash: {},
		width: 0, //width of tile map
		height: 0,  //height of tile map
		zoneTilesWide: 0, //width in tiles of a zone
		zoneTilesHigh: 0,  //height in tiles of a zone
		tilesHigh: 0, //height in tiles of entire map
		tilesWide: 0, //width in tiles of entire map
		tileWidth: 0, //width in pixels single tile
		tileHeight: 0, //height in pixels of single tile
		mapWidth: 0,
		mapHeight: 0,
		sprites: new Array(),
		main_sprite: 0,
		mouse: newMouse(),
		keyboard: newKeyboard(),
		physics_engine: newPhysicsEngine(),
		timeofDay: 0.2,
		view : 0,
		active_controller: 0,
		t: 0.0,
		dt: 0.01,
		currentTime: (new Date).getTime(),
		accumulator: 0.0,
	    gameTimer: 0, //holds id of main game timer
	    fps: 60,
	    fps_count: 0, //hold frame count
	    fps_timer: 0, //timer for FPS update (2 sec)
		
		init: function(){ //initialize experiment
      		if(!TileEngine.view)
				alert("please set map attributes before initializing tile engine");
			TileEngine.mouse.init(TileEngine.canvas)
			TileEngine.keyboard.init(TileEngine.canvas)
			TileEngine.physics_engine.init(TileEngine.tiles, TileEngine.tileWidth, TileEngine.tileHeight,TileEngine.mapWidth, TileEngine.mapHeight)
      		TileEngine.view.init(TileEngine.mouse, TileEngine.main_sprite, TileEngine.isKeyBoardActive);
			
	        //Active controller handling
	        $(TileEngine.canvas).mouseup(function(event){TileEngine.ctx_click = true;})
			$(document).keydown(function(event){if(TileEngine._focus)TileEngine.active_controller = TileEngine.keyboard})
		                .mousedown(function(event){TileEngine.active_controller = TileEngine.mouse;TileEngine.doc_click = true;})
		                .mouseup(function(event){TileEngine._focus = TileEngine.ctx_click && TileEngine.doc_click;TileEngine.doc_click = TileEngine.ctx_click = false;})
			Console.log("Tile Map Initialized");
		},
		start: function(){
      		Console.log("FPS limit set to: " + TileEngine.fps)
      		var interval = 1000 / TileEngine.fps;
      		TileEngine.gameTimer = setInterval(TileEngine.drawFrame, interval);
      		TileEngine.fps_timer = setInterval(TileEngine.updateFPS, 2000);
    	},
    	updateFPS: function(){
      		TileEngine.fps = TileEngine.fps_count / 2; // every two seconds cut the fps by 2
      		TileEngine.fps_count = 0; // every two seconds cut the fps by 2
    	},
    	isKeyBoardActive: function(){return TileEngine.active_controller == TileEngine.keyboard},
    	isMouseActive: function(){return TileEngine.active_controller == TileEngine.mouse},
		setMapAttributes: function(obj){ //this function must be called prior to initializing tile engine
			TileEngine.canvas = obj.canvas;  //get canvas element from html
			TileEngine.ctx = obj.ctx; //create main drawing canvas
			TileEngine.width  = TileEngine.canvas.width;
			TileEngine.height = TileEngine.canvas.height;
			TileEngine.tileWidth = obj.tileWidth;
			TileEngine.tileHeight = obj.tileHeight;
			TileEngine.zoneTilesWide = obj.zoneTilesWide;
			TileEngine.zoneTilesHigh = obj.zoneTilesHigh;
			TileEngine.tilesWide = obj.tilesWide;
			TileEngine.tilesHigh = obj.tilesHigh;
			TileEngine.mapWidth = TileEngine.tilesWide*TileEngine.tileWidth
			TileEngine.mapHeight = TileEngine.tilesHigh*TileEngine.tileHeight
			TileEngine.view = newView(obj.init_x,obj.init_y, TileEngine.width, TileEngine.height, TileEngine.mapWidth,TileEngine.mapHeight);
      		TileEngine.physics_engine.add_actor(TileEngine.view, obj.init_x, obj.init_y, TileEngine.width, TileEngine.height, true);
			
			Console.log(obj.sourceTileCounts + ' Source Tiles to Load');
			Console.log(obj.tilesArray.length + ' Map Tiles to Load');
			
			var source = newSourceImage();  
			source.init(obj.sourceFile);
			source.image.onload = function(){  //event handler for image load 
				TileEngine.tileSource = TileEngine.createTileSource(obj.tileWidth, obj.tileHeight, obj.sourceTileCounts, obj.sourceTileAccross, obj.tile_offset_x || 0, obj.tile_offset_y || 0, source);	//create tile sources using image source		
			}
			TileEngine.createZones();  //create zones
			TileEngine.createTiles(obj.tilesArray, obj.physicsArray);
		},
		setMainSpriteAttributes: function(obj){TileEngine.main_sprite = TileEngine.addSprite(obj, TileEngine.keyboard)},
    	addSprite: function(obj, director){
      		var sprite = newSprite(TileEngine.mapWidth,TileEngine.mapHeight, TileEngine.ctx);
      		sprite.init(obj.init_x, obj.init_y, obj.width, obj.height, obj.movement_hash, director)
			TileEngine.physics_engine.add_actor(sprite, obj.init_x, obj.init_y, obj.width, obj.height);
      		var source = newSourceImage();  
			source.init(obj.sourceFile);
			source.image.onload = function(){  //event handler for image load 
				sprite.spriteSource = TileEngine.createTileSource(obj.width, obj.height, obj.sourceTileCounts, obj.sourceTileAccross, obj.tile_offset_x || 0, obj.tile_offset_y || 0, source);	//create tile sources using image source		
			}
      		TileEngine.sprites.push(sprite)
      		return sprite;
    	},
		integrator: function(t,dt){		
			var newTime = (new Date).getTime(),
				deltaTime = (newTime - TileEngine.currentTime)/100
			if(deltaTime > 0.25)
				deltaTime = 0.25
			TileEngine.currentTime = newTime;
			TileEngine.accumulator += deltaTime;
			while(TileEngine.accumulator >= TileEngine.dt) {
				TileEngine.accumulator -= TileEngine.dt;
				TileEngine.physics_engine.integrate(TileEngine.dt)
				TileEngine.t += TileEngine.dt;
			}
			TileEngine.active_controller ? TileEngine.active_controller.update():TileEngine.view.update();
		},
		drawFrame: function(){ //main drawing function
			//physics
			TileEngine.integrator();
			//clear main canvas
			TileEngine.ctx.clearRect(0, 0, TileEngine.width, TileEngine.height);  
			//draw()
      		TileEngine.render(TileEngine.view);
      		TileEngine.fps_count++;  //increments frame for fps display
		},
		render: function(view){
			var i = TileEngine.zones.length,
					validZones = new Array();
			//base map
			while(i--){
				var check_zone = TileEngine.zones[i];
				if(view.isInView(check_zone)){
					validZones.push(check_zone);
					check_zone.drawTiles(view);
					TileEngine.ctx.drawImage(check_zone.base_canvas, Math.round(check_zone.x-view.x), Math.round(check_zone.y-view.y));
				} 
			}
			
			//sprites
			i = TileEngine.sprites.length
			while(i--)
				TileEngine.sprites[i].draw(view)
			
			//decorations
			i = validZones.length;
			while(i--){
				var check_zone = validZones[i];
				check_zone.drawDecorations(view);
				TileEngine.ctx.drawImage(check_zone.dec_canvas, check_zone.x-view.x, check_zone.y-view.y);
			}

			//do brightness of the screen
			TileEngine.ctx.fillStyle = "rgba(0, 0, 0," + TileEngine.timeofDay + ")";    
			TileEngine.ctx.fillRect(0, 0, TileEngine.width, TileEngine.height);
		},
		createTileSource: function(tileWidth, tileHeight, count, accross, offset_x, offset_y, source){ //create tiles sources
			if(TileEngine.tileSourcesHash[source.imageFilename])
				return TileEngine.tileSourcesHash[source.imageFilename]

			var source_array = new Array(),
				accross_count = 0,x = 0,y = 0,
				offset_x_count = 0, offset_y_count = 0;
			
			for(var i = 0; i < count; i++){
				var new_tileSource = newTileSource();
				new_tileSource.init(tileWidth, tileHeight,x+(offset_x*offset_x_count), y+(offset_y*offset_y_count), source);
				source_array.push(new_tileSource);
				accross_count++;
				x += tileWidth;
				offset_x_count++;
				if(accross_count >= accross){
					accross_count = 0;
					y += tileHeight;
					x = 0;
					offset_y_count++;
					offset_x_count = 0;
				}
			}
			//save in the hash that way two file are not needed 
			TileEngine.tileSourcesHash[source.imageFilename] = source_array;
			return TileEngine.tileSourcesHash[source.imageFilename];
		},

		createTiles: function(tilesArray, physicsArray) { //load tile array
			var tile_index = 0;  //track current position in tile array
			var y_zone = 0; //used to determine which zone to add tile to
			var x_zone = 0; //used to determine which zone to add tile to
			var zone_index = 0; //track current position in zone array
			var zone_wide = Math.ceil(TileEngine.tilesWide/TileEngine.zoneTilesWide); //how many zones are there horizontally
			
			function getX(index){return TileEngine.tileWidth * (index % TileEngine.tilesWide)}
			function getY(index){return TileEngine.tileHeight * parseInt(index / TileEngine.tilesWide)}

			for(var h = 0, hh = TileEngine.tilesHigh; h < hh; h++)
			{
				y_zone = Math.floor(h/TileEngine.zoneTilesHigh); //calculate which vertical zone we are in
				for(var i = 0, ii = TileEngine.tilesWide; i < ii; i++){ //cycle through each row
					if(!TileEngine.tiles[i*TileEngine.tileWidth])//if this x array is not initialized yet
						TileEngine.tiles[i*TileEngine.tileWidth] = new Array();

					x_zone = Math.floor(i/TileEngine.zoneTilesWide);// calculate which horizontal zone we are in
					
					var new_tile = newTile(); //create new tile object

					new_tile.init(getX(tile_index), getY(tile_index), TileEngine.tileWidth, TileEngine.tileHeight, tilesArray[tile_index], physicsArray[tile_index]); //init tile
					zone_index = (y_zone * zone_wide) + x_zone;//find what zone to add to using vert and horizontal positions
					
					TileEngine.zones[zone_index].addTile(new_tile); //add tile to zone
					TileEngine.tiles[new_tile.x][new_tile.y] = new_tile; //add tile to tile engine
					
					tile_index++;
				}
				 x_zone = 0; //reset horizontal position when we loop to new row
			}

			Console.log("Tiles Ready");
		},
		createZones: function(){//create array of zones for map
			//caluculate how many zones we need (width by height)
			var zone_wide = Math.ceil(TileEngine.tilesWide/TileEngine.zoneTilesWide),
				zone_high = Math.ceil(TileEngine.tilesHigh/TileEngine.zoneTilesHigh);

			/*these are used if tilemap is not evenly divisible by size of zones in tiles
			**they are used to define the size of zones on the right and bottom edges of the
			**map */
			var x_remainder = TileEngine.tilesWide%TileEngine.zoneTilesWide,
				y_remainder = TileEngine.tilesHigh%TileEngine.zoneTilesHigh;
			
			for(var h = 0; h < zone_high; h++){ //loop through zone rows
				for(var i = 0; i < zone_wide; i++){ //loop through zone columns
					var new_zone = newZone(), //create new zone
						x = i * TileEngine.zoneTilesWide * TileEngine.tileWidth, //set x pos of new zone
						y = h * TileEngine.zoneTilesHigh * TileEngine.tileHeight, //set y pos of new zone
						width = TileEngine.zoneTilesWide * TileEngine.tileWidth, //set width of new zone
						height = TileEngine.zoneTilesHigh * TileEngine.tileHeight, //set height of new zone
						tiles_wide = TileEngine.zoneTilesWide, //set tiles wide for new zone
						tiles_high = TileEngine.zoneTilesHigh; //set tiles high for new zone

					if(i == (zone_wide - 1) && x_remainder > 0){  //if is last zone on horizontal row and tiles divide unevenly into zones
						tiles_wide = x_remainder; //change new zone tiles wide to be correct
						width = tiles_wide * TileEngine.tileWidth;  //change new zone width to be correct
					}
					if(h == (zone_high - 1) && y_remainder > 0){ //if last zones on bottom and tiles divide unevenly into zones
						tiles_high = y_remainder; //adjust tiles high
						height = tiles_high * TileEngine.tileHeight; //adjust zone height
					}
					
					new_zone.init(TileEngine, x, y, TileEngine.tileWidth, TileEngine.tileHeight, width, height); //intitialize new zone
					TileEngine.zones.push(new_zone); //push zone to tile engine array
				}
			}	
		}
	}
	
  	Console.init();
  	if(CanvasSupport.check_canvas()){  //check canvas support before intializing
    	return TileEngine;
  	}
  	else {
    	Console.log('Your Browser Does not support this app!');	
    	return false;
  	}
};

function newSourceImage(){ //image used to create tile 
	var SourceImage = {
		imageFilename: 0, //filename for image
		image: 0, //dom image object
		init: function(file){
			SourceImage.imageFilename = file;
			SourceImage.image = new Image();  //create new image object
			SourceImage.image.src = file; //load file into image object
		}
	};
	return SourceImage;
}

/*** function to create and then return a new Tile object */
function newTile(){
	var Tile = {
		x: 0, // X and Y position of this tile
		y: 0, //
		local_x:0, //local x and y of thier position within thier zones
		local_y:0,
		width: 0,
		height: 0,
		baseSourceIndex: 0, //index of tile source in tile engine's source array
		decorationIndex: 0, //index of secondary layer 
		physicsID: 0, //physics type
		darker: 0, // mostly for debug but also for cool effect later maybe!
		init: function(x, y, width, height, source_index, physics_id){ //initialize sprite
			Tile.x = x;
			Tile.y = y;
			Tile.width = width;
			Tile.height = height;
			var sourceNumbers = getBytes(source_index);
			Tile.baseSourceIndex = sourceNumbers[1]; // set index of tile source for this tile
			Tile.decorationIndex = sourceNumbers[0]; 
			Tile.physicsID = physics_id || 0; 
		}
	};
	return Tile;  //returns newly created sprite object
};

function newTileSource(){ //image used to create tile 
	var TileSource = {
		canvas: 0, //main canvas object
		ctx: 0, //main canvas drawing context
		sourceImage: 0, //image source for this tile
		init: function(width, height, src_x, src_y, source){
			TileSource.sourceImage = source;  //set image source
			TileSource.canvas = document.createElement('canvas');
			TileSource.ctx = TileSource.canvas.getContext('2d'); //create main drawing canvas
			TileSource.canvas.setAttribute('width', width); //set tile source canvas size
			TileSource.canvas.setAttribute('height', height);
			TileSource.ctx.drawImage(TileSource.sourceImage.image, src_x, src_y, width, height, 0, 0, width, height); //draw image to tile source canvas
		}
	};
	return TileSource;
};


function newZone(){
	var Zone = {
		base_canvas: 0, //zone canvas object
		dec_canvas: 0, //zone canvas object
		tileEngine: 0, //the main tile engine object (used to fetch tile sources)
		base_ctx: 0, //zone canvas drawing context
		dec_ctx: 0, //zone canvas drawing context
		left: 0, //x position of this zone in the tile map
		top: 0, //y position of this zone in the tile map
		right: 0, //x position of right edge
		bottom: 0, //y position of bottom edge
		tileWidth: 0,
		tileHeight: 0,
		width: 0,
		height: 0,
		x: 0,
		y: 0,
		viewoffset: 0,
		tiles: 0, //array of tiles in this zone
		init: function(engine, left, top, tileWidth, tileHeight, width, height){
			Zone.tileEngine = engine;
			Zone.left = Zone.x = left;
			Zone.top = Zone.y = top;
			Zone.right = left + width;
			Zone.bottom = top + height;
			Zone.tileWidth = tileWidth;
			Zone.tileHeight = tileHeight;
			Zone.width = width;
			Zone.height = height;
			Zone.base_canvas = document.createElement('canvas');
			Zone.base_ctx = Zone.base_canvas.getContext('2d'); //create main drawing canvas
      		Zone.dec_canvas = document.createElement('canvas');
			Zone.dec_ctx = Zone.dec_canvas.getContext('2d'); //create main drawing canvas
			Zone.base_canvas.setAttribute('width', width); //set tile source canvas size
			Zone.base_canvas.setAttribute('height', height);
      		Zone.dec_canvas.setAttribute('width', width); //set tile source canvas size
			Zone.dec_canvas.setAttribute('height', height);
			Zone.tiles = new Array();
		},
		getX: function (index){return Zone.tileWidth * (index % (Zone.width / Zone.tileWidth))},
		getY: function (index){return Zone.tileHeight * parseInt(index / (Zone.height / Zone.tileWidth))},
		addTile: function(tile){
			var index = Zone.tiles.push(tile) - 1;	
			tile.local_x = Zone.getX(index);
			tile.local_y = Zone.getY(index);
		},
		drawTiles: function(view){
			Zone.base_ctx.clearRect(0,0,Zone.width, Zone.height);
			if(Zone.tiles){
				var i = Zone.tiles.length;
				while(i--){
					var check_tile = Zone.tiles[i];
					if(view.isInView(check_tile) && Zone.tileEngine.tileSource[check_tile.baseSourceIndex]){
						Zone.base_ctx.drawImage(Zone.tileEngine.tileSource[check_tile.baseSourceIndex].canvas, check_tile.local_x, check_tile.local_y); //draw tile based on its source index and position
					}
					if(check_tile.darker != 0){
						Zone.base_ctx.fillStyle = "rgba(0,0,0," + check_tile.darker + ")";    
						Zone.base_ctx.fillRect(check_tile.local_x,check_tile.local_y,Zone.tileWidth, Zone.tileHeight);
						check_tile.darker = 0;
					}
				}
			}
		},
		drawDecorations: function(view){
			Zone.dec_ctx.clearRect(0,0,Zone.width, Zone.height);
			if(Zone.tiles){
				var i = Zone.tiles.length;
				while(i--){
					var check_tile = Zone.tiles[i];
					//decoration cannot be at tile 0
					if(check_tile.decorationIndex != 0 && view.isInView(check_tile) && Zone.tileEngine.tileSource[check_tile.decorationIndex]){
						Zone.dec_ctx.drawImage(Zone.tileEngine.tileSource[check_tile.decorationIndex].canvas, check_tile.local_x, check_tile.local_y); //draw tile based on its source index and position
          			}
				}
			}
		}
	};
	return Zone;
}
//function to detect canvas support by alterebro (http://code.google.com/p/browser-canvas-support/)
var CanvasSupport = {
	canvas_compatible : false,
	check_canvas : function() {
		try {
			CanvasSupport.canvas_compatible = !!(document.createElement('canvas').getContext('2d')); // S60
		} catch(e) {
			CanvasSupport.canvas_compatible = !!(document.createElement('canvas').getContext); // IE
		} 
		return CanvasSupport.canvas_compatible;
	}
} 

function newView(x, y, width, height, mapWidth, mapHeight){
	var view = {
		x:x || 0,y:y || 0,viewWidth: 0,	viewHeight: 0,
    director: null, xoffset: 0, yoffset: 0, isControllingSprite: 0,
    main_sprite: 0,
		init: function(dir, main_sprite, isControllingSprite){
      view.director = dir;
      view.main_sprite = main_sprite;
      view.isControllingSprite = isControllingSprite;
      view.decay = 0.97; //override decay
      view.update();
		},
		update : function(){
      if(view.isControllingSprite()){
        view.x = view.x+(view.main_sprite.x - (view.x + width/2)) * 0.05
        view.y = view.y+(view.main_sprite.y - (view.y + height/2)) * 0.05
      }
      
      if((view.x+width) > mapWidth){
        view.x = mapWidth-width;
      }else if(view.x < 0){
        view.x = 0;
      }
      if((view.y+height) > mapHeight){
        view.y = mapHeight-height;
      }else if(view.y < 0){
        view.y = 0
      }
        
      view.viewWidth = view.x + width;
      view.viewHeight = view.y + height;
		},
		isInView: function(check){
			return (check.x+check.width > this.x && check.x <= this.viewWidth)&&(check.y+check.height > this.y && check.y <= this.viewHeight)
		},
		up: function(){
			var v = $.extend({}, this);
			if(v.y < 0){
				v.y += mapHeight;
				v.viewHeight = mapHeight;//no need to do the extra calc for the actual width
				v.yoffset = -mapHeight;
			}
			return v;
		},
		down: function(){ 
			var v = $.extend({}, this);
			if(v.viewHeight > mapHeight){
				v.y = 0
				v.viewHeight -= mapHeight;
				v.yoffset = mapHeight;
			}
			return v;
		},
		left: function(){ 
			var v = $.extend({}, this);
			if(v.x < 0){
				v.x += mapWidth;
				v.viewWidth = mapWidth;//no need to do the extra calc for the actual width
				v.xoffset = -mapWidth;
			}
			return v;
		},
	  right: function(){ 
			var v = $.extend({}, this);
			if(v.viewWidth > mapWidth){
				v.x = 0
				v.viewWidth -= mapWidth;
				v.xoffset = mapWidth;
			}
			return v;
		}
	}
	return view;
}

function newSprite(mapWidth, mapHeight, ctx){
	var Sprite = {
		sourceHash: 0,current_index:0, current_direction: 0, director: null,
		init: function(x, y, width, height, sourceHash, director){ //initialize sprite
			Sprite.director = director;
			Sprite.sourceHash = sourceHash;
			Sprite.current_direction = Sprite.sourceHash.down
      		setInterval(Sprite.update_index, 100)
		},
		update: function(){
			if(Sprite.dx > 1)
				Sprite.current_direction = Sprite.sourceHash.right
			if(Sprite.dx < -1)
				Sprite.current_direction = Sprite.sourceHash.left
			if(Sprite.dy > 1)
				Sprite.current_direction = Sprite.sourceHash.up
			if(Sprite.dy < -1)
				Sprite.current_direction = Sprite.sourceHash.down
		},
		current_frame: function(){
			return Sprite.current_direction[Sprite.current_index];
		},
		update_index: function(){
			if(Sprite.dx > 1 || Sprite.dx < -1 || Sprite.dy > 1 || Sprite.dy < -1){
        		Sprite.current_index++;
        	if(Sprite.current_index >= Sprite.current_direction.length)
          		Sprite.current_index = 0
      	}
		},
		draw: function(view, views){
			if(views){
				var v = views.length;
				while(v--){
					var currentView = views[v];
					if(Sprite.spriteSource && currentView.isInView(Sprite)){
						ctx.drawImage(Sprite.spriteSource[Sprite.current_frame()].canvas, (Sprite.x+currentView.xoffset)-view.x, (Sprite.y+currentView.yoffset)-view.y);
					}
				}
			}else if(Sprite.spriteSource && view.isInView(Sprite)){
						//console.log(currentView);
				try{
				ctx.drawImage(Sprite.spriteSource[Sprite.current_frame()].canvas, Sprite.x-view.x, Sprite.y-view.y);
				} catch (e){
						console.log(Sprite.current_frame());
				}
			}
		}
	};
	return Sprite;  //returns newly created sprite object
}

function newMouse(){
	var Mouse = {
			down: false,offsetx: 0,offsety: 0,timer: 0,accelx: 0,accely: 0,
			clickposx: 0,clickposy: 0,dx: 0,dy:0,view: 0,thrust: 10, 
      		decay: 0.97,	maxSpeed: 200,
			init: function(context) {
				$(context)
						.mousedown(Mouse.mouseDown)
						.mouseup(function()  {Mouse.down = false;})
						.mouseout(function() {Mouse.down = false;})
						.mousemove(Mouse.move);
        		setInterval(Mouse.update, 100);
			},
			isDown: function() {return Mouse.down;},
			mouseDown:function(event){
				Mouse.dx = 0;
				Mouse.dy = 0;
				Mouse.setClickPos(event)
			},
			setClickPos: function(event) { 
				Mouse.clickposx = event.screenX;
				Mouse.clickposy = event.screenY;
				Mouse.down = true;
			},
			move: function(event) {
				if (Mouse.isDown()) {
					Mouse.timer++;
					Mouse.offsetx = event.screenX - Mouse.clickposx;
					Mouse.offsety = event.screenY - Mouse.clickposy;
					Mouse.setClickPos(event);
					Mouse.accelx = Mouse.offsetx / Mouse.timer;
					Mouse.accely = Mouse.offsety / Mouse.timer;
				} else {
					Mouse.reset();
				}
			},
			reset: function() {
				Mouse.offsetx = 0;
				Mouse.offsety = 0;
				Mouse.accelx = 0;
				Mouse.accely = 0;
				Mouse.timer = 0;
			},
			update: function(){
				if (Mouse.isDown()) {
          Mouse.dx = Mouse.dx - (Mouse.accelx * Mouse.thrust);
          Mouse.dy = Mouse.dy + (Mouse.accely * Mouse.thrust);
 
          //speed limit
          var currentSpeed = Math.sqrt((Mouse.dx * Mouse.dx) + (Mouse.dy * Mouse.dy));
          if (currentSpeed > Mouse.maxSpeed){
            Mouse.dx *= Mouse.maxSpeed/currentSpeed;
            Mouse.dy *= Mouse.maxSpeed/currentSpeed;
          }
        }
        Mouse.dx *= Mouse.decay;
        Mouse.dy *= Mouse.decay;
        
				Mouse.reset();
			}
	};
	return Mouse;
}
function newKeyboard(){
	var keyboard = {
		LEFT: 37,
    RIGHT: 39,
    UP: 38,
    DOWN: 40,
    orientation: {},
    thrust: 10,	maxSpeed: 100, key_down: false,_focus:false,
    ctx_click:false, doc_click: false,
    dx: 0, dy: 0, decay: 0.97,
    init: function(context) {
      $(document).keydown(function(event){keyboard.keydown(event)})
                 .keyup(function(event){keyboard.keyup(event)})
                 
      $(context).mouseup(function(event){keyboard.ctx_click = true;})
			$(document).keydown(keyboard.keydown)
                 .keyup(keyboard.keyup)
                 .mousedown(function(event){keyboard.doc_click = true;})
                 .mouseup(function(event){keyboard._focus = keyboard.ctx_click && keyboard.doc_click;keyboard.doc_click = keyboard.ctx_click = false;})
                 
      setInterval(keyboard.update,1)
    },
    keydown: function (event){
      keyboard.orientation[event.keyCode] = keyboard._focus;
      keyboard.key_down = keyboard._focus;
    },
    keyup: function (event){
      keyboard.orientation[event.keyCode] = false;
      keyboard.key_down = false;
    },
    update: function(){
      if (keyboard.orientation[keyboard.LEFT])keyboard.dx -= keyboard.thrust;
      if (keyboard.orientation[keyboard.RIGHT])keyboard.dx += keyboard.thrust;
      if (keyboard.orientation[keyboard.UP])keyboard.dy += keyboard.thrust;
      if (keyboard.orientation[keyboard.DOWN])keyboard.dy -= keyboard.thrust;
      //speed limit
      var currentSpeed = Math.sqrt((keyboard.dx * keyboard.dx) + (keyboard.dy * keyboard.dy));
      if (currentSpeed > keyboard.maxSpeed){
        keyboard.dx *= keyboard.maxSpeed/currentSpeed;
        keyboard.dy *= keyboard.maxSpeed/currentSpeed;
      }
      keyboard.dx *= keyboard.decay;
      keyboard.dy *= keyboard.decay;
    }
	}
	return keyboard;
}
