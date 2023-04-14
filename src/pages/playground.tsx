import { Box, Container, IconButton, List, Option, Select, Sheet, Stack, Typography, useColorScheme, useTheme } from '@mui/joy';
import { type NextPage } from "next";
import React from "react";
import { PurposeData, type SystemPurpose } from "~utils/prompts";
import Face6Icon from '@mui/icons-material/Face6';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import SmartToyOutlinedIcon from '@mui/icons-material/SmartToyOutlined';
import SmartToyTwoToneIcon from '@mui/icons-material/SmartToyTwoTone';
// import ChatMessage from './components/ChatMessage';
import { type UiMessage } from './components/ChatMessage';
import Composer from './components/Composer';
import { AppRouter } from '~server/routers/_app';
import { createTRPCProxyClient, httpBatchLink } from '@trpc/client';
// import { trpc } from '~lib/hooks/trpc';
import dynamic from 'next/dynamic'
const ChatMessage = dynamic(() => import('./components/ChatMessage'), {
  ssr: false,
})

export const trpc = createTRPCProxyClient<AppRouter>({
  links: [
    httpBatchLink({
      /**
       * If you want to use SSR, you need to use the server's full URL
       * @link https://trpc.io/docs/ssr
       **/
      url: `http://localhost:3000/api/trpc`

      // You can pass any HTTP headers you wish here
      // async headers() {
      //   return {
      //     authorization: '',
      //   };
      // },
    })
  ]
});

/// UI Messages configuration

const MessageDefaults: { [key in UiMessage['role']]: Pick<UiMessage, 'role' | 'sender' | 'avatar'> } = {
  system: {
    role: 'system',
    sender: 'Bot',
    avatar: SmartToyTwoToneIcon, //'https://em-content.zobj.net/thumbs/120/apple/325/robot_1f916.png',
  },
  user: {
    role: 'user',
    sender: 'You',
    avatar: Face6Icon, //https://mui.com/static/images/avatar/2.jpg',
  },
  assistant: {
    role: 'assistant',
    sender: 'Bot',
    avatar: SmartToyOutlinedIcon, // 'https://www.svgrepo.com/show/306500/openai.svg',
  },
};

const createUiMessage = (role: UiMessage['role'], text: string): UiMessage => ({
  uid: Math.random().toString(36).substring(2, 15),
  text: text,
  model: '',
  ...MessageDefaults[role],
} as UiMessage);


