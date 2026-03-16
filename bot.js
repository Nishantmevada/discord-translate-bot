const express = require("express");
const app = express();

app.get("/", (req,res)=>{
  res.send("Bot is running");
});

app.listen(3000, ()=>{
  console.log("Web server running");
});

require("dotenv").config()

const {
Client,
GatewayIntentBits,
SlashCommandBuilder,
REST,
Routes,
ActionRowBuilder,
ButtonBuilder,
ButtonStyle
} = require("discord.js")

const translate = require("google-translate-api-x")
const fs = require("fs")

const client = new Client({
intents:[
GatewayIntentBits.Guilds,
GatewayIntentBits.GuildMessages,
GatewayIntentBits.MessageContent
]
})

let users = {}

if(fs.existsSync("./users.json")){
users = JSON.parse(fs.readFileSync("./users.json"))
}

function save(){
fs.writeFileSync("./users.json",JSON.stringify(users,null,2))
}

client.once("ready", async ()=>{

console.log("🌐 Translator Bot Online")

/* REGISTER COMMAND */

const commands = [
new SlashCommandBuilder()
.setName("setlang")
.setDescription("Set your translation language")
.addStringOption(option =>
option.setName("language")
.setDescription("Example: ru, en, zh-CN")
.setRequired(true))
].map(cmd => cmd.toJSON())

const rest = new REST({version:"10"}).setToken(process.env.TOKEN)

await rest.put(
Routes.applicationCommands(client.user.id),
{body:commands}
)

})

/* SLASH COMMAND */

client.on("interactionCreate", async interaction => {

if(interaction.isChatInputCommand()){

if(interaction.commandName === "setlang"){

const lang = interaction.options.getString("language")

users[interaction.user.id] = lang
save()

await interaction.reply({
content:`✅ Language set to ${lang}`,
ephemeral:true
})

}

}

/* BUTTON CLICK */

if(interaction.isButton()){

if(interaction.customId.startsWith("translate_")){

const text = interaction.customId.replace("translate_","")

const lang = users[interaction.user.id] || "en"

try{

const result = await translate(text,{
to:lang,
forceTo:true
})

await interaction.reply({
content:`🌐 Translation (${lang})\n${result.text}`,
ephemeral:true
})

}catch(err){
console.log(err)
}

}

}

})

/* ADD TRANSLATE BUTTON */

client.on("messageCreate", async message => {

if(message.author.bot) return

const button = new ButtonBuilder()
.setCustomId(`translate_${message.id}`) 
.setLabel("🌐 Translate")
.setStyle(ButtonStyle.Primary)

const row = new ActionRowBuilder().addComponents(button)

message.reply({
components:[row]
})

})

client.login(process.env.TOKEN)