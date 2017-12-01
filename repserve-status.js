const WebSocket = require('ws');

const ws = new WebSocket("ws://192.168.2.55:3344/socket/?lang=en&apikey=0752fb52-2bc2-4ad2-ada3-4c202dfc197c");

var printers = {
  "Dolly": {"id": 0,
            "status": "idle"},
  "dobby": {"id": 1,
            "status": "idle"}
};

ws.on('open', function () {
  console.log('Connected');
  sendMessage("listPrinter",{},":",1)
});
ws.on('error', function (message) {
  console.log(message);
});
ws.on('close', function (message) {
  console.log('Disconnected');
});
ws.on('message', function (message) {
  var msg = JSON.parse(message);
  var data = msg.data;
  if (msg.callback_id === 1) {
    for (var i = 0; i < data.length; i++) {
      var active = data[i].active;
      var job = data[i].job;
      var printer = data[i].name;

      if (active) {
        if (job !== "none") {
          printers[printer].status = "printing";
          update();
        }
        else {
          printers[printer].status = "idle";
          update();
        }
      }
    }
  }
  if (msg.eventList) {
    for (var i = 0; i < data.length; i++) {
      var eve = data[i].event;
      var printer = data[i].printer;

      switch(eve) {
        case "prepareJob":
          printers[printer].status = "heating";
          break;
        case "jobStarted":
          printers[printer].status = "printing";
          break;
        case "jobKilled":
          printers[printer].status = "failed";
          break;
        case "jobFinished":
          printers[printer].status = "complete";
          break;
        default:
          if (eve !== "temp") {
            console.log(eve);
          }
      }

      update();
    }
  }
});

function sendMessage(act, dat, pri, cid) {
  var msg = {
    action: act,
    data: dat,
    printer: pri,
    callback_id: cid
  }
  ws.send(JSON.stringify(msg));
}

function update() {
  for (printer in printers) {
    console.log(printer + " status: "+printers[printer].status);
  }
};
