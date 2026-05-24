/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   context.ts                                         :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: tlecuyer <tlecuyer@student.42.fr>          +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2026/05/19 15:51:02 by tlecuyer          #+#    #+#             */
/*   Updated: 2026/05/24 16:46:49 by tlecuyer         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

import Anthropic from "@anthropic-ai/sdk";
const MAX_MSG: number = 20;

// This class is used to store the conversation context for each player.
export class ConversationContext
{
    // conversationHistory is an array of MessageParam, 
    // which is the type expected by the Anthropic API for the "messages" parameter. 
    // It can contain both user and assistant messages, 
    // and each message can have a content that is either a string or an array of blocks 
    // (with type and text).
    private conversationHistory: Anthropic.MessageParam[] = [];

    private trim()
    {
        if (this.conversationHistory.length > MAX_MSG) 
        {
            this.conversationHistory = this.conversationHistory.slice(-MAX_MSG);
        }
    }

    addMessageAsUser(content: string) 
    {
        this.conversationHistory.push({ role: 'user', content });
        this.trim();
    }

    addMessageAsAssistant(content: string)
    {
        this.conversationHistory.push({ role: 'assistant', content : content.trim() });
        this.trim();
    }

    getMessageHistory(): Anthropic.MessageParam[]
    {
        return (this.conversationHistory);
    }

    reset() : void
    {
        this.conversationHistory = [];
    }
    // ---------------------------- Only for debug, to remove later ------------------
    toString(): string 
    {
        let result = "";
        let msg;
        
        for (let i = 0; i < this.conversationHistory.length; i++) 
        {
            msg = this.conversationHistory[i];
            let content = "";

            if (msg === undefined)
                continue; 
            if (typeof msg.content === "string") 
            {
                content = msg.content;
            }
            else if (msg)
            {
                for (let j = 0; j < msg.content.length; j++) 
                {
                    let block = msg.content[j];
                    if (block === undefined)
                        continue ;
                    let blockText = (block.type === "text") ? block.text : "[" + block.type + "]";
                    content += blockText + " ";
                }
            }
            result += msg.role + ": " + content + "\n";
        }

        return result;
    }

}