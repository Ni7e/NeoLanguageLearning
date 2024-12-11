// Global variables
let OPENAI_API_KEY = localStorage.getItem('openai_api_key');
let conversationStyle = localStorage.getItem('conversation_style') || 'casual';
let speakerGender = localStorage.getItem('speaker_gender') || 'neutral';

// Language options with flags (alphabetically sorted)
const languageOptions = {
    'Chinese': '🇨🇳 Chinese',
    'Croatian': '🇭🇷 Croatian',
    'English': '🇬🇧 English',
    'French': '🇫🇷 French',
    'German': '🇩🇪 German',
    'Italian': '🇮🇹 Italian',
    'Japanese': '🇯🇵 Japanese',
    'Korean': '🇰🇷 Korean',
    'Portuguese': '🇵🇹 Portuguese',
    'Russian': '🇷🇺 Russian',
    'Spanish': '🇪🇸 Spanish'
};

// Language codes for speech synthesis (matching the order above)
const languageToSpeechCode = {
    'Chinese': 'zh-CN',
    'Croatian': 'hr-HR',
    'English': 'en-US',
    'French': 'fr-FR',
    'German': 'de-DE',
    'Italian': 'it-IT',
    'Japanese': 'ja-JP',
    'Korean': 'ko-KR',
    'Portuguese': 'pt-PT',
    'Russian': 'ru-RU',
    'Spanish': 'es-ES'
};

// Initialize language dropdowns
function initializeLanguageDropdowns() {
    const nativeLanguage = document.getElementById('native-language');
    const targetLanguage = document.getElementById('target-language');
    
    // Clear existing options
    nativeLanguage.innerHTML = '';
    targetLanguage.innerHTML = '';
    
    // Add options to both dropdowns
    Object.entries(languageOptions).forEach(([lang, display]) => {
        nativeLanguage.add(new Option(display, display));
        targetLanguage.add(new Option(display, display));
    });
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    initializeLanguageDropdowns();
    loadApiKey();
    loadGenderPreference();
    initializeConversationStyle();
});

// Initialize language selectors
function populateLanguageSelect() {
    const nativeSelect = document.getElementById('native-language');
    const targetSelect = document.getElementById('target-language');
    
    // Clear existing options
    nativeSelect.innerHTML = '';
    targetSelect.innerHTML = '';
    
    // Add auto-detect option for native language
    const autoOption = document.createElement('option');
    autoOption.value = 'auto';
    autoOption.textContent = '🌐 Auto-detect';
    nativeSelect.appendChild(autoOption);

    // Add language options
    Object.entries(languageOptions).forEach(([lang, display]) => {
        const nativeOption = document.createElement('option');
        nativeOption.value = display;
        nativeOption.textContent = display;
        nativeSelect.appendChild(nativeOption);

        const targetOption = document.createElement('option');
        targetOption.value = display;
        targetOption.textContent = display;
        targetSelect.appendChild(targetOption);
    });

    // Set default values
    nativeSelect.value = 'auto';
    targetSelect.value = '🇬🇧 English';
}

function createCustomSelect(select) {
    const wrapper = document.createElement('div');
    wrapper.className = 'custom-select-wrapper';
    
    const customSelect = document.createElement('div');
    customSelect.className = 'custom-select';
    
    const trigger = document.createElement('div');
    trigger.className = 'custom-select-trigger';
    
    const options = document.createElement('div');
    options.className = 'custom-options';
    
    // Create custom options
    Array.from(select.options).forEach(option => {
        const customOption = document.createElement('div');
        customOption.className = 'custom-option';
        customOption.dataset.value = option.value;
        
        if (option.value === 'auto') {
            customOption.innerHTML = '<i class="fas fa-globe"></i> Auto-detect';
        } else {
            customOption.textContent = option.value;
        }
        
        customOption.addEventListener('click', () => {
            select.value = option.value;
            trigger.innerHTML = customOption.innerHTML;
            customSelect.classList.remove('open');
            select.dispatchEvent(new Event('change'));
            
            // Update selected state
            options.querySelectorAll('.custom-option').forEach(opt => {
                opt.classList.remove('selected');
            });
            customOption.classList.add('selected');
        });
        
        if (option.selected) {
            customOption.classList.add('selected');
            trigger.innerHTML = customOption.innerHTML;
        }
        
        options.appendChild(customOption);
    });
    
    // Toggle dropdown
    trigger.addEventListener('click', (e) => {
        e.stopPropagation();
        customSelect.classList.toggle('open');
    });
    
    // Close when clicking outside
    document.addEventListener('click', () => {
        customSelect.classList.remove('open');
    });
    
    customSelect.appendChild(trigger);
    customSelect.appendChild(options);
    wrapper.appendChild(customSelect);
    
    // Insert the custom select after the original
    select.parentNode.insertBefore(wrapper, select.nextSibling);
}

