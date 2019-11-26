# vue-h5-template
## 配置文件
.env.js 放在根目录下，个人配置git忽略
```js
// 不同环境访问不同的路径
const api = {
  dev: 'http://10.10.24.182:8090',
  mock: 'http://192.168.1.114:8088/mockjsdata/1',
  feature: 'http://192.168.1.114:8090',
  // test: 'http://rest.apizza.net/mock/779766c36ecc0737b94deafee204a88e',
  prod: ''
}

export const baseURL = () => {
  if (process.env.NODE_ENV === 'production') {
    return api.prod
  } else if (process.env.NODE_ENV === 'testing') {
    return api.test
  } else if (process.env.NODE_ENV === 'mock') {
    return api.mock
  } else if (process.env.NODE_ENV === 'feature') {
    return api.feature
  } else {
    return api.dev
  }
}

```


## 项目启动
```
yarn install
```

### Compiles and hot-reloads for development
```
yarn run serve
```

### Compiles and minifies for production
```
yarn run build
```

### Run your tests
```
yarn run test
```

### Lints and fixes files
```
yarn run lint
```

## 技术栈


### Customize configuration
See [Configuration Reference](https://cli.vuejs.org/config/).
