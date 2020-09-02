const Scene = require('telegraf/scenes/base');
const {Telegraf} = require('telegraf');
const {Extra} = Telegraf;


module.exports = (bot) => {
    const aboutScene = new Scene('about');

    aboutScene.enter(async ctx => {
        ctx.deleteMessage().catch(err => {
        });
        ctx.session.mesage_filter.forEach(msg => {
            ctx.deleteMessage(msg)
        })
        const message = 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Mauris pellentesque aliquam auctor. ' +
            'Etiam facilisis iaculis tellus vitae suscipit. In leo felis, vulputate eu cursus ac, rutrum ut dolor.'
        // ctx.reply(message, Extra.markup(markup => {
        //     return markup.inlineKeyboard([{text: ctx.i18n.t('menuBack'), callback_data: 'Back'}])
        // }))


        const msg = bot.telegram.sendPhoto(ctx.chat.id,
            'https://telegra.ph/file/56f1452feb6ddf47807b1.jpg',
            {
                width: 480,
                height: 256,
                caption: message,
                reply_markup: {
                    'inline_keyboard': [
                        [{text: ctx.i18n.t('menuBack'), callback_data: 'Back'}]
                    ]
                }
            })
        ctx.session.mesage_filter.push((await msg).message_id);
    })

    aboutScene.action('Back', ctx => {
        ctx.scene.enter('mainMenu', {
            start: ctx.i18n.t('mainMenu')
        })
    })

    return aboutScene;
}