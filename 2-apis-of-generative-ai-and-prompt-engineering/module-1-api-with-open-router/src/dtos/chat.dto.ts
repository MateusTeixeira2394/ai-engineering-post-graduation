import type { Chat } from '../models/chat.model.ts';
import type { Message, MessageRole } from '../models/message.model.ts';

/* ------------------------------- requests ------------------------------- */

export interface SendChatRequestDto {
    chatId?: string;
    message: string;
}

export interface ChatParamsDto {
    id: string;
}

/* ------------------------------- responses ------------------------------ */

export interface MessageDto {
    id: string;
    role: MessageRole;
    content: string;
    createdAt: string;
}

export interface ChatSummaryDto {
    id: string;
    title: string;
    messagesCount: number;
    createdAt: string;
    updatedAt: string;
}

export interface ChatDetailDto extends Omit<ChatSummaryDto, 'messagesCount'> {
    messages: MessageDto[];
}

export interface ListChatsResponseDto {
    chats: ChatSummaryDto[];
}

export interface SendChatResponseDto {
    chatId: string;
    message: MessageDto;
    answer: MessageDto;
}

/* -------------------------------- mappers ------------------------------- */

export function toMessageDto(message: Message): MessageDto {
    return {
        id: message.id,
        role: message.role,
        content: message.content,
        createdAt: message.createdAt
    };
}

export function toChatSummaryDto(chat: Chat): ChatSummaryDto {
    return {
        id: chat.id,
        title: chat.title,
        messagesCount: chat.messagesCount,
        createdAt: chat.createdAt,
        updatedAt: chat.updatedAt
    };
}

export function toChatDetailDto(chat: Chat): ChatDetailDto {
    return {
        id: chat.id,
        title: chat.title,
        createdAt: chat.createdAt,
        updatedAt: chat.updatedAt,
        messages: chat.messages.map(toMessageDto)
    };
}

export function toSendChatResponseDto(
    chat: Chat,
    message: Message,
    answer: Message
): SendChatResponseDto {
    return {
        chatId: chat.id,
        message: toMessageDto(message),
        answer: toMessageDto(answer)
    };
}
