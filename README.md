# ugc
Репозиторий с примерами взаимодействия с UGC компонентами Турбо-страниц, таких как Авторизация и Комментарии

## Примеры
[Форма авторизации](http://master.turboext.net/auth/login/form)

Настройка CORS в [nginx](https://github.com/turboext/ugc/blob/master/examples/nginx/config)

## Разработка
```bash
git clone git@github.com:turboext/ugc.git
cd ugc
npm i
npm start

open http://localhost:8085/auth/login/form?TURBO_ID=234dsdsdfw4
```

## Структура репозитория
### examples - директория с примерами верстки/статики/настроек, например:
```
examples/
├── default-auth-form
│   ├── README.md
│   ├── auth-socials.html
│   ├── auth.css
│   └── auth.html
└── nginx
    └── config
```
где default-auth-form - пример верстки формы авторизации.

### src - директория с примером реализации сервера для работы с авторизацией и комментариями
```
src/
├── data
├── middlewares
├── models
├── routes
├── utils
└── index.ts
```
