require('dotenv').config()
const {Telegraf} = require('telegraf');
const path = require('path');
const I18n = require('telegraf-i18n');
const MySQLSession = require('telegraf-session-mysql');
const Stage = require('telegraf/stage');

const i18n = new I18n({
    directory: path.resolve(__dirname, 'locales'),
    defaultLanguage: 'ru',
    sessionName: 'session',
    useSession: true,
    templateData: {
        pluralize: I18n.pluralize,
        uppercase: (value) => value.toUpperCase()
    }
})

const session = new MySQLSession({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: 'testcase'
})

const bot = new Telegraf(process.env.TGTOKEN)

// Scenes
const languageScene = require('./src/scenes/language')();
const countryScene = require('./src/scenes/country')();
const registrationScene = require('./src/scenes/registration')(bot);
const mainScene = require('./src/scenes/main')(bot);
const mainRequestScene = require('./src/scenes/request');
const policyScene = require('./src/scenes/policy')(bot);
const aboutScene = require('./src/scenes/about')(bot);
const priceScene = require('./src/scenes/price')(bot);
const requestScene = mainRequestScene.requestScene();
const createRequestScene = mainRequestScene.createRequestScene(bot);
const createRequestContact = mainRequestScene.createRequestContactScene();
const createRequestAudType = mainRequestScene.createRequestAudTypeScene();
const createRequestAudAge = mainRequestScene.createRequestAudAgeScene();
const createRequestPeriod = mainRequestScene.createRequestPeriodScene();
const createRequestEnd = mainRequestScene.createRequestEndScene(bot);

const stgs = [countryScene, languageScene, registrationScene, mainScene, aboutScene,
    requestScene, priceScene, createRequestScene, policyScene, createRequestContact, createRequestAudType, createRequestAudAge,
    createRequestPeriod, createRequestEnd];

// Stage
const stage = new Stage();
let queue = new Map()
stage.use((ctx, next) => {
    if (ctx.message && ctx.message.photo) return next()
    let user = queue.get(ctx.from.id)
    if (user) return
    queue.set(ctx.from.id, true)
    return next().then(() => {
        queue.delete(ctx.from.id)
    }).catch(e => {
        console.error(e)
        queue.delete(ctx.from.id)
    })
})

// middlewares
bot.use(session.middleware())
bot.use(i18n.middleware())


stgs.map(stg => {
    stage.register(stg);
})

bot.use(stage.middleware());

// bot.use(ctx => {
//     console.log(ctx.message);
// })

bot.start(ctx => {
    if (ctx.session.mesage_filter) {
        if (ctx.session.mesage_filter.length !== 0) {
            ctx.session.mesage_filter.forEach(msg => {
                ctx.deleteMessage(msg)
            })
        }
    }
    ctx.session.mesage_filter = [];

    if (ctx.session.chosenCountry) {
        return ctx.scene.enter('mainMenu', {
            start: ctx.i18n.t('mainMenu')
        })
    } else {
        return ctx.scene.enter('country');
    }

})


bot.startPolling()