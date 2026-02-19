interface LogtoConfig {
  endpoint: string;
  appId: string;
  appSecret: string;
  baseUrl: string;
}

const logotoExpressConfig: LogtoConfig = {
  endpoint: process.env.LOGTO_ENDPOINT || 'https://jmt53i.logto.app/',
  appId: process.env.LOGTO_APP_ID || 'd3tjwgdwid0d7pme59bi6',
  appSecret: process.env.LOGTO_APP_SECRET || 'JM9qaxx8IhcfjTYbPOvBTKBx176rPeAg',
  baseUrl: process.env.LOGTO_BASE_URL || 'http://localhost:3000',
};

export default logotoExpressConfig;
