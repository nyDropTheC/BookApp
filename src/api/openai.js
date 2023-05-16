const getOpenAIAPI = ( appcfg ) => {
    // If we're using the OpenAI provider backend (as a proper application should do), 
    // call on the backend server to keep our API key secure
    // However, if we're just building a toy app (as we are), 
    // use a simpler variation that directly calls upon OpenAI servers from an API key the user supplies

    const { useMockBackendApi, userOpenAiKey, remoteBackendPath } = appcfg.config;

    if ( !useMockBackendApi ) {
        const unimplementedStub = fn_name => ( ) => {
            throw `${fn_name} is unimplemented!`
        }

        return {
            generateSummary: unimplementedStub ( 'generateSummary@server' ),
            generateSuggestions: unimplementedStub ( 'generateSuggestions@server' )
        };
    }

    // Really, most of the difficulty of working with OpenAI's API
    // is writing out the perfect prompt for a given task
    // and I'm horrible at English

    const callChatCompletionWithPrompt = promptMessages => fetch ( 'https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${userOpenAiKey}`
        },

        body: JSON.stringify ( {
            model: 'gpt-3.5-turbo',
            messages: promptMessages,
            temperature: 1
            // While some requests may benefit from messing with temperature,
            // I really don't understand how it works
        } )
    } ).then ( resp => resp.json ( ) );

    // I'm not sure I need to actually name that user is passed into the function, given the local implementation does not require Firebase's auth feature
    
    return {
        generateSummary: ( book, user ) => callChatCompletionWithPrompt ( [
            {
                role: 'system',
                content: 'You are tasked with summarizing the contents of literary works with an intended result of making the summary\'s reader get interested in reading said work.'    
            },
            {
                role: 'user',
                content: `Summarize ${book.bookname} by the author(s) ${book.author} in accordance to the given instructions. Space out paragraphs with two newlines.` 
            }
        ] ),

        generateSuggestions: ( book, user ) => {
            // This is a cursed prompt
            // Like, a very cursed one
            // I know Pact by Wildbow will always get you so-and-so
            // But who cares?

            const promptMessages = [
                {
                    role: 'system',
                    content: 'You are tasked with suggesting similar works to the one the user provides. Include the name of the recommended work, the recommended work\'s author and a short, but engaging summary of the work.'
                },

                {
                    role: 'user',
                    content: `Suggest me similar works to Pact by the author(s) Wildbow in accordance to the given instructions.
                    Output the data as JSON, with the format being an array of objects with the schema of {name: "The work's name", author: "The work's author", description: "A short, but engaging description of the work in question"}. Do not output anything but JSON. Do not beautify the JSON.`
                },

                {
                    role: 'assistant',
                    content: JSON.stringify ( [
                        {
                            name: 'Worm',
                            author: 'Wildbow',
                            description: 'Worm is a web serial about a teenage girl with the power to control bugs and defend her city from a variety of threats.'
                        },

                        {
                            name: 'Twig',
                            author: 'Wildbow',
                            description: 'Twig is a web serial about a group of children experiments in an alternate world where mad science is the norm.'
                        },

                        {
                            name: 'Mother of Learning',
                            author: 'Domagoj Kurmaic',
                            description: 'Mother of Learning is a web novel about a young mage stuck in a time loop, trying to solve a deadly magical mystery.'
                        }
                    ], null )
                },

                {
                    role: 'user',
                    content: `Suggest me similar works to ${book.bookname} by the author(s) ${book.author} in accordance to the given instructions.
                    Output the data as JSON, with the format being an array of objects with the schema of {name: "The work's name", author: "The work's author", description: "A short, but engaging description of the work in question"}. Do not output anything but JSON. Do not beautify the JSON.`
                }
            ];

            return callChatCompletionWithPrompt ( promptMessages );
        }
    };
};

export default getOpenAIAPI;