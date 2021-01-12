class APIFeatures {
  constructor(mongooseQuery, reqQuery) {
    this.Query = mongooseQuery;
    this.queryString = reqQuery;
  }

  filter = () => {
    let queryObject = { ...this.queryString };
    // Delete special params fields
    const excludedFields = ["fields", "page", "limit", "sort"];
    excludedFields.forEach((field) =>
      Reflect.deleteProperty(queryObject, field)
    );

    let queryString = JSON.stringify(queryObject);

    const replacePat = /(gt|lt|gte|lte)/g;
    const replaceFn = (match) => `$${match}`;
    queryString = queryString.replace(replacePat, replaceFn);

    queryObject = JSON.parse(queryString);
    this.Query.find(queryObject);

    return this;
  };

  sort = () => {
    if (this.queryString.sort) {
      let sortBy = this.queryString.sort;
      sortBy = sortBy.replace(/,/g, " ");

      this.Query.sort(sortBy);
    } else {
      this.Query.sort("-createdAt");
    }

    return this;
  };

  project = () => {
    if (this.queryString.fields) {
      let fields = this.queryString.fields;
      fields = fields.replace(/,/g, " ");

      this.Query.select(fields);
    } else {
      this.Query.select("-__v");
    }

    return this;
  };

  paginate = () => {
    const page = this.queryString.page * 1 || 1;
    const limit = this.queryString.limit * 1 || 100;
    const numberOfDocsToSkip = (page - 1) * limit;

    this.Query.limit(limit).skip(numberOfDocsToSkip);

    return this;
  };
}

module.exports = APIFeatures;
