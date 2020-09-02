const Scene = require('telegraf/scenes/base');
const WizardScene = require('telegraf/scenes/wizard');
const {Telegraf} = require('telegraf');
const {Extra} = Telegraf;

const Post = require('../models/Post');

module.exports.requestScene = () => {

    const requestScene = new Scene('request');

    requestScene.enter(ctx => {
        ctx.scene.enter('createRequest')
    })

    return requestScene;
}

module.exports.createRequestScene = (bot) => {


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
            // ctx.deleteMessage().catch(err => {});
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
            // ctx.deleteMessage().catch(err => {});
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
            // ctx.deleteMessage().catch(err => {});
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
            // ctx.deleteMessage().catch(err => {});
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

            bot.telegram.sendMessage('-1001343832095', message, {parse_mode: 'HTML'});

            ctx.session.reqCreateComp = '';
            ctx.session.reqCreateCon = '';
            ctx.session.reqCreateComType = '';
            ctx.session.reqCreateDate = '';
            ctx.session.reqCreateProdType = '';

            ctx.scene.enter('mainMenu', {
                start: ctx.i18n.t('requestCompleteMsg')
            })
        }
    );

    createRequest.hears(['◀️ Назад', '◀️ Ortga'], ctx => {
        ctx.scene.enter('mainMenu', {
            start: ctx.i18n.t('mainMenu')
        })
    })


    return createRequest;
}
