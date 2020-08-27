require('dotenv').config()
const {Telegraf} = require('telegraf');
const path = require('path');
const I18n = require('telegraf-i18n');
const MySQLSession = require('telegraf-session-mysql');
const Stage = require('telegraf/stage');
const Scene = require('telegraf/scenes/base');
const WizardScene = require('telegraf/scenes/wizard');
const {Extra} = Telegraf;
const Markup = require('telegraf/markup');

const Post = require('./src/models/Post');
const User = require('./src/models/User');
const Channel = require('./src/models/Channel');
const SamplePost = require('./src/models/SamplePost');


const i18n = new I18n({
    directory: path.resolve(__dirname, 'locales'),
    defaultLanguage: 'ru',
    sessionName: 'session',
    useSession: true,
    templateData: {
        pluralize: I18n.pluralize,
        uppercase: (value) => value.toUpperCase()
    }
})

const local = 'ru';

const session = new MySQLSession({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: 'testcase'
})

const botInitial = new Telegraf(process.env.TGTOKEN)
botInitial.use(session.middleware())
botInitial.use(i18n.middleware())


const languageScene = new Scene('language');

languageScene.enter(async (ctx) => {
    ctx.deleteMessage().catch();
    if (ctx.session.mesage_filter.length !== 0) {
        ctx.session.mesage_filter.forEach(msg => {
            ctx.deleteMessage(msg)
        })
    }
    const msg = ctx.reply('Выберите язык / Tilni Tanlang', Extra.markup(markup => {
        return markup.keyboard([
            [`🇺🇿 O'zbek tili`],
            [`🇷🇺 Русский язык`]
        ]).resize();
    }))
    ctx.session.mesage_filter.push((await msg).message_id);
});

languageScene.hears('🇺🇿 O\'zbek tili', async ctx => {
    ctx.i18n.locale('uz')
    ctx.session.language = 'uz'
    return ctx.scene.enter('registration');
});

languageScene.hears('🇷🇺 Русский язык', async ctx => {
    ctx.i18n.locale('ru')
    ctx.session.language = 'ru'
    return ctx.scene.enter('registration');
});

const registrationScene = new Scene('registration');

registrationScene.enter( async ctx => {

    const msg = botInitial.telegram.sendMessage(ctx.chat.id, ctx.i18n.t('regMessage'), {
        parse_mode: 'HTML',
        reply_markup: {
            keyboard: [
                [{text: `📲 ${ctx.i18n.t('regMessage')}`, request_contact: true}]
            ],
            resize_keyboard: true,
            one_time_keyboard: true
        }
    })

});

registrationScene.on('contact', (ctx) => {
    ctx.deleteMessage();
    const user = User.create({
        user_id: ctx.message.from.id,
        username: ctx.message.from.username,
        lastName: ctx.message.contact.last_name,
        firstName: ctx.message.contact.first_name,
        language: ctx.session.language,
        phone: ctx.message.contact.phone_number,
    })
    ctx.scene.enter('mainMenu');
})


const mainScene = new Scene('mainMenu');

mainScene.enter(async (ctx) => {
    ctx.deleteMessage();
    let message = ctx.i18n.t('greeting', {
        ctx: ctx
    })
    if(ctx.scene.state.start) {
        message = ctx.scene.state.start
    }
    const msg = botInitial.telegram.sendMessage(ctx.chat.id, message, {
        parse_mode: 'HTML',
        reply_markup: {
            keyboard: [
                [`📝 ${ctx.i18n.t('menuPolicy')}`, `📓 ${ctx.i18n.t('menuRequest')}`],
                [`🖨️ ${ctx.i18n.t('menuAbout')}`],
                // [`◀️ ${ctx.i18n.t('mainMenuBack')}`]
            ],
            resize_keyboard: true,
            one_time_keyboard: true
        }
    })

    ctx.session.message = ctx.message.text;
    ctx.session.mesage_filter.push((await msg).message_id);
})

mainScene.hears(['📝 Условия размещения', '📝 Yuklash talablari'], ctx => {
    ctx.scene.enter('policy')
})

mainScene.hears(['📓 Оставить заявку', '📓 Sorovnoma qoldirish'], ctx => {
    ctx.scene.enter('request')
})

mainScene.hears(['🖨️ О нас', '🖨️ Biz haqimizda'], ctx => {
    ctx.scene.enter('about')
})

mainScene.hears(['◀️ Назад к выбору языка', '◀️ Tilni tanlashga qaytish'], ctx => {
    ctx.scene.enter('language')
})


const policyScene = new Scene('policy');

