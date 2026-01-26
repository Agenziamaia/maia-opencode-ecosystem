/**
 * Agent Base Interface
 *
 * This file defines the base interface for all agents.
 * Each agent should implement this interface.
 */

export interface Agent {
  name: string;
  description: string;
  process(message: string, context: Record<string, unknown>): Promise<string>;
}

export type AgentContext = {
  phoneNumber: string;
  conversationHistory: Array<{ role: string; content: string }>;
  metadata: Record<string, unknown>;
};

/**
 * Example Agent: Welcome Agent
 * TODO: Implement your welcome logic
 */
export class WelcomeAgent implements Agent {
  name = 'welcome';
  description = 'Handles welcome messages and initial greetings';

  async process(message: string, context: AgentContext): Promise<string> {
    // TODO: Implement welcome logic
    // Example: Detect if this is a new user and send welcome message
    return 'Welcome! How can I help you today?';
  }
}

/**
 * Example Agent: FAQ Agent
 * TODO: Implement your FAQ logic
 */
export class FAQAgent implements Agent {
  name = 'faq';
  description = 'Handles frequently asked questions';

  async process(message: string, context: AgentContext): Promise<string> {
    // TODO: Implement FAQ logic
    // Example: Match message against FAQ database
    return "I'm not sure about that. Let me check for you.";
  }
}

/**
 * Agent Router
 * Routes incoming messages to the appropriate agent
 */
export class AgentRouter {
  private agents: Map<string, Agent> = new Map();

  registerAgent(agent: Agent) {
    this.agents.set(agent.name, agent);
  }

  async route(message: string, context: AgentContext): Promise<string> {
    // TODO: Implement routing logic
    // Example: Use AI to classify message and route to appropriate agent

    // Simple routing based on keywords (implement your own logic)
    const messageLower = message.toLowerCase();

    if (messageLower.includes('hello') || messageLower.includes('hi')) {
      const agent = this.agents.get('welcome');
      if (agent) return agent.process(message, context);
    }

    // Default to FAQ agent
    const faqAgent = this.agents.get('faq');
    if (faqAgent) return faqAgent.process(message, context);

    return 'I need to think about that...';
  }
}
