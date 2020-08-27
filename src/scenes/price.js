const Scene = require('telegraf/scenes/base');
const {Telegraf} = require('telegraf');
const {Extra} = Telegraf;
const Markup = require('telegraf/markup');
const fs = require('fs');

module.exports = (bot) => {
    const priceScene = new Scene('price');

    priceScene.enter(async ctx => {

        bot.telegram.sendDocument(ctx.from.id, {
            source: fs.readFileSync('C:\\Users\\Dell\\Desktop\\Projects\\Node\\testCase\\src\\documents\\цены.xlsx'),
            filename: 'цены.xlsx'
        }).catch(function(error){ console.log(error); })


        const msg = bot.telegram.sendMessage(ctx.chat.id, 'Цены', {
            parse_mode: 'HTML',
            reply_markup: {
                keyboard: [
                    [`Назад`]
                ],
                resize_keyboard: true,
            }
        })
        //
        // ctx.scene.enter('mainMenu', {
        //     start: ctx.i18n.t('mainMenu')
        // })
    });

    priceScene.hears('Назад', ctx => {
        ctx.scene.enter('mainMenu', {
            start: ctx.i18n.t('mainMenu')
        })
    })

    return priceScene;
}
