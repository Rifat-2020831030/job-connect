import { z } from "zod";

export const validate = (schema) => async (req, res, next) => {
  try {
    await schema.parseAsync({
      body: req.body,
      query: req.query,
      params: req.params,
    });
    return next();
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errors = error.issues.map((issue) => ({
        path: issue.path.join("."),
        message: issue.message,
      }));
      return res.status(400).json({ status: 0, message: "Validation Error", errors });
    }
    return res
      .status(500)
      .json({ status: 0, message: "Internal Server Error during validation" });
  }
};
