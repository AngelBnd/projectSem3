// validate(schema) - parses req.body with a zod schema.
// On failure responds 400 { error: <first issue message>, details: [{ path, message }] },
// keeping the `error` key the frontend already reads. On success req.body is
// replaced with the parsed (unknown-keys-stripped) data.
const validate = (schema) => (req, res, next) => {
  const result = schema.safeParse(req.body ?? {});

  if (!result.success) {
    const issues = result.error.issues;
    return res.status(400).json({
      error: issues[0].message,
      details: issues.map((i) => ({
        path: i.path.join("."),
        message: i.message,
      })),
    });
  }

  req.body = result.data;
  next();
};

module.exports = validate;
