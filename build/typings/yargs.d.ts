declare module 'yargs' {
  var yargs: IYargs;
  export = yargs;
  interface IYargs {
    argv: any;
  }
}
