const Telegraf = require('telegraf')
const { Extra, Markup } = Telegraf
const _ = require('lodash')
const moment = require('moment')

const arrMonthUz = ['Yanvar', 'Fevral', 'Mart', 'Aprel', 'May', 'Iyun', 'Iyul', 'Avgust', 'Sentabr', 'Oktabr', 'Noyabr', 'Dekabr']
const arrMonthRu = ['Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь', 'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь']

module.exports = (month, ctx) => {
    const now = new Date(Date.now());
    const d = new Date(now.getFullYear(), month + 1, 0);

    const currentYear = d.getFullYear();
    let daysRow = [];

    for (let j = 1; j <= d.getDate(); j++) {
        let temp_date = new Date(d)
        temp_date.setDate(j)
        let m = moment(temp_date).tz("Asia/Tashkent")
        if (!m.isBefore() || m.isSame(moment(), 'day')) {
            daysRow.push(Markup.callbackButton(j.toString(), `${j}/${ctx.session.currentMonth}/${currentYear}`))
        } else {
            daysRow.push(Markup.callbackButton(" ", "ignore"))
        }

    }
    daysRow = _.chunk(daysRow, 7)
    let monthName;
    // const monthName = d.toLocaleString('default', { month: 'long' });
    if(ctx.session.language === 'ru'){
        monthName = arrMonthRu[d.getMonth()];
    } else if(ctx.session.language === 'uz'){
        monthName = arrMonthUz[d.getMonth()];
    }

    if (ctx.session.storeMonth === ctx.session.currentMonth) {
        return [
            [{ text: `${currentYear}`, callback_data: `year` }],
            [{ text: monthName, callback_data: `month` }],
            ...daysRow,
            [{ text: '▶️', callback_data: 'Next' }]
        ]
    } else {
        return [
            [{ text: `${currentYear}`, callback_data: `year` }],
            [{ text: monthName, callback_data: `month` }],
            ...daysRow,
            [{ text: '◀️', callback_data: 'Previous' }, { text: '▶️', callback_data: 'Next' }]
        ]
    }
}