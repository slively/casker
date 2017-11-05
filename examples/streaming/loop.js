var cnt = 0;
setInterval(function () {
	console.log('loop...');
	if (++cnt === 5) {
		process.exit(0);
	}
}, 500);