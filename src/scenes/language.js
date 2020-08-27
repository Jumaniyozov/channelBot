const Scene = require('telegraf/scenes/base');
const {Telegraf} = require('telegraf');
const {Extra} = Telegraf;

module.exports = () => {
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

        return languageScene
}