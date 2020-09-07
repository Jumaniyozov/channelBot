const Scene = require('telegraf/scenes/base');
const WizardScene = require('telegraf/scenes/wizard');
const {Telegraf} = require('telegraf');
const {Extra} = Telegraf;
const calendar = require('../helpers/calendarNew');

const Post = require('../models/Post');

module.exports.requestScene = () => {

    const requestScene = new Scene('request');

    requestScene.enter(ctx => {
        return ctx.scene.enter('createRequest')
    })

    return requestScene;
}

module.exports.createRequestScene = (bot) => {

    const createRequest = new Scene('createRequest')

    createRequest.enter(ctx => {
        const d = new Date(Date.now());
        ctx.session.currentMonth = d.getMonth();
        ctx.session.storeMonth = d.getMonth();
        ctx.session.endDate = false;
        const msg = ctx.reply(ctx.i18n.t('reqCompanyName'), Extra.markup(markup => {
            return markup.keyboard([`◀️ ${ctx.i18n.t('menuBack')}`]).resize()
        }));
    })

    createRequest.hears(['◀️ Назад', '◀️ Ortga'], ctx => {
        return ctx.scene.enter('mainMenu', {
            start: ctx.i18n.t('mainMenu')
        })
    })


    createRequest.on('message', ctx => {
        ctx.session.reqCompanyName = ctx.message.text;
        return ctx.scene.enter('createRequestContact')
    })


    return createRequest;
}

module.exports.createRequestContactScene = () => {

    const createRequestContact = new Scene('createRequestContact')

    createRequestContact.enter(ctx => {
        const msg = ctx.reply(ctx.i18n.t('reqCompanyContacts'), Extra.markup(markup => {
            return markup.keyboard([`◀️ ${ctx.i18n.t('menuBack')}`]).resize()
        }));
    })

    createRequestContact.hears(['◀️ Назад', '◀️ Ortga'], ctx => {
        return ctx.scene.enter('mainMenu', {
            start: ctx.i18n.t('mainMenu')
        })
    })

    createRequestContact.on('message', ctx => {
        ctx.session.reqCompanyContacts = ctx.message.text;
        return ctx.scene.enter('createRequestAudType')
    })


    return createRequestContact;
}

module.exports.createRequestAudTypeScene = () => {
    const createRequestAudType = new Scene('createRequestAudType');


    createRequestAudType.enter(ctx => {
        const msg = ctx.reply(ctx.i18n.t('reqCompanyAuditory'), Extra.markup(markup => {
            return markup.inlineKeyboard([
                [{text: `${ctx.i18n.t('audTypeMale')}`, callback_data: `${ctx.i18n.t('audTypeMale')}`}],
                [{text: `${ctx.i18n.t('audTypeFemale')}`, callback_data: `${ctx.i18n.t('audTypeFemale')}`}],
                [{text: `${ctx.i18n.t('audTypeBoth')}`, callback_data: `${ctx.i18n.t('audTypeBoth')}`}],
            ]).resize()
        }));
    })


    createRequestAudType.hears(['◀️ Назад', '◀️ Ortga'], ctx => {
        return ctx.scene.enter('mainMenu', {
            start: ctx.i18n.t('mainMenu')
        })
    })

    createRequestAudType.on('callback_query', ctx => {

        ctx.answerCbQuery(ctx.callbackQuery.data);
        ctx.session.reqCompanyAuditory = ctx.callbackQuery.data
        return ctx.scene.enter('createRequestAudAge')
    })


    return createRequestAudType;
}

module.exports.createRequestAudAgeScene = () => {

    const createRequestAudAge = new Scene('createRequestAudAge');


    createRequestAudAge.enter(ctx => {
        ctx.deleteMessage();

        ctx.session.ageMarkup = [
            [{text: `19-23`, callback_data: '19-23'}],
            [{text: `24-30`, callback_data: '24-30'}],
            [{text: `31-40`, callback_data: '31-40'}],
            [{text: `41-55`, callback_data: '41-55'}],
        ]
        ctx.session.ageSet = new Set();
        const msg = ctx.reply(ctx.i18n.t('reqCompanyAuditoryAge'), Extra.markup(markup => {
            return markup.inlineKeyboard(ctx.session.ageMarkup).resize()
        }));
    })

    createRequestAudAge.hears(['◀️ Назад', '◀️ Ortga'], ctx => {
        return ctx.scene.enter('mainMenu', {
            start: ctx.i18n.t('mainMenu')
        })
    })

    createRequestAudAge.on('callback_query', ctx => {

        if (ctx.callbackQuery.data === 'continue') {
            ctx.answerCbQuery();
            if(ctx.session.ageSet.size !== 0 ) {
                return ctx.scene.enter('createRequestPeriod')
            }
        }
        else {
            ctx.answerCbQuery(ctx.update.callback_query.data);
            if (ctx.session.ageSet.has(ctx.update.callback_query.data)) {
                ctx.deleteMessage();

                ctx.session.ageSet.delete(ctx.update.callback_query.data);
                const addingCheck = ctx.session.ageMarkup.filter((agm, index) => {
                    // updateMarkup = index;
                    return agm[0].callback_data === ctx.callbackQuery.data
                });
                ctx.session.ageMarkup.map(age => {
                    if (age === addingCheck[0]) {
                        const text = age[0].text.split(' ');
                        age[0].text = text[0];
                    }
                })

                ctx.reply(ctx.i18n.t('reqCompanyAuditoryAge'), Extra.markup(markup => {
                    return markup.inlineKeyboard(ctx.session.ageMarkup).resize()
                }));
            } else {
                ctx.deleteMessage();
                const addingCheck = ctx.session.ageMarkup.filter((agm, index) => {
                    // updateMarkup = index;
                    return agm[0].callback_data === ctx.callbackQuery.data
                });
                ctx.session.ageMarkup.map(age => {
                    if (age === addingCheck[0]) {
                        age[0].text = age[0].text + ' ✅'
                    }
                })

                if (ctx.session.ageMarkup.length === 4) {
                    ctx.session.ageMarkup.push([{text: `${ctx.i18n.t('reqContinue')}`, callback_data: 'continue'}])
                }
                ctx.reply(ctx.i18n.t('reqCompanyAuditoryAge'), Extra.markup(markup => {
                    return markup.inlineKeyboard(ctx.session.ageMarkup).resize()
                }));
                ctx.session.ageSet.add(ctx.update.callback_query.data);
            }
            // ctx.session.reqCompanyAuditoryAge = ctx.callbackQuery.data;
        }

    })


    return createRequestAudAge;
}

