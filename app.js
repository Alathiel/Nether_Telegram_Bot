require('dotenv').config()
const {Telegraf} = require('telegraf');
const CronJob = require('cron').CronJob;
const moment = require('moment');
settings = require('./settings.json');

const bot = new Telegraf(process.env.bot_token);
var job = null;
bot.telegram.setMyCommands(settings.commands,{type:'all_chat_administrators'});
bot.command('start', (ctx) => {
	send_urls(ctx,null, 'Hello, Welcome to Nether Help bot');
}) 

bot.command('info', ctx => {
	send_urls(ctx);
})

bot.command('infoPvt', ctx => {
	send_urls(ctx,null,null,true);
})

bot.command('cron', async function(ctx){
	let role = await bot.telegram.getChatMember(ctx.chat.id, ctx.from.id);
	if(ctx.chat.type !== 'private' && (role.status == "administrator" || role.status === "creator"))
		cron(ctx);
	
})

bot.command('mute', async function(ctx){
	let role = await bot.telegram.getChatMember(ctx.chat.id, ctx.from.id);
	if(ctx.chat.type !== 'private' && (role.status == "administrator" || role.status === "creator")){
		const message = 'You have been restricted from sending messages for 12 hours.'
		const ChatPermissions = {
			"can_send_messages": false,
			"can_send_media_messages": false,
			"can_send_other_messages": false,
			"can_add_web_page_previews": false,
			"can_send_polls": false,
			"can_change_info": false,
			"can_invite_users": false,
			"can_pin_messages": false
		}

		try{
		const date = ctx.update.message.date;
			release = moment.unix(date).add(12,'hour');
			const payload = {
				chat_id: ctx.chat.id,
				user_id: ctx.update.message.reply_to_message.from.id,
				permissions: ChatPermissions,
				until_date: release.unix()
			}
			ctx.telegram.callApi('restrictChatMember', payload);
			bot.telegram.sendMessage(ctx.update.message.reply_to_message.from.id, message);
		}catch(err){
			console.error(err);
		}
	}
})

bot.on('new_chat_members', function(message) {
	bot.telegram.deleteMessage(message.chat.id, message.update.message.message_id); //delete join message
	if(message.update.message.new_chat_member.is_bot === false) // send message if not a bot
		send_urls(message, message.update.message.new_chat_member);
})

bot.on('message', function(message){
	for(word in settings.blacklist){
		try{
			if((message.update.message.text).toLowerCase() === settings.blacklist[word])
				bot.telegram.deleteMessage(message.update.message.chat.id, message.update.message.message_id);
		}catch(err){console.error(err);}
	}
})

function cron(ctx){
	job = new CronJob('0 */10 * * * *', function() {
		send_urls(ctx);
	}, null, true, 'America/Los_Angeles');

	job.stop();
	job.start();
}
	

/*
ctx - context
member - if is a new member and his name
new message - if it's a welcome message
*/
async function send_urls(ctx, member = null, new_message = null, private = false){
	list = load_list(settings.urls);
	let message =' <b> Here you can read info about Nether </b>';
	if(!private){
		if(member !== null)
			message = 'Welcome '+member.first_name+'\n'+message;
		if(new_message !== null)
			message = new_message+"\n"+message;
		try{
			let role = await bot.telegram.getChatMember(ctx.chat.id, ctx.from.id);
			//if it's a group
			if(ctx.chat.type !== 'private'){
				if(role.status == "administrator" || role.status === "creator"){
					bot.telegram.sendMessage(ctx.chat.id, message, markup,{
						parseMode: 'HTML',
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
					parse_mode: 'HTML',
					reply_markup: {
						inline_keyboard: list
					}
				})
			}
		}
		catch(error){
			console.error(error);
		}
	} else{
		bot.telegram.sendMessage(ctx.update.message.from.id, message, {
			parse_mode: 'HTML',
			reply_markup: {
				inline_keyboard: list
			}
		})
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