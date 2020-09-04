const Scene = require('telegraf/scenes/base');
const {Telegraf} = require('telegraf');
const {Extra} = Telegraf;

const Country = require('../models/Country');
const countryChose = require('../helpers/countryChoser');

module.exports = () => {
    const countryScene = new Scene('country');

    countryScene.enter(async (ctx) => {

        const country = await Country.findAll();
        const countries = country.map(country => {
            return country.dataValues;
        })

        ctx.session.countries = countries;
        ctx.session.languages = countries.map(country => country.language)

        const msg = ctx.reply('Выберите страну', Extra.markup(markup => {
            return markup.keyboard([[`🇷🇺 Россия`], [`🇺🇿 O'zbekiston`], [`🇰🇿 Қазақстан`]]).resize();
        }))
        ctx.session.mesage_filter.push((await msg).message_id);

    });

    // countryScene.on('message', ctx => {
    //         if (ctx.session.countries) {
    //             const countries = ctx.session.countries.map(country => country.name);
    //
    //             if (countries.includes(ctx.message.text)) {
    //                 ctx.session.chosenCountry = ctx.session.countries.filter(country => {
    //                         return country.name === ctx.message.text
    //                     }
    //                 );
    //

                    // if (ctx.session.countryChosen) {
                    //     ctx.session.countryChosen = false;
                    //     ctx.session.country = ctx.session.chosenCountry.id;
                    //     // ctx.session.countries = ''
                    //     return ctx.scene.enter('mainMenu', {
                    //         start: ctx.i18n.t('mainMenu')
                    //     })
                    // } else {
                    //     ctx.session.country = ctx.session.chosenCountry.id;
                    //     // ctx.session.countries = ''
                    //     return ctx.scene.enter('language');
                    // }
    //             }
    //         } else {
    //             // ctx.session.countries = ''
    //             ctx.scene.enter('country');
    //         }
    //     }
    // )

    countryScene.hears(`🇷🇺 Россия`, ctx => {
        countryChose(ctx)
    })
    countryScene.hears(`🇺🇿 O'zbekiston`, ctx => {
        countryChose(ctx)
    })
    countryScene.hears(`🇰🇿 Қазақстан`, ctx => {
        countryChose(ctx)
    })

    return countryScene
}