'use strict'

require('dotenv').config()

const { Telegraf, Markup } = require('telegraf')
const { default: axios } = require('axios')
const tablize = require('jsontostringtable')
const http = require('http')

const bot = new Telegraf(process.env.BOT_TOKEN)

const db = require('./db')

const menu = Markup.inlineKeyboard([
    [
        Markup.button.callback('mint NFTs', 'mintMenu'),
        Markup.button.callback('Competition', 'competition')
    ],
    [
        Markup.button.url('idexo Site', 'https://idexo.com/'), ,
        Markup.button.url('idexo SaaS', 'https://app.idexo.io/'),
        Markup.button.url('FAQ', 'https://t.me/IdexoFAQ/3'),

    ]
]).resize()

const menuMint = Markup.inlineKeyboard([
    [
        Markup.button.callback('IEA NFT', 'iea'),
        Markup.button.callback('IPC NFT', 'ipc'),
        Markup.button.callback('ICC NFT', 'icc')
    ],
    [
        Markup.button.url('About idexo NFTs', 'https://t.me/IdexoFAQ/41')

    ],
    [
        Markup.button.callback('<<< back to main menu', 'back')
    ]

]).resize()

const menuComp = Markup.inlineKeyboard([
    [
        Markup.button.callback('My Points', 'points'),
        Markup.button.callback('View TOP 10', 'leaderboard10'),
        Markup.button.callback('View TOP 20', 'leaderboard20')
    ],
    [
        Markup.button.url('About competition', 'https://blog.idexo.io/idexo-community-competition-june-22nd-august-25th/')

    ],
    [
        Markup.button.callback('<<< back to main menu', 'back')
    ]

]).resize()


bot.start(async ctx => {
    console.log(!!ctx.update.message.from.username)
    if (!ctx.update.message.from.username) {
        ctx.reply('You must have a valid username... Use /start to continue')
        return
    }
    const activeUser = getUser(ctx)

    const valideUser = await db.searchUser(activeUser)
    if (valideUser) {
        ctx.reply(`Welcome again ${activeUser.details.firstName}`)
    } else {
        await ctx.reply('Adding new user...')
        const insertUser = await db.insertUser(activeUser)
        if (!insertUser) {
            console.log("Error inserting into DB!!!")
            ctx.reply(':( sorry, try again later!')
            return
        }
        await ctx.reply(`Welcome ${activeUser.details.firstName}`)
    }
    await ctx.reply('What do you want to do?', menu)
})

bot.help((ctx) => {
    ctx.telegram.sendMessage(ctx.chat.id, 'If you need help, you can look at the www.google.com ;)')
})

bot.action('mintMenu', ctx => {
    ctx.deleteMessage()
    ctx.reply('Choose an option...', menuMint)
})
bot.action('competition', ctx => {
    ctx.deleteMessage()
    ctx.reply(`
    Idexo Community Competition

The idexo community competition is hot!
Choose an option...
    `, menuComp)
})
bot.action('back', ctx => {
    ctx.deleteMessage()
    ctx.reply('What do you want to do?', menu)
})
bot.action('iea', async ctx => {
    await ctx.deleteMessage()
    await ctx.reply(`IEA NFT creation logic coming soon...

What do you want to do?`, menuMint)
})
bot.action('ipc', async ctx => {
    ctx.deleteMessage()
    await ctx.reply(`IPC NFT creation logic coming soon...

What do you want to do?`, menuMint)
})
bot.action('icc', async ctx => {
    ctx.deleteMessage()
    await ctx.reply(`ICC NFT creation logic coming soon...

What do you want to do?`, menuMint)
})
bot.action('points', async ctx => {
    ctx.deleteMessage()
    await ctx.reply(`points logic comming soon...

What do you want to do?`, menuMint)
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
                                text: "Go back to menu", callback_data: "back"
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
                                text: "Go back to menu", callback_data: "back"
                            }]
                        ]
                    }
                })
        })
})

bot.hears('/delete', async ctx => {
    const activeUser = getUser(ctx)

    const deleted = await db.removeUser(activeUser)
    if (deleted) {
        ctx.reply(deleted)
    } else {
        ctx.reply(deleted)
    }
})

function getUser(ctx) {
    const from = ctx.update.message.from
    const user = {
        "id": from.id,
        "details": {
            "userName": from.username,
            "firstName": from.first_name,
            "lastName": from.last_name
        }
    }
    return user
}

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


bot.launch()

process.once('SIGINT', () => bot.stop('SIGINT'))
process.once('SIGTERM', () => bot.stop('SIGTERM'))


//HEROKU
var port = (process.env.PORT || 5000)
http.createServer(function (request, response) {
    response.writeHead(200, { 'Content-Type': 'application/json' })
    response.write(JSON.stringify({ name: 'idointerfacebot', ver: '0.0.2' }))
    response.end()
}).listen(port)
//HEROKU