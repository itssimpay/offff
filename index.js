const Discord = require("discord.js");

const client = new Discord.Client({
    intents: ["GUILDS", "GUILD_MESSAGES", "GUILD_MEMBERS", "MESSAGE_CONTENT"],
    partials: ["CHANNEL", "MESSAGE"]
});

const token = "token"; // ضع التوكن الخاص بك هنا
const suggestionChannelId = "1338508787623002155"; // ضع معرف قناة الاقتراحات هنا
const linkWarningChannelId = "1338508802332426323"; // ضع معرف القناة التي تريد تطبيق تحذير الروابط فيها
const newsChannelId = "1338508786557652992"; // ضع معرف قناة الأخبار هنا
const adminId = "989891024300158996"; // ضع معرف المسؤول هنا
const ticketChannelId = "1338508808325959753"; // ضع معرف قناة التذاكر هنا

const allowedSayChannels = [
    "1338508783294484624",
    "1338508785014018089",
    "1338508791800664064",
    "1338508790672130119",
    newsChannelId
];

const warnings = new Map(); // خريطة لتخزين التحذيرات
const removedWarningsMap = new Map(); // خريطة لتخزين التحذيرات التي تمت إزالتها

client.on('ready', async () => {
    console.log(`Client has been initiated! ${client.user.username}`);
});

