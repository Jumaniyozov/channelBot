cleanGreetMsg = (ctx) => {
    ctx.session.mesage_filter.forEach(msg => {
        ctx.deleteMessage(msg)
    })
}

module.export = {cleanGreetMsg};