var i = setInterval(function () { return console.log('still looping...'); }, 100);
process.on('SIGINT', function () {
    clearInterval(i);
    console.log('stopping loop...');
});
//# sourceMappingURL=loop.js.map