module.exports.createRequestPeriodScene = () => {

    const createRequestPeriodScene = new Scene('createRequestPeriod');

    createRequestPeriodScene.enter(ctx => {
        ctx.deleteMessage();
        if (ctx.session.endDate) {
            const msg = ctx.reply(`⚠️ ${ctx.i18n.t('reqCompanyEndPub')}`, Extra.markup(markup => {
                return markup.inlineKeyboard(calendar(ctx.session.currentMonth, ctx)).resize();
            }));
        } else {
            const msg = ctx.reply(`❗ ${ctx.i18n.t('reqCompanyStartPub')}`, Extra.markup(markup => {
                return markup.inlineKeyboard(calendar(ctx.session.currentMonth, ctx)).resize();
            }));
        }


    })

    createRequestPeriodScene.hears(['◀️ Назад', '◀️ Ortga'], ctx => {
        return ctx.scene.enter('mainMenu', {
            start: ctx.i18n.t('mainMenu')
        })
    })


    createRequestPeriodScene.on('callback_query', ctx => {

        // console.log(ctx.scene.state.endDate);

        if (ctx.update.callback_query.data === 'Previous') {
            ctx.answerCbQuery();
            ctx.session.currentMonth = ctx.session.currentMonth - 1;
            return ctx.scene.enter('createRequestPeriod')
        } else if (ctx.update.callback_query.data === 'Next') {
            ctx.answerCbQuery();
            ctx.session.currentMonth = ctx.session.currentMonth + 1;
            return ctx.scene.enter('createRequestPeriod')
        } else {
            ctx.answerCbQuery();
            if (ctx.update.callback_query.data === 'ignore') {

            } else if (ctx.update.callback_query.data !== 'year' ||
                ctx.update.callback_query.data !== 'month') {
                if (ctx.session.endDate) {
                    // ctx.scene.state.endDate = false;
                    ctx.session.reqCompanyEndPub = ctx.update.callback_query.data;
                    return ctx.scene.enter('createRequestEnd')
                } else {
                    // ctx.scene.state.endDate = true;
                    ctx.session.reqCompanyStartPub = ctx.update.callback_query.data;
                    ctx.session.endDate = true;
                    return ctx.scene.enter('createRequestPeriod')
                }
            }

        }
    })

    return createRequestPeriodScene;
}


module.exports.createRequestEndScene = (bot) => {

    const createRequestEnd = new Scene('createRequestEnd');

    createRequestEnd.enter(async ctx => {
        ctx.deleteMessage();

        const post = await Post.create({
            companyName: ctx.session.reqCompanyName,
            companyContacts: ctx.session.reqCompanyContacts,
            companyAuditory: ctx.session.reqCompanyAuditory,
            companyAuditoryAge: ctx.session.ageSet.toString(),
            companyStartPub: ctx.session.reqCompanyStartPub,
            companyEndPub: ctx.session.reqCompanyEndPub,
        });
        let ageArr = Array.from(ctx.session.ageSet);

        const message = `
<b>${ctx.i18n.t('compName')}</b>: <i>${ctx.session.reqCompanyName}</i>
<b>${ctx.i18n.t('compContacts')}</b>: <i>${ctx.session.reqCompanyContacts}</i>
<b>${ctx.i18n.t('companyAuditory')}</b>: <i>${ctx.session.reqCompanyAuditory}</i>
<b>${ctx.i18n.t('companyAuditoryAge')}</b>: <i>${ageArr.toString()}</i>
<b>${ctx.i18n.t('compStartPubDate')}</b>: <i>${ctx.session.reqCompanyStartPub}</i>
<b>${ctx.i18n.t('compEndPubDate')}</b>: <i>${ctx.session.reqCompanyEndPub}</i>
`

        bot.telegram.sendMessage('-1001343832095', message, {parse_mode: 'HTML'});

        ctx.scene.enter('mainMenu', {
            start: ctx.i18n.t('requestCompleteMsg')
        })
    })

    return createRequestEnd;
}