const EventEmitter = require("events");

module.exports = class Game extends EventEmitter {
    static name;
    static alias = [];

    /**
     * Unique identifier of the game.
     */
    gameId;
    /**
     * The discord text channel the game is taking place in.
     */
    channel;
    /**
     * List of players playing the game.
     */
    players = [];
    /**
     * Wether the game has started.
     */
    isPlaying = false;
    phoenix = null;

    constructor(message, gameId, phoenix) {
        super();
        this.phoenix = phoenix;
        this.gameId = gameId;
        this.channel = message.channel;
        this.players = [];
        this.players.push({
            tag: message.author.tag,
            username:
                message.member.nickname == null
                    ? message.author.username
                    : message.member.nickname,
        });
        this.isPlaying = false;
    }
};