function updateGenderSelect() {
    const genderSelect = document.getElementById('speaker-gender');
    genderSelect.innerHTML = `
        <option value="neutral">Not specified</option>
        <option value="male">♂ Male</option>
        <option value="female">♀ Female</option>
    `;
}

// Save language preferences
function saveLanguagePreferences() {
    const nativeLanguage = document.getElementById('native-language').value;
    const targetLanguage = document.getElementById('target-language').value;
    
    debugLog('Saving preferences:', {
        native: nativeLanguage,
        target: targetLanguage,
        style: conversationStyle
    });
    
    try {
        localStorage.setItem('native_language', nativeLanguage);
        localStorage.setItem('target_language', targetLanguage);
        localStorage.setItem('conversation_style', conversationStyle);
        debugLog('Successfully saved language preferences to localStorage');
    } catch (error) {
        debugLog('Error saving preferences:', error);
    }
}

// Restore saved language preferences
function restoreLanguagePreferences() {
    debugLog('Restoring preferences...');
    
    try {
        const nativeLanguage = localStorage.getItem('native_language');
        const targetLanguage = localStorage.getItem('target_language');
        const savedGender = localStorage.getItem('speaker_gender');
        const style = localStorage.getItem('conversation_style');
        
        debugLog('Retrieved preferences from localStorage:', {
            native: nativeLanguage,
            target: targetLanguage,
            gender: savedGender,
            style: style
        });
        
        if (nativeLanguage) {
            document.getElementById('native-language').value = nativeLanguage;
            debugLog('Restored native language:', nativeLanguage);
        }
        if (targetLanguage) {
            document.getElementById('target-language').value = targetLanguage;
            debugLog('Restored target language:', targetLanguage);
        }
        if (savedGender) {
            const genderSelect = document.getElementById('speaker-gender');
            if (genderSelect) {
                genderSelect.value = savedGender;
                speakerGender = savedGender;
                debugLog('Restored gender preference:', savedGender);
            }
        }
        if (style) {
            setConversationStyle(style);
            debugLog('Restored conversation style:', style);
        }
    } catch (error) {
        debugLog('Error restoring preferences:', error);
    }
}

// Initialize the application
function initializeApp() {
    debugLog('Initializing application...');
    
    // Initialize debug console first
    initializeDebugConsole();
    
    // First populate the language dropdowns
    populateLanguageSelect();
    
    // Then restore all saved preferences
    restoreLanguagePreferences();
    
    // Restore preload setting
    try {
        const preloadEnabled = localStorage.getItem('preload_enabled');
        debugLog('Retrieved preload setting:', preloadEnabled);
        
        const preloadToggle = document.getElementById('preload-toggle');
        if (preloadEnabled !== null) {
            preloadToggle.checked = preloadEnabled === 'true';
            debugLog('Restored preload setting:', preloadToggle.checked);
        } else {
            // Default to enabled if no setting saved
            preloadToggle.checked = true;
            localStorage.setItem('preload_enabled', 'true');
            debugLog('Set default preload setting to enabled');
        }
        
        // Add event listener for preload toggle
        preloadToggle.addEventListener('change', () => {
            updatePreloadSetting();
        });
        
        // Start preloading if enabled
        if (preloadToggle.checked) {
            preloadRandomConversation();
        }
    } catch (error) {
        debugLog('Error restoring preload setting:', error);
    }
    
    // Set up event listeners for language changes
    document.getElementById('native-language').addEventListener('change', function() {
        debugLog('Native language changed');
        saveLanguagePreferences();
        // Clear preloaded conversation if languages change
        preloadedConversation = null;
        if (isPreloadEnabled()) {
            preloadRandomConversation();
        }
    });

    document.getElementById('target-language').addEventListener('change', function() {
        debugLog('Target language changed');
        saveLanguagePreferences();
        // Clear preloaded conversation if languages change
        preloadedConversation = null;
        if (isPreloadEnabled()) {
            preloadRandomConversation();
        }
    });

    document.getElementById('speaker-gender').addEventListener('change', function() {
        debugLog('Gender preference changed');
        saveGenderPreference();
    });

    debugLog('Application initialized');
}

