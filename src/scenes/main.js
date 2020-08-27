const Scene = require('telegraf/scenes/base');
const {Telegraf} = require('telegraf');

module.exports = (bot) => {
    const mainScene = new Scene('mainMenu');

    mainScene.enter(async (ctx) => {
        ctx.deleteMessage();
        let message = ctx.i18n.t('greeting', {
            ctx: ctx
        })
        if (ctx.scene.state.start) {
            message = ctx.scene.state.start
        }
        const msg = bot.telegram.sendMessage(ctx.chat.id, message, {
            parse_mode: 'HTML',
            reply_markup: {
                keyboard: [
                    [`📝 ${ctx.i18n.t('menuPolicy')}`, `📓 ${ctx.i18n.t('menuRequest')}`],
                    [`🖨️ ${ctx.i18n.t('menuAbout')}`],
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

    return mainScene;
}