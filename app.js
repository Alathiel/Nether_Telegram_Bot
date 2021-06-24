require('dotenv').config()
const {Telegraf} = require('telegraf');
const bot = new Telegraf(process.env.bot_token);
settings = require('./settings.json');

bot.command('start', (ctx) => {
	send_urls(ctx,null, 'Hello, Welcome to Nether Help bot');
}) 

bot.command('info', ctx => {
	send_urls(ctx);
})

bot.on('new_chat_members', function(message) {
	bot.telegram.deleteMessage(message.chat.id, message.update.message.message_id); //delete join message
	if(message.update.message.new_chat_member.is_bot === false) // send message if not a bot
		send_urls(message, message.update.message.new_chat_member);
})

/*
ctx - context
member - if is a new member and his name
new message - if it's a welcome message
*/
async function send_urls(ctx, member = null, new_message = null){
	list = load_list(settings.urls);
	let message = 'Here you can read info about Nether';
	if(member !== null)
		message = 'Welcome '+member.first_name+'\n'+message;
	if(new_message !== null)
		message = new_message+"\n"+message;
	try{
		let role = await bot.telegram.getChatMember(ctx.chat.id, ctx.from.id);
		//if it's a group
		if(ctx.chat.type !== 'private'){
			if(role.status == "administrator" || role.status === "creator"){
				bot.telegram.sendMessage(ctx.chat.id, message, {
					reply_markup: {
						inline_keyboard: list
					}
				}).then((mess) => {
					setTimeout(() => {
						bot.telegram.deleteMessage(ctx.chat.id,mess.message_id);
						bot.telegram.deleteMessage(ctx.chat.id, ctx.update.message.message_id);
					}, settings.delete_time*1000)
				}).catch(err => console.log(err));
			}
			else{
				bot.telegram.sendMessage(ctx.chat.id, 'You can\'t use this command because you\'re not an Admin',{})
			}
		}
		//if it's a private chat
		else{
			bot.telegram.sendMessage(ctx.chat.id, message, {
				reply_markup: {
					inline_keyboard: list
				}
			})
		}
	}
	catch(error){
		console.error(error);
	}
}

function load_list(urls){
	var list = [];
	var list_app = [];
	var i = 0;
	urls.forEach(element => {
		if(i == 0){
			list.push([{
				text: element.text,
				url: element.url
			}]);
			i++;
		}
		else if(i > 0 && i <= 3){
			list_app.push({
				text: element.text,
				url: element.url
			})
			i++;
		}
		else if(i > 4 && i <= 5){
			list_app.push({
				text: element.text,
				url: element.url
			})
			i++;
		}
		else if(i > 6 && i <= 7){
			list_app.push({
				text: element.text,
				url: element.url
			})
			i++;
		}
		else if(i >= 4){
			list.push(list_app);
			list_app = [];
			list_app.push({
				text: element.text,
				url: element.url
			})
			i++;
		}

	});
	if(list_app.length>0)
		list.push(list_app);
	return list;
}


bot.launch();


/*
_._     _,-'""`-._
(,-.`._,'(       |\`-/|					 ____________________________
    `-.-' \ )-`( , o o)					//***************************\\
          `-    \`_`"'-					||******Created By Bios******||
		  								\\___________________________//

*/