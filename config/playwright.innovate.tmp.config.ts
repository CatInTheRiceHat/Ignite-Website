import config from './playwright.sol.config';
export default { ...config, use: { ...config.use, baseURL: 'http://127.0.0.1:5173' }, webServer: undefined };
