const { MessageEmbed } = require("discord.js");
const { PenalModel } = require("../../Helpers/models.js")
const { Jail } = global.Moderation.Permissions;

exports.run = async (Moderation, message, args) => {
    if (message.member.check(Jail.AuthRoles) === false) return;
    const Member = message.mentions.members.first() || message.guild.member(args[0]) || (await Moderation.getUser(args[0]));
    if (!Member) return message.channel.send("Geçerli bir üye belirt!");

    PenalModel.find({ Activity: true, User: Member.id, $or: [{ Type: "JAIL" }, { Type: "TEMP_JAIL" }] }, async (err, res) => {
        if (err) return console.error(err);
        if (!res || !res.length) return message.channel.send(":no_entry_sign: Belirttiğin kullanıcının cezası bulunmamaktadır.");
        if (Member.roles) Member.roles.set(res[0].Jail_Roles).catch(console.error);
        const Channel =  Moderation.channels.cache.get(Jail.Channel);
        const Embed = new MessageEmbed().setAuthor(message.author.tag, message.author.avatarURL({ dynamic: true }));
        if (Channel) Channel.send(`${message.author}-\`${message.author.id}\`adlı yetkili başarı ile ${Member}-\`${Member.id}\`kişisinin sunucudaki cezasını kaldırdı.`);
        message.channel.send(Embed.setColor("BLACK").setDescription(`${Member}-\`${Member.id}\`kullanıcısının cezası başarı ile kaldırıldı.`).setColor("BLACK").setTimestamp()).then(x => x.delete({timeout: 10000}))
        message.react("✅")
        PenalModel.updateMany({ Activity: true, User: Member.id, $or: [{ Type: "JAIL" }, { Type: "TEMP_JAIL" }] }, { $set: { Activity: false, Compaleted: true } }, (error, data) => {
            if (error) return console.error(error)
        });
    }).catch(console.error)
};

exports.conf = {
    commands: ["unjail"],
    enabled: true,
    usage: "unjail [Üye]"
};