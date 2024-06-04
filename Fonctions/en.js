const emojis = require("./emojis");

module.exports = {

    error: content => `**${emojis.error} \`Error\` : ${content} ${emojis.cancel}**`,
    server: content => `**${emojis.server} \`Server\` : ${content}**`,
    bot: content => `**${emojis.bot} \`Bot\` : ${content}**`,
    role: content => `**${emojis.role} \`Role\` : ${content}**`,
    user: content => `**${emojis.user} \`User\` : ${content}**`,
    channel: content => `**${emojis.channel} \`Channel\` : ${content}**`,
    xp: content => `**${emojis.xp} \`Experience\` : ${content}**`,
    ban: content => `**${emojis.ban} \`Ban\` : ${content}**`,
    unban: content => `**${emojis.unban} \`Unban\` : ${content}**`,
    kick: content => `**${emojis.kick} \`Kick\` : ${content}**`,
    mute: content => `**${emojis.timeout} \`Mute\` : ${content}**`,
    unmute: content => `**${emojis.untimeout} \`Unmute\` : ${content}**`,
    warn: content => `**${emojis.warn} \`Warn\` : ${content}**`,
    reason: content => `**${emojis.reason} \`Reason\` : ${emojis.string1}\`${content}\`${emojis.string2}**`,
    infractions: content => `**${emojis.infractions} \`Offenses\` : ${content}**`,
    clear: content => `**${emojis.clear} \`Clear\` : ${content} ${emojis.complete}**`,
    prefix: content => `**${emojis.prefix} \`Prefix\` : ${content}**`,
    en: content => `**${emojis.uk} \`English\` : ${content}**`,
    slowmode: content => `**${emojis.slowmode} \`Slowmode\` : ${content} ${emojis.complete}**`,
    unslowmode: content => `**${emojis.unslowmode} \`Unslowmode\` : ${content} ${emojis.complete}**`,
    lock: content => `**${emojis.lock} \`Lock\` : ${content}**`,
    unlock: content => `**${emojis.unlock} \`Unlock\` : ${content}**`,
    moderation: content => `**${emojis.moderation} \`Moderation\` : ${content} ${emojis.complete}**`,
    logs: content => `**${emojis.logs} \`Logs\` : ${content}**`,
    events: content => `**${emojis.events} \`Events\` : ${content}**`,
    captcha: content => `**${emojis.captcha} \`Captcha\` : ${content}**`,
    bug: content => `**${emojis.bug_hunter2} \`Bug\` : ${content} ${emojis.complete}**`
}