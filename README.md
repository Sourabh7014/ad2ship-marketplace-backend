# ad2ship-marketplace-backend

Ad2Ship marketplace ka backend (NestJS). Folder structure `ad2ship-theme-backend`
ke seller hisse jaisi hi rakhi hai, taaki wahan se code laane par imports same rahein.

```
src/
  modules/seller/  ← seller API modules (auth, kyc, orders, products, billing, wallet, ...)
                     har module me controller, service, module, dto/
  common/          ← guards, decorators, filters, helpers, libraries, services, pdf, ...
  core/            ← cache, guards, interceptors, strategies, utils, core.module
  config/          ← app, database, jwt, redis config
  database/        ← prisma module/service
  resource/        ← base API resource (response shape)
  templete/        ← handlebars templates (label, invoice, manifest, picklist)
  main.ts, app.module.ts
prisma/            ← schema + seeders/
test/              ← e2e tests + fixtures/
public/, assets/   ← static files
```

Khaali folders me `.gitkeep` hai — file aate hi use hata dena.

## Chalane ke liye

```bash
pnpm install
cp .env.example .env
pnpm start:dev
```
