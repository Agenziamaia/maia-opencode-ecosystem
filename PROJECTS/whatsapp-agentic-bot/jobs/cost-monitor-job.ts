/**
 * Trigger.dev Job: Cost Monitoring & Optimization
 *
 * Monitors Trigger.dev usage and optimizes costs
 * Sends alerts if budget exceeded
 * Suggests optimization opportunities
 */

import { client } from '@trigger.dev/sdk';

const BUDGET = 5.0; // $5/month target
const WARN_THRESHOLD = 4.0; // $4 warning threshold

client.defineJob({
  id: 'cost-monitor',
  name: 'Monthly Cost Analysis',
  version: '1.0.0',
  trigger: cron({
    cron: '0 9 1 * *', // 1st of every month at 9 AM
  }),
  integrations: {},
  run: async (payload, io) => {
    await io.logger.info('Starting cost analysis');

    // Step 1: Fetch Trigger.dev statistics
    const stats = await io.runTask('fetch-trigger-stats', async () => {
      const response = await fetch(`${process.env.TRIGGER_DEV_URL}/api/stats`, {
        headers: {
          Authorization: `Bearer ${process.env.TRIGGER_DEV_API_KEY}`,
        },
      });

      return response.json();
    });

    const jobsRun = stats.jobsRun || 0;
    const cost = stats.cost || 0;

    await io.logger.info('Cost analysis results', {
      jobsRun,
      cost,
      avgCostPerJob: jobsRun > 0 ? (cost / jobsRun).toFixed(4) : 0,
      budget: BUDGET,
      status: cost > BUDGET ? 'OVER_BUDGET' : cost > WARN_THRESHOLD ? 'WARNING' : 'OK',
    });

    // Step 2: Check if over budget
    if (cost > BUDGET) {
      await io.logger.error(`OVER BUDGET: $${cost} exceeds $${BUDGET}`);

      // Send alert via Slack
      await io.runTask('send-budget-alert', async () => {
        await fetch(process.env.SLACK_WEBHOOK_URL!, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            text: `⚠️ Trigger.dev cost alert: $${cost} exceeded $${BUDGET} budget`,
            blocks: [
              {
                type: 'section',
                text: {
                  type: 'mrkdwn',
                  text: `*Trigger.dev Cost Alert*\n\n• Cost: $${cost}\n• Budget: $${BUDGET}\n• Jobs run: ${jobsRun}\n\nAction required to reduce costs.`,
                },
              },
              {
                type: 'actions',
                elements: [
                  {
                    type: 'button',
                    text: { type: 'plain_text', text: 'Pause Workers' },
                    url: `${process.env.TRIGGER_DEV_URL}/pause`,
                  },
                ],
              },
            ],
          }),
        });
      });

      // Suggest optimizations
      await io.runTask('suggest-optimizations', async () => {
        await fetch(`${process.env.GATEWAY_URL}/api/mesh/commands`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-API-Key': process.env.GATEWAY_API_KEY,
          },
          body: JSON.stringify({
            action: 'LOG_OPTIMIZATION_SUGGESTION',
            payload: {
              suggestions: [
                'Increase pause hours during low traffic',
                'Reduce job frequency',
                'Consolidate batch jobs',
                'Move more processing to local',
              ],
            },
          }),
        });
      });
    } else if (cost > WARN_THRESHOLD) {
      await io.logger.warn(`WARNING: $${cost} approaching $${WARN_THRESHOLD} threshold`);
    }

    // Step 3: Generate monthly report
    const report = {
      month: new Date().toLocaleString('default', { month: 'long', year: 'numeric' }),
      summary: {
        totalJobs: jobsRun,
        totalCost: `$${cost.toFixed(2)}`,
        avgCostPerJob: `$${jobsRun > 0 ? (cost / jobsRun).toFixed(4) : '0'}`,
        budgetUtilization: `${((cost / BUDGET) * 100).toFixed(1)}%`,
      },
      breakdown: await generateCostBreakdown(stats),
      recommendations: await generateRecommendations(cost, jobsRun),
    };

    await io.logger.info('Monthly report generated', report);

    // Store report in local DB
    await io.runTask('store-report', async () => {
      await fetch(`${process.env.GATEWAY_URL}/api/mesh/commands`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': process.env.GATEWAY_API_KEY,
        },
        body: JSON.stringify({
          action: 'STORE_COST_REPORT',
          payload: report,
        }),
      });
    });

    return report;
  },
});

