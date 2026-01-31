/**
 * Skill Loader for MAIA Ecosystem
 *
 * Implements the three-level progressive disclosure loading system for skills:
 * Level 1: Metadata (name + description) - Always in context (~100 words)
 * Level 2: SKILL.md body - When skill triggers (<5k words)
 * Level 3: Bundled resources - As needed by Claude (scripts, references, assets)
 *
 * Skills are loaded from two locations:
 * - UNIVERSAL/skills/[skill-name]/SKILL.md (universal/shared skills)
 * - .opencode/skills/[skill-name]/SKILL.md (project-specific skills)
 */

import { readFileSync, readdirSync, existsSync, statSync } from 'fs';
import { join, dirname, basename } from 'path';

// ============================================================================
// Types
// ============================================================================

/**
 * Parsed frontmatter from SKILL.md
 */
export interface SkillFrontmatter {
  name: string;
  description: string;
  license?: string;
  tools?: string[];
}

/**
 * Complete skill data including metadata and content
 */
export interface SkillData {
  metadata: SkillFrontmatter;
  content: string;
  path: string;
  directory: string;
  hasBundledResources: {
    scripts: boolean;
    references: boolean;
    assets: boolean;
  };
}

/**
 * Skill metadata for Level 1 loading (always in context)
 */
export interface SkillMetadata {
  name: string;
  description: string;
  skillPath: string;
}

// ============================================================================
// Skill Loader
// ============================================================================

/**
 * SkillLoader class implementing lazy loading and progressive disclosure
 */
class SkillLoader {
  private metadataCache: Map<string, SkillMetadata> = new Map();
  private contentCache: Map<string, SkillData> = new Map();
  private initialized: boolean = false;

  /**
   * Get the singleton instance
   */
  private static instance: SkillLoader;

  static getInstance(): SkillLoader {
    if (!SkillLoader.instance) {
      SkillLoader.instance = new SkillLoader();
    }
    return SkillLoader.instance;
  }

  /**
   * Initialize the skill loader by scanning skill directories
   * This only builds the metadata cache (Level 1), not full content
   */
  initialize(): void {
    if (this.initialized) {
      return;
    }

    const baseDir = process.cwd();
    const skillPaths = [
      join(baseDir, 'UNIVERSAL', 'skills'),
      join(baseDir, '.opencode', 'skills'),
    ];

    for (const skillPath of skillPaths) {
      this.scanSkillDirectory(skillPath);
    }

    this.initialized = true;
  }

  /**
   * Scan a skill directory and build metadata cache
   */
  private scanSkillDirectory(skillPath: string): void {
    if (!existsSync(skillPath)) {
      return;
    }

    const entries = readdirSync(skillPath, { withFileTypes: true });

    for (const entry of entries) {
      if (entry.isDirectory()) {
        const skillDir = join(skillPath, entry.name);
        const skillFile = join(skillDir, 'SKILL.md');

        if (existsSync(skillFile)) {
          try {
            const frontmatter = this.parseFrontmatter(skillFile);
            if (frontmatter && frontmatter.name && frontmatter.description) {
              this.metadataCache.set(frontmatter.name, {
                name: frontmatter.name,
                description: frontmatter.description,
                skillPath: skillFile,
              });
            }
          } catch (error) {
            // Skip invalid skill files silently
            console.warn(`Warning: Could not parse skill file: ${skillFile}`);
          }
        }
      }
    }
  }

