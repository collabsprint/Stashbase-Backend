interface LogtoConfig {
  endpoint: string;
  appId: string;
  appSecret: string;
  baseUrl: string;
}

const logotoExpressConfig: LogtoConfig = {
  endpoint: process.env.LOGTO_ENDPOINT || 'endpoint',
  appId: process.env.LOGTO_APP_ID || 'id',
  appSecret: process.env.LOGTO_APP_SECRET || 'secret',
  baseUrl: process.env.LOGTO_BASE_URL || 'baseurl',
};

export default logotoExpressConfig;
