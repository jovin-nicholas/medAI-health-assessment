import { auth } from '@/app/(auth)/auth';
import { getMostRecentUserMessage } from '@/lib/utils';
import { formatDataStreamPart } from '@ai-sdk/ui-utils';
import { generateTitleFromUserMessage } from '@/app/(chat)/actions';

import {
    deleteChatById,
    getChatById,
    saveChat,
    saveMessages,
} from '@/lib/db/queries';
import { generateUUID } from '@/lib/utils';

export async function POST(req: Request) {
    const session = await auth();

    if (!session || !session.user || !session.user.id) {
        return new Response('Unauthorized', { status: 401 });
    }
    const userId = session.user.id;

    const { chatId, messages } = await req.json();
    const userMessage = getMostRecentUserMessage(messages);

    if (!userMessage) {
        return new Response('Bad Request: No user message found.', { status: 400 });
    }
    const userMessageId = userMessage.id || generateUUID();

    // console.log('LOG:: Inside /api/proxy...' + chatId + "\n" + userMessage.content);
    const inputMessage = userMessage.content || '';

    const ws = new WebSocket('ws://localhost:9080');
    let finalContent = '';

    const stream = new ReadableStream({
        start(controller) {
            ws.onopen = () => {
                // Send the input message to the Python backend
                ws.send(JSON.stringify({ messages, inputMessage }));
            };

            ws.onmessage = async (event) => {
                try {
                    // console.log('Received message from WebSocket:', event.data);
                    const parsedData = JSON.parse(event.data);

                    if (parsedData.type === "end") {
                        console.log('LOG:: WebSocket stream completed');
                        const finalData = formatDataStreamPart('finish_message', {
                            finishReason: 'stop',
                            usage: parsedData.usage || { promptTokens: 0, completionTokens: 0, totalTokens: 0 },
                        });


                        const chat = await getChatById({ id: chatId });
                        if (!chat) {
                            const title = await generateTitleFromUserMessage({ message: userMessage });
                            await saveChat({ id: chatId, userId: userId, title });
                        }

                        saveMessages({
                            messages: [
                                {
                                    id: userMessageId,
                                    chatId: chatId,
                                    role: 'user',
                                    content: inputMessage,
                                    createdAt: new Date(),
                                },
                                {
                                    id: generateUUID(),
                                    chatId: chatId,
                                    role: 'assistant',
                                    content: finalContent,
                                    createdAt: new Date(),
                                },
                            ],
                        });

                        controller.enqueue(new TextEncoder().encode(finalData)); // Enqueue the final message
                        controller.close();
                        return;
                    }
                    else if (parsedData.type === "error") {
                        console.error('LOG:: WebSocket error:', parsedData.error);
                        controller.error(new Error(parsedData.error));
                        controller.close();
                        return;
                    }

                    finalContent += parsedData.content || '';

                    const dataStreamPart = formatDataStreamPart(
                        'text',
                        parsedData.content
                    );
                    controller.enqueue(new TextEncoder().encode(dataStreamPart));

                } catch (error) {
                    console.error('Error parsing WebSocket message:', error);
                    controller.error(error);
                }
            };

            ws.onclose = () => {
                console.log('WebSocket connection closed');
                controller.close();
            };

            ws.onerror = (error) => {
                console.error('WebSocket error:', error);
                controller.error(error);
                ws.close();
            };
        },
        cancel() {
            ws.close();
        },
    });

    return new Response(stream, {
        headers: {
            'Content-Type': 'text/event-stream',
            'X-Vercel-AI-Data-Stream': 'v1'
        },
    });

}