// Call initialization when the page loads
window.addEventListener('load', initializeApp);

// Gender preference management
function saveGenderPreference() {
    const genderSelect = document.getElementById('speaker-gender');
    if (genderSelect) {
        speakerGender = genderSelect.value;
        localStorage.setItem('speaker_gender', speakerGender);
        debugLog('Saved gender preference:', speakerGender);
    }
}

// Conversation style management
function setConversationStyle(style) {
    debugLog(`Setting conversation style to: ${style}`);
    conversationStyle = style;
    
    // Update UI
    document.querySelectorAll('.style-button').forEach(btn => {
        if (btn.id === `${style}-style`) {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    });
    
    // Save the preference
    localStorage.setItem('conversation_style', style);
    debugLog('Saved conversation style preference');
    
    // Clear preloaded conversation when style changes
    preloadedConversation = null;
    if (isPreloadEnabled()) {
        preloadRandomConversation();
    }
}

// Function to initialize conversation style
function initializeConversationStyle() {
    const savedStyle = localStorage.getItem('conversation_style') || 'casual';
    setConversationStyle(savedStyle);
}

// Add click handlers for style buttons
document.querySelectorAll('.style-button').forEach(btn => {
    btn.addEventListener('click', () => {
        const style = btn.id.replace('-style', '');
        debugLog(`Style button clicked: ${style}`);
        setConversationStyle(style);
    });
});

// API Key management
function showApiKeyModal() {
    const modal = document.createElement('dialog');
    modal.innerHTML = `
        <div class="modal-content">
            <h3>Enter OpenAI API Key</h3>
            <p>Please enter your OpenAI API key to use the conversation generator.</p>
            <input type="password" id="api-key-input" class="api-key-input" placeholder="sk-...">
            <div class="modal-buttons">
                <button onclick="saveApiKey()" class="save-button">Save</button>
                <button onclick="closeApiKeyModal()" class="cancel-button">Cancel</button>
            </div>
        </div>
    `;
    document.body.appendChild(modal);
    modal.showModal();
}

function saveApiKey() {
    const input = document.getElementById('api-key-input');
    const key = input.value.trim();
    
    if (key && key.startsWith('sk-')) {
        OPENAI_API_KEY = key;
        localStorage.setItem('openai_api_key', key);
        closeApiKeyModal();
    } else {
        showError('Please enter a valid OpenAI API key starting with "sk-"');
    }
}

function closeApiKeyModal() {
    const modal = document.querySelector('dialog');
    if (modal) {
        modal.close();
        modal.remove();
    }
}

// Debug console functions
let debugConsoleVisible = localStorage.getItem('debug_console_visible') === 'true';

function toggleDebugConsole() {
    debugConsoleVisible = !debugConsoleVisible;
    const console = document.getElementById('debug-console');
    console.classList.toggle('visible', debugConsoleVisible);
    localStorage.setItem('debug_console_visible', debugConsoleVisible.toString());
    debugLog('Debug console ' + (debugConsoleVisible ? 'shown' : 'hidden'));
}

function clearDebugConsole() {
    const console = document.getElementById('debug-console');
    console.innerHTML = '';
    debugLog('Console cleared');
}

async function copyDebugConsole() {
    const console = document.getElementById('debug-console');
    try {
        await navigator.clipboard.writeText(console.innerText);
        debugLog('Console content copied to clipboard');
        
        // Visual feedback on the copy button
        const copyButton = document.querySelector('#debug-controls button:nth-child(2)');
        const originalText = copyButton.textContent;
        copyButton.textContent = 'Copied!';
        setTimeout(() => {
            copyButton.textContent = originalText;
        }, 2000);
    } catch (error) {
        console.error('Failed to copy console content:', error);
    }
}

// Initialize debug console visibility
function initializeDebugConsole() {
    const console = document.getElementById('debug-console');
    console.classList.toggle('visible', debugConsoleVisible);
    debugLog('Debug console initialized, visibility:', debugConsoleVisible);
}

// Debug logging function
function debugLog(...args) {
    const console = document.getElementById('debug-console');
    const p = document.createElement('p');
    
    // Check if first argument is an error
    if (args[0] instanceof Error) {
        p.classList.add('error');
    }
    
    // Format the message
    const message = args.map(arg => {
        if (typeof arg === 'object') {
            return JSON.stringify(arg, null, 2);
        }
        return String(arg);
    }).join(' ');
    
    p.textContent = `[${new Date().toLocaleTimeString()}] ${message}`;
    console.appendChild(p);
    
    // Auto-scroll to bottom
    console.scrollTop = console.scrollHeight;
    
    // Log to browser console as well
    originalConsole.log(...args);
}

// Override console.error and console.warn
console.error = (...args) => {
    const p = document.createElement('p');
    p.classList.add('error');
    debugLog(...args);
    originalConsole.error(...args);
};

console.warn = (...args) => {
    const p = document.createElement('p');
    p.classList.add('warn');
    debugLog(...args);
    originalConsole.warn(...args);
};

// Console overrides for debug logging
const originalConsole = {
    log: console.log,
    error: console.error,
    warn: console.warn
};

console.log = (...args) => {
    debugLog(...args);
    originalConsole.log(...args);
};

// Text-to-speech functionality
function speak(text, language) {
    const utterance = new SpeechSynthesisUtterance(text);
    
    // Extract just the language name without the flag emoji
    const langName = language.replace(/🇬🇧|🇪🇸|🇫🇷|🇩🇪|🇮🇹|🇵🇹|🇷🇺|🇯🇵|🇰🇷|🇨🇳|🇭🇷|[^a-zA-Z\s]/g, '').trim();
    utterance.lang = languageToSpeechCode[langName] || 'en-US';
    
    debugLog('Speaking:', { text, language: utterance.lang });
    
    // Cancel any ongoing speech
    window.speechSynthesis.cancel();
    
    // Speak the new text
    window.speechSynthesis.speak(utterance);
}

// OpenAI API interaction
async function makeOpenAIRequest(messages) {
    try {
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${OPENAI_API_KEY}`
            },
            body: JSON.stringify({
                model: 'gpt-3.5-turbo',
                messages: messages,
                temperature: 0.7,
                max_tokens: 1000
            })
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            debugLog('API Error Response:', errorData);
            throw new Error(`API request failed: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();
        debugLog('API Response:', data);
        return data;
    } catch (error) {
        debugLog('API Request Error:', error);
        throw new Error(`Failed to generate conversation: ${error.message}`);
    }
}

// Conversation generation and display
async function generateConversationFromAPI(userTopic = '', sourceLanguage, targetLanguage, styleDescription = 'casual', gender = 'neutral') {
    if (!OPENAI_API_KEY) {
        showApiKeyModal();
        throw new Error('API key not set');
    }

    // Extract just the language name without the flag emoji
    const sourceLang = sourceLanguage.replace(/🇬🇧|🇪🇸|🇫🇷|🇩🇪|🇮🇹|🇵🇹|🇷🇺|🇯🇵|🇰🇷|🇨🇳|🇭🇷|[^a-zA-Z\s]/g, '').trim();
    const targetLang = targetLanguage.replace(/🇬🇧|🇪🇸|🇫🇷|🇩🇪|🇮🇹|🇵🇹|🇷🇺|🇯🇵|🇰🇷|🇨🇳|🇭🇷|[^a-zA-Z\s]/g, '').trim();

    debugLog('Processing languages:', { sourceLang, targetLang });

    const genderContext = gender !== 'neutral' 
        ? `The speaker is ${gender}, so use appropriate forms when the language requires it.` 
        : '';

    const situationExamples = userTopic ? '' : `
If no topic is provided, choose ONE of these situations randomly:
- At work (meeting colleagues, discussing projects, asking for help)
- Shopping (groceries, clothes, electronics, asking about products)
- Restaurant/Café (ordering food, making reservations, special requests)
- Travel (asking directions, buying tickets, hotel check-in)
- Healthcare (doctor's appointment, pharmacy, describing symptoms)
- Home life (family discussions, household tasks, making plans)
- Social life (meeting friends, making plans, hobbies)
- Services (bank, post office, calling customer service)
- Education (classroom interactions, studying, asking questions)
- Emergency situations (asking for help, explaining problems)

Make the conversation specific and practical, focusing on useful phrases and vocabulary for that situation.`;

    const systemPrompt = `You are a language learning assistant that creates natural conversations between two people.
The conversation MUST be in ${targetLang} with ${sourceLang} translations.
The conversations should be ${styleDescription} in tone and focused on real-world scenarios.
${genderContext}

${situationExamples}

Format your response as a JSON array containing EXACTLY 3 exchanges (6 messages total).
Each exchange must follow this format:
{
    "user": {
        "text": "text in ${targetLang}",
        "translation": "translation in ${sourceLang}"
    },
    "other": {
        "text": "response in ${targetLang}",
        "translation": "translation in ${sourceLang}"
    }
}`;

    const userPrompt = userTopic 
        ? `Create a ${styleDescription} conversation about "${userTopic}" between two people.`
        : `Create a ${styleDescription} conversation about a specific real-world situation. Make it practical and useful for language learners.`;

    const messages = [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt + `
The conversation MUST:
1. Be in ${targetLang} with ${sourceLang} translations
2. Have EXACTLY 3 exchanges (6 messages total)
3. Be natural sounding and appropriate for beginners
4. Include common, practical phrases that would be useful in real situations
5. Avoid basic greetings-only conversations unless specifically requested
Return ONLY the JSON array of exchanges, no additional text.` }
    ];

    try {
        debugLog('Making API request...');
        const response = await makeOpenAIRequest(messages);
        debugLog('API Response received');
        
        const conversation = parseConversationResponse(response);
        
        // Validate conversation length
        if (!Array.isArray(conversation) || conversation.length !== 3) {
            throw new Error(`Invalid conversation length: expected 3 exchanges, got ${conversation?.length || 0}`);
        }
        
        return conversation;
    } catch (error) {
        debugLog('Failed to generate conversation:', error);
        throw error;
    }
}

