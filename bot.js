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
const registrationScene = require('./src/scenes/registration')(bot);
const mainScene = require('./src/scenes/main')(bot);
const mainRequestScene = require('./src/scenes/request');
const policyScene = require('./src/scenes/policy')(bot);
const aboutScene = require('./src/scenes/about')();
const priceScene = require('./src/scenes/price')(bot);
const requestScene = mainRequestScene.requestScene();
const createRequestScene = mainRequestScene.createRequestScene(bot);

// Stage
const stage = new Stage([languageScene, registrationScene, mainScene, aboutScene, requestScene, priceScene, createRequestScene, policyScene]);

// middlewares
bot.use(session.middleware())
bot.use(i18n.middleware())
bot.use(stage.middleware());


bot.start(ctx => {
    if (ctx.session.mesage_filter) {
        if (ctx.session.mesage_filter.length !== 0) {
            ctx.session.mesage_filter.forEach(msg => {
                ctx.deleteMessage(msg)
            })
        }
    }
    ctx.session.mesage_filter = [];

    ctx.scene.enter('language');
})


bot.startPolling()