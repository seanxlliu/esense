import { Configuration, CreateChatCompletionRequest, CreateChatCompletionResponse, OpenAIApi } from 'openai';
import createHttpsProxyAgent from 'https-proxy-agent';
import type { NextRequest } from 'next/server';
import fetch from 'node-fetch';
import { createParser, ParsedEvent, ReconnectInterval } from 'eventsource-parser';


export interface UiMessage {
    uid: string;
    sender: 'You' | 'Bot' | string;
    role: 'assistant' | 'system' | 'user';
    text: string;
    model: string; // optional for 'assistant' roles (not user messages)
    avatar: string | React.ElementType | null;
}

export interface ChatMessage {
    role: 'assistant' | 'system' | 'user';
    content: string;
}

interface ChatCompletionsRequest {
    model: string;
    messages: ChatMessage[];
    temperature?: number;
    top_p?: number;
    frequency_penalty?: number;
    presence_penalty?: number;
    max_tokens?: number;
    stream: boolean;
    n: number;
}

interface ChatCompletionsResponseChunked {
    id: string; // unique id of this chunk
    object: 'chat.completion.chunk';
    created: number; // unix timestamp in seconds
    model: string; // can differ from the ask, e.g. 'gpt-4-0314'
    choices: {
      delta: Partial<ChatMessage>;
      index: number; // always 0s for n=1
      finish_reason: 'stop' | 'length' | null;
    }[];
  }


const configuration = new Configuration({
    apiKey: process.env.OPENAI_KEY,
    baseOptions: {
        httpsAgent: process.env.ALL_PROXY ? createHttpsProxyAgent(process.env.ALL_PROXY) : undefined
    }
});

const openai = new OpenAIApi(configuration);

export const getBotMessageStreaming = async (messages: UiMessage[]) => {
    // const response = await openai.createChatCompletion({
    //     model: 'gpt-3.5-turbo',
    //     messages: messages.map(message => ({
    //         role: message.role,
    //         content: message.text,
    //         stream: true,
    //     })),
    // })
    // console.log(response);
    // if (response.data && response.data.choices && response.data.choices.length > 0 && response.data.choices[0]) {
    //     return response.data.choices[0].message;
    // }
    // return undefined;
    // const response = await fetch('https://api.openai.com/v1/chat/completions', {
    //     method: 'POST',
    //     headers: { 'Content-Type': 'application/json' },
    //     body: JSON.stringify({ 
    //         apiKey: process.env.OPENAI_KEY, 
    //         model: loadGptModel(), 
    //         messages: messages }),
    //     agent: process.env.OPENAI_PROXY && process.env.ALL_PROXY ? createHttpsProxyAgent(process.env.ALL_PROXY) : undefined
    // });

    // if (response.body) {
    //     const reader = response.body.getReader();
    //     const decoder = new TextDecoder('utf-8');

    //     const newBotMessage: UiMessage = createUiMessage('assistant', '');

    //     while (true) {
    //         const { value, done } = await reader.read();
    //         if (done) break;

    //         const messageText = decoder.decode(value);
    //         newBotMessage.text += messageText;

    //         // there may be a JSON object at the beginning of the message, which contains the model name (streaming workaround)
    //         if (!newBotMessage.model && newBotMessage.text.startsWith('{')) {
    //             const endOfJson = newBotMessage.text.indexOf('}');
    //             if (endOfJson > 0) {
    //                 const json = newBotMessage.text.substring(0, endOfJson + 1);
    //                 try {
    //                     const parsed = JSON.parse(json);
    //                     newBotMessage.model = parsed.model;
    //                     newBotMessage.text = newBotMessage.text.substring(endOfJson + 1);
    //                 } catch (e) {
    //                     // error parsing JSON, ignore
    //                     console.log('Error parsing JSON: ' + e);
    //                 }
    //             }
    //         }

    //         setMessages(list => {
    //             // if missing, add the message at the end of the list, otherwise set a new list anyway, to trigger a re-render
    //             const message = list.find(message => message.uid === newBotMessage.uid);
    //             return !message ? [...list, newBotMessage] : [...list];
    //         });
    //     }
    // }
};

