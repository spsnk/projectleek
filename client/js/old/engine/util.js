var setBytes = function(num1,num2,num3) {
	return (num1 << 18)| num2;//return (((num1 << 16) | (num2||0)) << 4) | (num3||0);
};

function getBytes(num) {
	return [num & 0x3FFFF, (num >> 18) & 0x3FFFF];//return [num & 0xF, (num >> 4) & 0xFFFF, (num >> 20) & 0xFFFF];
};

var makeMapTilesArray = function(tiles_a, decor_a){
	var tilesArray = new Array()
	var i = tiles_a.length
	while(i--){
		tilesArray[i] = setBytes(tiles_a[i], decor_a[i]);
	}
	//console.log(tilesArray);
	return tilesArray;
}
var Console = { //object to create messages (using alert in a game loop will crash your browser)
	console: 0, //hold element where messages will be added
	hidden: true, 
	init: function(){
		//Console.console = $("<div id='console'>Loading...</br></div>")
		Console.console = $('#m')
			//.css('width', $('canvas').css('width'))
			//.insertAfter('canvas')
	},
	hide: function(){$(Console.console).hide('slow'); Console.hidden=true;},
	show: function(){$(Console.console).show('slow'); Console.hidden=false;},
	log: function(msg){ //add new message
		if(Console.console)
			$(Console.console).append('> '+msg+'<br />');
	},
	error: function(msg){ //add new message
		if(Console.console)
			$(Console.console).append('> <span style="color:red;">'+msg+'</span><br />');
	}
};