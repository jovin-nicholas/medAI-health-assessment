import {
    getMostRecentUserMessage,
} from '@/lib/utils';
import { formatDataStreamPart } from '@ai-sdk/ui-utils';

export async function POST(req: Request) {
    const { messages } = await req.json();
    const userMessage = getMostRecentUserMessage(messages);

    // console.log('LOG:: Inside /api/proxy...' + userMessage?.content);
    const inputMessage = userMessage?.content || '';

    const ws = new WebSocket('ws://localhost:9080');

    const stream = new ReadableStream({
        start(controller) {
            ws.onopen = () => {
                // Send the input message to the Python backend
                ws.send(JSON.stringify({ inputMessage }));
            };

            ws.onmessage = (event) => {
                try {
                    // console.log('Received message from WebSocket:', event.data);
                    const parsedData = JSON.parse(event.data);

                    if (parsedData.type === "end") {
                        console.log('LOG:: WebSocket stream completed');
                        const finalData = formatDataStreamPart('finish_message', {
                            finishReason: 'stop',
                            usage: parsedData.usage || { promptTokens: 0, completionTokens: 0, totalTokens: 0 },
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