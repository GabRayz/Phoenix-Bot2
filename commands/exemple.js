let Command = require('../src/Command');

module.exports = class Example extends Command {
    static name = 'example';
    static alias = [
        "example",
        "expl"
    ];
    static description = "Example for creating a command";

    static async call(message, Phoenix) {
        // Code . . .
    }
}
