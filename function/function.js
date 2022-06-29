const Discord = require('discord.js-selfbot-v13');

/**
 * @param {Discord.Client} client
 * @param {String} type guild, channel as string
 * @param {String} value id
 * @param {String} option.channelType GUILD_TEXT, GUILD_VOICE
 * @returns {Object} status
 */
async function checking(
    client,
    type,
    value,
    option = {
        channelType: String,
    }
) {
    if (type == 'guild') {
        const guild = await client.guilds.cache.get(value);
        if (guild) {
            return {
                status: true,
                rsp: 0,
                guild: guild
            };
        }
        return {
            status: false,
            rsp: 1,
        };
    } else if (type == 'channel') {
        if (option.channelType) {
            const type = option.channelType;
            const channel = await client.channels.cache.get(value);
            if (!channel) {
                return {
                    status: false,
                    rsp: 1,
                };
            }
            const checkType = channel.type == type;
            if (checkType) {
                return {
                    status: true,
                    rsp: 0,
                    channel: channel,
                };
            } else {
                return {
                    status: false,
                    rsp: 1,
                };
            }
        } else {
            return {
                status: (await client.channels.cache.get(value)) ? true : false,
                rsp: (await client.channels.cache.get(value)) ? 0 : 1,
                channel: (await client.channels.cache.get(value)) || undefined,
            };
        }
    }
}
module.exports = {
    checking,
};
