# API Reference

## Table of Contents

- [Gateway Endpoints](#gateway-endpoints)
- [WhatsApp Service](#whatsapp-service)
- [AI Service](#ai-service)
- [Database Service](#database-service)
- [Agent Interface](#agent-interface)

## Gateway Endpoints

### GET /health

Health check endpoint.

**Response:**

```json
{
  "status": "healthy",
  "timestamp": "2024-01-22T10:00:00.000Z"
}
```

### POST /webhook/whatsapp

Receives webhook from WhatsApp Business API.

**Headers:**

- `X-Hub-Signature-256`: HMAC-SHA256 signature (for verification)

**Body:**

```json
{
  "object": "whatsapp_business_account",
  "entry": [
    {
      "id": "123456789",
      "changes": [
        {
          "value": {
            "messaging_product": "whatsapp",
            "metadata": {
              "display_phone_number": "+1234567890"
            },
            "messages": [
              {
                "from": "+1234567890",
                "id": "wamid.xxx",
                "timestamp": "1705900800",
                "type": "text",
                "text": {
                  "body": "Hello"
                }
              }
            ]
          }
        }
      ]
    }
  ]
}
```

**Response:**

```json
{
  "message": "Webhook received"
}
```

## WhatsApp Service

### sendTextMessage(message)

Send a text message via WhatsApp.

**Parameters:**

```typescript
{
  to: string;        // Phone number with country code
  text: string;      // Message content
  type?: 'text' | 'template';
  templateName?: string;
  templateLanguage?: string;
}
```

**Returns:**

```typescript
{
  success: boolean;
  messageId?: string;
  error?: string;
}
```

**Example:**

```typescript
const result = await sendTextMessage({
  to: '+1234567890',
  text: 'Hello from bot!',
});

if (result.success) {
  console.log('Message sent:', result.messageId);
}
```

### sendMediaMessage(media)

Send a media message (image, video, document, audio).

**Parameters:**

```typescript
{
  to: string;
  mediaUrl: string;
  caption?: string;
  mediaType: 'image' | 'video' | 'document' | 'audio';
}
```

**Returns:**

```typescript
{
  success: boolean;
  messageId?: string;
  error?: string;
}
```

**Example:**

```typescript
const result = await sendMediaMessage({
  to: '+1234567890',
  mediaUrl: 'https://example.com/image.jpg',
  caption: 'Check this out!',
  mediaType: 'image',
});
```

### verifyWebhookSignature(body, signature, secret)

Verify webhook HMAC signature.

**Parameters:**

- `body: string` - Raw request body
- `signature: string` - Signature from header
- `secret: string` - Webhook secret

**Returns:**

- `boolean` - True if signature is valid

### downloadMedia(mediaId)

Download media from WhatsApp.

**Parameters:**

- `mediaId: string` - Media ID from message

**Returns:**

- `Buffer | null` - Media data or null on failure

## AI Service

### generateCompletion(messages, options?)

Generate AI completion using OpenAI.

**Parameters:**

```typescript
{
  messages: Array<{
    role: 'system' | 'user' | 'assistant';
    content: string;
  }>;
  options?: {
    model?: string;           // Default: 'gpt-4-turbo-preview'
    temperature?: number;     // Default: 0.7
    maxTokens?: number;       // Default: 500
  };
}
```

**Returns:**

```typescript
{
  text: string;
  model: string;
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
}
```

**Example:**

```typescript
const response = await generateCompletion(
  [
    { role: 'system', content: 'You are a helpful assistant.' },
    { role: 'user', content: 'Hello!' },
  ],
  {
    temperature: 0.5,
    maxTokens: 100,
  }
);

console.log(response.text);
```

### generateFAQResponse(question, context)

Generate FAQ response.

**Parameters:**

- `question: string` - User's question
- `context: string` - FAQ/context information

**Returns:**

- `AIResponse` - Generated response

### generateWelcomeMessage(customerName?)

Generate welcome message.

**Parameters:**

- `customerName?: string` - Optional customer name

**Returns:**

- `AIResponse` - Generated welcome message

### generatePersonalizedResponse(conversationHistory, newMessage)

Generate personalized response based on conversation.

**Parameters:**

- `conversationHistory: ChatMessage[]` - Previous messages
- `newMessage: string` - Current user message

**Returns:**

- `AIResponse` - Generated response

## Database Service

### conversationRepository.create(phoneNumber)

Create a new conversation.

**Parameters:**

- `phoneNumber: string` - User's phone number

**Returns:**

- `string` - Conversation ID

**Example:**

```typescript
const conversationId = conversationRepository.create('+1234567890');
```

### conversationRepository.findByPhone(phoneNumber)

Find conversation by phone number.

**Parameters:**

- `phoneNumber: string` - Phone number

**Returns:**

- `object | null` - Conversation data or null

**Example:**

```typescript
const conversation = conversationRepository.findByPhone('+1234567890');
if (conversation) {
  console.log('Found conversation:', conversation.id);
}
```

### conversationRepository.getHistory(conversationId, limit?)

Get conversation history.

**Parameters:**

- `conversationId: string` - Conversation ID
- `limit?: number` - Maximum messages to return (default: 10)

**Returns:**

- `Array<Message>` - Message history

**Example:**

```typescript
const history = conversationRepository.getHistory(conversationId, 20);
console.log(`Found ${history.length} messages`);
```

### conversationRepository.addMessage(conversationId, role, content)

Add a message to conversation.

**Parameters:**

- `conversationId: string` - Conversation ID
- `role: string` - 'user' or 'assistant'
- `content: string` - Message content

**Returns:**

- `string` - Message ID

**Example:**

```typescript
const messageId = conversationRepository.addMessage(conversationId, 'user', 'Hello bot!');
```

## Agent Interface

### Agent

Base interface for all agents.

```typescript
interface Agent {
  name: string;
  description: string;
  process(message: string, context: AgentContext): Promise<string>;
}
```

### AgentContext

Context passed to agent's process method.

```typescript
{
  phoneNumber: string;
  conversationHistory: Array<{
    role: string;
    content: string;
  }>;
  metadata: Record<string, unknown>;
}
```

### AgentRouter

Routes messages to appropriate agents.

```typescript
class AgentRouter {
  registerAgent(agent: Agent): void;
  route(message: string, context: AgentContext): Promise<string>;
}
```

**Example:**

```typescript
const router = new AgentRouter();
router.registerAgent(new WelcomeAgent());
router.registerAgent(new FAQAgent());

const response = await router.route('Hello!', {
  phoneNumber: '+1234567890',
  conversationHistory: [],
  metadata: {},
});
```

## Error Handling

All async functions may throw errors. Wrap in try-catch:

```typescript
try {
  const result = await sendTextMessage({ to: '+1234567890', text: 'Hi' });
  // Handle success
} catch (error) {
  console.error('Failed:', error);
}
```

## Type Definitions

```typescript
// WhatsApp Message
interface WhatsAppMessage {
  to: string;
  text: string;
  type?: 'text' | 'template';
  templateName?: string;
  templateLanguage?: string;
}

// WhatsApp Media
interface WhatsAppMedia {
  to: string;
  mediaUrl: string;
  caption?: string;
  mediaType: 'image' | 'video' | 'document' | 'audio';
}

// WhatsApp Response
interface WhatsAppResponse {
  success: boolean;
  messageId?: string;
  error?: string;
}

// Chat Message
interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

// AI Response
interface AIResponse {
  text: string;
  model: string;
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
}

// Agent Context
interface AgentContext {
  phoneNumber: string;
  conversationHistory: ChatMessage[];
  metadata: Record<string, unknown>;
}
```
