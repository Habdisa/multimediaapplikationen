// General HTTP server
// Also AJAX-Server for
// - demo-services: /info /text /json
// - /poll
// - /hash

const http        = require ('http'),
      https       = require ('https'),
      fs          = require ('fs'),
      glob        = require ('glob'),
      express     = require ('express'),
      serve_index = require ('serve-index'),
      body_parser = require ('body-parser'),
      socketio    = require ('socket.io');
const PORT = 8888;
const config = {
    httpPort: PORT,
//    httpRedirect: true,
//    httpsPort: 8443,
};

const app = express();
app.use (body_parser.json ());
app.use (body_parser.urlencoded ({extended: true}));
app.use(express.static("public"))

// http + https instantiation
var server;
if (config.httpPort) {
    if (config.httpRedirect) {
        // When both http and https are enabled, http should only be a redirecting server
        http.createServer (function (req, res) {
            var host = req.headers.host?.replace(/:.*/,"");
            if (config.httpsPort !== 443) {
                host += ":" + config.httpsPort;
            }
            res.writeHead (301, { "Location": "https://" + host + req.url });
            res.end();
        }) .on  ("error", e => { severe_error ("REDIRECTOR ERROR", e);
        }) .listen (config.httpPort, function () {
            console.log ("Redirecting express http server listening on port " + config.httpPort);
        });
    } else {
        server = http.createServer (app) .listen (config.httpPort, function () {
            console.log ("Express http server listening on port http://localhost:" + config.httpPort);
        });
    }
}
if (config.httpsPort) {
    var ssl_opts = {
        key:  fs.readFileSync ('../ssl/server.key'),
        cert: fs.readFileSync ('../ssl/server.crt'),
        ca:   glob.sync ('../ssl/chain*.crt') .map (function (e) { return fs.readFileSync (e); }),
        //ciphers: "",
    };
    server = https.createServer (ssl_opts, app) .listen (config.httpsPort, function () {
        console.log ("Express https server listening on port http://localhost:" + config.httpsPort);
    });
}


// LOG
app.use (function (req, res, next) {
    console.log (new Date().toISOString() + " " + req.socket.remoteAddress + ":" + req.socket.remotePort + " " + req.method + " " + req.url);
    next();
});


//
// AJAX-Handler
//

var count = 0;

// HANDLER: return query string back as text
app.all ("/text", function (req, res) {
    ++count;
    var args = {...req.query, ...req.body};
    console.log ("  "+req.method+" text: "+JSON.stringify(args)+" #"+count);
    res.writeHead (200, {'Content-Type': 'text/plain'});
    res.write("AJAX: "+JSON.stringify(args)+" #"+count);
    res.end ();
});
app.use(express.static('public'))
// HANDLER: return query back as JSON object
app.all ("/json", function (req, res) {
    ++count;
    const data = JSON.stringify({
        "name": "Max Mustermann",
        "telefon": "0911/123456789",
        "alter": 66,
        "hobbies": [
            "radfahren",
            "skifahren"
        ]
    });
    res.writeHead (200, {'Content-Type': 'application/json'});
    res.write(data);
    res.end ();
});

//
// POLL related state
//

var poll_count   = {};
var poll_entries = {};

// HANDLER: count poll entries
// poll: poll name
// entry: selected entry
//       returns: count: total poll count, entries: hash of counts
app.all ("/poll", function (req, res) {
    var poll = req.query.poll;
    if (! poll)
	return defaulterror (res, 404, "'poll' required");
    if (poll_count[poll] === undefined) {
	poll_count[poll] = 0;
	poll_entries[poll] = {};
    }
    if (req.query.entry) {
	poll_count[poll]++;
	if (poll_entries[poll][req.query.entry] === undefined)
	    poll_entries[poll][req.query.entry] = 0;
	poll_entries[poll][req.query.entry]++;
    }
    var json = JSON.stringify ( { count: poll_count[poll], entries: poll_entries[poll] } );
    console.log ("  ajax_poll: "+json);
    res.writeHead (200, {'Content-Type': 'application/json'});
    res.write(json);
    res.end ();
});


