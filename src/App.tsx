import { useEffect, useState } from 'react';
import { AuthForm } from './components/auth/AuthForm';
import { AppLayout } from './components/layout/AppLayout';
import { defaultSettings, mockChats } from './mocks';
import type { ScopeOption, SettingsValues, ThemeMode } from './types';

export default function App() {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [theme, setTheme] = useState<ThemeMode>('light');
    const [activeChatId, setActiveChatId] = useState(mockChats[0]?.id ?? '');
    const [searchValue, setSearchValue] = useState('');
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    const [settings, setSettings] = useState<SettingsValues>(defaultSettings);

    const visibleChats = mockChats.filter((chat) => {
        const query = searchValue.trim().toLowerCase();

        if (!query) {
            return true;
        }

        return (
            chat.title.toLowerCase().includes(query) ||
            chat.preview.toLowerCase().includes(query)
        );
    });

    useEffect(() => {
        document.documentElement.dataset.theme = theme;
    }, [theme]);

    const currentChat = activeChatId
        ? mockChats.find((chat) => chat.id === activeChatId) ?? null
        : null;

    const handleLogin = (credentials: string, _scope: ScopeOption) => {
        if (!credentials.trim()) {
            return;
        }

        setIsAuthenticated(true);
    };

    return isAuthenticated ? (
        <AppLayout
            activeChatId={currentChat?.id ?? ''}
            chats={visibleChats}
            currentChat={currentChat}
            isSettingsOpen={isSettingsOpen}
            isSidebarOpen={isSidebarOpen}
            searchValue={searchValue}
            settings={settings}
            theme={theme}
            onCloseSettings={() => setIsSettingsOpen(false)}
            onDeleteChat={() => undefined}
            onEditChat={() => undefined}
            onNewChat={() => {
                setActiveChatId('');
                setIsSidebarOpen(false);
            }}
            onOpenSettings={() => setIsSettingsOpen(true)}
            onResetSettings={() => setSettings(defaultSettings)}
            onSaveSettings={(nextSettings) => setSettings(nextSettings)}
            onSearchChange={setSearchValue}
            onSelectChat={(chatId) => {
                setActiveChatId(chatId);
                setIsSidebarOpen(false);
            }}
            onStop={() => undefined}
            onToggleSidebar={() => setIsSidebarOpen((value) => !value)}
            onToggleTheme={() =>
                setTheme((value) => (value === 'light' ? 'dark' : 'light'))
            }
        />
    ) : (
        <AuthForm onSubmit={handleLogin} />
    );
}