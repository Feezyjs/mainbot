const { MessageEmbed } = require("discord.js");
const Penal = require("../../Helpers/penal.js")
const { Ban } = global.Moderation.Permissions;

exports.run = async (Moderation, message, args) => {
    if (message.member.check(Ban.AuthRoles) === false) return;

    if (!args[0] || !Number(args[0]) || args[0].length <= 0) return message.channel.send("Geçerli bir ID belirt.");

    const Bans = await message.guild.fetchBans();
    const data = await Penal.fetchPenals({ Activity: true, User: args.join(" "), Type: "BAN" }, 1);
    if (!Bans.has(args[0]) && !data) return message.channel.send(":no_entry_sign: Belirttiğin ID'ye sahip olan kullanıcının banı bulunmamaktadır.");
    if (data.length > 0) await Penal.inactiveUserPenals(args.join(" "), "BAN");
    if (Bans.has(args[0])) message.guild.members.unban(args[0]).catch(console.error);

    const User = (await Moderation.users.fetch(args[0])).tag;
    const Channel = Moderation.channels.cache.get(Ban.Channel);
    const Embed = new MessageEmbed().setAuthor(message.author.tag, message.author.avatarURL({ dynamic: true }));

    if (Channel) Channel.send(Embed.setDescription(`${message.author} adlı yetkili **${User}** adlı kullanıcının sunucuda ki yasaklamasını başarı ile kaldırdı.`).setColor("BLACK").setTimestamp())
    message.channel.send(Embed.setColor("BLACK").setDescription(`${message.author} adlı yetkili başarı ile **${User}** adlı üyenin banını kaldırdı.`)).then(x => x.delete({timeout: 10000}));
    message.react("✅")
};

exports.conf = {
    commands: ["unban", "banaç"],
    enabled: true,
    usage: "unban [ID]"
};
