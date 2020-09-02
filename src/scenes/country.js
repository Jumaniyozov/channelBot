const Scene = require('telegraf/scenes/base');
const {Telegraf} = require('telegraf');
const {Extra} = Telegraf;

const Country = require('../models/Country');

module.exports = () => {
    const countryScene = new Scene('country');

    countryScene.enter(async (ctx) => {

        const country = await Country.findAll();
        const countries = country.map(country => {
            return country.dataValues;
        })
        const replyMarkup = countries.map(country => [country.name]);

        ctx.session.countries = countries;
        ctx.session.languages = countries.map(country => country.language)

        const msg = ctx.reply('Выберите страну', Extra.markup(markup => {
            return markup.keyboard(replyMarkup).resize();
        }))
        ctx.session.mesage_filter.push((await msg).message_id);

    });

    countryScene.on('message', ctx => {
            if (ctx.session.countries) {
                const countries = ctx.session.countries.map(country => country.name);

                if (countries.includes(ctx.message.text)) {
                    ctx.session.chosenCountry = ctx.session.countries.filter(country => {
                            return country.name === ctx.message.text
                        }
                    );


                    if (ctx.session.countryChosen) {
                        ctx.session.countryChosen = false;
                        ctx.session.country = ctx.session.chosenCountry.id;
                        // ctx.session.countries = ''
                        return ctx.scene.enter('mainMenu', {
                            start: ctx.i18n.t('mainMenu')
                        })
                    } else {
                        ctx.session.country = ctx.session.chosenCountry.id;
                        // ctx.session.countries = ''
                        return ctx.scene.enter('language');
                    }
                }
            } else {
                // ctx.session.countries = ''
                ctx.scene.enter('country');
            }
        }
    )

    return countryScene
}