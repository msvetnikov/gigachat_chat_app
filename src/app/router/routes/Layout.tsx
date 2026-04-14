import { Suspense, lazy, useState } from 'react';
import styles from '../routes.module.css';

const LazySidebar = lazy(() =>
    import('../../../components/sidebar/Sidebar').then((module) => ({
        default: module.Sidebar,
    }))
);
const LazyChatWindow = lazy(() =>
    import('../../../components/chat/ChatWindow').then((module) => ({
        default: module.ChatWindow,
    }))
);

export function Layout() {
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

            <Suspense fallback={null}>
                <LazySidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
            </Suspense>

            <main className={styles.content}>
                <Suspense fallback={null}>
                    <LazyChatWindow />
                </Suspense>
            </main>
        </div>
    );
}
