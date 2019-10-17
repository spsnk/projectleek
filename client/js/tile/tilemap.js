/*All code copyright 2010 by John Graham unless otherwise attributed*/
//Minor changes by Jay Crossler - CC BY/3.0 license

function SourceImage(file){ //image used to create tile 
	//var SourceImage = {
		// imageFilename: 0, //filename for image
		// image: 0, //dom image object
		// is_ready: 0, //is image loaded and ready to be drawn
		// init: function(file){
	this.imageFilename = file;
	this.is_ready = false;
	this.image = new Image();  //create new image object
	this.image.src = file; //load file into image object
		// }
	// };
	// return SourceImage;
}

function TileSource(w,h,sx,sy,s){ //image used to create tile 
	//var TileSource = {
		// canvas: 0, //main canvas object
		// ctx: 0, //main canvas drawing context
		// sourceImage: 0, //image source for this tile
		// init: function(width, height, src_x, src_y, source){
	this.sourceImage = s;  //set image source
	this.canvas = document.createElement('canvas');
	this.ctx = this.canvas.getContext('2d'); //create main drawing canvas
	this.canvas.setAttribute('width', w); //set tile source canvas size
	this.canvas.setAttribute('height', h);
	this.ctx.drawImage(this.sourceImage.image, sx, sy, w, h, 0, 0, w, h); //draw image to tile source canvas
		// }
	// };
	// return TileSource;
}

/*** function to create and then return a new Tile object */
function Tile(x,y,w,h,s){
	this.x = x; // X position of this tile
	this.y = y; //Y position of this tile
	this.width = w; //width and height of this tile
	this.height = h;
	this.sourceIndex = s; //index of tile source in tile engine's source array
	//this.init: function(x, y, width, height, source){ //initialize sprite
		// Tile.x = x;
		// Tile.y = y;
		// Tile.width = width;
		// Tile.height = height;
		// Tile.sourceIndex = source; // set index of tile source for this tile
	// }
	//};
	//return Tile;  //returns newly created sprite object
};

function Zone(engine, left, top, tilesWide, tilesHigh, tileWidth, tileHeight, width, height){
	// var Zone = {
		// canvas: 0, //zone canvas object
		// tileEngine: 0, //the main tile engine object (used to fetch tile sources)
		// ctx: 0, //zone canvas drawing context
		// left: 0, //x position of this zone in the tile map
		// top: 0, //y position of this zone in the tile map
		// right: 0, //x position of right edge
		// bottom: 0, //y position of bottom edge
		// tileWidth: 0,
		// tileHeight: 0,
		// width: 0,
		// height: 0,
		// color: 0,
		// tiles: 0, //array of tiles in this zone
		// init: function(engine, left, top, tilesWide, tilesHigh, tileWidth, tileHeight, width, height){
			this.tileEngine = engine;
			this.left = left;
			this.top = top;
			this.right = left + width;
			this.bottom = top + height;
			this.tileWidth = tileWidth;
			this.tileHeight = tileHeight;
			this.width = width;
			this.height = height;
			this.canvas = document.createElement('canvas');
			this.ctx = this.canvas.getContext('2d'); //create main drawing canvas
			this.canvas.setAttribute('width', width); //set tile source canvas size
			this.canvas.setAttribute('height', height);
			this.tiles = new Array();
			
			var r = Math.floor(Math.random() * 255);
			var g =  Math.floor(Math.random() * 255);
			var b =  Math.floor(Math.random() * 255);
			this.color = "rgba(" + r + "," + g + "," + b + ",.6)";
//},
	}
Zone.prototype.addTile = function(tile){
		//addTile: function(tile){
	this.tiles.push(tile);	
}//,
Zone.prototype.arrangeTiles = function(){
		//arrangeTiles: function(){
	var tiles_wide = this.width / this.tileWidth;
	var tiles_high = this.height / this.tileHeight;
	var index = 0;
	for(var i = 0; i < tiles_high; i++) {
		for(var j = 0; j < tiles_wide; j++) {
			this.tiles[index].x = j * this.tileWidth;
			this.tiles[index].y = i * this.tileHeight;
			index++;
		}
	}
}//,
Zone.prototype.drawTiles = function(viewX, viewY, viewWidth, viewHeight){
		//drawTiles: function(viewX, viewY, viewWidth, viewHeight){
	this.ctx.clearRect(0,0,this.width, this.height);//clear main canvas
	if(this.tiles){
		var drawTiles = new Array(); //array to hold only the tiles we are drawing
		var x = viewX;
		var y = viewY;
		var width = viewWidth; 
		var height = viewHeight;
		for(var i = 0, ii = this.tiles.length; i < ii; i++){
			var check_tile = this.tiles[i];
						
			//check to see if each tile is outside the viewport
			if((check_tile.x >= width || check_tile.y >= height) ||((check_tile.x + check_tile.width) < x || (check_tile.y + check_tile.height < y))){
				continue;//if it's outside, loop again	
			}
			else{
				drawTiles.push(check_tile);	//if it's inside add it to be drawn
			}
		}
		//now loop through and draw only what needs to be drawn
		for(var j = 0, jj = drawTiles.length; j < jj; j++){
			var tile = drawTiles[j];
			if(this.tileEngine.tileSource[tile.sourceIndex]){
				this.ctx.drawImage(this.tileEngine.tileSource[tile.sourceIndex].canvas, tile.x, tile.y); //draw tile based on its source index and position					
			}
		}
	}
//Added check for optional colors
	// if(Game.tileEngine.showZoneColors) {
		// this.ctx.fillStyle = this.color;    
		// this.ctx.fillRect(0,0,this.width, this.height);
	// }
}
	//};
	// return Zone;
