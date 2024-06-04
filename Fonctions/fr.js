const emojis = require("./emojis");

module.exports = {

    error: content => `**${emojis.error} \`Erreur\` : ${content} ${emojis.cancel}**`,
    server: content => `**${emojis.server} \`Serveur\` : ${content}**`,
    bot: content => `**${emojis.bot} \`Robot\` : ${content}**`,
    role: content => `**${emojis.role} \`Rôle\` : ${content}**`,
    user: content => `**${emojis.user} \`Utilisateur\` : ${content}**`,
    channel: content => `**${emojis.channel} \`Salon\` : ${content}**`,
    xp: content => `**${emojis.xp} \`Expérience\` : ${content}**`,
    ban: content => `**${emojis.ban} \`Bannissement\` : ${content}**`,
    unban: content => `**${emojis.unban} \`Débannissement\` : ${content}**`,
    kick: content => `**${emojis.kick} \`Expulsion\` : ${content}**`,
    mute: content => `**${emojis.timeout} \`Muet\` : ${content}**`,
    unmute: content => `**${emojis.untimeout} \`Parole rendu\` : ${content}**`,
    warn: content => `**${emojis.warn} \`Avertissement\` : ${content}**`,
    reason: content => `**${emojis.reason} \`Raison\` : ${emojis.string1}\`${content}\`${emojis.string2}**`,
    infractions: content => `**${emojis.infractions} \`Infractions\` : ${content}**`,
    clear: content => `**${emojis.clear} \`Nettoyage\` : ${content} ${emojis.complete}**`,
    prefix: content => `**${emojis.prefix} \`Préfixe\` : ${content}**`,
    fr: content => `**${emojis.france} \`Français\` : ${content}**`,
    slowmode: content => `**${emojis.slowmode} \`Ralentissement\` : ${content} ${emojis.complete}**`,
    unslowmode: content => `**${emojis.unslowmode} \`Déralentissement\` : ${content} ${emojis.complete}**`,
    lock: content => `**${emojis.lock} \`Verrouillage\` : ${content}**`,
    unlock: content => `**${emojis.unlock} \`Déverrouillage\` : ${content}**`,
    moderation: content => `**${emojis.moderation} \`Modération\` : ${content} ${emojis.complete}**`,
    logs: content => `**${emojis.logs} \`Logs\` : ${content}**`,
    events: content => `**${emojis.events} \`Events\` : ${content}**`,
    captcha: content => `**${emojis.captcha} \`Captcha\` : ${content}**`,
    bug: content => `**${emojis.bug_hunter2} \`Bug\` : ${content} ${emojis.complete}**`
}