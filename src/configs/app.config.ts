const role = localStorage.getItem('role');
const env = import.meta.env.VITE_APP_BASE_URL;


export type AppConfig = {
    apiPrefix: string;
    authenticatedEntryPath: string;
    unAuthenticatedEntryPath: string;
    tourPath: string;
    locale: string;
    publicPath: string;
    enableMock: boolean;
};



const appConfig: AppConfig = {
    apiPrefix: `${env}v1/api/`,
    authenticatedEntryPath:'/app/crm/dashboard',
    unAuthenticatedEntryPath: '/sign-in',
    tourPath: '/app/account/kyc-form',
    publicPath: '/publicView',
    locale: 'en',
    enableMock: false
};


export default appConfig;
