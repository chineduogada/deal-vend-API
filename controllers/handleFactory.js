const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/AppError");
const APIFeatures = require("../utils/APIFeatures");
const validateInput = require("../utils/validateInput");

const buildQueryToCache = (req, query) => {
  query = req.cache ? query.cache(req.cacheOptions) : query;
  return query;
};

exports.getMany = (Model, docName = "document") =>
  catchAsync(async (req, res) => {
    const apiFeatures = new APIFeatures(
      buildQueryToCache(req, Model.find(req.filterOptions)),
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
    const error = validateInput(req.body, schema);

    if (error) {
      return next(new AppError(error.details[0].message, 400));
    }

    const doc = await Model.create(req.body);

    res.status(201).json({
      status: "success",
      data: {
        [docName]: doc,
      },
    });
  });

exports.getOne = (Model, docName = "document", filterField, populateOptions) =>
  catchAsync(async (req, res, next) => {
    let query = filterField
      ? Model.findOne({ [filterField]: req.params[filterField] })
      : Model.findById(req.params.id);
    if (populateOptions) {
      query = query.populate(populateOptions);
    }
    const doc = await buildQueryToCache(req, query);

    if (!doc) {
      return next(
        new AppError(
          `No '${docName}' with the given \`${filterField || "id"}\`!`,
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

exports.updateOne = (Model, docName = "document", schema, filterField) =>
  catchAsync(async (req, res, next) => {
    const error = validateInput(req.body, schema);

    if (error) {
      return next(new AppError(error.details[0].message, 400));
    }

    const doc = filterField
      ? await Model.findOneAndUpdate({ [filterField]: req.params[filterField] })
      : await Model.findByIdAndUpdate(req.params.id, req.body, {
          new: true,
          runValidators: true,
        });

    if (!doc) {
      return next(
        new AppError(
          `No '${docName}' with the given \`${filterField || "id"}\`!`,
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

exports.deleteOne = (Model, docName = "document", filterField) =>
  catchAsync(async (req, res, next) => {
    const doc = filterField
      ? await Model.findOneAndRemove({ [filterField]: req.params[filterField] })
      : await Model.findByIdAndRemove(req.params.id);

    if (!doc) {
      return next(
        new AppError(
          `No '${docName}' with the given \`${filterField || "id"}\`!`,
          404
        )
      );
    }

    res.status(204).json({
      status: "success",
      data: null,
    });
  });
