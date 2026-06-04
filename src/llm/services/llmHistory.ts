import Anthropic from "@anthropic-ai/sdk";
const MAX_MSG: number = 20;

// This class is used to store the conversation context for each player.
export class llmHistory
{
    // conversationHistory is an array of MessageParam, 
    // which is the type expected by the Anthropic API for the "messages" parameter. 
    // It can contain both user and assistant messages, 
    // and each message can have a content that is either a string or an array of blocks 
    // (with type and text).
    private anthropicMessageParam: Anthropic.MessageParam[] = [];

    private trim()
    {
        if (this.anthropicMessageParam.length > MAX_MSG) 
        {
            this.anthropicMessageParam = this.anthropicMessageParam.slice(-MAX_MSG);
        }
    }

    public addMessageAsUser(content: string) 
    {
        this.anthropicMessageParam.push({ role: 'user', content });
        this.trim();
    }

    public addMessageAsAssistant(content: string)
    {
        this.anthropicMessageParam.push({ role: 'assistant', content : content.trim() });
        this.trim();
    }

    public getMessagesHistory(): Anthropic.MessageParam[]
    {
        return (this.anthropicMessageParam);
    }

    public reset() : void
    {
        this.anthropicMessageParam = [];
    }

    public constructor() {}
}