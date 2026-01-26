const http = require('http');
const https = require('https');

const MAPPING = {
    'qwen-coder': 'qwen/qwen3-coder:free',
    'deepseek-r1': 'deepseek/deepseek-r1:free',
    'deepseek-clone': 'deepseek/deepseek-r1-0528:free'
};

const OPENROUTER_KEY = process.env.OPENROUTER_API_KEY;
const OPENAI_KEY = process.env.OPENAI_API_KEY;

if (!OPENROUTER_KEY) console.warn("Warning: OPENROUTER_API_KEY missing");
if (!OPENAI_KEY) console.warn("Warning: OPENAI_API_KEY missing");

const server = http.createServer((req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    if (req.method === 'OPTIONS') {
        res.writeHead(200);
        res.end();
        return;
    }

    if (req.url.includes('/chat/completions')) {
        let body = '';
        req.on('data', chunk => body += chunk);
        req.on('end', () => {
            let data;
            try {
                data = JSON.parse(body);
            } catch (e) {
                res.writeHead(400); res.end("Invalid JSON"); return;
            }

            const originalModel = data.model.replace('openai/', ''); // Strip prefix if present

            let targetHost, targetPath, targetKey;

            if (MAPPING[originalModel]) {
                // Route to OpenRouter
                console.log(`[Proxy] OpenRouter: ${originalModel} -> ${MAPPING[originalModel]}`);
                data.model = MAPPING[originalModel];
                targetHost = 'openrouter.ai';
                targetPath = '/api/v1/chat/completions';
                targetKey = OPENROUTER_KEY;
            } else {
                // Route to OpenAI (Default)
                console.log(`[Proxy] OpenAI Pass-through: ${originalModel}`);
                targetHost = 'api.openai.com';
                targetPath = '/v1/chat/completions';
                targetKey = OPENAI_KEY;
            }

            const payload = JSON.stringify(data);

            const options = {
                hostname: targetHost,
                path: targetPath,
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${targetKey}`,
                    'Content-Length': Buffer.byteLength(payload)
                }
            };

            const proxyReq = https.request(options, (proxyRes) => {
                res.writeHead(proxyRes.statusCode, proxyRes.headers);
                proxyRes.pipe(res, { end: true });
            });

            proxyReq.on('error', (e) => {
                console.error(`Error connecting to ${targetHost}:`, e);
                res.writeHead(502);
                res.end("Proxy Error");
            });

            proxyReq.write(payload);
            proxyReq.end();
        });
    } else {
        res.writeHead(404);
        res.end('Not Found');
    }
});

server.listen(3040, () => {
    console.log('✅ Unified Gateway running on :3040');
    console.log('-> OpenRouter for: ' + Object.keys(MAPPING).join(', '));
    console.log('-> OpenAI for everything else');
});
