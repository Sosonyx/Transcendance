/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   context.ts                                         :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: tlecuyer <tlecuyer@student.42.fr>          +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2026/05/19 15:51:02 by tlecuyer          #+#    #+#             */
/*   Updated: 2026/05/20 14:40:59 by tlecuyer         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

import Anthropic from "@anthropic-ai/sdk";
const MAX_MSG: number = 20;

export class ConversationContext {
    private message_array: Anthropic.MessageParam[] = [];
    private trim() {
        if (this.message_array.length > MAX_MSG) {
            this.message_array = this.message_array.slice(-MAX_MSG);
        }
    }
    addUserMessage(content: string, role: string) {
        if (role == "user") {
            this.message_array.push({ role: 'user', content });
            this.trim();
        }
        else {
            this.message_array.push({ role: 'assistant', content });
            this.trim();
        }
    }
    toString(): string 
    {
        let result = "";
        let msg;
        
        for (let i = 0; i < this.message_array.length; i++) {
            msg = this.message_array[i];
            let content = "";

            if (msg === undefined)
                continue; 
            if (typeof msg.content === "string") {
                content = msg.content;
            }
            else if (msg){
                for (let j = 0; j < msg.content.length; j++) {
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
getMessage(): Anthropic.MessageParam[]
{
    return (this.message_array);
}
reset() : void
    {
        this.message_array = [];
    }
}

const playerSessions = new Map<string, ConversationContext>();

export function getSession(playerId: string): ConversationContext {
    if (!playerSessions.has(playerId)) {
        playerSessions.set(playerId, new ConversationContext());
    }
    return (playerSessions.get(playerId))!;
}