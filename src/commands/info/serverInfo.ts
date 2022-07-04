import Command from "../../Command";
import { MessageEmbed } from "discord.js";
import logger from "../../logger";
import Sentry from "@sentry/node";

export default class ServerInfo extends Command {
    static commandName: string = "serverInfo";
    static alias = ["server", "serverinfo"];
    static description = "Affiche les informations d'un serveur";

    static async call(message, _phoenix) {
        const server = message.guild;

        const owner = await server.fetchOwner();

        const embed = new MessageEmbed()
            .setTimestamp()
            .setColor(0x00ff00)
            .setThumbnail(server.iconURL())
            .addField("Name", `${server.name}`, true)
            .addField(
                "Owner",
                `${owner.user.username}#${owner.user.discriminator}`,
                true
            )
            .addField("ID", `${server.id}`)
            .addField("Members", `${server.memberCount}`, true)
            .addField("Channels", `${server.channels.cache.size}`, true)
            .addField("Roles", `${server.roles.cache.size}`, true)
            .addField("Created at", `${server.createdAt}`);

        message.channel.send({ embeds: [embed] }).catch((err) => {
            Sentry.captureException(err);
            message.reply(`An error occured.`);
            logger.error(err, { label: "SERVER_INFO" });
        });
    }
}
