import { useState } from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { ChatWindow } from '../../components/chat/ChatWindow';
import { Sidebar } from '../../components/sidebar/Sidebar';
import styles from './routes.module.css';

function Layout() {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    return (
        <div className={styles.shell}>
            <button
                aria-label="Открыть список чатов"
                className={styles.burger}
                onClick={() => setIsSidebarOpen(true)}
                type="button"
            >
                <span />
                <span />
                <span />
            </button>

            <div
                aria-hidden={!isSidebarOpen}
                className={[styles.backdrop, isSidebarOpen ? styles.backdropVisible : ''].join(' ')}
                onClick={() => setIsSidebarOpen(false)}
            />

            <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

            <main className={styles.content}>
                <ChatWindow />
            </main>
        </div>
    );
}

export function AppRoutes() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<Layout />} />
                <Route path="/chat/:id" element={<Layout />} />
            </Routes>
        </BrowserRouter>
    );
}
