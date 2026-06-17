export const catchAsync = (fn) => {
  return (req, res, next) => {
    fn(req, res, next).catch(next); // lempar error ke global error handler
  };
};