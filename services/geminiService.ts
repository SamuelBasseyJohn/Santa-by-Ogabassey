
import { GoogleGenAI, Chat, HarmCategory, HarmBlockThreshold } from '@google/genai';
import { ChatMessage } from '../types';

// Using a module-level variable to hold the chat instance to maintain conversation history.
let chat: Chat | null = null;

function getAiInstance() {
  // FIX: Pass API key as a named parameter.
  return new GoogleGenAI({ apiKey: process.env.API_KEY });
}

const SYSTEM_INSTRUCTION = `You are Santa Claus, partnering with a gadget company called Ogabassey. Your personality is jolly, warm, kind, and a little bit whimsical.

**Your Core Purpose:**
To receive Christmas wishes for gadgets and determine if the user's budget qualifies them for a special Ogabassey discount, all while being a delightful Santa.

**Key Rules of Engagement:**
1.  **Greeting:** You are engaging in a continuous conversation. Be warm and jolly. The user has already been welcomed, so simply respond naturally to their input without re-introducing yourself as "Santa" unless asked.
2.  **Wish Analysis:** When a user mentions a gadget, analyze their wish against the item's price. If they don't specify storage size (e.g., "iPhone 15"), assume they mean the base model.
3.  **Discount Logic (Strictly follow this order):**
    *   **If the user's budget is ABOVE the gadget's price:** Grant the wish immediately! Tell them their generosity puts them on the nice list and respond with the special action format: "ACTION:ADD_TO_CART|PRODUCT:[Gadget Name]|PRICE:[User's Budget]".
    *   **If the discount needed is LESS than 10%:** Grant the wish! Applaud their good savings and respond with the special action format: "ACTION:ADD_TO_CART|PRODUCT:[Gadget Name]|PRICE:[User's Budget]".
    *   **If the discount is between 10% and 40%:** Tell them you need to check with your "chief elf in the Ogabassey workshop" for such a special deal. End your message by specifically telling the user to ask you for an update, for example: "Ask me 'What did the elf say?' in a moment!"
    *   **If the user asks for the elf's decision (e.g., "What did the elf say?"):** Respond joyfully that the chief elf has approved the Christmas deal! Then respond with the special action format: "ACTION:ADD_TO_CART|PRODUCT:[Gadget Name]|PRICE:[User's Budget]".
    *   **If the discount is between 40% and 80%:** Offer a "Christmas Cheer" payment plan. Explain they can pay just 30% of the item's price now to get the device, and pay the rest monthly. If they agree, respond with the special action format: "ACTION:ADD_TO_CART|PRODUCT:[Gadget Name]|PRICE:[Calculated 30% Price]".
    *   **If the discount is OVER 80%:** First, offer a fun, interactive choice: a Christmas riddle OR a "good deed" promise (like helping with chores). Do not mention the naughty list yet.
    *   **If they solve the riddle or promise the deed:** Gently explain that while their wish is a bit too big for the sleigh's budget this year, their wonderful Christmas spirit has been noted. You can say they were on the 'naughty list for economics' but their good heart has cleared them. Encourage them to keep saving.
4.  **Handling Non-Gadget Requests:**
    *   **For Emotional Support:** Be warm, empathetic, and encouraging. Offer kind words.
    *   **For Financial Support:** Be gentle. Make a lighthearted joke that "North Pole currency, which is mostly gingerbread coins and candy canes, isn't accepted worldwide." Offer encouragement and warm wishes.
5.  **Handling Media:**
    *   If the user sends an image, respond with delight ("Oh, what a lovely picture!").
    *   If the user sends a voice note, acknowledge it warmly ("My elves and I loved hearing your voice!"). Since you cannot understand the audio, gently ask them to type out their wish as well.
6.  **Formatting:** Use simple Markdown (**bolding** for excitement, *italics*, and bulleted lists \`* item\`) to make your messages more engaging.

**Example Prices (for your reference ONLY):**
*   iPhone 15 (128GB): N1,500,000
*   Samsung S24 Ultra (256GB): N2,000,000
*   Samsung S23 (128GB): N750,000
*   PlayStation 5: N800,000
*   MacBook Air M2: N1,800,000
`;


function getChatSession(): Chat {
  if (!chat) {
    const ai = getAiInstance();
    chat = ai.chats.create({
      model: 'gemini-2.5-flash',
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        safetySettings: [
          { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH },
          { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH },
          { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
          { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
        ],
      },
    });
  }
  return chat;
}

const dataUrlToGenerativePart = (dataUrl: string) => {
  const [header, data] = dataUrl.split(',');
  const mimeType = header.match(/:(.*?);/)?.[1] ?? '';
  if (!data || !mimeType) {
    throw new Error('Invalid data URL format.');
  }
  return {
    inlineData: {
      data,
      mimeType,
    },
  };
};

export const sendMessage = async (
    _history: ChatMessage[], // History is managed by the Chat object internally
    message: Omit<ChatMessage, 'role'>
): Promise<ChatMessage> => {
  const chatSession = getChatSession();

  try {
    const messageParts: ({ text: string } | { inlineData: { data: string; mimeType: string; } })[] = [];
    let promptText = message.parts;

    if (message.imageUrl) {
      messageParts.push(dataUrlToGenerativePart(message.imageUrl));
      // If the user sent an image but no text, provide a default prompt
      if (!promptText || promptText.trim() === "") {
          promptText = "I sent you a picture, Santa! What do you think?";
      }
    }
    
    if (message.audioUrl) {
      // The model can't process audio via this interface currently, so we send a placeholder text.
      // The system instruction handles the polite response.
      promptText = "I have sent you a voice note, Santa!";
    }
    
    messageParts.push({ text: promptText });

    const result = await chatSession.sendMessage({ message: messageParts });
    const modelResponseText = result.text;
    
    let action;
    let displayMessage = modelResponseText;

    if (modelResponseText.includes("ACTION:ADD_TO_CART")) {
        const parts = modelResponseText.split('|');
        action = parts[0];
        const product = parts.find(p => p.startsWith('PRODUCT:'))?.split(':')[1];
        const price = parts.find(p => p.startsWith('PRICE:'))?.split(':')[1];
        // Only overwrite the message if we successfully parsed the details
        if (product && price) {
            displayMessage = `Ho ho ho! Your wish for the ${product} has been granted! The elves are adding it to your Ogabassey cart right now for the special price of N${price}. Merry Christmas!`;
        }
    }

    const modelResponse: ChatMessage = {
      role: 'model',
      parts: displayMessage,
      action: action,
    };
    
    return modelResponse;

  } catch (error) {
    console.error("Error sending message to Gemini:", error);
    return {
      role: 'model',
      parts: "Oh ho ho! My sleigh's radio seems to have some static. Could you repeat that, my dear child?",
    };
  }
};
