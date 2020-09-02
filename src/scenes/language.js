const Scene = require('telegraf/scenes/base');
const {Telegraf} = require('telegraf');
const {Extra} = Telegraf;

module.exports = () => {
    const languageScene = new Scene('language');

    languageScene.enter(async (ctx) => {
        ctx.deleteMessage().catch(err => {
        });
        if (ctx.session.mesage_filter.length !== 0) {
            ctx.session.mesage_filter.forEach(msg => {
                ctx.deleteMessage(msg)
            })
        }

        let replyMarkup;

        if (ctx.session.chosenCountry[0].id !== 1) {
            replyMarkup = [
                [`🇷🇺 Русский язык`],
                [`${ctx.session.chosenCountry[0].language}`]
            ]
        } else {
            replyMarkup = [
                [`🇷🇺 Русский язык`]
            ]
        }

        const msg = ctx.reply('Выберите язык', Extra.markup(markup => {
            return markup.keyboard(replyMarkup).resize();
        }))
        ctx.session.mesage_filter.push((await msg).message_id);
    });

    languageScene.on('message', async ctx => {
        if(ctx.session.languages.includes(ctx.message.text)){
            ctx.session.chosenLanguage = ctx.session.countries.filter(country => {
                    return country.language === ctx.message.text
                }
            );
            ctx.i18n.locale(`${ctx.session.chosenLanguage[0].locale}`)
            ctx.session.language = ctx.session.chosenLanguage[0].locale
            if(ctx.session.languageChosen){
                return  ctx.scene.enter('mainMenu', {
                    start: ctx.i18n.t('mainMenu')
                })
            } else {
                return ctx.scene.enter('registration');
            }
        }
    });

    return languageScene
}