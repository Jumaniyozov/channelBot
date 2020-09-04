module.exports = (ctx) => {
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