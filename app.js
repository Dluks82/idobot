'use strict'


var http = require('http')
require('dotenv').config()
const { Telegraf } = require('telegraf')
const { default: axios } = require('axios')
const tablize = require('jsontostringtable')

const token = process.env.BOT_TOKEN
const bot = new Telegraf(token)

bot.start((ctx) => {
    console.log(ctx.from)

    ctx.telegram.sendMessage(ctx.chat.id,
        `Welcome ${ctx.chat.first_name}, i am Idexo Teste Version Bot!

It's a pleasure to see you around here. How can I help you? ;)`)
    let msg = 'Please, choose an option...'
    ctx.telegram.sendMessage(ctx.chat.id, msg, {
        reply_markup: {
            inline_keyboard: [
                [{
                    text: "TOP10",
                    callback_data: 'leaderboard10'
                }, {
                    text: "TOP20",
                    callback_data: 'leaderboard20'
                }, {
                    text: "Go idexo Site", url: 'https://idexo.io'
                }]
            ]
        }
    })
})

bot.help((ctx) => {
    ctx.telegram.sendMessage(ctx.chat.id, "Huuummm, at the moment I don't have much to help you :( But you can visit http://idexo.io to know more about me ;)")
})

bot.action('leaderboard10', ctx => {
    ctx.deleteMessage()
    getData(10)
        .then((result) => {
            ctx.telegram.sendMessage(ctx.chat.id, result,
                {
                    parse_mode: 'MarkdownV2',
                    reply_markup: {
                        inline_keyboard: [
                            [{
                                text: "Go back to menu", callback_data: "go-back"
                            }]
                        ]
                    }
                })
        })
})
bot.action('leaderboard20', ctx => {
    ctx.deleteMessage()
    getData(20)
        .then((result) => {
            ctx.telegram.sendMessage(ctx.chat.id, result,
                {
                    parse_mode: 'MarkdownV2',
                    reply_markup: {
                        inline_keyboard: [
                            [{
                                text: "Go back to menu", callback_data: "go-back"
                            }]
                        ]
                    }
                })
        })
})

bot.action('go-back', ctx => {
    ctx.deleteMessage()
    let msg = 'Please, choose an option...'
    ctx.telegram.sendMessage(ctx.chat.id, msg, {
        reply_markup: {
            inline_keyboard: [
                [{
                    text: "TOP10",
                    callback_data: 'leaderboard10'
                }, {
                    text: "TOP20",
                    callback_data: 'leaderboard20'
                }, {
                    text: "Go idexo Site", url: 'https://idexo.io'
                }]
            ]
        }
    })
})

bot.launch()

async function getData(top) {
    let url = 'https://leaderboard.idexo.io/'
    let res = await axios.get(url)
    let data = res.data.data
    // let total = Object.keys(res.data.data).length

    let newArr = data.slice(0, top).map((i, index) => {
        return ({ name: i.author.S, points: i.point_balance.N })
        // return ({ pos: index + 1, name: i.author.S, tokenId: i.token_id.N, points: i.point_balance.N })
    })

    var table = tablize(newArr)
    var header = `
    TOP ${top} leaderboard!

`
    var headerAndTable = header + table
    console.log(headerAndTable)
    var message = "```" + headerAndTable + "```"
    return message
}

// Enable graceful stop
process.once('SIGINT', () => bot.stop('SIGINT'))
process.once('SIGTERM', () => bot.stop('SIGTERM'))





//HEROKU
var port = (process.env.PORT || 5000)
http.createServer(function (request, response) {
    response.writeHead(200, { 'Content-Type': 'application/json' })
    response.write(JSON.stringify({ name: 'idointerfacebot', ver: '0.0.1' }))
    response.end()
}).listen(port)
//HEROKU