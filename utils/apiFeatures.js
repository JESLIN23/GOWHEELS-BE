class APIFeatures {
  constructor(query, queryString) {
    this.query = query;
    this.queryString = queryString;
  }

  filter() {
    let queryObj = { ...this.queryString };
    const excludedFields = ['sort', 'page', 'limit', 'fields', 'search'];
    excludedFields.forEach((el) => delete queryObj[el]);

    for (const key in queryObj) {
      if (queryObj[key].length === 0) {
        delete queryObj[key];
      }
    }

    for (const key in queryObj) {
      if (queryObj[key].includes(',')) {
        const values = queryObj[key].split(',');
        queryObj[key] = { $in: values };
      }
    }

    let queryStr = JSON.stringify(queryObj);
    queryStr = queryStr.replace(/\b(gt|gte|lt|lte)\b/g, (match) => `$${match}`);

    this.query = this.query.find(JSON.parse(queryStr));

    return this;
  }

  search(searchFields) {
    if (this.queryString?.search) {
      const searchRegex = new RegExp(this.queryString.search, 'i');
      
      let queryStr;

      if (searchFields && searchFields.length > 0) {
        queryStr = {
          $or: searchFields.map((field) => ({
            [field]: { $regex: searchRegex },
          })),
        };
      } else {
        queryStr = {
          $or: Object.keys(this.query.model.schema.paths).reduce(
            (acc, field) => {
              if (field !== '__v') {
                acc.push({ [field]: { $regex: searchRegex } });
              }
              return acc;
            },
            []
          ),
        };
      }

      this.query = this.query.find(queryStr);
    }
    return this;
  }

  sort() {
    if (this.queryString?.sort) {
      let sortBy = this.queryString.sort.split(',').join(' ');
      this.query = this.query.sort(sortBy);
    } else {
      this.query = this.query.sort('price');
    }
    return this;
  }

  limitFields() {
    if (this.queryString?.fields) {
      const fields = req.query.fields.split(',').join(' ');
      this.query = this.query.select(fields);
    } else {
      this.query = this.query.select('-__v');
    }
    return this;
  }

  pagination() {
    const page = this.queryString?.page * 1 || 1;
    const limit = this.queryString?.limit * 1 || 100;
    const skip = (page - 1) * limit;
    this.query = this.query.skip(skip).limit(limit);

    return this;
  }
}

module.exports = APIFeatures;
