import { tool } from "@opencode-ai/plugin"

/**
 * Discord Integration Tools
 * Requires DISCORD_BOT_TOKEN environment variable
 */

export const send = tool({
    description: "Send a message to a Discord channel",
    args: {
        channel_id: tool.schema.string().describe("Discord channel ID"),
        message: tool.schema.string().describe("Message content (max 2000 chars)"),
    },
    async execute(args) {
        const token = process.env.DISCORD_BOT_TOKEN;
        if (!token) {
            return "Error: DISCORD_BOT_TOKEN not set in environment";
        }

        const res = await fetch(`https://discord.com/api/v10/channels/${args.channel_id}/messages`, {
            method: "POST",
            headers: {
                Authorization: `Bot ${token}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ content: args.message.slice(0, 2000) }),
        });

        if (res.ok) {
            return `✅ Message sent to channel ${args.channel_id}`;
        } else {
            const err = await res.json();
            return `❌ Discord API Error: ${res.status} - ${JSON.stringify(err)}`;
        }
    },
});

export const read = tool({
    description: "Read recent messages from a Discord channel",
    args: {
        channel_id: tool.schema.string().describe("Discord channel ID"),
        limit: tool.schema.number().optional().describe("Number of messages (default 10, max 100)"),
    },
    async execute(args) {
        const token = process.env.DISCORD_BOT_TOKEN;
        if (!token) {
            return "Error: DISCORD_BOT_TOKEN not set in environment";
        }

        const limit = Math.min(args.limit || 10, 100);
        const res = await fetch(`https://discord.com/api/v10/channels/${args.channel_id}/messages?limit=${limit}`, {
            headers: { Authorization: `Bot ${token}` },
        });

        if (!res.ok) {
            const err = await res.json();
            return `❌ Discord API Error: ${res.status} - ${JSON.stringify(err)}`;
        }

        const messages = await res.json();
        return messages
            .map((m: any) => `[${m.author.username}]: ${m.content}`)
            .reverse()
            .join("\n");
    },
});

export const channels = tool({
    description: "List channels in a Discord guild (server)",
    args: {
        guild_id: tool.schema.string().describe("Discord guild/server ID"),
    },
    async execute(args) {
        const token = process.env.DISCORD_BOT_TOKEN;
        if (!token) {
            return "Error: DISCORD_BOT_TOKEN not set in environment";
        }

        const res = await fetch(`https://discord.com/api/v10/guilds/${args.guild_id}/channels`, {
            headers: { Authorization: `Bot ${token}` },
        });

        if (!res.ok) {
            const err = await res.json();
            return `❌ Discord API Error: ${res.status} - ${JSON.stringify(err)}`;
        }

        const chans = await res.json();
        return chans
            .filter((c: any) => c.type === 0) // Text channels only
            .map((c: any) => `#${c.name} (ID: ${c.id})`)
            .join("\n");
    },
});
