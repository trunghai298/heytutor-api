export class AbstractError extends Error {
  constructor(props) {
    super(props);
    Error.captureStackTrace(this, this.constructor);
    this.name = this.constructor.name;
    // [{ field: props.field, message: props.message }]
    if (props.errors) {
      this.errors = props.errors;
    } else {
      const { field, message } = props;
      this.errors = [{ field, message }] || [];
    }

    this.message = this.toString();
  }

  toString() {
    return `${this.errors
      .map((error) => ` [${error.field}] ${error.message}`)
      .join(", ")}`;
  }
}

export class NotFoundError extends AbstractError {}
export class ForbiddenError extends AbstractError {}
export class NotAuthorizedError extends AbstractError {}
export class BadRequestError extends AbstractError {}

export const notFoundMiddleware = (req, res, next) =>
  next(
    new NotFoundError({
      errors: [
        {
          field: "path",
          message: "Path not found",
        },
      ],
    })
  );

export const errorHandler = (err, req, res, next) => {
  let code = 500;

  switch (err.name) {
    case "BadRequestError":
      code = 400;
      break;
    case "NotAuthorizedError":
      code = 401;
      break;
    case "ForbiddenError":
      code = 403;
      break;
    case "NotFoundError":
      code = 404;
      break;
    default:
      code = 500;
      break;
  }

  console.log(err);

  if (code < 500) {
    res.status(code).json({ errors: err.errors });
  } else {
    res.status(code).send({ message: err.message, stack: err.stack });
  }

  if (code === null) {
    next();
  }
};
