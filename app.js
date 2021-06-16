require('dotenv').config()
const {Telegraf} = require('telegraf');
const bot = new Telegraf(process.env.bot_token);
settings = require('./settings.json');

bot.command('start', ctx => {
    console.log(ctx.from)
    bot.telegram.sendMessage(ctx.chat.id, 'Hello, Welcome to Nether Help bot', {})
	send_urls(ctx);
})


bot.command('info', ctx => {
	send_urls(ctx);
})

bot.command('help', ctx => {
	commands_string = 'Commands\n\n';
	settings.commands.forEach(command => {
		commands_string +=' '+command+'\n\n';
	});

	bot.telegram.sendMessage(ctx.chat.id, commands_string);
})

bot.on('new_chat_members', function(message) {
	bot.telegram.deleteMessage(message.chat.id, message.update.message.message_id); //delete join message
	if(message.update.message.new_chat_member.is_bot === false) // send message if not a bot
		send_urls(message, message.update.message.new_chat_member);
})

function send_urls(ctx, member = null){
	var list = [];
	settings.urls.forEach(element => {	
		list.push({
			text: element.text,
			url: element.url
		})
	});
	let message = 'Here you can read info about Nether';
	if(member != null)
		message = 'Welcome '+member.first_name+'\n'+message;

	bot.telegram.sendMessage(ctx.chat.id, message, {
        reply_markup: {
            inline_keyboard: [
                list
            ]
        }
    })
}


bot.launch();