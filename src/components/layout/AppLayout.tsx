import type { ChatData, SettingsValues, ThemeMode } from '../../types';
import { ChatWindow } from '../chat/ChatWindow';
import { SettingsPanel } from '../settings/SettingsPanel';
import { Sidebar } from '../sidebar/Sidebar';
import styles from './AppLayout.module.css';

interface AppLayoutProps {
    chats: ChatData[];
    activeChatId: string;
    currentChat: ChatData | null;
    isSettingsOpen: boolean;
    isSidebarOpen: boolean;
    searchValue: string;
    settings: SettingsValues;
    theme: ThemeMode;
    onCloseSettings: () => void;
    onDeleteChat: (chatId: string) => void;
    onEditChat: (chatId: string) => void;
    onNewChat: () => void;
    onOpenSettings: () => void;
    onResetSettings: () => void;
    onSaveSettings: (settings: SettingsValues) => void;
    onSearchChange: (value: string) => void;
    onSelectChat: (chatId: string) => void;
    onStop: () => void;
    onToggleSidebar: () => void;
    onToggleTheme: () => void;
}

export function AppLayout({
    chats,
    activeChatId,
    currentChat,
    isSettingsOpen,
    isSidebarOpen,
    searchValue,
    settings,
    theme,
    onCloseSettings,
    onDeleteChat,
    onEditChat,
    onNewChat,
    onOpenSettings,
    onResetSettings,
    onSaveSettings,
    onSearchChange,
    onSelectChat,
    onStop,
    onToggleSidebar,
    onToggleTheme,
}: AppLayoutProps) {
    return (
        <div className={styles.shell}>
            <button
                aria-label="Открыть список чатов"
                className={styles.burger}
                onClick={onToggleSidebar}
                type="button"
            >
                <span />
                <span />
                <span />
            </button>

            <div
                aria-hidden={!isSidebarOpen}
                className={[
                    styles.backdrop,
                    isSidebarOpen ? styles.backdropVisible : '',
                ].join(' ')}
                onClick={onToggleSidebar}
            />

            <Sidebar
                activeChatId={activeChatId}
                chats={chats}
                isOpen={isSidebarOpen}
                searchValue={searchValue}
                onDeleteChat={onDeleteChat}
                onEditChat={onEditChat}
                onNewChat={onNewChat}
                onSearchChange={onSearchChange}
                onSelectChat={onSelectChat}
            />

            <main className={styles.content}>
                <ChatWindow
                    chat={currentChat}
                    onOpenSettings={onOpenSettings}
                    onStop={onStop}
                />
            </main>

            <SettingsPanel
                isOpen={isSettingsOpen}
                settings={settings}
                theme={theme}
                onClose={onCloseSettings}
                onReset={onResetSettings}
                onSave={onSaveSettings}
                onToggleTheme={onToggleTheme}
            />
        </div>
    );
}