  /**
   * Parse YAML frontmatter from a SKILL.md file
   */
  private parseFrontmatter(skillPath: string): SkillFrontmatter | null {
    const content = readFileSync(skillPath, 'utf-8');

    // Check for frontmatter delimiter
    if (!content.startsWith('---')) {
      return null;
    }

    const frontmatterEnd = content.indexOf('---', 3);
    if (frontmatterEnd === -1) {
      return null;
    }

    const frontmatterText = content.slice(3, frontmatterEnd).trim();
    const frontmatter: SkillFrontmatter = {
      name: '',
      description: '',
    };

    // Parse YAML key-value pairs
    const lines = frontmatterText.split('\n');
    for (const line of lines) {
      const colonIndex = line.indexOf(':');
      if (colonIndex === -1) continue;

      const key = line.slice(0, colonIndex).trim();
      let value = line.slice(colonIndex + 1).trim();

      // Handle quoted strings
      if ((value.startsWith('"') && value.endsWith('"')) ||
          (value.startsWith("'") && value.endsWith("'"))) {
        value = value.slice(1, -1);
      }

      if (key === 'name') {
        frontmatter.name = value;
      } else if (key === 'description') {
        frontmatter.description = value;
      } else if (key === 'license') {
        frontmatter.license = value;
      } else if (key === 'tools') {
        // Parse array-style tools field
        if (value.startsWith('[') && value.endsWith(']')) {
          frontmatter.tools = value
            .slice(1, -1)
            .split(',')
            .map((t) => t.trim().replace(/['"]/g, ''))
            .filter((t) => t.length > 0);
        }
      }
    }

    return frontmatter.name && frontmatter.description ? frontmatter : null;
  }

  /**
   * Extract content without frontmatter
   */
  private extractContent(skillPath: string): string {
    const content = readFileSync(skillPath, 'utf-8');

    const frontmatterEnd = content.indexOf('---', 3);
    if (frontmatterEnd === -1) {
      return content;
    }

    // Skip past the second --- and any newlines
    let contentStart = frontmatterEnd + 3;
    while (contentStart < content.length && (content[contentStart] === '\n' || content[contentStart] === '\r')) {
      contentStart++;
    }

    return content.slice(contentStart);
  }

  /**
   * Check for bundled resources in skill directory
   */
  private checkBundledResources(skillDir: string): {
    scripts: boolean;
    references: boolean;
    assets: boolean;
  } {
    return {
      scripts: existsSync(join(skillDir, 'scripts')),
      references: existsSync(join(skillDir, 'references')),
      assets: existsSync(join(skillDir, 'assets')),
    };
  }

  // ========================================================================
  // Public API
  // ========================================================================

  /**
   * Get all skill metadata (Level 1: always in context)
   * Returns lightweight metadata only, not full content
   */
  getAllSkillMetadata(): SkillMetadata[] {
    this.initialize();
    return Array.from(this.metadataCache.values());
  }

  /**
   * Get skill metadata by name (Level 1)
   */
  getSkillMetadata(skillName: string): SkillMetadata | null {
    this.initialize();
    return this.metadataCache.get(skillName) || null;
  }

  /**
   * Check if a skill exists
   */
  hasSkill(skillName: string): boolean {
    this.initialize();
    return this.metadataCache.has(skillName);
  }

  /**
   * Get list of all skill names
   */
  listSkillNames(): string[] {
    this.initialize();
    return Array.from(this.metadataCache.keys());
  }

  /**
   * Load full skill content by name (Level 2: lazy loaded)
   * This includes the SKILL.md body content without frontmatter
   */
  loadSkill(skillName: string): SkillData | null {
    this.initialize();

    // Check cache first
    if (this.contentCache.has(skillName)) {
      return this.contentCache.get(skillName)!;
    }

    const metadata = this.metadataCache.get(skillName);
    if (!metadata) {
      return null;
    }

    return this.loadSkillByPath(metadata.skillPath);
  }

  /**
   * Load skill content directly from path
   */
  loadSkillByPath(skillPath: string): SkillData | null {
    // Check cache first
    for (const skillData of this.contentCache.values()) {
      if (skillData.path === skillPath) {
        return skillData;
      }
    }

    if (!existsSync(skillPath)) {
      return null;
    }

    try {
      const frontmatter = this.parseFrontmatter(skillPath);
      if (!frontmatter) {
        return null;
      }

      const content = this.extractContent(skillPath);
      const skillDir = dirname(skillPath);
      const skillName = basename(skillDir);

      const skillData: SkillData = {
        metadata: frontmatter,
        content,
        path: skillPath,
        directory: skillDir,
        hasBundledResources: this.checkBundledResources(skillDir),
      };

      // Cache by both name and path
      this.contentCache.set(frontmatter.name, skillData);

      return skillData;
    } catch (error) {
      console.error(`Error loading skill from ${skillPath}:`, error);
      return null;
    }
  }

  /**
   * Get skill content only (text without frontmatter)
   * For Level 2 loading into agent prompts
   */
  getSkillContent(skillName: string): string | null {
    const skillData = this.loadSkill(skillName);
    return skillData ? skillData.content : null;
  }

  /**
   * Get skills matching a search query
   * Searches both name and description
   */
  searchSkills(query: string): SkillMetadata[] {
    this.initialize();
    const lowerQuery = query.toLowerCase();

    return this.getAllSkillMetadata().filter(
      (skill) =>
        skill.name.toLowerCase().includes(lowerQuery) ||
        skill.description.toLowerCase().includes(lowerQuery)
    );
  }

  /**
   * Clear all caches (useful for testing or hot reload)
   */
  clearCache(): void {
    this.metadataCache.clear();
    this.contentCache.clear();
    this.initialized = false;
  }

  /**
   * Get skill directory path (for accessing bundled resources - Level 3)
   */
  getSkillDirectory(skillName: string): string | null {
    const skillData = this.loadSkill(skillName);
    return skillData ? skillData.directory : null;
  }

  /**
   * Check if skill has bundled resources
   */
  getSkillBundledResources(skillName: string): {
    scripts: boolean;
    references: boolean;
    assets: boolean;
  } | null {
    const skillData = this.loadSkill(skillName);
    return skillData ? skillData.hasBundledResources : null;
  }

  /**
   * Format skills for agent prompt injection (Level 1 metadata)
   * Returns formatted text suitable for including in system prompts
   */
  formatSkillsForPrompt(skillNames?: string[]): string {
    this.initialize();
    const skillsToFormat = skillNames
      ? skillNames.map((name) => this.metadataCache.get(name)).filter(Boolean) as SkillMetadata[]
      : this.getAllSkillMetadata();

    if (skillsToFormat.length === 0) {
      return 'No skills available.';
    }

    return skillsToFormat
      .map((skill) => `## ${skill.name}\n${skill.description}`)
      .join('\n\n');
  }

  /**
   * Format single skill with content for prompt injection (Level 2)
   * Includes both metadata and full SKILL.md body
   */
  formatSkillForPrompt(skillName: string): string | null {
    const skillData = this.loadSkill(skillName);
    if (!skillData) {
      return null;
    }

    return `# ${skillData.metadata.name}\n\n${skillData.content}`;
  }
}

// ============================================================================
// Singleton Instance & Convenience Functions
// ============================================================================

/**
 * Get the skill loader singleton instance
 */
export function getSkillLoader(): SkillLoader {
  return SkillLoader.getInstance();
}

/**
 * Initialize the skill loader (scans all skill directories)
 */
export function initializeSkills(): void {
  getSkillLoader().initialize();
}

/**
 * Get all skill metadata (Level 1)
 */
export function getAllSkillMetadata(): SkillMetadata[] {
  return getSkillLoader().getAllSkillMetadata();
}

/**
 * Get skill metadata by name (Level 1)
 */
export function getSkillMetadata(skillName: string): SkillMetadata | null {
  return getSkillLoader().getSkillMetadata(skillName);
}

/**
 * Load full skill content (Level 2)
 */
export function loadSkill(skillName: string): SkillData | null {
  return getSkillLoader().loadSkill(skillName);
}

/**
 * Get skill content only (text without frontmatter)
 */
export function getSkillContent(skillName: string): string | null {
  return getSkillLoader().getSkillContent(skillName);
}

/**
 * List all available skill names
 */
export function listSkillNames(): string[] {
  return getSkillLoader().listSkillNames();
}

/**
 * Check if a skill exists
 */
export function hasSkill(skillName: string): boolean {
  return getSkillLoader().hasSkill(skillName);
}

/**
 * Search skills by query
 */
export function searchSkills(query: string): SkillMetadata[] {
  return getSkillLoader().searchSkills(query);
}

/**
 * Format skills for agent prompt (Level 1 metadata)
 */
export function formatSkillsForPrompt(skillNames?: string[]): string {
  return getSkillLoader().formatSkillsForPrompt(skillNames);
}

/**
 * Format single skill with content for prompt (Level 2)
 */
export function formatSkillForPrompt(skillName: string): string | null {
  return getSkillLoader().formatSkillForPrompt(skillName);
}

/**
 * Get skill directory (for Level 3 bundled resources)
 */
export function getSkillDirectory(skillName: string): string | null {
  return getSkillLoader().getSkillDirectory(skillName);
}

/**
 * Get skill bundled resources info
 */
export function getSkillBundledResources(skillName: string): {
  scripts: boolean;
  references: boolean;
  assets: boolean;
} | null {
  return getSkillLoader().getSkillBundledResources(skillName);
}

// ============================================================================
// MCP Tool Exports (for integration with ecosystem tools)
// ============================================================================

/**
 * Format skills as a summary string (for MCP tools)
 */
export function getSkillsSummary(): string {
  const skills = getAllSkillMetadata();
  if (skills.length === 0) {
    return 'No skills available.';
  }

  return `Available Skills (${skills.length}):\n\n` +
    skills.map((s) => `• ${s.name}: ${s.description.slice(0, 100)}${s.description.length > 100 ? '...' : ''}`)
      .join('\n');
}

/**
 * Get detailed skill information
 */
export function getSkillDetails(skillName: string): string | null {
  const skillData = loadSkill(skillName);
  if (!skillData) {
    return null;
  }

  let details = `# ${skillData.metadata.name}\n\n`;
  details += `**Description:** ${skillData.metadata.description}\n`;
  details += `**Path:** ${skillData.path}\n`;
  details += `**Directory:** ${skillData.directory}\n\n`;

  details += '**Bundled Resources:**\n';
  details += `- Scripts: ${skillData.hasBundledResources.scripts ? 'Yes' : 'No'}\n`;
  details += `- References: ${skillData.hasBundledResources.references ? 'Yes' : 'No'}\n`;
  details += `- Assets: ${skillData.hasBundledResources.assets ? 'Yes' : 'No'}\n\n`;

  details += `**Content Preview:**\n${skillData.content.slice(0, 500)}${skillData.content.length > 500 ? '...\n\n[Content truncated]' : ''}`;

  return details;
}
