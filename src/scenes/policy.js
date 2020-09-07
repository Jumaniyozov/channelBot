const Scene = require('telegraf/scenes/base');
const {Telegraf} = require('telegraf');
const {Extra} = Telegraf;
const Markup = require('telegraf/markup');

const Channel = require('../models/Channel');
const SamplePost = require('../models/SamplePost');
const Country = require('../models/Country');

module.exports = (bot) => {

    const policyScene = new Scene('policy');

    policyScene.enter(async (ctx) => {
        ctx.deleteMessage().catch(err => {
        });
        ctx.session.mesage_filter.forEach(msg => {
            ctx.deleteMessage(msg)
        })
        const results = await Channel.findAll({where: {country: ctx.session.chosenCountry[0].id}});
        ctx.session.channels = results.map(channel => {
            return [{text: channel.dataValues.name, callback_data: `c:${channel.id}:${channel.dataValues.name}`}]
        })
        ctx.session.channelNames = results.map(channel => {
            return channel.dataValues.name
        })

        ctx.reply(ctx.i18n.t('menuPolicy'), Extra.markup(markup => {
            return markup.inlineKeyboard(
                [
                    ...ctx.session.channels,
                    [{text: `◀️ ${ctx.i18n.t('menuBack')}`, callback_data: 'back'}],
                ]).resize()
        }))
    })

    policyScene.action('back', ctx => {
        ctx.deleteMessage().catch(err => {
        });
        ctx.answerCbQuery();
        ctx.scene.enter('mainMenu', {
            start: ctx.i18n.t('mainMenu')
        })
    })

    policyScene.action('backChannelMenu', ctx => {
        ctx.answerCbQuery();
        ctx.deleteMessage().catch(err => {
        });
        ctx.scene.enter('policy')
    })


    policyScene.action('Previous', async (ctx) => {
        ctx.answerCbQuery();
        ctx.session.currentCont = ctx.session.currentCont - 1;

        let markup;

        if (ctx.session.currentCont !== 0) {
            markup = {
                'inline_keyboard': [
                    [{text: '◀️', callback_data: 'Previous'}, {text: '▶️', callback_data: 'Next'},
                    ],
                    [{
                        text: `◀️ ${ctx.i18n.t('menuBack')}`,
                        callback_data: `c:${ctx.session.channelId}:${ctx.session.channelName}`
                    }]
                ]
            }
        } else {
            markup = {
                'inline_keyboard': [
                    [{text: '▶️', callback_data: 'Next'},
                    ],
                    [{
                        text: `◀️ ${ctx.i18n.t('menuBack')}`,
                        callback_data: `c:${ctx.session.channelId}:${ctx.session.channelName}`
                    }]
                ]
            }
        }

        const data = ctx.session.contents[ctx.session.currentCont].data;

        if (ctx.session.contents[ctx.session.currentCont].data.mediaType === 'video') {
            const msg = bot.telegram.sendVideo(ctx.chat.id, data.media, {
                width: 480,
                height: 256,
                caption: `${data.header}\n` +
                    '\n' +
                    `${data.caption}` +
                    '\n' +
                    `${data.contacts}`,
                reply_markup: markup

            })
            ctx.session.mesage_filter.push((await msg).message_id);

        } else if (ctx.session.contents[ctx.session.currentCont].data.mediaType === 'photo') {
            const msg = bot.telegram.sendPhoto(ctx.chat.id, data.media, {
                width: 480,
                height: 256,
                caption: `${data.header}\n` +
                    '\n' +
                    `${data.caption}` +
                    '\n' +
                    `${data.contacts}`,
                reply_markup: ctx.session.currentCont === 0 ? markup_1 : markup_2
            })

            ctx.session.mesage_filter.push((await msg).message_id);
        }
    })


    policyScene.action('Next', async (ctx) => {
        ctx.answerCbQuery();
        ctx.deleteMessage().catch(err => {
        });
        ctx.session.currentCont = ctx.session.currentCont + 1;

        let markup;

        if ((ctx.session.currentCont + 1) !== ctx.session.contents.length) {
            markup = {
                'inline_keyboard': [
                    [{text: '◀️', callback_data: 'Previous'}, {text: '▶️', callback_data: 'Next'},
                    ],
                    [{
                        text: `◀️ ${ctx.i18n.t('menuBack')}`,
                        callback_data: `c:${ctx.session.channelId}:${ctx.session.channelName}`
                    }]
                ]
            }
        } else {
            markup = {
                'inline_keyboard': [
                    [{text: '◀️', callback_data: 'Previous'},
                    ],
                    [{
                        text: `◀️ ${ctx.i18n.t('menuBack')}`,
                        callback_data: `c:${ctx.session.channelId}:${ctx.session.channelName}`
                    }]
                ]
            }
        }

        const data = ctx.session.contents[ctx.session.currentCont].data;

        if (ctx.session.contents[ctx.session.currentCont].data.mediaType === 'video') {
            const msg = bot.telegram.sendVideo(ctx.chat.id, data.media, {
                width: 480,
                height: 256,
                caption: `${data.header}\n` +
                    '\n' +
                    `${data.caption}` +
                    '\n' +
                    `${data.contacts}`,
                reply_markup: markup
            })
            ctx.session.mesage_filter.push((await msg).message_id);

        } else if (data.mediaType === 'photo') {
            const msg = bot.telegram.sendPhoto(ctx.chat.id, data.media, {
                width: 480,
                height: 256,
                caption: `${data.header}\n` +
                    '\n' +
                    `${data.caption}` +
                    '\n' +
                    `${data.contacts}`,
                reply_markup: markup
            })

            ctx.session.mesage_filter.push((await msg).message_id);
        }
    })

    policyScene.action('policies', ctx => {
        ctx.answerCbQuery();
        ctx.deleteMessage().catch(err => {
        });
        const message = `
<b>${ctx.i18n.t('chanelPolicy')}</b>
<a href="https://telegra.ph/Usloviya-razmeshcheniya-08-24">${ctx.i18n.t('chanelLink')}</a>
`
        ctx.replyWithHTML(message, Extra.markup(markup => {
            return markup.inlineKeyboard([{
                text: `◀️ ${ctx.i18n.t('menuBack')}`,
                callback_data: `c:${ctx.session.channelId}:${ctx.session.channelName}`
            }]).resize()
        }))
    })


    policyScene.on("callback_query", async ctx => {
        ctx.answerCbQuery();
        let [type, id, channelName] = ctx.callbackQuery.data.split(":")
        if (type === "c") {
            let channel = await Channel.findOne({
                where: {
                    id: id
                }
            })
            ctx.session.channelId = id;
            ctx.session.channelDesc = channel[`desc_${ctx.session.language}`];
            ctx.session.channelName = channelName;

            if (channel) {
                if (channel.is_channel) {
                    ctx.answerCbQuery()
                    ctx.deleteMessage().catch(err => {
                    });
                    ctx.reply(ctx.session.channelDesc, Extra.HTML().markup(markup => {
                        return markup.inlineKeyboard([
                            [Markup.callbackButton(ctx.i18n.t('chanelSample'), `p:${channel.id}:${channelName}`)],
                            [Markup.callbackButton(ctx.i18n.t('chanelReq'), `policies`)],
                            [Markup.callbackButton(`◀️ ${ctx.i18n.t('menuBack')}`, `backChannelMenu`)],
                        ])
                    }))
                } else {
                    ctx.answerCbQuery()
                    ctx.deleteMessage().catch(err => {
                    });
                    ctx.reply(channel[`desc_${ctx.session.language}`], Extra.HTML().markup(markup => {
                        return markup.inlineKeyboard([
                            [Markup.callbackButton(`◀️ ${ctx.i18n.t('menuBack')}`, 'backChannelMenu')]
                        ])
                    }))
                }
            }
        } else if (type === 'p') {

            let posts = await SamplePost.findAll({
                where: {
                    channelname: channelName
                }
            })

            console.log(posts);

            if (posts.length !== 0) {
                ctx.session.contents = posts.map((content, index) => {
                    return {index: index, data: content.dataValues}
                })
                ctx.session.currentCont = 0;

                let replyMarkup;

                const markup_1 = {
                    'inline_keyboard': [
                        [{text: '▶️', callback_data: 'Next'},
                        ],
                        [{
                            text: `◀️ ${ctx.i18n.t('menuBack')}`,
                            callback_data: `b:${ctx.session.channelId}:${channelName}`
                        }]
                    ]
                }

                const markup_2 = {
                    'inline_keyboard': [
                        [{text: '◀️', callback_data: 'Previous'}, {text: '▶️', callback_data: 'Next'},
                        ],
                        [{
                            text: `◀️ ${ctx.i18n.t('menuBack')}`,
                            callback_data: `b:${ctx.session.channelId}:${channelName}`
                        }]
                    ]
                }

                const markup_3 = {
                    'inline_keyboard': [
                        [{
                            text: `◀️ ${ctx.i18n.t('menuBack')}`,
                            callback_data: `b:${ctx.session.channelId}:${channelName}`
                        }]
                    ]
                }

                if (posts.length === 1) {
                    replyMarkup = markup_3
                } else if (ctx.session.currentCont === 0) {
                    replyMarkup = markup_1
                } else {
                    replyMarkup = markup_2
                }


                const data = ctx.session.contents[ctx.session.currentCont].data;
                ctx.answerCbQuery()
                ctx.deleteMessage().catch(err => {
                });

                if (data.mediaType === 'video') {
                    const msg = bot.telegram.sendVideo(ctx.chat.id, data.media, {
                        width: 480,
                        height: 256,
                        caption: `${data.header}\n` +
                            '\n' +
                            `${data.caption}` +
                            '\n' +
                            `${data.contacts}`,
                        reply_markup: replyMarkup
                    })
                    ctx.session.mesage_filter.push((await msg).message_id);

                } else if (data.mediaType === 'photo') {
                    const msg = bot.telegram.sendPhoto(ctx.chat.id, data.media, {
                        width: 480,
                        height: 256,
                        caption: `${data.header}\n` +
                            '\n' +
                            `${data.caption}` +
                            '\n' +
                            `${data.contacts}`,
                        reply_markup: replyMarkup
                    })

                    ctx.session.mesage_filter.push((await msg).message_id);
                }


            } else {
                ctx.answerCbQuery()
                ctx.deleteMessage().catch(err => {
                });
                ctx.reply(`${ctx.i18n.t('emptyPost')}`, Extra.HTML().markup(markup => {
                    return markup.inlineKeyboard([
                        [Markup.callbackButton(`◀️ ${ctx.i18n.t('menuBack')}`, `b:${ctx.session.channelId}:${channelName}`)]
                    ])
                }))
            }
        } else if (type === 'b') {
            ctx.answerCbQuery()
            ctx.deleteMessage().catch(err => {
            });
            ctx.reply(ctx.session.channelDesc, Extra.HTML().markup(markup => {
                return markup.inlineKeyboard([
                    [Markup.callbackButton(ctx.i18n.t('chanelSample'), `p:${ctx.session.channelId}:${channelName}`)],
                    [Markup.callbackButton(ctx.i18n.t('chanelReq'), `policies`)],
                    [Markup.callbackButton(`◀️ ${ctx.i18n.t('menuBack')}`, `backChannelMenu`)],
                    // [Markup.callbackButton(`◀️ ${ctx.i18n.t('menuBack')}`, `b:${channel.id}:${channelName}`)],
                ])
            }))
        }
    })

    return policyScene;
}