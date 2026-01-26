#!/usr/bin/env node

/**
 * MAIA Auto-Handoff System
 * Automatically tracks agent handoffs and generates session reports
 *
 * Usage: node .opencode/scripts/auto-handoff.js [action]
 */

import { readFileSync, writeFileSync, existsSync } from 'fs';
import { execSync } from 'child_process';
import path from 'path';

const HANDOFFS_FILE = '.agents/handoffs.json';
const METRICS_FILE = '.agents/metrics.json';
const SESSIONS_DIR = '.agents/sessions/';

function loadJSON(filePath) {
  if (!existsSync(filePath)) {
    return null;
  }
  try {
    return JSON.parse(readFileSync(filePath, 'utf8'));
  } catch (error) {
    console.error(`Error reading ${filePath}:`, error.message);
    return null;
  }
}

function saveJSON(filePath, data) {
  writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
  console.log(`Updated ${filePath}`);
}

function parseAgentTag(message) {
  const match = message.match(/<!-- (@\w+)-session-([^:]+):?\s*(.+)?/);
  if (!match) return null;

  return {
    agent: match[1],
    sessionId: match[2],
    context: match[3]?.trim() || 'No context provided',
  };
}

function analyzeCommit(commit) {
  const hash = commit.hash;
  const message = commit.message;
  const author = commit.author;
  const date = commit.date;

  const agentTag = parseAgentTag(message);

  if (!agentTag) {
    return null;
  }

  return {
    hash,
    message,
    author,
    date,
    agent: agentTag.agent,
    sessionId: agentTag.sessionId,
    context: agentTag.context,
  };
}

function getRecentCommits(count = 10) {
  try {
    const output = execSync(`git log -${count} --pretty=format:"%H|%an|%ad|%s" --date=iso`, {
      encoding: 'utf8',
    });
    return output.trim().split('\n').map(line => {
      const [hash, author, date, ...messageParts] = line.split('|');
      return {
        hash,
        author,
        date,
        message: messageParts.join('|').trim(),
      };
    });
  } catch (error) {
    console.error('Error getting git commits:', error.message);
    return [];
  }
}

function trackHandoffs() {
  const handoffsData = loadJSON(HANDOFFS_FILE) || { handoffs: [], current_session: null };
  const metricsData = loadJSON(METRICS_FILE) || {};

  const commits = getRecentCommits();
  const newHandoffs = [];

  for (const commit of commits) {
    const analysis = analyzeCommit(commit);

    if (analysis) {
      // Check if this handoff already exists
      const exists = handoffsData.handoffs.some(h => h.hash === analysis.hash);

      if (!exists) {
        newHandoffs.push(analysis);

        // Update metrics for the agent
        if (metricsData[analysis.agent.replace('@', '')]) {
          const agentMetrics = metricsData[analysis.agent.replace('@', '')];
          agentMetrics.tasks_completed = (agentMetrics.tasks_completed || 0) + 1;
        }
      }
    }
  }

  if (newHandoffs.length > 0) {
    handoffsData.handoffs.unshift(...newHandoffs);
    saveJSON(HANDOFFS_FILE, handoffsData);
    saveJSON(METRICS_FILE, metricsData);

    console.log(`Tracked ${newHandoffs.length} new handoffs`);
    newHandoffs.forEach(h => {
      console.log(`  ${h.agent} (${h.sessionId}): ${h.message}`);
    });
  } else {
    console.log('No new handoffs to track');
  }

  return newHandoffs;
}

function generateSessionReport(sessionId) {
  const handoffsData = loadJSON(HANDOFFS_FILE);
  if (!handoffsData) {
    console.error('No handoffs data found');
    return;
  }

  const sessionHandoffs = handoffsData.handoffs.filter(
    h => h.sessionId === sessionId
  );

  if (sessionHandoffs.length === 0) {
    console.error(`No handoffs found for session ${sessionId}`);
    return;
  }

  const report = {
    sessionId,
    agents: [...new Set(sessionHandoffs.map(h => h.agent))],
    commits: sessionHandoffs,
    summary: {
      totalCommits: sessionHandoffs.length,
      uniqueAgents: [...new Set(sessionHandoffs.map(h => h.agent))].length,
      timeRange: {
        start: sessionHandoffs[sessionHandoffs.length - 1].date,
        end: sessionHandoffs[0].date,
      },
    },
  };

  const reportPath = path.join(SESSIONS_DIR, `${sessionId}.json`);
  saveJSON(reportPath, report);

  console.log(`Generated session report: ${reportPath}`);
  return report;
}

function showMetrics() {
  const metricsData = loadJSON(METRICS_FILE);
  if (!metricsData) {
    console.error('No metrics data found');
    return;
  }

  console.log('\n=== MAIA Droid Performance Metrics ===\n');

  for (const [agent, metrics] of Object.entries(metricsData)) {
    console.log(`${agent}:`);
    for (const [key, value] of Object.entries(metrics)) {
      console.log(`  ${key}: ${value}`);
    }
    console.log('');
  }
}

function main() {
  const args = process.argv.slice(2);
  const action = args[0] || 'track';

  switch (action) {
    case 'track':
      trackHandoffs();
      break;
    case 'report':
      if (!args[1]) {
        console.error('Please provide a session ID');
        process.exit(1);
      }
      generateSessionReport(args[1]);
      break;
    case 'metrics':
      showMetrics();
      break;
    default:
      console.log('Usage: node auto-handoff.js [track|report|metrics]');
      console.log('  track    - Track new handoffs from recent commits');
      console.log('  report   - Generate session report (requires session ID)');
      console.log('  metrics  - Show agent performance metrics');
      process.exit(1);
  }
}

main();
