const Scene = require('telegraf/scenes/base');
const {Telegraf} = require('telegraf');
const User = require('../models/User');


module.exports = (bot) => {
    const registrationScene = new Scene('registration');

    registrationScene.enter(async ctx => {

        const msg = bot.telegram.sendMessage(ctx.chat.id, ctx.i18n.t('regMessage'), {
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

    registrationScene.on('contact', async (ctx) => {
        ctx.deleteMessage();
        let user = await User.findOne({
            where: {
                user_id: ctx.from.id
            }
        })

        if(user) {
            ctx.session.user_status = user.dataValues.status;
        }

        if (!user) {
            user = await User.create({
                user_id: ctx.message.from.id,
                username: ctx.message.from.username,
                lastName: ctx.message.contact.last_name,
                firstName: ctx.message.contact.first_name,
                language: ctx.session.language,
                phone: ctx.message.contact.phone_number,
            })
        }

        ctx.scene.enter('mainMenu');
    })

    return registrationScene;
}
