const Scene = require('telegraf/scenes/base');
const {Telegraf} = require('telegraf');
const {Extra} = Telegraf;


module.exports = () => {
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
        ctx.scene.enter('mainMenu', {
            start: ctx.i18n.t('mainMenu')
        })
    })

    return aboutScene;
}