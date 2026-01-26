import { type Plugin, tool } from "@opencode-ai/plugin"

/**
 * 🎮 MAIA Discord Integration Plugin
 * 
 * Provides Discord messaging capabilities for MAIA agents.
 * Requires DISCORD_BOT_TOKEN in environment.
 */

export const DiscordPlugin: Plugin = async (ctx) => {
    const token = process.env.DISCORD_BOT_TOKEN

    return {
        tool: {
            discord_send: tool({
                description: "Send a message to a Discord channel. Requires DISCORD_BOT_TOKEN env var.",
                args: {
                    channel_id: tool.schema.string().describe("Discord channel ID"),
                    message: tool.schema.string().describe("Message content (max 2000 chars)"),
                },
                async execute(args) {
                    if (!token) {
                        return "❌ Error: DISCORD_BOT_TOKEN not set in environment"
                    }

                    try {
                        const res = await fetch(`https://discord.com/api/v10/channels/${args.channel_id}/messages`, {
                            method: "POST",
                            headers: {
                                Authorization: `Bot ${token}`,
                                "Content-Type": "application/json",
                            },
                            body: JSON.stringify({ content: args.message.slice(0, 2000) }),
                        })

                        if (res.ok) {
                            return `✅ Message sent to channel ${args.channel_id}`
                        } else {
                            const err = await res.json()
                            return `❌ Discord API Error: ${res.status} - ${JSON.stringify(err)}`
                        }
                    } catch (e) {
                        return `❌ Network Error: ${e}`
                    }
                },
            }),

            discord_read: tool({
                description: "Read recent messages from a Discord channel. Requires DISCORD_BOT_TOKEN env var.",
                args: {
                    channel_id: tool.schema.string().describe("Discord channel ID"),
                    limit: tool.schema.number().optional().describe("Number of messages (default 10, max 100)"),
                },
                async execute(args) {
                    if (!token) {
                        return "❌ Error: DISCORD_BOT_TOKEN not set in environment"
                    }

                    try {
                        const limit = Math.min(args.limit || 10, 100)
                        const res = await fetch(`https://discord.com/api/v10/channels/${args.channel_id}/messages?limit=${limit}`, {
                            headers: { Authorization: `Bot ${token}` },
                        })

                        if (!res.ok) {
                            const err = await res.json()
                            return `❌ Discord API Error: ${res.status} - ${JSON.stringify(err)}`
                        }

                        const messages = await res.json() as any[]
                        return messages
                            .map((m) => `[${m.author.username}]: ${m.content}`)
                            .reverse()
                            .join("\n")
                    } catch (e) {
                        return `❌ Network Error: ${e}`
                    }
                },
            }),

            discord_channels: tool({
                description: "List text channels in a Discord guild/server. Requires DISCORD_BOT_TOKEN env var.",
                args: {
                    guild_id: tool.schema.string().describe("Discord guild/server ID"),
                },
                async execute(args) {
                    if (!token) {
                        return "❌ Error: DISCORD_BOT_TOKEN not set in environment"
                    }

                    try {
                        const res = await fetch(`https://discord.com/api/v10/guilds/${args.guild_id}/channels`, {
                            headers: { Authorization: `Bot ${token}` },
                        })

                        if (!res.ok) {
                            const err = await res.json()
                            return `❌ Discord API Error: ${res.status} - ${JSON.stringify(err)}`
                        }

                        const channels = await res.json() as any[]
                        return channels
                            .filter((c) => c.type === 0) // Text channels only
                            .map((c) => `#${c.name} (ID: ${c.id})`)
                            .join("\n")
                    } catch (e) {
                        return `❌ Network Error: ${e}`
                    }
                },
            }),
        },
    }
}