policyScene.enter(async (ctx) => {
    ctx.deleteMessage()
    ctx.session.mesage_filter.forEach(msg => {
        ctx.deleteMessage(msg)
    })
    const results = await Channel.findAll();
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
    ctx.deleteMessage()
    ctx.scene.enter('mainMenu', {
        start: 'Главное меню'
    })
})

policyScene.action('backChannelMenu', ctx => {
    ctx.deleteMessage()
    ctx.scene.enter('policy')
})


policyScene.action('Previous', async (ctx) => {
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
        const msg = botInitial.telegram.sendVideo(ctx.chat.id, data.media, {
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
        const msg = botInitial.telegram.sendPhoto(ctx.chat.id, data.media, {
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
    ctx.deleteMessage();
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
        const msg = botInitial.telegram.sendVideo(ctx.chat.id, data.media, {
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
        const msg = botInitial.telegram.sendPhoto(ctx.chat.id, data.media, {
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
    ctx.deleteMessage()
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
                console.log(ctx.session.channelId, channelName);
                ctx.answerCbQuery()
                ctx.deleteMessage()
                ctx.reply(ctx.session.channelDesc, Extra.HTML().markup(markup => {
                    return markup.inlineKeyboard([
                        [Markup.callbackButton(ctx.i18n.t('chanelSample'), `p:${channel.id}:${channelName}`)],
                        [Markup.callbackButton(ctx.i18n.t('chanelReq'), `policies`)],
                        [Markup.callbackButton(`◀️ ${ctx.i18n.t('menuBack')}`, `backChannelMenu`)],
                    ])
                }))
            } else {
                ctx.answerCbQuery()
                ctx.deleteMessage()
                ctx.reply(channel[`desc_${ctx.session.language}`], Extra.HTML().markup(markup => {
                    return markup.inlineKeyboard([
                        [Markup.callbackButton(`◀️ ${ctx.i18n.t('menuBack')}`, 'backChannelMenu')]
                    ])
                }))
            }
        }
    } else if (type === 'p') {
        console.log(ctx.session.channelId, channelName);

        let posts = await SamplePost.findAll({
            where: {
                channelname: channelName
            }
        })


        if (posts.length !== 0) {
            ctx.session.contents = posts.map((content, index) => {
                return {index: index, data: content.dataValues}
            })
            ctx.session.currentCont = 0;


            const markup_1 = {
                'inline_keyboard': [
                    [{text: '▶️', callback_data: 'Next'},
                    ],
                    [{text: `◀️ ${ctx.i18n.t('menuBack')}`, callback_data: `b:${ctx.session.channelId}:${channelName}`}]
                ]
            }

            const markup_2 = {
                'inline_keyboard': [
                    [{text: '◀️', callback_data: 'Previous'}, {text: '▶️', callback_data: 'Next'},
                    ],
                    [{text: `◀️ ${ctx.i18n.t('menuBack')}`, callback_data: `b:${ctx.session.channelId}:${channelName}`}]
                ]
            }

            const data = ctx.session.contents[ctx.session.currentCont].data;
            ctx.answerCbQuery()
            ctx.deleteMessage()
            const msg = botInitial.telegram.sendVideo(ctx.chat.id, data.media, {
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

        } else {
            ctx.answerCbQuery()
            ctx.deleteMessage()
            ctx.reply(`${ctx.i18n.t('emptyPost')}`, Extra.HTML().markup(markup => {
                return markup.inlineKeyboard([
                    [Markup.callbackButton(`◀️ ${ctx.i18n.t('menuBack')}`, `b:${ctx.session.channelId}:${channelName}`)]
                ])
            }))
        }
    } else if (type === 'b') {
        ctx.answerCbQuery()
        ctx.deleteMessage()
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

const requestScene = new Scene('request');

requestScene.enter(ctx => {
    ctx.scene.enter('createRequest')
})


const createRequest = new WizardScene('createRequest',
    async (ctx) => {
        ctx.deleteMessage()
        const msg = ctx.reply(ctx.i18n.t('reqCreateComp'), Extra.markup(markup => {
            return markup.keyboard([`◀️ ${ctx.i18n.t('menuBack')}`]).resize()
        }));

        // ctx.session.mesage_filter.push((await msg).message_id);
        return ctx.wizard.next()
    },
    async (ctx) => {
        const msg = ctx.reply(ctx.i18n.t('reqCreateCon'), Extra.markup(markup => {
            return markup.keyboard([`◀️ ${ctx.i18n.t('menuBack')}`]).resize()
        }));
        ctx.session.reqCreateComp = ctx.message.text;
        // ctx.session.mesage_filter.push((await msg).message_id);
        return ctx.wizard.next()
    },
    async (ctx) => {
        // ctx.deleteMessage();
        // ctx.session.mesage_filter.forEach(msg => {
        //     ctx.deleteMessage(msg)
        // })
        const msg = ctx.reply(ctx.i18n.t('reqCreateComType'), Extra.markup(markup => {
            return markup.keyboard([`◀️ ${ctx.i18n.t('menuBack')}`]).resize()
        }));
        ctx.session.reqCreateCon = ctx.message.text;
        // ctx.session.mesage_filter.push((await msg).message_id);
        return ctx.wizard.next();
    },
    async (ctx) => {
        // ctx.deleteMessage();
        // ctx.session.mesage_filter.forEach(msg => {
        //     ctx.deleteMessage(msg)
        // })
        const msg = ctx.reply(ctx.i18n.t('reqCreateDate'), Extra.markup(markup => {
            return markup.keyboard([`◀️ ${ctx.i18n.t('menuBack')}`]).resize()
        }));
        ctx.session.reqCreateComType = ctx.message.text;
        // ctx.session.mesage_filter.push((await msg).message_id);
        return ctx.wizard.next();
    },
    async (ctx) => {
        // ctx.deleteMessage();
        // ctx.session.mesage_filter.forEach(msg => {
        //     ctx.deleteMessage(msg)
        // })
        const msg = ctx.reply(ctx.i18n.t('reqCreateProdType'), Extra.markup(markup => {
            return markup.keyboard([`◀️ ${ctx.i18n.t('menuBack')}`]).resize()
        }));
        ctx.session.reqCreateDate = ctx.message.text;
        // ctx.session.mesage_filter.push((await msg).message_id);
        return ctx.wizard.next()
    },
    async (ctx) => {
        // ctx.deleteMessage();
        ctx.session.reqCreateProdType = ctx.message.text;

        const post = await Post.create({
            compName: ctx.session.reqCreateComp,
            contacts: ctx.session.reqCreateCon,
            compType: ctx.session.reqCreateComType,
            pubdate: ctx.session.reqCreateDate,
            prodType: ctx.session.reqCreateProdType
        });

        const message = `
<b>${ctx.i18n.t('compName')}</b>: <i>${ctx.session.reqCreateComp}</i>
<b>${ctx.i18n.t('compCont')}</b>: <i>${ctx.session.reqCreateCon}</i>
<b>${ctx.i18n.t('compCompType')}</b>: <i>${ctx.session.reqCreateComType}</i>
<b>${ctx.i18n.t('compPubDate')}</b>: <i>${ctx.session.reqCreateDate}</i>
<b>${ctx.i18n.t('compProdType')}</b>: <i>${ctx.session.reqCreateProdType}</i>`

        botInitial.telegram.sendMessage('-1001343832095', message, {parse_mode: 'HTML'});

        ctx.session.reqCreateComp = '';
        ctx.session.reqCreateCon = '';
        ctx.session.reqCreateComType = '';
        ctx.session.reqCreateDate = '';
        ctx.session.reqCreateProdType = '';

        ctx.scene.enter('mainMenu', {
            start: 'Ваша заявка успешно отправалена. В ближайшее время с вами свяжутся наши специалисты.'
        })
    }
);

createRequest.hears(['◀️ Назад', '◀️ Ortga'], ctx => {
    ctx.scene.enter('mainMenu', {
        start: 'Главное меню'
    })
})

createRequest.action('BACK', ctx => {
    ctx.scene.enter('mainMenu')
})

const aboutScene = new Scene('about');

aboutScene.enter(ctx => {
    ctx.deleteMessage();
    ctx.session.mesage_filter.forEach(msg => {
        ctx.deleteMessage(msg)
    })
    const message = 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Mauris pellentesque aliquam auctor. ' +
        'Etiam facilisis iaculis tellus vitae suscipit. In leo felis, vulputate eu cursus ac, rutrum ut dolor.'
    ctx.reply(message, Extra.markup(markup => {
        return markup.inlineKeyboard([{text: ctx.i18n.t('menuBack'), callback_data: 'Back'}])
    }))
})

aboutScene.action('Back', ctx => {
    // ctx.deleteMessage()

    ctx.scene.enter('mainMenu')
})


const stage = new Stage([languageScene, mainScene, policyScene, requestScene,
    aboutScene, createRequest, registrationScene]);


botInitial.use(stage.middleware());

botInitial.start(ctx => {
    if (ctx.session.mesage_filter) {
        if (ctx.session.mesage_filter.length !== 0) {
            ctx.session.mesage_filter.forEach(msg => {
                ctx.deleteMessage(msg)
            })
        }
    }
    ctx.session.mesage_filter = [];

    ctx.scene.enter('language');
})


botInitial.startPolling()