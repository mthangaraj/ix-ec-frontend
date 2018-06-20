const express = require('express');
const app = express();
// Run the app by serving the static files
// in the dist directory
app.use(express.static(__dirname + '/dist'));

/* for serve the index.html page for every request since the url without '#' will be a request to server.*/
app.get('*', function(req, res) {
    res.sendfile(__dirname + '/dist/index.html');
});
// Start the app by listening on the default
// Heroku port
app.listen(process.env.PORT || 8080,function(){
  console.log("app server is running");
});
