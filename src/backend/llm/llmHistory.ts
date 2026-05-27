/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   context.ts                                         :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: tlecuyer <tlecuyer@student.42.fr>          +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2026/05/19 15:51:02 by tlecuyer          #+#    #+#             */
/*   Updated: 2026/05/27 16:14:08 by tlecuyer         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

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

    public getMessageHistory(): Anthropic.MessageParam[]
    {
        return (this.anthropicMessageParam);
    }

    public reset() : void
    {
        this.anthropicMessageParam = [];
    }

    public constructor() {}
    // ---------------------------- Only for debug, to remove later ------------------
    toString(): string 
    {
        let result = "";
        let msg;
        
        for (let i = 0; i < this.anthropicMessageParam.length; i++) 
        {
            msg = this.anthropicMessageParam[i];
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