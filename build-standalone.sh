rm -rf ./standalone-dist
pnpm run build
mkdir -p ./standalone-dist
cp -r ./scripts-dist ./standalone-dist/scripts
cp -r ./package.json ./standalone-dist/package.json
cp -r ./next.config.js ./standalone-dist/
cp -r ./public ./standalone-dist/public
cp -r ./.next/standalone/* ./standalone-dist/
mkdir -p ./standalone-dist/.next
cp -r ./.next/static ./standalone-dist/.next/static
cp -r ./drizzle ./standalone-dist/drizzle