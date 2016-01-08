declare module 'gulp-file' {
  var file: File;
  export = file;
  interface File {
    (fileName: string, fileContents: string, options?: any) : any
  }
}