/**
 * Generate cost breakdown by job type
 */
async function generateCostBreakdown(stats: any) {
  return {
    flightDelayJobs: stats.jobsByType?.flightDelay || 0,
    emailParserJobs: stats.jobsByType?.emailParser || 0,
    analyticsJobs: stats.jobsByType?.analytics || 0,
    upsellJobs: stats.jobsByType?.upsell || 0,
    other:
      (stats.jobsRun || 0) -
      (stats.jobsByType?.flightDelay || 0) -
      (stats.jobsByType?.emailParser || 0) -
      (stats.jobsByType?.analytics || 0) -
      (stats.jobsByType?.upsell || 0),
  };
}

/**
 * Generate cost optimization recommendations
 */
async function generateRecommendations(cost: number, jobsRun: number) {
  const recommendations = [];

  if (cost > 4.0) {
    recommendations.push({
      priority: 'HIGH',
      action: 'Increase pause hours',
      impact: 'Saves $1-2/mo',
      description: 'Pause workers during 2 AM - 8 AM (low traffic)',
    });
  }

  if (jobsRun > 1000) {
    recommendations.push({
      priority: 'MEDIUM',
      action: 'Consolidate batch jobs',
      impact: 'Saves $0.5-1/mo',
      description: 'Send multiple notifications in single job instead of individual jobs',
    });
  }

  recommendations.push({
    priority: 'LOW',
    action: 'Move more processing to local',
    impact: 'Saves $0.5-1/mo',
    description: 'Use local bot for guest lookups, simple queries',
  });

  return recommendations;
}

/**
 * Weekly check for quick optimization
 */
client.defineJob({
  id: 'weekly-cost-check',
  name: 'Weekly Cost Check',
  version: '1.0.0',
  trigger: cron({
    cron: '0 9 * * 1', // 9 AM every Monday
  }),
  integrations: {},
  run: async (payload, io) => {
    await io.logger.info('Weekly cost check');

    const stats = await io.runTask('fetch-weekly-stats', async () => {
      const response = await fetch(`${process.env.TRIGGER_DEV_URL}/api/stats`, {
        headers: {
          Authorization: `Bearer ${process.env.TRIGGER_DEV_API_KEY}`,
        },
      });

      return response.json();
    });

    // Estimate monthly cost (weekly * 4.3)
    const weeklyCost = stats.cost || 0;
    const estimatedMonthly = weeklyCost * 4.3;

    await io.logger.info('Weekly cost estimate', {
      weekly: `$${weeklyCost.toFixed(2)}`,
      estimatedMonthly: `$${estimatedMonthly.toFixed(2)}`,
      budget: `$${BUDGET}`,
    });

    if (estimatedMonthly > WARN_THRESHOLD) {
      await io.logger.warn(`On track to exceed budget: $${estimatedMonthly.toFixed(2)} estimated`);

      // Check if we should increase pause hours
      const activeGuests = await io.runTask('check-active-guests', async () => {
        const response = await fetch(`${process.env.GATEWAY_URL}/api/mesh/guests/query`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-API-Key': process.env.GATEWAY_API_KEY,
          },
          body: JSON.stringify({ status: 'active' }),
        });

        const data = await response.json();
        return data.count || 0;
      });

      if (activeGuests === 0) {
        await io.logger.info('No active guests - safe to pause workers');
      }
    }

    return { weeklyCost, estimatedMonthly };
  },
});
