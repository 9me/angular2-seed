

//Merge environments
let env = 'development';
let configs: [any] = [all, eval(env), local];
let config = Object.assign({}, ...configs);
