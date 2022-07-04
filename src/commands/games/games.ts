import Command from "../../Command";
import fs from "fs";
import {MessageEmbed} from "discord.js";
import TwoK48 from "./TwoK48";
import logger from "../../logger";

const games = { TwoK48 };

export default class Games extends Command {
    static commandName = "games";
    static alias = ["games", "game", "2048"];
    static description = "Jouer à des mini-jeux.";
    static scoreboard;

    /**
     * List of currently playing instances of games
     */
    static currentGames: any[] = [];

    static async call(message, phoenix) {
        await this.loadScoreboard();
        if (
            message.args.length == 0 &&
            ["game", "games"].includes(message.command)
        )
            this.displayScoreBoard(message.channel);
        else if (message.args.length == 0)
            this.startGame(message.command, message, phoenix);
        else if (message.args.length == 1) {
            this.startGame(message.args[0], message, phoenix);
        } else if (message.args.length == 2) {
            if (message.args[1] == "start")
                this.startGame(message.args[0], message, phoenix);
            else if (message.args[1] == "stop")
                this.stopGame(message.args[0], message.author.tag);
        }
    }

    static displayScoreBoard(channel) {
        let description = "";
        Object.keys(this.scoreboard).forEach((game) => {
            description += "**" + game + " : **\n";
            for (let i = 0; i < 5 && i < this.scoreboard[game].length; i++) {
                let player = this.scoreboard[game][i];
                description +=
                    "#" +
                    (i + 1) +
                    " " +
                    player.tag +
                    " : " +
                    player.score +
                    "\n";
            }
        });
        let embed = new MessageEmbed();
        embed
            .setTitle("Scoreboard")
            .setDescription(description)
            .setColor("ORANGE");
        channel.send({ embeds: [embed] });
    }

    static startGame(name, message, phoenix) {
        Object.keys(games).forEach((game) => {
            if (games[game] && games[game].alias.includes(name)) {
                // Instantiate a new game and add it to the current games
                let newGame = new games[game](
                    message,
                    this.getRandomId(),
                    phoenix
                );
                this.currentGames.push(newGame);
                newGame.on("end", this.removeGame);
            }
        });
    }

    static stopGame(name, authorTag) {
        // Find a game with the corresponding name and player.
        let currentGame = this.currentGames.find(
            (game) =>
                game &&
                game.alias.includes(name) &&
                game.players.find((player) => player.tag == authorTag)
        );
        if (currentGame) currentGame.stop();
    }

    static getRandomId() {
        while (true) {
            let id = Math.floor(Math.random() * (999999 - 100000)) + 100000;
            let taken = this.currentGames.find(
                (game) => game && game.gameId == id
            );
            if (!taken) return id;
        }
    }

    /**
     * Remove a finished game from the list of currently played games.
     * @param {*} gameId
     */
    static removeGame(gameId) {
        logger.debug("Remove game", { label: "GAMES_REMOVE_GAME" });
        let index = Games.currentGames.findIndex(
            (game) => game && game.gameId == gameId
        );
        if (index >= 0) Games.currentGames[index] = null;
    }

    /**
     * Loads the scoreboard from the file. Creates the file if it does not exist.
     */
    static loadScoreboard() {
        return new Promise<void>((resolve) => {
            fs.access(
                "./src/games/scoreboard.json",
                fs.constants.F_OK,
                (err) => {
                    if (err) {
                        this.scoreboard = {
                            2048: [],
                            power4: [],
                        };
                        resolve();
                    } else {
                        this.scoreboard = require("../src/games/scoreboard.json");
                        resolve();
                    }
                }
            );
        });
    }

    static saveScoreboard() {
        return new Promise<void>((resolve, reject) => {
            fs.writeFile(
                "./src/games/scoreboard.json",
                JSON.stringify(this.scoreboard, null, 4),
                (err) => {
                    if (err) {
                        logger.error(`Error while saving scoreboard: ${err}`, {
                            label: "GAMES_SAVE_SCOREBOARD",
                        });
                        return reject(err);
                    } else return resolve();
                }
            );
        });
    }
}