//
// HASH related state
//

// data{name}
var hash_data = {};


// HANDLER: hash
app.all ("/hash", function (req, res) {
    var args = {...req.query, ...req.body};
    var name      =  args.name  === undefined ? "" : args.name;
    var store     =  args.store === undefined ? "" : args.name;
    var json;

    if (name === "") {
        json = Object.keys (hash_data);
    } else if (store) {
	delete args.store;
	json = hash_data[name] = args;
        iohash.emit (name);
    } else
	json = hash_data[name];

    if (json === undefined) {
	return defaulterror (res, 422, "unknown name");
    } else {
	res.writeHead (200, {'Content-Type': 'application/json'});
	res.write(JSON.stringify (json));
	res.end ();
    }
});

// HANDLER: hash (new)
app.get ("/hash/:path(*)", function (req, res) {
    res.writeHead (200, {'Content-Type': 'application/json'});
    res.write (JSON.stringify (hash_data [req.params.path] || null));
    res.end   ();
});
app.post ("/hash/:path(*)", function (req, res) {
    console.log ("  "+JSON.stringify (req.body));
    hash_data [req.params.path] = req.body;
    res.writeHead (200, {'Content-Type': 'application/json'});
    res.write (JSON.stringify (hash_data [req.params.path]));
    res.end   ();
    iohash.emit (req.params.path);
});
app.put ("/hash/:path(*)", function (req, res) {
    if (hash_data [req.params.path] === undefined) {
	return defaulterror (res, 422, "unknown name");
    }
    console.log ("  "+JSON.stringify (req.body));
    Object.assign (hash_data [req.params.path], req.body);
    res.writeHead (200, {'Content-Type': 'application/json'});
    res.write (JSON.stringify (hash_data [req.params.path]));
    res.end   ();
    iohash.emit (req.params.path);
});
app.delete ("/hash/:path(*)", function (req, res) {
    delete hash_data [req.params.path];
    res.writeHead (200, {'Content-Type': 'text/plain'});
    res.end   ();
    iohash.emit (req.params.path);
});


//
// Static files / dirs handler
//
app.use(function(req, res, next) {
    res.setHeader ('Cross-Origin-Opener-Policy', 'same-origin');
    res.setHeader ('Cross-Origin-Embedder-Policy', 'require-corp');
    next();
});
app.use (express.static ('.'));
app.use (serve_index ('.', { icons: true, view: 'details' }));

// Default error return
function defaulterror (res, code, err) {
    console.log   ("  error: "+code+" "+err);
    res.writeHead (code, {"Content-Type": "text/html"});
    res.write     ("<!DOCTYPE html><html><body><h1>" + code + " " + err + "</h1></body></html>\n");
    res.end       ();
}


//
// WebSocket Service
//

const Emitter = require('events').EventEmitter;
const emit = Emitter.prototype.emit;

const io = socketio (server);
const iohash  = io.of ("/hash");
const iobcast = io.of ("/broadcast");

iobcast.on ("connection", function (socket) {

    var onevent = socket.onevent;
    socket.onevent = function (packet) {
        var args = ["*"].concat (packet.data || []);
        onevent.call (this, packet);            // original call
        emit.apply   (this, args);              // additional call to catch-all
    };

    var descr = socket.client.request.socket.remoteAddress + ":" + socket.client.request.socket.remotePort;

    console.log ("connection established on socket " + descr);
    socket.on ("disconnect", function () {
        console.log ("connection closed on socket " + descr);
    });

    socket.on ("*", function (msg, obj) {
        console.log (new Date().toISOString() + " " + descr + " WS " + msg + ": " + JSON.stringify (obj));
        iobcast.emit (msg, obj);
    });

});


//
// Uncaught Exceptions
//
function severe_error (what, err) {
    console.error ("*** "+what);
    console.error (err?.stack+"\n");
}
server .on ("error",              e => severe_error ("SERVER ERROR", e));
process.on ("uncaughtException",  e => severe_error ("EXCEPTION",    e));
process.on ("unhandledRejection", e => severe_error ("REJECTION",    e));


//EOF
