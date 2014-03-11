#!/usr/bin/env node

var Primus = require('primus'),
    http   = require('http'),
    colour  = '#f4f4f4';

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
          checkImap(data.user);
        break;
      }
    }
  });
});

function checkImap(user, callback)
{
  var Imap = require('imap'),
      inspect = require('util').inspect;

  var imap = new Imap({
    user: user.email,
    password: user.password,
    host: user.host,
    port: user.port,
    tls: user.tls,
    tlsOptions: { rejectUnauthorized: false }
  });

  function openInbox(cb) {
    imap.openBox('INBOX', true, cb);
  }

  imap.once('ready', function() {
    openInbox(function(err, box) {
      if (err) throw err;
      var f = imap.seq.fetch('1:3', {
        bodies: 'HEADER.FIELDS (FROM TO SUBJECT DATE)',
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
  });

  imap.connect();
}