client.on('messageCreate', async (message) => {
    if (message.author.bot) return;

    // Test command
    if (message.content.toLowerCase() === "test") {
        const embed = new Discord.MessageEmbed()
            .setColor("GREEN")
            .setDescription("Test successful!");
        message.reply({ embeds: [embed] });
    }

        // إرسال صورة GIF تلقائيًا بعد كل رسالة في القناة المحددة
        if (message.channel.id === "1338508808325959753") {
            const gifUrl = "https://cdn.discordapp.com/attachments/1338508802332426323/1338850763996266506/standard.gif?ex=67ac9570&is=67ab43f0&hm=c860fd7efef048fb6a52f9fa5652d71e03cc969fa5c34e300838c658227e829a&";
            message.channel.send(gifUrl);
        }

    // Ban command
    if (message.content.startsWith("!ban")) {
        if (!message.member.permissions.has("BAN_MEMBERS")) return message.reply("You don't have permission to use this command.");
        let member = message.mentions.members.first();
        if (!member) return message.reply("Please mention a user to ban.");
        member.ban().then(() => {
            const embed = new Discord.MessageEmbed()
                .setColor("RED")
                .setDescription(`${member.user.tag} has been banned.`);
            message.reply({ embeds: [embed] });
        }).catch(err => {
            message.reply("I was unable to ban the member.");
            console.error(err);
        });
    }

    // Unban command
    if (message.content.startsWith("!unban")) {
        if (!message.member.permissions.has("BAN_MEMBERS")) return message.reply("You don't have permission to use this command.");
        let userId = message.content.split(" ")[1];
        if (!userId) return message.reply("Please provide a user ID to unban.");
        message.guild.members.unban(userId).then(() => {
            const embed = new Discord.MessageEmbed()
                .setColor("GREEN")
                .setDescription(`User with ID ${userId} has been unbanned.`);
            message.reply({ embeds: [embed] });
        }).catch(err => {
            message.reply("I was unable to unban the user.");
            console.error(err);
        });
    }

    // Kick command
    if (message.content.startsWith("!kick")) {
        if (!message.member.permissions.has("KICK_MEMBERS")) return message.reply("You don't have permission to use this command.");
        let member = message.mentions.members.first();
        if (!member) return message.reply("Please mention a user to kick.");
        member.kick().then(() => {
            const embed = new Discord.MessageEmbed()
                .setColor("ORANGE")
                .setDescription(`${member.user.tag} has been kicked.`);
            message.reply({ embeds: [embed] });
        }).catch(err => {
            message.reply("I was unable to kick the member.");
            console.error(err);
        });
    }

    // Mute command
    if (message.content.startsWith("!mute")) {
        if (!message.member.permissions.has("MUTE_MEMBERS")) return message.reply("You don't have permission to use this command.");
        let member = message.mentions.members.first();
        if (!member) return message.reply("Please mention a user to mute.");
        let muteRole = message.guild.roles.cache.find(role => role.name === "Muted");
        if (!muteRole) return message.reply("Mute role not found.");
        member.roles.add(muteRole).then(() => {
            const embed = new Discord.MessageEmbed()
                .setColor("YELLOW")
                .setDescription(`${member.user.tag} has been muted.`);
            message.reply({ embeds: [embed] });
        }).catch(err => {
            message.reply("I was unable to mute the member.");
            console.error(err);
        });
    }

    // Unmute command
    if (message.content.startsWith("!unmute")) {
        if (!message.member.permissions.has("MUTE_MEMBERS")) return message.reply("You don't have permission to use this command.");
        let member = message.mentions.members.first();
        if (!member) return message.reply("Please mention a user to unmute.");
        let muteRole = message.guild.roles.cache.find(role => role.name === "Muted");
        if (!muteRole) return message.reply("Mute role not found.");
        member.roles.remove(muteRole).then(() => {
            const embed = new Discord.MessageEmbed()
                .setColor("GREEN")
                .setDescription(`${member.user.tag} has been unmuted.`);
            message.reply({ embeds: [embed] });
        }).catch(err => {
            message.reply("I was unable to unmute the member.");
            console.error(err);
        });
    }

    // Timeout command
    if (message.content.startsWith("!timeout")) {
        if (!message.member.permissions.has("MODERATE_MEMBERS")) return message.reply("You don't have permission to use this command.");
        let member = message.mentions.members.first();
        if (!member) return message.reply("Please mention a user to timeout.");
        let args = message.content.split(" ").slice(2);
        let duration = parseInt(args[0]);
        if (isNaN(duration) || duration <= 0) return message.reply("Please provide a valid duration in minutes.");
        let reason = args.slice(1).join(" ") || "No reason provided";

        member.timeout(duration * 60 * 1000, reason).then(() => {
            const embed = new Discord.MessageEmbed()
                .setColor("ORANGE")
                .setDescription(`${member.user.tag} has been timed out for ${duration} minutes. Reason: ${reason}`);
            message.reply({ embeds: [embed] });
        }).catch(err => {
            message.reply("I was unable to timeout the member.");
            console.error(err);
        });
    }

    // Lock channel command
    if (message.content.startsWith("!lock")) {
        if (!message.member.permissions.has("MANAGE_CHANNELS")) return message.reply("You don't have permission to use this command.");
        let channel = message.mentions.channels.first() || message.channel;
        channel.permissionOverwrites.edit(message.guild.roles.everyone, { SEND_MESSAGES: false }).then(() => {
            const embed = new Discord.MessageEmbed()
                .setColor("RED")
                .setDescription(`${channel.name} has been locked.`);
            message.reply({ embeds: [embed] });
        }).catch(err => {
            message.reply("I was unable to lock the channel.");
            console.error(err);
        });
    }

    // Unlock channel command
    if (message.content.startsWith("!unlock")) {
        if (!message.member.permissions.has("MANAGE_CHANNELS")) return message.reply("You don't have permission to use this command.");
        let channel = message.mentions.channels.first() || message.channel;
        channel.permissionOverwrites.edit(message.guild.roles.everyone, { SEND_MESSAGES: true }).then(() => {
            const embed = new Discord.MessageEmbed()
                .setColor("GREEN")
                .setDescription(`${channel.name} has been unlocked.`);
            message.reply({ embeds: [embed] });
        }).catch(err => {
            message.reply("I was unable to unlock the channel.");
            console.error(err);
        });
    }

    // Clear messages command
    if (message.content.startsWith("!clear")) {
        if (!message.member.permissions.has("MANAGE_MESSAGES")) return message.reply("You don't have permission to use this command.");
        let args = message.content.split(" ").slice(1);
        let amount = parseInt(args[0]);
        if (isNaN(amount) || amount <= 0) return message.reply("Please provide a valid number of messages to delete.");
        message.channel.bulkDelete(amount, true).then(deleted => {
            const embed = new Discord.MessageEmbed()
                .setColor("BLUE")
                .setDescription(`Deleted ${deleted.size} messages.`);
            message.reply({ embeds: [embed] }).then(msg => {
                setTimeout(() => msg.delete(), 5000);
            });
        }).catch(err => {
            message.reply("I was unable to delete the messages.");
            console.error(err);
        });
    }

    // Broadcast command
    if (message.content.startsWith("!bc")) {
        if (!message.member.permissions.has("ADMINISTRATOR")) return message.reply("You don't have permission to use this command.");
        let args = message.content.split(" ").slice(1);
        let broadcastMessage = args.join(" ");
        if (!broadcastMessage) return message.reply("Please provide a message to broadcast.");

        const embed = new Discord.MessageEmbed()
            .setColor("BLUE")
            .setTitle("Broadcast Message")
            .setDescription(broadcastMessage)
            .setTimestamp();

        message.guild.members.fetch().then(members => {
            members.forEach(member => {
                if (!member.user.bot) {
                    member.send({ embeds: [embed] }).catch(err => console.error(`Could not send message to ${member.user.tag}: ${err}`));
                }
            });
        });

        message.reply("Broadcast message sent to all members.");
    }

    // Say command for news channel and other specified channels
    if (message.content.startsWith("!say") && allowedSayChannels.includes(message.channel.id)) {
        if (!message.member.permissions.has("ADMINISTRATOR")) return message.reply("You don't have permission to use this command.");
        let args = message.content.split(" ").slice(1);
        let newsMessage = args.join(" ");
        if (!newsMessage) return message.reply("Please provide a message to send.");

        const embed = new Discord.MessageEmbed()
            .setColor("BLUE")
            .setTitle("News Update")
            .setDescription(newsMessage)
            .setImage("https://cdn.discordapp.com/attachments/1338508802332426323/1338850763996266506/standard.gif?ex=67ac9570&is=67ab43f0&hm=c860fd7efef048fb6a52f9fa5652d71e03cc969fa5c34e300838c658227e829a&")
            .setTimestamp();

        message.channel.send({ embeds: [embed] });
        message.delete().catch(console.error); // Delete the user's message after sending the news update
    }

    // Automatically send suggestions when a message is sent in a specific channel
    if (message.channel.id === suggestionChannelId) {
        const embed = new Discord.MessageEmbed()
            .setAuthor(`${message.author.tag}`, message.author.avatarURL({ dynamic: true }))
            .setColor("RANDOM")
            .setTitle("New Suggestion")
            .setDescription(`> **${message.content}**`)
            .addField("User ID", message.author.id, true)
            .addField("Channel", `<#${message.channel.id}>`, true)
            .setThumbnail(message.author.avatarURL({ dynamic: true }))
            .setTimestamp();

        const row = new Discord.MessageActionRow()
            .addComponents(
                new Discord.MessageButton()
                    .setCustomId('accept')
                    .setLabel('Accept')
                    .setStyle('SUCCESS'),
                new Discord.MessageButton()
                    .setCustomId('deny')
                    .setLabel('Deny')
                    .setStyle('DANGER')
            );

        message.channel.send({ embeds: [embed], components: [row] }).then(msg => {
            msg.react("✔️").then(() => {
                msg.react("❌");
            });
        });

        message.delete().catch(console.error); // Delete the user's message after sending the suggestion

        message.author.send(`Thank you for your suggestion in <#${message.channel.id}>`).catch(console.error);
    }

    // Info command
if (message.content.startsWith("!info")) {
    let member = message.mentions.members.first() || message.member;
    let userWarnings = warnings.get(member.id) || [];
    let removedWarnings = removedWarningsMap.get(member.id) || [];

    const embed = new Discord.MessageEmbed()
        .setTitle(`${member.user.tag}'s Info`)
        .setThumbnail(member.user.avatarURL())
        .addFields(
            { name: 'ID', value: member.id, inline: true },
            { name: 'Nickname', value: member.nickname || 'None', inline: true },
            { name: 'Joined Server', value: new Date(member.joinedTimestamp).toLocaleDateString(), inline: true },
            { name: 'Joined Discord', value: new Date(member.user.createdTimestamp).toLocaleDateString(), inline: true },
            { name: 'Warnings', value: userWarnings.length > 0 ? userWarnings.join('\n') : 'None', inline: false },
            { name: 'Removed Warnings', value: removedWarnings.length > 0 ? removedWarnings.join('\n') : 'None', inline: false }
        )
        .setColor("BLUE")
        .setTimestamp();

    message.channel.send({ embeds: [embed] });
}
    // Warn command
    if (message.content.startsWith("!warn")) {
        if (!message.member.permissions.has("MANAGE_MESSAGES")) return message.reply("You don't have permission to use this command.");
        let member = message.mentions.members.first();
        if (!member) return message.reply("Please mention a user to warn.");
        let reason = message.content.split(" ").slice(2).join(" ");
        if (!reason) return message.reply("Please provide a reason for the warning.");

        if (!warnings.has(member.id)) {
            warnings.set(member.id, []);
        }
        warnings.get(member.id).push(reason);

        const embed = new Discord.MessageEmbed()
            .setColor("YELLOW")
            .setDescription(`${member.user.tag} has been warned for: ${reason}`);
        message.reply({ embeds: [embed] });
    }

// Remove warn command
if (message.content.startsWith("!removewarn")) {
    if (!message.member.permissions.has("MANAGE_MESSAGES")) return message.reply("You don't have permission to use this command.");
    let member = message.mentions.members.first();
    if (!member) return message.reply("Please mention a user to remove a warning from.");
    let warnIndex = parseInt(message.content.split(" ")[2]) - 1;
    if (isNaN(warnIndex) || warnIndex < 0) return message.reply("Please provide a valid warning index.");

    if (!warnings.has(member.id) || !warnings.get(member.id)[warnIndex]) {
        return message.reply("This user does not have a warning at the specified index.");
    }

    let removedWarning = warnings.get(member.id).splice(warnIndex, 1)[0];
    if (!removedWarningsMap.has(member.id)) {
        removedWarningsMap.set(member.id, []);
    }
    removedWarningsMap.get(member.id).push(removedWarning);

    const embed = new Discord.MessageEmbed()
        .setColor("GREEN")
        .setDescription(`Warning ${warnIndex + 1} has been removed from ${member.user.tag}.`);
    message.reply({ embeds: [embed] });
}

    // Automatically delete messages containing links and warn the user (only for non-admins) in a specific channel
    if (message.channel.id === linkWarningChannelId && message.content.match(/https?:\/\/[^\s]+/) && !message.member.permissions.has("ADMINISTRATOR")) {
        message.delete().catch(console.error);

        const warningEmbed = new Discord.MessageEmbed()
            .setTitle("Warning")
            .setColor("RED")
            .setDescription("You have been warned for posting a link in the channel.")
            .addField("Reason", "Posted a link.", true)
            .setTimestamp();

        message.author.send({ embeds: [warningEmbed] }).catch(console.error);

        if (!warnings.has(message.author.id)) {
            warnings.set(message.author.id, []);
        }
        warnings.get(message.author.id).push("Posted a link.");
    }

    // Create support ticket command
    if (message.content.startsWith("!ticket")) {
        const ticketCategory = message.guild.channels.cache.find(c => c.name === "Support Tickets" && c.type === "GUILD_CATEGORY");
        if (!ticketCategory) {
            return message.reply("Support Tickets category not found. Please create a category named 'Support Tickets'.");
        }

        const ticketChannel = await message.guild.channels.create(`ticket-${message.author.username}`, {
            type: 'GUILD_TEXT',
            parent: ticketCategory.id,
            permissionOverwrites: [
                {
                    id: message.guild.id,
                    deny: ['VIEW_CHANNEL'],
                },
                {
                    id: message.author.id,
                    allow: ['VIEW_CHANNEL', 'SEND_MESSAGES'],
                },
                {
                    id: adminId, // Replace with the role ID of your support team
                    allow: ['VIEW_CHANNEL', 'SEND_MESSAGES'],
                },
            ],
        });

        const embed = new Discord.MessageEmbed()
            .setColor("BLUE")
            .setDescription(`Hello ${message.author}, a support team member will be with you shortly. Please describe your issue.`);

        ticketChannel.send({ embeds: [embed] });
        message.reply(`Your support ticket has been created: ${ticketChannel}`);
    }

    // Close support ticket command
    if (message.content.startsWith("!close")) {
        if (!message.channel.name.startsWith("ticket-")) {
            return message.reply("This command can only be used in a support ticket channel.");
        }

        message.channel.delete().catch(console.error);
    }

    // ...existing code...

// Server Info command
if (message.content.startsWith("!serverinfo")) {
    const { guild } = message;
    const { name, region, memberCount, owner, afkTimeout } = guild;
    const icon = guild.iconURL();

    const embed = new Discord.MessageEmbed()
        .setTitle(`Server info for ${name}`)
        .setThumbnail(icon)
        .addFields(
            { name: 'Region', value: region, inline: true },
            { name: 'Members', value: memberCount.toString(), inline: true },
            { name: 'Owner', value: owner.user.tag, inline: true },
            { name: 'AFK Timeout', value: afkTimeout.toString(), inline: true }
        )
        .setColor("BLUE");

    message.channel.send({ embeds: [embed] });
}

// User Info command
if (message.content.startsWith("!userinfo")) {
    let member = message.mentions.members.first() || message.member;
    const embed = new Discord.MessageEmbed()
        .setTitle(`${member.user.tag}'s Info`)
        .setThumbnail(member.user.avatarURL())
        .addFields(
            { name: 'ID', value: member.id, inline: true },
            { name: 'Nickname', value: member.nickname || 'None', inline: true },
            { name: 'Joined Server', value: new Date(member.joinedTimestamp).toLocaleDateString(), inline: true },
            { name: 'Joined Discord', value: new Date(member.user.createdTimestamp).toLocaleDateString(), inline: true }
        )
        .setColor("BLUE");

    message.channel.send({ embeds: [embed] });
}

// Role Info command
if (message.content.startsWith("!roleinfo")) {
    let role = message.mentions.roles.first();
    if (!role) return message.reply("Please mention a role.");

    const embed = new Discord.MessageEmbed()
        .setTitle(`${role.name} Role Info`)
        .addFields(
            { name: 'ID', value: role.id, inline: true },
            { name: 'Color', value: role.hexColor, inline: true },
            { name: 'Members', value: role.members.size.toString(), inline: true },
            { name: 'Position', value: role.position.toString(), inline: true }
        )
        .setColor(role.hexColor);

    message.channel.send({ embeds: [embed] });
}

// Avatar command
if (message.content.startsWith("!avatar")) {
    let member = message.mentions.members.first() || message.member;
    const embed = new Discord.MessageEmbed()
        .setTitle(`${member.user.tag}'s Avatar`)
        .setImage(member.user.avatarURL({ dynamic: true, size: 512 }))
        .setColor("BLUE");

    message.channel.send({ embeds: [embed] });
}

// Ping command
if (message.content.startsWith("!ping")) {
    const embed = new Discord.MessageEmbed()
        .setDescription(`🏓 Latency is ${Date.now() - message.createdTimestamp}ms. API Latency is ${Math.round(client.ws.ping)}ms`)
        .setColor("BLUE");

    message.channel.send({ embeds: [embed] });
}

// ...existing code...

// ...existing code...

// Timeout command
if (message.content.startsWith("!timeout")) {
    if (!message.member.permissions.has("MODERATE_MEMBERS")) return message.reply("You don't have permission to use this command.");
    let member = message.mentions.members.first();
    if (!member) return message.reply("Please mention a user to timeout.");
    let args = message.content.split(" ").slice(2);
    let duration = parseInt(args[0]);
    if (isNaN(duration) || duration <= 0) return message.reply("Please provide a valid duration in minutes.");
    let reason = args.slice(1).join(" ") || "No reason provided";

    member.timeout(duration * 60 * 1000, reason).then(() => {
        const embed = new Discord.MessageEmbed()
            .setColor("ORANGE")
            .setDescription(`${member.user.tag} has been timed out for ${duration} minutes. Reason: ${reason}`);
        message.reply({ embeds: [embed] });
    }).catch(err => {
        message.reply("I was unable to timeout the member.");
        console.error(err);
    });
}

// ...existing code...

    // Rules command
    if (message.content.startsWith("!rules")) {
        const rulesEmbed = new Discord.MessageEmbed()
            .setTitle("Server Rules")
            .setColor("PURPLE")
            .setDescription("Please follow these rules to ensure a friendly environment:")
            .addField("1. يمنع المشاكل بجميع انواعه.")
            .addField("2. يمنع السب و الشتم و الاهانة بجميع انواعه")
            .addField("3. يمنع التلميح لسبه, مثل : كلسمك الخ..")
            .addField("4. Follow Discord's TOS", "Ensure you follow Discord's Terms of Service.")
            .addField("5. Use appropriate channels", "Post content in the appropriate channels.")
            .setTimestamp()
            .setFooter("Thank you for following the rules!");

        message.channel.send({ embeds: [rulesEmbed] });
    }

    // Help command
    if (message.content.startsWith("!help")) {
        const helpEmbed = new Discord.MessageEmbed()
            .setTitle("Bot Commands")
            .setColor("BLUE")
            .setDescription("List of all bot commands and their functions:")
            .addField("!ban", "Ban a user.")
            .addField("!unban", "Unban a user.")
            .addField("!kick", "Kick a user.")
            .addField("!mute", "Mute a user.")
            .addField("!unmute", "Unmute a user.")
            .addField("!lock", "Lock a channel.")
            .addField("!unlock", "Unlock a channel.")
            .addField("!clear", "Clear messages.")
            .addField("!warn", "Warn a user.")
            .addField("!removewarn", "Remove a warning from a user.")
            .addField("!test", "Test the bot.")
            .addField("!bc", "Broadcast a message to all members.")
            .addField("!say", "Send a news update in the news channel.")
            .addField("!help", "Display this list of commands.")
            .addField("!rules", "Display the server rules.")
            .addField("!ticket", "Create a support ticket.")
            .addField("!close", "Close a support ticket.")
            .addField("!serverinfo", "Display server information.")
            .addField("!userinfo", "Display user information.")
            .addField("!roleinfo", "Display role information.")
            .addField("!avatar", "Display user avatar.")
            .addField("!ping", "Check bot latency.")
            .addField("!timeout", "Timeout a user.")
            .addField("!info", "Display user info and warnings.")
            .setTimestamp();
            message.channel.send({ embeds: [helpEmbed] });
        }
    });
    
    client.on('interactionCreate', async interaction => {
        if (!interaction.isButton()) return;
    
        const suggestionMessage = interaction.message;
        const suggestionEmbed = suggestionMessage.embeds[0];
        const suggestionAuthorId = suggestionEmbed.fields.find(field => field.name === "User ID").value;
    
        if (interaction.user.id !== adminId) {
            return interaction.reply({ content: "You don't have permission to use this button.", ephemeral: true });
        }
    
        if (interaction.customId === 'accept') {
            interaction.reply({ content: "Suggestion accepted.", ephemeral: true });
            client.users.fetch(suggestionAuthorId).then(user => {
                user.send("Your suggestion has been accepted.").catch(console.error);
            });
        } else if (interaction.customId === 'deny') {
            interaction.reply({ content: "Suggestion denied.", ephemeral: true });
            client.users.fetch(suggestionAuthorId).then(user => {
                user.send("Your suggestion has been denied.").catch(console.error);
            });
        }
    });
    
    client.login(token);