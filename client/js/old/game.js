/*All code copyright 2010 by John Graham unless otherwise attributed*/

//this array tells the tile engine which offset in the tiles.png image to use

function Map(map,tiles,decor,phys,tileSizeW,tileSizeH,totalTiles,tilesPerRow,tilesW,tilesH,zoneW,zoneH){//map
	this.mapTiles			= tiles;
	this.decoration			= decor;
	///this.tilesArray			= [];
	this.physicsArray		= phys;
	this.canvas				= 0;
	this.ctx				= 0;
	this.init_x				= 0;
	this.init_y				= 0;
	this.sourceFile			= 'img/map/'+map+'.png';
	this.tileWidth			= tileSizeW;
	this.tileHeight			= tileSizeH;
	this.tile_offset_x		= 1;
	this.tile_offset_y		= 1;
	this.sourceTileCounts	= totalTiles;
	this.sourceTileAcross	= tilesPerRow;
	this.tilesWide			= tilesW;
	this.tilesHigh			= tilesH;
	this.zoneTilesWide		= zoneW;
	this.zoneTilesHigh		= zoneH;
}

// var test = {}
// test.init_x = 0;
// test.init_y = 0;
// test.sourceFile = 'img/map/grid_tiles.png';
// test.tileWidth = 16;
// test.tileHeight = 16;
// test.tile_offset_x = 1;
// test.tile_offset_y = 1;
// test.sourceTileCounts = 4096;
// test.sourceTileAccross = 64;
// test.tilesWide = 64;
// test.tilesHigh = 64;
// test.zoneTilesWide = 8;
// test.zoneTilesHigh = 8;
// test.mapTiles = [];
// test.physicsArray = [];
// test.decoration = [];
//var mapTiles = [],physicsArray = [],decoration = [];
// for(var i = 0; i < 4096;i++){
	// test.mapTiles[i] 	= i;
	// test.physicsArray[i]= 0;
	// test.decoration[i]	= 0;
// }
//var test = new Map('grid_tiles',mapTiles,decoration,physicsArray,16,16,4096,64,64,64,8,8);
//test.tilesArray = makeMapTilesArray(mapTiles, decoration);
//test.tilesArray = makeMapTilesArray(test.mapTiles, test.decoration);
function Player(x,y,s){ //player
	this.init_x				= x;
	this.init_y				= y;
	this.width				= 19;
	this.height				= 26;
	this.tile_offset_x 		= 1;
	this.tile_offset_y		= 1;
	this.sourceFile			= 'img/player/'+s+'.png';
	this.sourceTileCounts	= 24;
	this.sourceTileAccross	= 6;
	this.movement_hash 		= {
		// up:    [6,7,8],
		// down:  [0,1,2],
		// left:  [9,10,11],
		// right:  [3,4,5]
		down:  [12,13,14],
		right:  [15,16,17],
		up:    [18,19,20],
		left:  [21,22,23]
	}
};

var dawn = new Player(64,84,'F');
// { //player
	// init_x				: 64,
	// init_y				: 84,
	// width				: 19, 
	// height				: 26,
	// tile_offset_x 		: 1,
	// tile_offset_y		: 1,
	// sourceFile			: 'img/map/player_F.png',
	// sourceTileCounts	: 24,
	// sourceTileAccross	: 6,
	// movement_hash 		: {
		// up:    [6,7,8],
		// down:  [0,1,2],
		// left:  [9,10,11],
		// right:  [3,4,5]
		// down:  [12,13,14],
		// right:  [15,16,17],
		// up:    [18,19,20],
		// left:  [21,22,23]
	// }
// };

//var tilesArray1 = makeMapTilesArray(maptilesArray1, decorationtilesArray)
//var tilesArray2 = makeMapTilesArray(maptilesArray2, decorationtilesArray)
//console.log(test);