// Parse API response
function parseConversationResponse(response) {
    try {
        debugLog('Parsing conversation response...');
        
        if (!response?.choices?.[0]?.message?.content) {
            throw new Error('Invalid API response format');
        }

        // Try to parse the content as JSON
        let content;
        try {
            content = JSON.parse(response.choices[0].message.content);
        } catch (e) {
            debugLog('Failed to parse JSON content:', e);
            debugLog('Raw content:', response.choices[0].message.content);
            throw new Error('Invalid conversation format - failed to parse JSON');
        }

        if (!Array.isArray(content)) {
            debugLog('Content is not an array:', content);
            throw new Error('Invalid conversation format - expected an array');
        }

        if (content.length !== 3) {
            debugLog('Wrong number of exchanges:', content.length);
            throw new Error(`Invalid conversation length: expected 3 exchanges, got ${content.length}`);
        }

        // Validate and transform each exchange
        const exchanges = content.map((exchange, index) => {
            if (!exchange?.user?.text || !exchange?.user?.translation ||
                !exchange?.other?.text || !exchange?.other?.translation) {
                debugLog('Invalid exchange format at index', index, exchange);
                throw new Error(`Invalid exchange format at position ${index + 1}`);
            }

            return {
                user: {
                    text: exchange.user.text.trim(),
                    translation: exchange.user.translation.trim()
                },
                other: {
                    text: exchange.other.text.trim(),
                    translation: exchange.other.translation.trim()
                }
            };
        });

        return exchanges;
    } catch (error) {
        debugLog('Parse error:', error);
        debugLog('Raw response:', JSON.stringify(response, null, 2));
        throw error;
    }
}

