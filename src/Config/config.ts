/**
 * This Config contains a centeral entry point for environment variables
 */
const config = {
  PORT: process.env.PORT || 5000,
  DB_CONNECTION: process.env.DB_CONNECTION || "",
  LOGGLY_TOKEN: process.env.LOGGLY_TOKEN || "",
};

export { config };
