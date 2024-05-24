import { BrowserRouter, Outlet, Route, Routes } from 'react-router-dom';
import './App.less';
import { PageHome } from './PageHome';
import { PageNotFound } from './PageNotFound';

/* AppWrapRouter */

export const AppWrapRouter: React.FC = () => {
    return (
    <BrowserRouter>
        <Routes>
            <Route path='/' element={<App />} >
                <Route index element={<PageHome />} />
                <Route path='*' element={<PageNotFound />} />
            </Route>
        </Routes>
    </BrowserRouter>
    );
}

/* App */

export type AppContext = {
    foo: string,
};

const App: React.FC = () =>
{
    const appContext: AppContext = {
        foo: 'bar',
    };

    return <>
    <div id='layout'>
        <Header />
        <main>
            <div id='page'>
                <Outlet context={appContext} />
            </div>
        </main>
    </div>
    </>;
}

const Header: React.FC = () =>
{
    return <header>
        <h1>
            <img alt='polymedia' src='https://assets.polymedia.app/img/all/logo-nomargin-transparent-512x512.webp' className='logo' />
            Vanity
        </h1>
    </header>;
}
