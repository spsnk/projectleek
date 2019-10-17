/*All code copyright 2010 by John Graham unless otherwise attributed*/
//Edits and additions by Jay Crossler, changes Creative Commons BY/3.0 license

var pallet = {
	"tilesWide": 18,//30
	"tilesHigh": 12,//18
	"layers" : [
		{"layerName": "Ground",
		"sourceFiles": "img/map/test_tile.png",
		"sourceTileCounts": 2,//254,
		"sourceTileAcross": 2,
		"tileOffestX": 0,
		"tileOffsetY": 32,
		"tileWidth": 32,
		"tileHeight": 32,
		"zoneTilesWide": 5, //14
		"zoneTilesHigh": 5,	//9
		"showZoneColors": false,
		"tilesArray": [
			1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,
			1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,
			1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,
			1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,
			1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,
			1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,
			1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,
			1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,
			1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,
			1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,
			1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,
			1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0,
			0,1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,
			1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0,
			0,1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,
			1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0,
			0,1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,
			1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0,
			]
		},
		// {"layerName": "Boom",
		// "sourceFiles": "images/tiles.png",
		// "sourceTileCounts": 254,
		// "sourceTileAcross": 22,
		// "tileOffestX": 0,
		// "tileOffsetY": 32,
		// "tileWidth": 32,
		// "tileHeight": 32,
		// "zoneTilesWide": 10,
		// "zoneTilesHigh": 10,	  
		// "showZoneColors": false,
		// "tilesArray": [ -1 ]
		// },
		// {"layerName": "Flooring64",
		// "sourceFiles": "images/511n9k.png",
		// "sourceTileCounts": 32,
		// "sourceTileAcross": 8,
		// "tileOffestX": 0,
		// "tileOffsetY": 64, //Why?
		// "tileWidth": 64,
		// "tileHeight": 64,
		// "zoneTilesWide": 5,
		// "zoneTilesHigh": 5,	  
		// "showZoneColors": false,
		// "tilesArray": [ -1 ]
		// }
	]
};


//function to detect canvas support by alterebro (http://code.google.com/p/browser-canvas-support/)
var canvas_support = {
	canvas_compatible : false,
	check_canvas : function() {
		try {
			this.canvas_compatible = !!(document.createElement('canvas').getContext('2d')); // S60
			} catch(e) {
			this.canvas_compatible = !!(document.createElement('canvas').getContext); // IE
		} 
		return this.canvas_compatible;
	}
} 

function Game(mapObj,canvasId) {
	// gameTimer: 0, //holds id of main game timer
	// tileEngine: [], //holds tile engine object
	// fps: 0, //target fps for game loop
	// mapModel: 0,
	// numLayers: 0,
	//initGame: function(mapObj,canvasId) { //initialize game
		console.log(mapObj);
		//console.log(canvasId);
		this.tileEngine = [];
		this.fps = 60; // 2500; //set target fps to 25
		this.createTiles(mapObj,canvasId);
//		Message.addMessage("Tiles Ready");
		this.startTimer(); //start game loop
//		Message.addMessage("Main Loop Started");
	}//,
Game.prototype.startTimer = function(){
	//startTimer: function(){ //start game loop
	var interval = 1000 / this.fps;
	//var asdf = this.runLoop;
	var ghjk = this;
	this.gameTimer = setInterval(function(){ghjk.runLoop(ghjk)}, interval);
	console.log('Main Loop Started');
}//,
	// var running, lastFrame = +new Date;
	// var obj = this;
    // function loop( now ) {
        ////stop the loop if render returned false
        // if ( running !== false ) {
            // webkitRequestAnimationFrame( loop );
            // var deltaT = now - lastFrame;
            ////do not render frame when deltaT is too high
            // if ( deltaT < 160 ) {
				// obj.tileEngine[0].ctx.clearRect(0,0,obj.tileEngine[0].width, obj.tileEngine[0].height);  //clear main canvas
				// for (var i=0;i<obj.numLayers;i++) {
					// obj.tileEngine[i].drawFrame();
				// }
            // }
            // lastFrame = now;
        // }
    // }
    // loop( lastFrame );
// }
Game.prototype.runLoop = function(obj){
	//runLoop: function(){ //code to run on each game loop
	obj.tileEngine[0].ctx.clearRect(0,0,obj.tileEngine[0].width, obj.tileEngine[0].height);  //clear main canvas
	for (var i=0;i<obj.numLayers;i++) {
		obj.tileEngine[i].drawFrame();
	}
	//FPS.fps_count++;  //increments frame for fps display
}//,
Game.prototype.createTiles = function(mapObj,canvasId){
	//createTiles: function(mapObj,canvasId){ //create and initialize tile engine
//		Game.mapModel = newMapModel();
	this.numLayers = mapObj.layers.length;
	for (var i=0;i<this.numLayers;i++) {		 //create tile engine object
		var obj = new Object(); //create tile engine initializer object
		
		obj.tilesWide 			= mapObj.tilesWide;
		obj.tilesHigh			= mapObj.tilesHigh;
		
		obj.layerName 			= mapObj.layers[i].layerName;
		obj.tileWidth			= mapObj.layers[i].tileWidth;
		obj.tileHeight 			= mapObj.layers[i].tileHeight;
		obj.zoneTilesWide 		= mapObj.layers[i].zoneTilesWide;
		obj.zoneTilesHigh 		= mapObj.layers[i].zoneTilesHigh;
		obj.sourceFiles 		= mapObj.layers[i].sourceFiles;
		obj.sourceTileCounts 	= mapObj.layers[i].sourceTileCounts;
		obj.sourceTileAcross 	= mapObj.layers[i].sourceTileAcross;
		obj.tileOffestX 		= mapObj.layers[i].tileOffestX;
		obj.tileOffsetY 		= mapObj.layers[i].tileOffsetY;
		obj.width 				= obj.tileWidth * obj.tilesWide;
		obj.height 				= obj.tileHeight * obj.tilesHigh;
		obj.tilesArray 			= mapObj.layers[i].tilesArray;
		obj.showZoneColors 		= mapObj.showZoneColors

		//Added - TODO: not working, check why
		obj.startX = 0;
		obj.startY = 0;
		this.tileEngine.push(new TileEngine(canvasId,obj));

		//this.tileEngine[i].setMapAttributes(obj);
		//Game.tileEngine[i].init();  //initialize tile engine object
	}

		// if (is_firefox) {
			// setTimeout("Painter.sizeCanvasToMax()",1000);
		// } else {
			// Painter.sizeCanvasToMax();  //TODO: Set so not timer in Firefox
		// }
		// Painter.addCanvasEvents();
		// Painter.setLayerOptions();
		console.log('Tiles Ready');
	}
//};

//if(canvas_support.check_canvas()){  //check canvas support before intializing
	//Game.initGame(pallet,'map'); //initialize game object
//}
// else {
	// Message.addMessage('Your Browser Does not support this demo!');	
// }



