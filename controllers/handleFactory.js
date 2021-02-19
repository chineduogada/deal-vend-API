const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/AppError");
const APIFeatures = require("../utils/APIFeatures");
const validateInput = require("../utils/validateInput");

exports.getMany = (Model, docName = "document") =>
  catchAsync(async (req, res) => {
    const apiFeatures = new APIFeatures(
      Model.find(req.filterOptions),
      req.query
    )
      .filter()
      .sort()
      .paginate()
      .project();

    // EXECUTE QUERY
    // const docs = await apiFeatures.Query.explain();
    const docs = await apiFeatures.Query;

    // SEND RESPONSE
    res.status(200).json({
      status: "success",
      results: docs.length,
      data: {
        [docName]: docs,
      },
    });
  });

exports.createOne = (Model, docName = "document", schema) =>
  catchAsync(async (req, res, next) => {
    if (schema) {
      const error = validateInput(req.body, schema);

      if (error) {
        return next(new AppError(error.details[0].message, 400));
      }
    }

    const doc = await Model.create(req.body);

    res.status(201).json({
      status: "success",
      data: {
        [docName]: doc,
      },
    });
  });

exports.getOne = (Model, docName = "document", populateOptions) =>
  catchAsync(async (req, res, next) => {
    const filterOptions = !req.filterOptions
      ? { _id: req.params.id }
      : req.filterOptions;

    let query = Model.findOne(filterOptions);

    if (populateOptions) {
      query = query.populate(populateOptions);
    }

    const doc = await query;

    if (!doc) {
      return next(
        new AppError(
          !req.filterOptions
            ? `No \`${docName}\` with the given \`id\`!`
            : `The \`${docName}\` specified is not found!`,
          404
        )
      );
    }

    res.status(200).json({
      status: "success",
      data: {
        [docName]: doc,
      },
    });
  });

exports.updateOne = (Model, docName = "document", schema) =>
  catchAsync(async (req, res, next) => {
    if (schema) {
      const error = validateInput(req.body, schema);

      if (error) {
        return next(new AppError(error.details[0].message, 400));
      }
    }

    const filterOptions = !req.filterOptions
      ? { _id: req.params.id }
      : req.filterOptions;

    let doc = await Model.findOneAndUpdate(filterOptions, req.body, {
      new: true,
      runValidators: true,
    });

    if (!doc) {
      return next(
        new AppError(
          !req.filterOptions
            ? `No \`${docName}\` with the given \`id\`!`
            : `The \`${docName}\` specified is not found!`,
          404
        )
      );
    }

    res.status(200).json({
      status: "success",
      data: {
        [docName]: doc,
      },
    });
  });

exports.deleteOne = (Model, docName = "document") =>
  catchAsync(async (req, res, next) => {
    const filterOptions = !req.filterOptions
      ? { _id: req.params.id }
      : req.filterOptions;

    let doc = await Model.findOneAndRemove(filterOptions);

    if (!doc) {
      return next(
        new AppError(
          !req.filterOptions
            ? `No \`${docName}\` with the given \`id\`!`
            : `The \`${docName}\` specified is not found!`,
          404
        )
      );
    }

    res.status(204).json({
      status: "success",
      data: null,
    });
  });
