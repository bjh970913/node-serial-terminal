const colors = require('colors')
const readline = require('readline');
const SerialPort = require('serialport');
const fs = require('fs');

const rl = readline.createInterface({
    input: process.stdin,
    output: null
});

const serialName = '/dev/' + fs.readdirSync('/dev').filter(x => x.search('cu.usbserial')!=-1)[0];

console.log(colors.green(`Using ${serialName}`))

var port = new SerialPort(serialName, {
  baudRate: 115200
});

port.on('open', () => {
    let sigintTimeout = false;

    port.on('readable', function () {
        process.stdout.write(port.read().toString());
    });
    
    port.write('\r');
    readInput();


    process.on('SIGINT', function() {
        if (sigintTimeout) {
            process.exit();
        }
        sigintTimeout = true;
        setTimeout(() => sigintTimeout = false, 1000);
        port.write(Buffer.from([0x03]))
    });
})

function readInput() {
    rl.question('', (line) => {
        port.write(line + '\r');
    })
    setTimeout(readInput, 10);
}

port.on('error', (err) => {
    console.log(colors.red(err))
    process.exit();
})