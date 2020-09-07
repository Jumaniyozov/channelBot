module.exports = (month, ctx) => {
    const now = new Date(Date.now());
    const d = new Date(now.getFullYear(), month + 1, 0);



    const simpleArr = (digit) => {
        if (digit === 28) {
            return [
                ['1', '2', '3', '4', '5', '6', '7'],
                ['8', '9', '10', '11', '12', '13', '14'],
                ['15', '16', '17', '18', '19', '20', '21'],
                ['22', '23', '24', '25', '26', '27', '28']
            ]
        } else if (digit === 29) {
            return [
                ['1', '2', '3', '4', '5', '6', '7'],
                ['8', '9', '10', '11', '12', '13', '14'],
                ['15', '16', '17', '18', '19', '20', '21'],
                ['22', '23', '24', '25', '26', '27', '28'],
                ['29']
            ]
        } else if (digit === 30) {
            return [
                ['1', '2', '3', '4', '5', '6', '7'],
                ['8', '9', '10', '11', '12', '13', '14'],
                ['15', '16', '17', '18', '19', '20', '21'],
                ['22', '23', '24', '25', '26', '27', '28'],
                ['29', '30']
            ]
        } else if (digit === 31) {
            return [
                ['1', '2', '3', '4', '5', '6', '7'],
                ['8', '9', '10', '11', '12', '13', '14'],
                ['15', '16', '17', '18', '19', '20', '21'],
                ['22', '23', '24', '25', '26', '27', '28'],
                ['29', '30', '31']
            ]
        }
    }
    const dd = simpleArr(d.getDate());
    const currentYear = d.getFullYear();

    const inlineArr = dd.map(digit => {
        return digit.map(d => {
            return {text: d, callback_data: `${d}/${ctx.session.currentMonth}/${currentYear}`}
        })
    })


    const monthName = d.toLocaleString('default', {month: 'long'});

    if (ctx.session.storeMonth === ctx.session.currentMonth) {
        return [
            [{text: `${currentYear}`, callback_data: `year`}],
            [{text: monthName, callback_data: `month`}],
            ...inlineArr,
            [{text: '▶️', callback_data: 'Next'}]
        ]
    } else {
        return [
            [{text: `${currentYear}`, callback_data: `year`}],
            [{text: monthName, callback_data: `month`}],
            ...inlineArr,
            [{text: '◀️', callback_data: 'Previous'}, {text: '▶️', callback_data: 'Next'}]
        ]
    }
}