// The file contents for the current environment will overwrite these during build.
// The build system defaults to the dev environment which uses `environment.ts`, but if you do
// `ng build --env=prod` then `environment.prod.ts` will be used instead.
// The list of which env maps to which file can be found in `.angular-cli.json`.

export const environment = {
  production: false,
  development: false,
  api: {
    url: 'https://ec-portal-backend.herokuapp.com/lend/v1',
    username: 'extreme',
    password: 'Espresso1',
    client_id: 'KiQsiI3b7WKdNozrveptdx7SH4JvnYc6NgYrGBeh',
    client_secret: 'doEcQYlNYplNWomZQLUZnLlEE2iPxNOCV2H9KaJ8Jtdun2kaE4QdEgDeuu1xvaWPm1T7JmPu9szeNrDvJHmnCuUA4IQrYv0iryNe43uv8i0wmHXEmJlDr99uyTMiB8JT',
    token_url: 'https://ec-portal-backend.herokuapp.com/o/token/',
    notification_url: 'https://ec-portal-frontend.herokuapp.com'
  }
};
