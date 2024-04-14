
# Generated API for monkey

- auto generated OAS 3.0.0 compliant api

## Run

```sh
npm start
```

## Build

```sh
docker build -t container-name:0.0.1 .
```

## Documentation

- Documenation is auto generated and is available via swagger at [http://localhost:3000](http://localhost:3000)

```sh
npm run docs
```

## Configs

configs are located at **configs/configs.json**

```json
{
  "port": 7777,
  "db": {
    "mongoURL": "mongodb://localhost:27017/sugar",
    "mongoOptions": {
      "useNewUrlParser": true
    }
  },
  "env": "local",
  "userCanApiKey": "123456"
}
```


  