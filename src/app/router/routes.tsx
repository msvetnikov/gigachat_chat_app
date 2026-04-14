import { Suspense, lazy } from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';

const LazyHomeRoute = lazy(() => import('./routes/HomeRoute'));
const LazyChatRoute = lazy(() => import('./routes/ChatRoute'));

export function AppRoutes() {
    return (
        <BrowserRouter>
            <Suspense fallback={null}>
                <Routes>
                    <Route path="/" element={<LazyHomeRoute />} />
                    <Route path="/chat/:id" element={<LazyChatRoute />} />
                </Routes>
            </Suspense>
        </BrowserRouter>
    );
}
