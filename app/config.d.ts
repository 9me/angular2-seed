declare module 'config' {
  let config: Config;
  export = config;
  interface Config {
    ENV: string
  }
}
