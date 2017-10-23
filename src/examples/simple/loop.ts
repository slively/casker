const i = setInterval(() => console.log('still looping...'), 100);
process.on('SIGINT', () => {
	clearInterval(i);
	console.log('stopping loop...');
});