function Game(map,player,canvas,fps){ 
	/* arguments: 
		obj map		(map object) 
		obj player	(player object) 
		str canvas	(ID of canvas element)
		str fps		(fps container ID)
	*/
	//this.tileEngine 	= 0; //holds tile engine object
  	//this.fps_el 		= 0; //fps elemnt to put the fps in
	/***
	var map = {};
	map.init_x 				= obj.init_x;
	map.init_y 				= obj.init_y;
	map.sourceFile 			= obj.sourceFile;
	map.tileWidth 			= obj.tileWidth;
	map.tileHeight 			= obj.tileHeight;
	map.tile_offset_x 		= obj.tile_offset_x;
	map.tile_offset_y 		= obj.tile_offset_y;
	map.sourceTileCounts 	= obj.sourceTileCounts;
	map.sourceTileAccross 	= obj.sourceTileAccross;
	map.tilesWide 			= obj.tilesWide;
	map.tilesHigh			= obj.tilesHigh;
	map.zoneTilesWide 		= obj.zoneTilesWide;
	map.zoneTilesHigh 		= obj.zoneTilesHigh;
	map.mapTiles 			= obj.mapTiles;
	map.physicsArray 		= obj.physicsArray;
	map.decoration 			= obj.decoration;
	***/
	map.tilesArray 			= makeMapTilesArray(map.mapTiles, map.decoration);
	map.canvas 				= document.getElementById(canvas);
	map.ctx 				= map.canvas.getContext('2d');
	//console.log(map)
	this.tileEngine = newTileEngine(); //create tile engine object
	this.tileEngine.setMapAttributes(map);
	this.tileEngine.setMainSpriteAttributes(player);
	
	this.tileEngine.init();  //initialize tile engine object
	this.fps_el = document.getElementById(fps);
	var that = this;
	//console.log(this.fps_el);
	this.fps_timer = setInterval(function(){
		if(that.fps_el)
			that.fps_el.innerHTML = that.tileEngine.fps + 'fps';
	}, 2000);
	this.tileEngine.start(); //start game loop
	Console.log("Main Loop Started");
}
Game.prototype.end = function(){
	this.tileEngine = null;
	this.fps_el = null;
}

//$(document).ready(function(){Game.initGame();}) //initialize game object

/* 	var tiles =[
				9,9,9,9,9,9,9,9,8,4,4,4,4,4,7,9,9,8,0,0,
				8,4,7,9,9,9,9,9,2,0,0,0,0,0,1,9,9,2,0,0,
				2,0,1,9,9,9,9,9,6,3,3,3,3,3,5,9,9,2,0,0,
				6,3,5,9,9,9,9,9,9,9,9,9,9,9,9,9,9,2,0,0,
				9,9,9,9,9,9,9,9,9,9,9,9,9,9,9,9,9,2,0,0,
				9,9,9,9,9,9,9,9,9,9,9,9,9,9,9,9,9,2,0,0,
				9,9,9,9,9,9,9,9,9,9,9,9,9,9,9,9,9,2,0,0,
				9,9,9,9,9,9,9,9,9,9,9,9,9,9,9,9,9,6,3,5,
				9,9,9,9,9,9,9,9,8,4,4,4,4,4,4,7,9,9,9,9,
				9,9,9,9,9,9,9,9,2,0,0,0,0,0,0,0,7,9,9,9,
				9,9,9,9,9,9,9,9,2,0,0,0,0,0,0,0,1,9,9,9,
				9,9,9,9,9,9,9,9,2,0,0,0,0,0,0,0,1,9,9,9,
				9,9,9,9,9,9,9,9,2,0,0,0,0,0,0,0,1,9,9,9,
				9,9,9,9,9,9,9,9,6,3,3,3,3,3,3,3,5,9,9,9,
				9,9,9,9,9,9,9,9,9,9,9,9,9,9,9,9,9,9,9,9,
				4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,
				];
				var decorations = [
				0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,
				0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,
				0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,
				0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,
				0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,
				0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,
				0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,
				0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,
				0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,
				0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,
				0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,
				0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,
				0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0
				];
				var physics = [
				0,0,0,0,0,0,0,0,1,1,1,1,1,1,1,0,0,1,1,1,
				1,1,1,0,0,0,0,0,1,1,1,1,1,1,1,0,0,1,1,1,
				1,1,1,0,0,0,0,0,1,1,1,1,1,1,1,0,0,1,1,1,
				1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,
				0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,
				0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,
				0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,
				0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,
				0,0,0,0,0,0,0,0,1,1,1,1,1,1,1,1,0,0,0,0,
				0,0,0,0,0,0,0,0,1,1,1,1,1,1,1,1,1,0,0,0,
				0,0,0,0,0,0,0,0,1,1,1,1,1,1,1,1,1,0,0,0,
				0,0,0,0,0,0,0,0,1,1,1,1,1,1,1,1,1,0,0,0,
				0,0,0,0,0,0,0,0,1,1,1,1,1,1,1,1,1,0,0,0
				]
				var mapmap = new Map('test_map2',tiles,decorations,physics,32,32,10,10,20,20,20,20);
			game = new Game(mapmap,dawn,'map','fps'); */