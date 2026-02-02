import { execSync } from "child_process";
import { existsSync, mkdirSync } from "fs";
import { EXTERNAL_TOOLS } from "./external-tools";
import path from "path";

console.log("🦅 MAIA ECOSYSTEM: Initializing External Dependencies...");

const ROOT_DIR = process.cwd();

EXTERNAL_TOOLS.forEach((tool) => {
    const targetPath = path.join(ROOT_DIR, tool.path);

    if (existsSync(targetPath)) {
        console.log(`✅ [SKIP] ${tool.name} is already installed.`);
        // Optional: Check for updates?
        // execSync("git pull", { cwd: targetPath });
    } else {
        console.log(`⬇️ [INSTALL] Cloning ${tool.name}...`);
        const parentDir = path.dirname(targetPath);
        if (!existsSync(parentDir)) {
            mkdirSync(parentDir, { recursive: true });
        }

        try {
            execSync(`git clone ${tool.repo} "${targetPath}"`, { stdio: "inherit" });
            console.log(`   ✅ Installed to ${tool.path}`);
        } catch (e) {
            console.error(`   ❌ Failed to clone ${tool.name}:`, e.message);
        }
    }
});

console.log("✨ Ecosystem Dependencies Ready.");
