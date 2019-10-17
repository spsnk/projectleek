<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Strict//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-strict.dtd">
<html xmlns="http://www.w3.org/1999/xhtml">
<head>
<meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
<title>Project Leek</title>
<link rel="shortcut icon" type="image/x-icon" href="/favicon.ico">
<link rel="stylesheet" type="text/css" href="css/main.css" />
<script type="text/javascript" src="/static/js/jquery-1.7.1.min.js"></script>
<script type="text/javascript" src="/static/js/socket.io.min.js"></script>
<script type="text/javascript" src="js/crafty.js"></script>
<script type="text/javascript" src="js/data.js"></script>
<script type="text/javascript" src="js/gamec.js"></script>
<script type="text/javascript" src="js/socket.js"></script>
<script type="text/javascript">
	$(document).ready(function(){
		$('#msg').keydown(send);
		$('#u').keydown(function(e){
			if (e.keyCode == 13) {
				$('#p').focus();
				e.preventDefault();
				return false;
			}
		});
		$('#p').keydown(function(e){
			if (e.keyCode == 13) {
				connect();
				e.preventDefault();
				return false;
			}
		});
		$('#b').click(connect);
		$(document).keydown(function(e){
			//e.preventDefault();
		});
		$('.huba').hover(function() {
			$('.small').stop().animate({
				'background-color':'#00e',
				'boxShadow': '0px 0px 20px #00b'
			});
		},
		function() {
			$('.small').stop().animate({
				'background-color':'#6BC3B7',
				'boxShadow': '0px'
			});
		});
	});
</script>
</head>
<body>
	<div id="c">
		<h3>Leeks are not food</h3>
		<div id="cw">Total Connections: <span id="cn"> </span></div>
		<div id="info"></div>
		<!-- <canvas id="map" height="320"360 width="520" 560></canvas> -->
		<div id="cr-stage">
		</div>
		<div id="hud-wrapper">
			<div id="cx">
				<input id="u" type="text" placeholder="Username"/>
				<input id="p" type="password" placeholder="Password"/>
				<button id="b" class="button">Connect</button>
			</div>
			<div id="dx">
				<input id="msg" type="text" placeholder="Message"/>
				<button id="d" onclick="logout();" class="button">Disconnect</button>
				<button id="clear" onclick="$('#m > div').toggle(300,function(){$(this).parent().html('').show();});" class="button">Clear Log</button>
			</div>
		</div>
		<div id="m"></div>
	</div>
	<div class="half"></div>
	<div class="circle"></div>
	<div class="circle small"></div>
	<div class="img"></div>
		<div class="huba"></div>
	</div>
</body>
</html>