const Playground: NextPage = () => {
  const theme = useTheme();
  const { mode: colorMode, setMode: setColorMode } = useColorScheme();

  const [selectedSystemPurpose, setSelectedSystemPurpose] = React.useState<SystemPurpose>('Generic');
  const [messages, setMessages] = React.useState<UiMessage[]>([]);
  const [disableCompose, setDisableCompose] = React.useState(false);
  const messagesEndRef = React.useRef<HTMLDivElement | null>(null);

  React.useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // React.useEffect(() => {
  //   // show the settings at startup if the API key is not present
  //   if (!isValidOpenAIApiKey(loadOpenAIApiKey()))
  //     setSettingsShown(true);
  // }, []);

  const handleDarkModeToggle = () => setColorMode(colorMode === 'dark' ? 'light' : 'dark');

  const handleListClear = () => setMessages([]);

  const handleListDelete = (uid: string) =>
    setMessages(list => list.filter(message => message.uid !== uid));

  const handleListEdit = (uid: string, newText: string) =>
    setMessages(list => list.map(message => (message.uid === uid ? { ...message, text: newText } : message)));

  const handleListRunAgain = (uid: string) => {
    // take all messages until we get to uid, then remove the rest
    const uidPosition = messages.findIndex(message => message.uid === uid);
    if (uidPosition === -1) return;
    const conversation = messages.slice(0, uidPosition + 1);
    setMessages(conversation);

    // disable the composer while the bot is replying
    setDisableCompose(true);
    // void getBotMessageStreaming(conversation)
    //   .then(() => setDisableCompose(false));
  };

  const handlePurposeChange = (purpose: SystemPurpose | null) => {
    if (!purpose) return;

    if (purpose === 'Custom') {
      const systemMessage = prompt('Enter your custom AI purpose', PurposeData['Custom'].systemMessage);
      PurposeData['Custom'].systemMessage = systemMessage || '';
    }

    setSelectedSystemPurpose(purpose);
  };

  const getBotMessageStreaming = async (messages: UiMessage[]) => {
    // const response = await fetch('/api/chat', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify({ apiKey: loadOpenAIApiKey(), model: loadGptModel(), messages: messages }),
    // });

    const chat = await trpc.chat.query({ messages: messages.map(m => ({ role: m.role, content: m.text })) });
    console.log(chat);

    const newBotMessage: UiMessage = createUiMessage('assistant', chat.message);
    setMessages(list => {
      return [...list, newBotMessage];
    });


    // if (response.body) {
    //   const reader = response.body.getReader();
    //   const decoder = new TextDecoder('utf-8');

    //   const newBotMessage: UiMessage = createUiMessage('assistant', '');

    //   while (true) {
    //     const { value, done } = await reader.read();
    //     if (done) break;

    //     const messageText = decoder.decode(value);
    //     newBotMessage.text += messageText;

    //     // there may be a JSON object at the beginning of the message, which contains the model name (streaming workaround)
    //     if (!newBotMessage.model && newBotMessage.text.startsWith('{')) {
    //       const endOfJson = newBotMessage.text.indexOf('}');
    //       if (endOfJson > 0) {
    //         const json = newBotMessage.text.substring(0, endOfJson + 1);
    //         try {
    //           const parsed = JSON.parse(json);
    //           newBotMessage.model = parsed.model;
    //           newBotMessage.text = newBotMessage.text.substring(endOfJson + 1);
    //         } catch (e) {
    //           // error parsing JSON, ignore
    //           console.log('Error parsing JSON: ' + e);
    //         }
    //       }
    //     }

    //     setMessages(list => {
    //       // if missing, add the message at the end of the list, otherwise set a new list anyway, to trigger a re-render
    //       const message = list.find(message => message.uid === newBotMessage.uid);
    //       return !message ? [...list, newBotMessage] : [...list];
    //     });
    //   }
    // }
  };

  const handleComposerSendMessage: (text: string) => void = (text) => {

    // seed the conversation with a 'system' message
    const conversation = [...messages];
    if (!conversation.length) {
      let systemMessage = PurposeData[selectedSystemPurpose].systemMessage;
      systemMessage = systemMessage.replaceAll('{{Today}}', new Date().toISOString().split('T')[0] as string);
      conversation.push(createUiMessage('system', systemMessage));
    }

    // add the user message
    conversation.push(createUiMessage('user', text));

    // update the list of messages
    setMessages(conversation);

    // disable the composer while the bot is replying
    setDisableCompose(true);
    getBotMessageStreaming(conversation)
      .then(() => setDisableCompose(false))
      .catch(() => setDisableCompose(false));
  };


  const listEmpty = !messages.length;

  const Emoji = (props: any) => null;

  return (
    <Container maxWidth='xl' disableGutters sx={{
      boxShadow: theme.vars.shadow.lg,
    }}>
      <Stack direction='column' sx={{
        minHeight: '100vh',
      }}>

        {/* Application Bar */}
        <Sheet variant='solid' invertedColors sx={{
          position: 'sticky', top: 0, zIndex: 20, p: 1,
          background: theme.vars.palette.primary.solidHoverBg,
          display: 'flex', flexDirection: 'row',
        }}>
          <IconButton variant='plain' color='neutral' onClick={handleDarkModeToggle}>
            <DarkModeIcon />
          </IconButton>

          {/*{!isEmpty && (*/}
          {/*  <IconButton variant='plain' color='neutral' disabled={isDisabledCompose} onClick={onClearConversation}>*/}
          {/*    <DeleteOutlineOutlinedIcon />*/}
          {/*  </IconButton>*/}
          {/*)}*/}

          <Typography sx={{
            textAlign: 'center',
            fontFamily: theme.vars.fontFamily.code, fontSize: '1rem', lineHeight: 1.75,
            my: 'auto',
            flexGrow: 1,
          }} onDoubleClick={handleListClear}>
            GPT Playground
          </Typography>
        </Sheet>

        {/* Chat */}
        <Box sx={{
          flexGrow: 1,
          background: theme.vars.palette.background.level1,
        }}>
          {listEmpty ? (
            <Stack direction='column' sx={{ alignItems: 'center', justifyContent: 'center', minHeight: '50vh' }}>
              <Box>
                <Typography level='body3' color='neutral'>
                  AI purpose
                </Typography>
                <Select value={selectedSystemPurpose} onChange={(e, v) => handlePurposeChange(v)} sx={{ minWidth: '40vw' }}>
                  <Option value='Developer'><Emoji>👩‍💻</Emoji> Developer</Option>
                  <Option value='Scientist'><Emoji>🔬</Emoji> Scientist</Option>
                  <Option value='Executive'><Emoji>👔</Emoji> Executive</Option>
                  <Option value='Catalyst'><Emoji>🚀</Emoji> Catalyst</Option>
                  <Option value='Generic'><Emoji>🧠</Emoji> Chat</Option>
                  <Option value='Custom'><Emoji>✨</Emoji> Custom</Option>
                </Select>
                <Typography level='body2' sx={{ mt: 2, minWidth: 260 }}>
                  {PurposeData[selectedSystemPurpose].description}
                </Typography>
              </Box>
            </Stack>
          ) : (
            <>
              <List sx={{ p: 0 }}>
                {messages.map((message, index) =>
                  <ChatMessage key={'msg-' + message.uid} uiMessage={message}
                    onDelete={() => handleListDelete(message.uid)}
                    onEdit={newText => handleListEdit(message.uid, newText)}
                    onRunAgain={() => handleListRunAgain(message.uid)} />)}
                <div ref={messagesEndRef}></div>
              </List>
            </>
          )}
        </Box>

        {/* Compose */}
        <Box sx={{
          position: 'sticky', bottom: 0, zIndex: 10,
          background: theme.vars.palette.background.body,
          borderTop: '1px solid',
          borderTopColor: theme.vars.palette.divider,
          p: { xs: 1, md: 2 },
        }}>
          <Composer isDeveloper={selectedSystemPurpose === 'Developer'} disableSend={disableCompose} sendMessage={handleComposerSendMessage} />
        </Box>

      </Stack>
    </Container>
  );
}

export default Playground;