var Toxiproxy = require('toxiproxy-node');

var client = new Toxiproxy('localhost:8474');

var proxy = client.NewProxy({
    name: 'polyball',
    listen: '127.0.0.1:9090',
    upstream: '127.0.0.1:8080',
    enabled: true
});

proxy.Create(function (err, body) {
    if (err) {
        console.log("Error creating proxy client:");
        console.log(err);
        return;
    }
    console.log(body);

    proxy.SetToxic('latency', 'downstream', {
        enabled: true,
        latency: 100
    }, function (err, body) {
        if (err) {
            console.log(err);
        }
        console.log(body);
    });

    proxy.SetToxic('latency', 'upstream', {
        enabled: true,
        latency: 100
    }, function (err, body) {
        if (err) {
            console.log(err);
        }
        console.log(body);
    });
});