//}
	

function TileEngine(canvasId,map){
	//var TileEngine = { //main canvas and demo container
		// canvas: 0, //main canvas object
		// ctx: 0, //main canvas drawing context
		// tiles: 0, //array of tiles
		// zones: 0, //array of tile zones
		// sources: 0, //array of source images
		// tileSource: 0, //array of tile source objects, one for each unique tile
		// width: 0, //width of tile map
		// height: 0,  //height of tile map
		// zoneTilesWide: 0, //width in tiles of a zone
		// zoneTilesHigh: 0,  //height in tiles of a zone
		// tilesHigh: 0, //height in tiles of entire map
		// tilesWide: 0, //width in tiles of entire map
		// tileWidth: 0, //width in pixels single tile
		// tileHeight: 0, //height in pixels of single tile
		// layerName: "no name",
		// sourceFiles: 0,
		// sourceTileCounts: 0,
		// sourceTileAcross: 0,
		// tileOffsetX: 0,
		// tileOffsetY: 0,
		// tilesArray: 0,
		// showZoneColors: 0,
		//init: function(){ //initialize experiment
	this.canvas = 0; //main canvas object
	this.ctx = 0; //main canvas drawing context
	this.tiles = 0; //array of tiles
	this.zones = 0; //array of tile zones
	this.sources = 0; //array of source images
	this.tileSource = 0; //array of tile source objects, one for each unique tile
	this.width = 0; //width of tile map
	this.height = 0;  //height of tile map
	this.zoneTilesWide = 0; //width in tiles of a zone
	this.zoneTilesHigh = 0;  //height in tiles of a zone
	this.tilesHigh = 0; //height in tiles of entire map
	this.tilesWide = 0; //width in tiles of entire map
	this.tileWidth = 0; //width in pixels single tile
	this.tileHeight = 0; //height in pixels of single tile
	this.layerName = "no name";
	this.sourceFiles= 0;
	this.sourceTileCounts = 0;
	this.sourceTileAcross = 0;
	this.tileOffsetX = 0;
	this.tileOffsetY = 0;
	this.tilesArray = 0;
	this.showZoneColors= 0;
	this.canvas = document.getElementById(canvasId);  //get canvas element from html
	this.ctx = this.canvas.getContext('2d'); //create main drawing canvas
	//TileEngine.canvas.setAttribute('width', TileEngine.width); //set attributes of canvas
	//TileEngine.canvas.setAttribute('height', TileEngine.height);
	this.setMapAttributes(map);
	this.sources = new Array();
	this.loadSource();
	var wut = this;
	this.sources[0].image.onload = function(){  //event handler for image load 
		wut.sources[0].is_ready = true; // image source is ready when image is loaded
		wut.tileSource = new Array();
		wut.createTileSource(wut.sourceTileCounts, wut.sourceTileAcross);	//create tile sources using image source		
	}
	this.tiles = new Array();
	this.zones = new Array();
	this.createTiles();  //create tiles - uses tilesArray declared below
			
}//,
TileEngine.prototype.setMapAttributes = function(obj){
		//setMapAttributes: function(obj){ //this function must be called prior to initializing tile engine
			this.width = obj.width;
			this.height = obj.height;
			this.tileWidth = obj.tileWidth;
			this.tileHeight = obj.tileHeight;
			this.zoneTilesWide = obj.zoneTilesWide;
			this.zoneTilesHigh = obj.zoneTilesHigh;
			this.tilesWide = obj.tilesWide;
			this.tilesHigh = obj.tilesHigh;
			this.sourceFiles = obj.sourceFiles;
			this.sourceTileCounts = obj.sourceTileCounts;
			this.sourceTileAcross = obj.sourceTileAcross;
			this.tileOffsetX = obj.tileOffestX;
			this.tileOffsetY = obj.tileOffsetY;
			this.tilesArray = obj.tilesArray;
			this.showZoneColors = obj.showZoneColors;
//Added
			this.layerName = obj.layerName;
			this.startX = obj.startX;
			this.startY = obj.startY;
}//,
TileEngine.prototype.loadSource = function(){
		//loadSource: function(){ //create and initialize image source
	var source = new SourceImage(this.sourceFiles);  
	//source.init(this.sourceFiles);
	this.sources.push(source);
}//,
TileEngine.prototype.drawFrame = function(){
	//drawFrame: function(){ //main drawing function
//			TileEngine.ctx.clearRect(0,0,TileEngine.width, TileEngine.height);  //clear main canvas
	//this.ctx.clearRect(0,0,this.width, this.height);  //clear main canvas
	if(this.zones){
		for(var i = 0, ii = this.zones.length; i < ii; i++){
			var check_zone = this.zones[i];
			//check to see if each zone is outside the viewport
			if((check_zone.x >= this.width || check_zone.y >= this.height)||((check_zone.x + check_zone.width) < this.x || (check_zone.y + check_zone.height < this.y))){ //only draw zones that are in the viewport
				continue;//if it's outside, loop again	
			}
			else{
				//this.zones[i].drawTiles(0,0,this.width, this.height);
				//this.ctx.drawImage(this.zones[i].canvas, this.zones[i].left, this.zones[i].top);
			}
		}

	}
}//,
TileEngine.prototype.createTileSource = function(count,accross){
		//createTileSource: function(count, accross){ //create tiles sources
	var accross_count = 0;
	var x = 0;
	var y = 0;
	for(var i = 0; i < count; i++){
		var new_tileSource = new TileSource(this.tileWidth, this.tileHeight, x, y, this.sources[0]);
		//new_tileSource.init(this.tileWidth, this.tileHeight, x, y, this.sources[0]);
		this.tileSource.push(new_tileSource);
		accross_count++;
		x += this.tileWidth;
		if(accross_count >= accross){
			accross_count = 0;
			y += this.tileHeight;
			x = 0;
		}
	}
}//,
TileEngine.prototype.createZones = function(){
	//createZones: function(){//create array of zones for map
	//caluculate how many zones we need (width by height)
	var zone_wide = Math.ceil(this.tilesWide/this.zoneTilesWide);
	var zone_high = Math.ceil(this.tilesHigh/this.zoneTilesHigh);

	/*these are used if tilemap is not evenly divisible by size of zones in tiles
	**they are used to define the size of zones on the right and bottom edges of the
	**map */
	var x_remainder = this.tilesWide%this.zoneTilesWide;
	var y_remainder = this.tilesHigh%this.zoneTilesHigh;
	
	for(var h = 0; h < zone_high; h++) { //loop through zone rows
		for(var i = 0; i < zone_wide; i++) {//loop through zone columns
			var x = i * this.zoneTilesWide * this.tileWidth //set x pos of new zone
			var y = h * this.zoneTilesHigh * this.tileHeight //set y pos of new zone
			var width = this.zoneTilesWide * this.tileWidth; //set width of new zone
			var tiles_wide = this.zoneTilesWide //set tiles wide for new zone
			if(i == (zone_wide - 1) && x_remainder > 0){  //if is last zone on horizontal row and tiles divide unevenly into zones
				tiles_wide = x_remainder; //change new zone tiles wide to be correct
				width = tiles_wide * this.tileWidth;  //change new zone width to be correct
			}
			var height = this.zoneTilesHigh * this.tileHeight; //set height of new zone
			var tiles_high = this.zoneTilesHigh //set tiles high for new zone
			if(h == (zone_high - 1) && y_remainder > 0){ //if last zones on bottom and tiles divide unevenly into zones
				tiles_high = y_remainder; //adjust tiles high
				height = tiles_high * this.tileHeight; //adjust zone height
			}
			var new_zone = new Zone(this, x, y, tiles_wide, this.zoneTilesHigh, this.tileWidth, this.tileHeight, width, height); //create new zone
			//new_zone.init(this, x, y, tiles_wide, this.zoneTilesHigh, this.tileWidth, this.tileHeight, width, height); //intitialize new zone
			this.zones.push(new_zone); //push zone to tile engine array
		}
	}
}//,
TileEngine.prototype.createTiles = function() {
		//createTiles: function() { //load tile array
	this.createZones();  //create zones
	var tile_index = 0;  //track current position in tile array
	var y_zone = 0; //used to determine which zone to add tile to
	var x_zone = 0; //used to determine which zone to add tile to
	var zone_index = 0; //track current position in zone array
	var zone_wide = Math.ceil(this.tilesWide/this.zoneTilesWide); //how many zones are there horizontally
	for(var h = 0, hh = this.tilesHigh; h < hh; h++) {
		y_zone = Math.floor(h/this.zoneTilesHigh); //calculate which vertical zone we are in
		for(var i = 0, ii = this.tilesWide; i < ii; i++) { //cycle through each row
			x_zone = Math.floor(i/this.zoneTilesWide);// calculate which horizontal zone we are in
			var new_tile = new Tile(0, 0, this.tileWidth, this.tileHeight, this.tilesArray[tile_index]); //create new tile object
			//new_tile.init(0, 0, this.tileWidth, this.tileHeight, this.tilesArray[tile_index]); //init tile
			zone_index = (y_zone * zone_wide) + x_zone;//find what zone to add to using vert and horizontal positions
			this.zones[zone_index].addTile(new_tile); //add tile to zone
			tile_index++;
		}
		x_zone = 0; //reset horizontal position when we loop to new row
	}
	for(var j = 0, jj = this.zones.length; j < jj; j++) {
		this.zones[j].arrangeTiles(); //go throughh and arange x and y positions of tiles in zones
	}
}
//}
	// return TileEngine;
// };


