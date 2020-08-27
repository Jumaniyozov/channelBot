const Scene = require('telegraf/scenes/base');
const fs = require('fs')
const path = require('path')
const axios = require('axios')


module.exports = (bot) => {
    const mainScene = new Scene('mainMenu');

    mainScene.enter(async (ctx) => {
        ctx.deleteMessage();
        let message = ctx.i18n.t('greeting', {
            ctx: ctx
        })

        const unauthMsg = [
            [`📝 ${ctx.i18n.t('menuPolicy')}`, `📓 ${ctx.i18n.t('menuRequest')}`],
            [`🖨️ ${ctx.i18n.t('menuAbout')}`],
        ]

        const authMsg = [
            [`📝 ${ctx.i18n.t('menuPolicy')}`, `📓 ${ctx.i18n.t('menuRequest')}`],
            [`${ctx.i18n.t('menuPrice')}`],
            [`🖨️ ${ctx.i18n.t('menuAbout')}`],
        ]

        if (ctx.scene.state.start) {
            message = ctx.scene.state.start
        }
        const msg = bot.telegram.sendMessage(ctx.chat.id, message, {
            parse_mode: 'HTML',
            reply_markup: {
                keyboard: ctx.session.user_status === 1 || 3 ? authMsg: unauthMsg,
                resize_keyboard: true,
                one_time_keyboard: true
            }
        })

        ctx.session.message = ctx.message.text;
        ctx.session.mesage_filter.push((await msg).message_id);
    })

    mainScene.on('document', ctx => {
        // console.log(ctx.message)

        if(ctx.session.user_status === 3) {
            async function downloadImage() {
                const fileUrl = `https://api.telegram.org/bot${process.env.TGTOKEN}/getFile?file_id=${ctx.message.document.file_id}`
                const res = await axios.get(fileUrl);

                // console.log(res.data.result.file_path);

                const url = `https://api.telegram.org/file/bot${process.env.TGTOKEN}/${res.data.result.file_path}`

                const pathe = path.resolve(__dirname, '../documents', 'цены.xlsx')
                const writer = fs.createWriteStream(pathe)

                const response = await axios({
                    url,
                    method: 'GET',
                    responseType: 'stream'
                })

                response.data.pipe(writer)

                return new Promise((resolve, reject) => {
                    writer.on('finish', resolve)
                    writer.on('error', reject)
                })
            }

            downloadImage()
        }
    })

    mainScene.hears(['📝 Условия размещения', '📝 Yuklash talablari'], ctx => {
        ctx.scene.enter('policy')
    })

    mainScene.hears([`Narxlarni ko'rsatish`, 'Показать цены'], ctx => {
        ctx.scene.enter('price')
    })

    mainScene.hears(['📓 Оставить заявку', '📓 Sorovnoma qoldirish'], ctx => {
        ctx.scene.enter('request')
    })

    mainScene.hears(['🖨️ О нас', '🖨️ Biz haqimizda'], ctx => {
        ctx.scene.enter('about')
    })

    mainScene.hears(['◀️ Назад к выбору языка', '◀️ Tilni tanlashga qaytish'], ctx => {
        ctx.scene.enter('language')
    })

    return mainScene;
}