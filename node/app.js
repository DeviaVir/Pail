#!/usr/bin/env node
var Primus = require('primus'),
    http   = require('http'),
    Imap = require('imap'),
    inspect = require('util').inspect;

var server = http.createServer().listen(8080),
    primus = new Primus(server);

primus.on('connection', function (spark) {
  // spark is the new connection.
  console.log('Detected connection');

  console.log('Emitting id');
  primus.write({'method': 'connect', 'response': spark.id});

  spark.on('data', function (data) {
    if('method' in data) {
      switch(data.method) {
        case 'checkImap':
          checkImap(data.user, spark.id, function(res){
            primus.write({'method': data.method, 'response': res});
          });
        break;
        case 'testImap':
          testImap(data.user, function(res){
            primus.write({'method': data.method, 'response': res});
          });
        break;
      }
    }
  });
});

function connectImap(user)
{
  var imap = new Imap({
    user: user.email,
    password: user.password,
    host: user.host,
    port: user.port,
    tls: user.tls,
    tlsOptions: { rejectUnauthorized: false }
  });

  return imap;
}

function testImap(user, callback)
{
  var imap = connectImap(user.imap);

  imap.once('error', function(err) {
    console.log(err);
    callback(false);
  });

  imap.once('ready', function() {
    console.log('ready');
    callback(true);
  });

  imap.connect();
}

function checkImap(user, sparkId, callback)
{
  var imap = connectImap(user.imap);
  function openInbox(cb) {
    imap.openBox('INBOX', true, cb);
  }

  imap.once('ready', function() {
    openInbox(function(err, box) {
      if (err) throw err;
      var f = imap.seq.fetch('1:3', {
        bodies: 'HEADER.FIELDS (FROM TO SUBJECT DATE MESSAGE-ID)',
        struct: true
      });
      f.on('message', function(msg, seqno) {
        console.log('Message #%d', seqno);
        var prefix = '(#' + seqno + ') ';
        msg.on('body', function(stream, info) {
          var buffer = '';
          stream.on('data', function(chunk) {
            buffer += chunk.toString('utf8');
          });
          stream.once('end', function() {
            console.log(prefix + 'Parsed header: %s', inspect(Imap.parseHeader(buffer)));
            primus.forEach(function (spark, id, connections) {
              if (id !== sparkId) return;

              spark.write({'method': 'newMessage', 'response': Imap.parseHeader(buffer)});
            });
          });
        });
        msg.once('attributes', function(attrs) {
          console.log(prefix + 'Attributes: %s', inspect(attrs, false, 8));
        });
        msg.once('end', function() {
          console.log(prefix + 'Finished');
        });

        // Send the data to primus
      });
      f.once('error', function(err) {
        console.log('Fetch error: ' + err);
      });
      f.once('end', function() {
        console.log('Done fetching all messages!');
        imap.end();
      });
    });
  });

  imap.once('error', function(err) {
    console.log(err);
  });

  imap.once('end', function() {
    console.log('Connection ended');
    callback(true);
  });

  imap.connect();
}