let prisma: any;
try {
  // Use require so we can handle case where client isn't generated yet
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const { PrismaClient } = require("@prisma/client");
  prisma = new PrismaClient();
} catch (err: any) {
  console.warn("Prisma client not available. Run `npx prisma generate` and set DATABASE_URL. DB features will be disabled.");
  prisma = new Proxy({}, {
    get() {
      throw new Error("Prisma client not available. Run `npx prisma generate` and set DATABASE_URL to use DB features.");
    }
  });
}

export default prisma;