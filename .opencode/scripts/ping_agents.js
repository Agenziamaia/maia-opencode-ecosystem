import { createOpencodeClient } from '../node_modules/@opencode-ai/sdk/dist/index.js';

async function pingAgents() {
    const agentsToPing = ['maia', 'coder', 'ops'];
    console.log(`\n📡 Pinging Core Agents (${agentsToPing.join(', ')})...`);

    const client = createOpencodeClient({
        directory: process.cwd(),
        baseUrl: process.env.OPENCODE_API_URL || 'http://localhost:3000',
    });

    const results = [];

    for (const agentId of agentsToPing) {
        const start = Date.now();
        try {
            // Just try to create a session - that verifies the agent exists and is loadable
            const session = await client.session.create({ agentId });
            if (session.error) throw new Error(session.error.message);

            const duration = Date.now() - start;
            console.log(`   ✅ @${agentId} is ALIVE (${duration}ms)`);
            results.push({ agent: agentId, status: 'ok' });
        } catch (e) {
            console.error(`   ❌ @${agentId} is DEAD: ${e.message}`);
            results.push({ agent: agentId, status: 'dead', error: e.message });
        }
    }

    // Report summary
    const dead = results.filter(r => r.status === 'dead');
    if (dead.length > 0) {
        console.error(`\n⚠️  CRITICAL: ${dead.length} Core Agents failed to respond.`);
        process.exit(1);
    } else {
        console.log(`\n✨ All Core Agents Responded. System is Healthy.`);
        process.exit(0);
    }
}

pingAgents().catch(e => {
    console.error('Ping script failed:', e);
    process.exit(1);
});