export async function chat(messages: ChatMessage[]) {
    // const stream: ReadableStream = await OpenAIStream({
    //   model: 'gpt-3.5-turbo',
    //   messages: messages,
    //   temperature: 0.6,
    //   max_tokens: 2048,
    // });

    const option = {
        model: 'gpt-3.5-turbo',
        messages: messages,
        temperature: 0.6,
        max_tokens: 2048,
    };

    const res = await sendChatGptRequest(option) || 'Cannot connect to OpenAI API';
    return res;
  };

  async function sendChatGptRequest(option: CreateChatCompletionRequest): Promise<string | false> {
    if (!configuration.apiKey) {
        console.error("API key missing");
        return false;
    }

    try {
        const completion = await openai.createChatCompletion(option);
        console.log(completion);
        
        if (completion && completion.data &&  completion.data.choices && completion.data.choices.length > 0) {
            console.info('Usage', completion.data.usage?.total_tokens);
            return completion.data.choices[0]?.message?.content?.trim() ?? false;
        } else {
            console.error('Unexpected result')
            return false
        }
    } catch (error: any) {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        if (error.response) {
            // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
            console.error(error.response.status, error.response.data);
        } else {
            // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/restrict-template-expressions
            console.error(`Error with OpenAI Chat API request: ${error.message}`);
        }
        return false;
    }
}
async function OpenAIStream(payload: Omit<ChatCompletionsRequest, 'stream' | 'n'>): Promise<ReadableStream> {
    const encoder = new TextEncoder();
    const decoder = new TextDecoder();

    const streamingPayload: ChatCompletionsRequest = {
        ...payload,
        stream: true,
        n: 1,
    };

    const apiKey = process.env.OPENAI_KEY || '';
    if (!apiKey) {
        throw new Error('Error: missing OpenAI API Key. Add it on the client side (Settings icon) or server side (your deployment).');
    }

    const proxy = process.env.ALL_PROXY ? createHttpsProxyAgent(process.env.ALL_PROXY) || undefined : undefined;
    const res = await fetch('https://api.openai.com/v1/chat/completions', {
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${apiKey}`,
        },
        method: 'POST',
        body: JSON.stringify(streamingPayload),
        agent: proxy,
    });

    return new ReadableStream({
        async start(controller) {
            // handle errors here, to return them as custom text on the stream
            if (!res.ok) {
                let errorPayload: object = {};
                try {
                    errorPayload = await res.json() as object;
                } catch (e) {
                    // ignore
                }
                // return custom text
                controller.enqueue(encoder.encode(`OpenAI API error: ${res.status} ${res.statusText} ${JSON.stringify(errorPayload)}`));
                controller.close();
                return;
            }

            // the first packet will have the model name
            let sentFirstPacket = false;

            // stream response (SSE) from OpenAI may be fragmented into multiple chunks
            // this ensures we properly read chunks and invoke an event for each SSE event stream
            const parser = createParser((event: ParsedEvent | ReconnectInterval) => {
                // ignore reconnect interval
                if (event.type !== 'event')
                    return;

                // https://beta.openai.com/docs/api-reference/completions/create#completions/create-stream
                if (event.data === '[DONE]') {
                    controller.close();
                    return;
                }

                try {
                    const json: ChatCompletionsResponseChunked = JSON.parse(event.data) as ChatCompletionsResponseChunked;

                    if (!json || !json.choices || !json.choices.length || !json.choices[0] || !json.choices[0].delta)
                        return;

                    // ignore any 'role' delta update
                    if (json.choices[0].delta.role)
                        return;

                    // stringify and send the first packet as a JSON object
                    if (!sentFirstPacket) {
                        sentFirstPacket = true;
                        const firstPacket = {
                            model: json.model,
                        };
                        controller.enqueue(encoder.encode(JSON.stringify(firstPacket)));
                    }

                    // transmit the text stream
                    const text = json.choices[0].delta?.content || '';
                    const queue = encoder.encode(text);
                    controller.enqueue(queue);

                } catch (e) {
                    // maybe parse error
                    controller.error(e);
                }
            });

            // https://web.dev/streams/#asynchronous-iteration
            for await (const chunk of res.body as AsyncIterable<Uint8Array>)
                parser.feed(decoder.decode(chunk));
        },
    });
}


