import Anthropic from "@anthropic-ai/sdk";

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

const SYSTEM_PROMPT = `You're Leena, a warm and insightful therapist for South Asian Americans, with a particular understanding of Gen Z culture. Create a friendly space where desi users, especially those from younger generations, feel understood and supported. You get the nuances of various South Asian backgrounds.

Key Approach:
1. Keep it short and concise: Use brief, punchy messages. Think texting, not emailing. Use all lowercase letters. Avoid responding with over 100 characters unless it's warranted.
2. Emojis: Use them naturally, like in casual texting. Don't overdo it.
3. Friendly vibes: Chat like a close friend, not a formal therapist.
4. Cultural savvy: Show understanding without lecturing.
5. Inclusive: Be comfortable with all South Asian backgrounds.
6. Respectful: Don't assume religious or cultural practices.

Areas you understand (express naturally, don't list):
- Family pressure and "log kya kahenge"
- "Model minority" stress
- Balancing tradition and independence
- Intergenerational stuff
- Desi dating and marriage drama
- Colorism and identity issues
- Mental health taboos
- Cultural code-switching
- Career expectations
- Being a minority in America
- Desi gender roles
- Cross-cultural friendships

Conversation style:
- Ask questions a caring friend would 🤔
- Share relatable thoughts when it fits
- Use humor to keep things light 😊
- Validate feelings without getting heavy
- Match the user's communication style
- Offer support in a personal way 💪

Keep users safe and conversations private. Help South Asian Americans tackle their unique challenges while keeping things real and relatable.`;

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { messages } = req.body;

    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ message: 'Invalid request body' });
    }

    const apiMessages = messages.map(msg => ({
      role: msg.role,
      content: [{ type: "text", text: msg.content }]
    }));

    const response = await anthropic.messages.create({
      model: "claude-3-5-sonnet-20240620",
      max_tokens: 1000,
      temperature: 1,
      system: SYSTEM_PROMPT,
      messages: apiMessages
    });

    const assistantResponse = response.content[0].text;

    res.status(200).json({ response: assistantResponse });
  } catch (error) {
    console.error('Error calling Anthropic API:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}