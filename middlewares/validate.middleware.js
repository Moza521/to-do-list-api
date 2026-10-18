const validate = (schema) => async (req, res, next) => {
  try {
    const parsed = await schema.parseAsync({
      body: req.body,
      query: req.query,
      params: req.params,
    });

    if (parsed.body) req.body = parsed.body;
    if (parsed.query) req.query = parsed.query;
    if (parsed.params) req.params = parsed.params;

    return next();
  } catch (error) {
    if (error.name === "ZodError" || error.issues) {
      const formattedErrors = (error.issues || []).map((err) => ({
        field: err.path.join(".").replace(/^(body|query|params)\./, ""),
        message: err.message,
      }));

      return res.status(400).json({
        status: "fail",
        message: "Validation Error",
        errors: formattedErrors,
      });
    }

    return next(error);
  }
};

module.exports = validate;
