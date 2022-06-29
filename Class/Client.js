const Discord = require('discord.js-selfbot-v13');
const func = require('../function/function');
const { joinVoiceChannel } = require('@discordjs/voice');
const rpc = require('discord-rpc-contructor');

module.exports = class Client extends Discord.Client {
    constructor(
        option = {
            customLog: Function,
            readyLog: {
                mode: Boolean,
                text: String,
            },
            main: {
                guildId: String,
                textChannelId: String,
                voiceChannelId: String,
            },
        }
    ) {
        super({
            checkUpdate: false,
        });
        this.customOption = option;
        this.log = this.customOption?.customLog || console.log;
    }
    /**
     * Loginnnnnnn
     * @param {String} token
     */
    async loginToUser(token) {
        if (token.length === 0) {
            throw new Error(`Missing Token.`);
        }
        if (typeof token !== 'string') {
            throw new Error(`Token must be string.`);
        }
        await this.login(token)
            .then(() => {
                this.log(`Package made by hocsinhgioitoan, thanks for using!`);
                if (this.customOption?.readyLog?.mode) {
                    this.on('ready', () => {
                        const text =
                            this.customOption?.readyLog?.text ||
                            `<userName> is ready!`;

                        this.log(
                            text.replace(`<userName>`, this.user.username)
                        );
                    });
                }
            })
            .catch((e) => {
                console.log(e);
            });
    }

    async autoVoice(
        option = {
            useMainClientOption: false,
            rejoin: false,
            timeToConnectAgian: 1000 * 60 * 15, // 15 mins
            guildId: String,
            voiceChannelId: String,
            text: {
                waiting: String,
                done: String,
                rejoin: String,
            },
            selfDeaf: Boolean,
            selfMute: Boolean,
        }
    ) {
        const check_guild = await func.checking(
            this,
            'guild',
            option.useMainClientOption
                ? this.customOption.main.guildId
                : option.guildId
        );
        if (option.useMainClientOption) {
            if (typeof option.useMainClientOption !== `boolean`)
                throw new Error('Invalid type of useMainClientOption');
        }
        if (option.rejoin) {
            if (typeof option.rejoin !== `boolean`)
                throw new Error('Invalid type of rejoin');
        }
        if (option.timeToConnectAgian) {
            if (typeof option.timeToConnectAgian !== `number`)
                throw new Error('Invalid type of timeToConnectAgian');
        }
        if (option.selfDeaf) {
            if (typeof option.selfDeaf !== `boolean`)
                throw new Error('Invalid type of selfDeaf');
        }
        if (option.selfMute) {
            if (typeof option.selfMute !== `boolean`)
                throw new Error('Invalid type of selfMute');
        }
        if (!check_guild.status) throw new Error(`Invalid Guild Id`);
        const check_voice_channel = await func.checking(
            this,
            'channel',
            option.useMainClientOption
                ? this.customOption.main.voiceChannelId
                : option.voiceChannelId,
            {
                channelType: 'GUILD_VOICE',
            }
        );
        if (!check_voice_channel.status)
            throw new Error(`Invalid Channel Voice Id`);
        this.on('ready', async () => {
            const waitText =
                option?.text?.waiting ||
                `Joining voice <voiceChannelName> in <guildName>`;
            this.log(
                waitText
                    .replace(
                        `<voiceChannelName>`,
                        check_voice_channel.channel.name
                    )
                    .replace(`<guildName>`, check_guild.guild.name)
            );
            await join();
            if (option.rejoin) {
                setInterval(async () => {
                    await join();
                    const rejoinText =
                        option?.text?.rejoin ||
                        `Join agian <voiceChannelName> in <guildName>`;
                    this.log(
                        rejoinText
                            .replace(
                                `<voiceChannelName>`,
                                check_voice_channel.channel.name
                            )
                            .replace(`<guildName>`, check_guild.guild.name)
                    );
                }, option.timeToConnectAgian || 1000 * 60 * 15);
            }
            const doneText =
                option?.text?.done ||
                `Joined voice <voiceChannelName> in <guildName>`;
            this.log(
                doneText
                    .replace(
                        `<voiceChannelName>`,
                        check_voice_channel.channel.name
                    )
                    .replace(`<guildName>`, check_guild.guild.name)
            );

            function join() {
                joinVoiceChannel({
                    channelId: option.voiceChannelId,
                    guildId: option.guildId,
                    adapterCreator: check_guild.guild.voiceAdapterCreator,
                    selfDeaf: option.selfDeaf || false,
                    selfMute: option.selfMute || false,
                });
            }
        });
    }
    async changeStatus(
        option = {
            CustomStatus: {
                name: String,
                DiscordEmojiOrUnicodeEmoji: String,
                DiscordEmoji: {
                    id: String,
                    name: String,
                    animated: Boolean,
                },
                UnicodeEmoji: String,
            },
            RichPresence: {
                applicationId: String,
                type: Number,
                state: String,
                name: String,
                details: String,
                option: {
                    party: [Array],
                    startTime: Number,
                },
                text: {
                    big: String,
                    small: String,
                },
                autoChoiceImage: Boolean,
                image: {
                    big: String,
                    small: String,
                },
            },
            Spotify
        }
    ) {
        if (Object.keys(option).length >= 2) {
            throw new Error(`Only 1 object`);
        }
        if (option.CustomStatus) {
            if (!option.CustomStatus.name)
                throw new Error(`Mising name for CustomStatus`);
            const RP = new rpc.CustomStatus();
            if (
                option?.CustomStatus?.DiscordEmojiOrUnicodeEmoji?.toLowerCase?.() ==
                'discord'
            ) {
                RP.setDiscordEmoji({
                    id: option.CustomStatus.DiscordEmoji.id,
                    name: option.CustomStatus.DiscordEmoji.name,
                    animated: option.CustomStatus.DiscordEmoji.animated,
                });
            } else if (
                option?.CustomStatus?.DiscordEmojiOrUnicodeEmoji?.toLowerCase?.() ==
                'unicode'
            ) {
                RP.setUnicodeEmoji(option.CustomStatus.UnicodeEmoji);
            }
            RP.setState(`${option.CustomStatus.name}`);
            RP.toDiscord();
            this.user.setActivity(RP.game);
        } else if (option.RichPresence) {
            if (!option.RichPresence.applicationId)
                throw new Error(`Mising Application id for RichPresence`);
            let bigImage;
            let smallImage;
            if (option.RichPresence.autoChoiceImage) {
                const images = await rpc.getRpcImages(
                    option.RichPresence.applicationId
                );
                if (images.length <= 1) {
                    throw Error('Not Enough image for RichPresence');
                } else {
                    bigImage = images[0].id;
                    smallImage = images[0].id;
                }
            } else {
                if (
                    !option.RichPresence.image.big ||
                    !option.RichPresence.image.small
                ) {
                    throw Error('Missing Image to use');
                }
            }
            const RP = new rpc.Rpc()
                .setApplicationId(option.RichPresence.applicationId)
                .setType(option.RichPresence.type || 1)
                .setState(option.RichPresence.state || 'None')
                .setDetails(option.RichPresence.details || 'None')
                .setName(option.RichPresence.name || 'None')
                .setParty({
                    size: option.RichPresence?.option?.party || [1, 2],
                    id: rpc.uuid(),
                })
                .setStartTimestamp(
                    option.RichPresence?.option?.startTime || Date.now()
                )
                .setAssetsLargeText(option.RichPresence?.text?.big || 'None')
                .setAssetsSmallText(option.RichPresence?.text?.small || 'None')
                .setAssetsLargeImage(
                    option.RichPresence.autoChoiceImage
                        ? bigImage
                        : option.RichPresence.image.big
                )
                .setAssetsSmallImage(
                    option.RichPresence.autoChoiceImage
                        ? smallImage
                        : option.RichPresence.image.small
                )
                .toDiscord();
            this.user.setActivity(RP.game);
        } else {
            throw new Error('Mising status');
        }
    }
};
