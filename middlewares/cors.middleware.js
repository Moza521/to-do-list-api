const cores = require("cors");

const allowedOrigins = process.env.ALLOWED_ORIGINS.split(",");
const corsOptions = {
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    }
    callback(null, true);
    //  else {
    //   callback(new Error("CORS POLICY: Origin Not Allowed"));
    // }
  },
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
  credentials: true,
  allowHeaders: ["Content-Type", "Authorization"],
};

module.exports = cores(corsOptions);