// Display conversation
function displayConversation(conversation) {
    const container = document.getElementById('conversation-content');
    container.innerHTML = '';

    conversation.forEach((exchange, index) => {
        // User's message
        const userMessage = createMessageElement(exchange.user, 'user');
        container.appendChild(userMessage);

        // Other person's message
        const otherMessage = createMessageElement(exchange.other, 'other');
        container.appendChild(otherMessage);
    });
}

function createMessageElement(message, type) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${type}-message`;

    // Create speak button first (will be in the first column)
    const speakButton = document.createElement('button');
    speakButton.className = 'speak-button';
    speakButton.innerHTML = '<i class="fas fa-volume-up"></i>';
    speakButton.onclick = () => speak(message.text, document.getElementById('target-language').value);

    // Create text container for the second column
    const textContainer = document.createElement('div');
    textContainer.className = 'text-container';

    const textDiv = document.createElement('div');
    textDiv.className = 'message-text';
    textDiv.textContent = message.text;

    const translationDiv = document.createElement('div');
    translationDiv.className = 'message-translation';
    translationDiv.textContent = message.translation;

    textContainer.appendChild(textDiv);
    textContainer.appendChild(translationDiv);

    // Add speak button and text container in the right order for grid layout
    messageDiv.appendChild(speakButton);
    messageDiv.appendChild(textContainer);

    return messageDiv;
}

// Preload conversation management
async function preloadRandomConversation() {
    if (isPreloading || preloadAttempts >= MAX_PRELOAD_ATTEMPTS || !isPreloadEnabled()) {
        return;
    }

    try {
        isPreloading = true;
        preloadAttempts++;

        const sourceLanguage = document.getElementById('native-language').value;
        const targetLanguage = document.getElementById('target-language').value;
        
        // Only preload if languages haven't changed
        if (preloadedLanguages.source === sourceLanguage && 
            preloadedLanguages.target === targetLanguage && 
            preloadedConversation) {
            return;
        }

        const conversation = await generateConversationFromAPI(
            '', // Empty topic for random generation
            sourceLanguage, 
            targetLanguage,
            conversationStyle
        );

        if (!conversation) {
            throw new Error('Failed to generate conversation');
        }

        preloadedConversation = conversation;
        preloadedLanguages.source = sourceLanguage;
        preloadedLanguages.target = targetLanguage;
        preloadAttempts = 0;
    } catch (error) {
        debugLog('Preload error:', error);
        preloadedConversation = null;
    } finally {
        isPreloading = false;
    }
}

function isPreloadEnabled() {
    return document.getElementById('preload-toggle').checked;
}

function updatePreloadSetting() {
    const enabled = isPreloadEnabled();
    debugLog(`Updating preload setting: ${enabled}`);
    
    try {
        localStorage.setItem('preload_enabled', enabled.toString());
        debugLog('Successfully saved preload setting');
        
        if (enabled && !preloadedConversation) {
            preloadRandomConversation();
        }
    } catch (error) {
        debugLog('Error saving preload setting:', error);
    }
}

// Handle conversation generation
async function handleGenerate() {
    const generateButton = document.getElementById('generate-button');
    generateButton.disabled = true;
    generateButton.textContent = 'Generating...';

    try {
        const sourceLanguageSelect = document.getElementById('native-language');
        const targetLanguageSelect = document.getElementById('target-language');
        const topicInput = document.getElementById('input-text');
        const genderSelect = document.getElementById('speaker-gender');

        const sourceLanguage = sourceLanguageSelect.value;
        const targetLanguage = targetLanguageSelect.value;
        const topic = topicInput.value.trim();
        const gender = genderSelect.value;

        if (sourceLanguage === targetLanguage) {
            throw new Error("Please select different languages for learning");
        }

        debugLog('Generating conversation with:', {
            sourceLanguage,
            targetLanguage,
            topic,
            style: conversationStyle,
            gender
        });

        clearConversation();
        showLoadingIndicator();

        const conversation = await generateConversationFromAPI(
            topic, 
            sourceLanguage, 
            targetLanguage, 
            conversationStyle,
            gender
        );
        
        if (!conversation || !Array.isArray(conversation) || conversation.length === 0) {
            throw new Error('Invalid conversation response from API');
        }

        displayConversation(conversation);
        
    } catch (error) {
        debugLog('Error generating conversation:', error);
        showErrorModal(error.message || 'Failed to generate conversation. Please try again.');
    } finally {
        generateButton.disabled = false;
        generateButton.textContent = 'Generate Conversation';
        hideLoadingIndicator();
    }
}

// Show error modal
function showErrorModal(message) {
    const errorDiv = document.createElement('div');
    errorDiv.className = 'modal error-modal';
    errorDiv.innerHTML = `
        <div class="modal-content">
            <h2>Error</h2>
            <p>${message}</p>
            <button onclick="this.closest('.modal').remove()">OK</button>
        </div>
    `;
    document.body.appendChild(errorDiv);
}

// Clear conversation
function clearConversation() {
    const container = document.getElementById('conversation-content');
    const topic = document.getElementById('conversation-topic');
    if (container) container.innerHTML = '';
    if (topic) topic.innerHTML = '';
}

// Show/hide loading indicator
function showLoadingIndicator() {
    const button = document.getElementById('generate-button');
    if (button) {
        button.disabled = true;
        button.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Generating...';
    }
}

function hideLoadingIndicator() {
    const button = document.getElementById('generate-button');
    if (button) {
        button.disabled = false;
        button.innerHTML = 'Generate Conversation';
    }
}

// Add event listener for Enter key on input field
document.getElementById('input-text').addEventListener('keypress', function(event) {
    if (event.key === 'Enter') {
        event.preventDefault();
        handleGenerate();
    }
});

// Add event listeners for language changes
document.getElementById('native-language').addEventListener('change', function() {
    // Clear preloaded conversation if languages change
    preloadedConversation = null;
    if (isPreloadEnabled()) {
        preloadRandomConversation();
    }
    saveLanguagePreferences();
});

document.getElementById('target-language').addEventListener('change', function() {
    // Clear preloaded conversation if languages change
    preloadedConversation = null;
    if (isPreloadEnabled()) {
        preloadRandomConversation();
    }
    saveLanguagePreferences();
});

document.getElementById('speaker-gender').addEventListener('change', function() {
    debugLog('Gender preference changed');
    saveGenderPreference();
});

// Settings management
function toggleSettings() {
    document.getElementById('settings-menu').classList.toggle('show');
}

// Close settings when clicking outside
window.onclick = function(event) {
    if (!event.target.matches('#settings-button') && !event.target.matches('.fa-cog')) {
        const dropdowns = document.getElementsByClassName('settings-content');
        for (let dropdown of dropdowns) {
            if (dropdown.classList.contains('show')) {
                dropdown.classList.remove('show');
            }
        }
    }
}

// Show error message
function showError(message) {
    const errorModal = document.createElement('div');
    errorModal.className = 'modal error-modal';
    errorModal.innerHTML = `
        <div class="modal-content">
            <h2>Error</h2>
            <p>${message}</p>
            <button onclick="this.closest('.modal').remove()">OK</button>
        </div>
    `;
    document.body.appendChild(errorModal);

    // Auto-close after 5 seconds
    setTimeout(() => {
        if (errorModal.parentNode) {
            errorModal.remove();
        }
    }, 5000);
}
