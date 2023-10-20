const Product = require("../model/Product");
const success = require("../helpers/success");
const failure = require("../helpers/failed");
const Category = require("../model/Category");
const Author = require("../model/Author");
const Publisher = require("../model/Publisher");
const { sendResponse } = require("../util/common");
const HTTP_STATUS = require("../constants/statusCodes");
const mongoose = require("mongoose");
const fs = require("fs").promises;
const fss = require("fs");
const path = require("path");

class ProductController {
  async index(req, res) {
    try {
      const {
        query: searchQuery,
        category,
        author,
        publisher,
        rating,
        price_start,
        price_end,
        page,
        page_size,
        price,
        stock,
        stockRange,
        priceSort,
        stockSort,
        ratingSort,
        discountSort,
      } = req.query;

      console.log(price);

      const aggregatePipeline = [];

      // Add a $match stage to filter products based on other criteria if needed
      const matchStage = {};

      // Create a regex pattern for case-insensitive search
      const regexPattern = new RegExp(searchQuery, "i");

       // Price filter
       if (price_start && price_end) {
        const priceQuery = {
          $gte: parseFloat(price_start), // Greater than or equal to price_start
          $lte: parseFloat(price_end), // Less than or equal to price_end
        };
        matchStage.price = priceQuery;
      }

      if (category && Array.isArray(category) && category.length > 0) {
        const categoryIds = category.map((categoryId) =>
          mongoose.Types.ObjectId(categoryId)
        );
        matchStage.category = { $in: categoryIds };
      }

      // Filter by Publisher IDs
      if (publisher && Array.isArray(publisher) && publisher.length > 0) {
        const publisherIds = publisher.map((publisherId) =>
          mongoose.Types.ObjectId(publisherId)
        );
        matchStage.publisher = { $in: publisherIds };
      }

      // Filter by Rating IDs
      if (rating && Array.isArray(rating) && rating.length > 0) {
        const ratingIds = rating.map((ratingId) => parseInt(ratingId)); // Assuming ratings are numbers
        matchStage.rating = { $in: ratingIds };
      }

      // Filter by Author IDs
      if (author && Array.isArray(author) && author.length > 0) {
        const authorIds = author.map((authorId) =>
          mongoose.Types.ObjectId(authorId)
        );
        matchStage["authorInfo._id"] = { $in: authorIds };
      }

      // Stock filter
      if (stock && stockRange) {
        const stockQuery = {};
        if (stockRange === "gte") {
          stockQuery.$gte = parseFloat(stock);
        } else if (stockRange === "lte") {
          stockQuery.$lte = parseFloat(stock);
        }
        matchStage.stock = stockQuery;
      }

      if (Object.keys(matchStage).length > 0) {
        aggregatePipeline.push({ $match: matchStage });
      }

      // Add sorting stages if required
      if (priceSort) {
        const priceSortDirection =
          priceSort === "asc" ? 1 : priceSort === "dsc" ? -1 : 0;
        if (priceSortDirection !== 0) {
          aggregatePipeline.push({ $sort: { price: priceSortDirection } });
        }
      }

      if (ratingSort) {
        const ratingSortDirection =
          ratingSort === "asc" ? 1 : ratingSort === "dsc" ? -1 : 0;
        if (ratingSortDirection !== 0) {
          aggregatePipeline.push({ $sort: { price: ratingSortDirection } });
        }
      }

      if (stockSort) {
        const stockSortDirection =
          stockSort === "asc" ? 1 : stockSort === "dsc" ? -1 : 0;
        if (stockSortDirection !== 0) {
          aggregatePipeline.push({ $sort: { stock: stockSortDirection } });
        }
      }

      // Add sorting by discount
      if (discountSort) {
        const discountSortDirection =
          discountSort === "asc" ? 1 : discountSort === "dsc" ? -1 : 0;
        if (discountSortDirection !== 0) {
          aggregatePipeline.push({
            $sort: {
              "genericDiscount.percentage": discountSortDirection,
              "premiumDiscount.percentage": discountSortDirection,
              // Add more fields if needed for other discount types
            },
          });
        }
      }




      // Add a $lookup stage to join the 'Author' collection
      aggregatePipeline.push({
        $lookup: {
          from: "authors",
          localField: "author",
          foreignField: "_id",
          as: "authorInfo",
        },
      });

      // Add a $lookup stage to join the 'Category' collection
      aggregatePipeline.push({
        $lookup: {
          from: "categories",
          localField: "category",
          foreignField: "_id",
          as: "categoryInfo",
        },
      });

      // Add a $lookup stage to join the 'Publisher' collection
      aggregatePipeline.push({
        $lookup: {
          from: "publishers",
          localField: "publisher",
          foreignField: "_id",
          as: "publisherInfo",
        },
      });

      // Add a $lookup stage to join the 'Discount' collection
      aggregatePipeline.push({
        $lookup: {
          from: "discounts",
          localField: "_id",
          foreignField: "product",
          as: "discount",
        },
      });

      aggregatePipeline.push({
        $addFields: {
          discount: {
            $arrayElemAt: ["$discount", 0],
          },
        },
      });

      aggregatePipeline.push({
        $addFields: {
          currentDateTime: new Date(),
        },
      });

      aggregatePipeline.push({
        $addFields: {
          isValidDiscount: {
            $and: [
              {
                $gte: [
                  "$currentDateTime",
                  {
                    $ifNull: ["$discount.discountStartDateTime", new Date(0)],
                  },
                ],
              },
              {
                $lte: [
                  "$currentDateTime",
                  {
                    $add: [
                      {
                        $ifNull: [
                          "$discount.discountStartDateTime",
                          new Date(0),
                        ],
                      },
                      {
                        $multiply: [
                          {
                            $ifNull: ["$discount.discountDurationInMinutes", 0],
                          },
                          60000, // Convert duration to milliseconds
                        ],
                      },
                    ],
                  },
                ],
              },
            ],
          },
        },
      });

      aggregatePipeline.push({
        $addFields: {
          genericDiscount: {
            $cond: [
              "$isValidDiscount",
              {
                percentage: { $ifNull: ["$discount.generic", 0] },
                discountedPrice: {
                  $multiply: [
                    "$price",
                    { $ifNull: ["$discount.generic", 0] },
                    0.01,
                  ],
                },
              },
              {
                percentage: 0,
                discountedPrice: 0,
              },
            ],
          },
        },
      });

      aggregatePipeline.push({
        $addFields: {
          premiumDiscount: {
            $cond: [
              "$isValidDiscount",
              {
                percentage: { $ifNull: ["$discount.premium", 0] },
                discountedPrice: {
                  $multiply: [
                    "$price",
                    { $ifNull: ["$discount.premium", 0] },
                    0.01,
                  ],
                },
              },
              {
                percentage: 0,
                discountedPrice: 0,
              },
            ],
          },
        },
      });

      // Use $or to search across multiple fields
      if (searchQuery) {
        matchStage["$or"] = [
          { name: regexPattern },
          { description: regexPattern },
          { "authorInfo.name": regexPattern },
          { "categoryInfo.name": regexPattern },
          { "publisherInfo.name": regexPattern },
        ];
      }

      // // Price filter
      // if (price_start && price_end) {
      //   const priceQuery = {
      //     $gte: parseFloat(price_start), // Greater than or equal to price_start
      //     $lte: parseFloat(price_end), // Less than or equal to price_end
      //   };
      //   matchStage.price = priceQuery;
      // }

      // if (category && Array.isArray(category) && category.length > 0) {
      //   const categoryIds = category.map((categoryId) =>
      //     mongoose.Types.ObjectId(categoryId)
      //   );
      //   matchStage.category = { $in: categoryIds };
      // }

      // // Filter by Publisher IDs
      // if (publisher && Array.isArray(publisher) && publisher.length > 0) {
      //   const publisherIds = publisher.map((publisherId) =>
      //     mongoose.Types.ObjectId(publisherId)
      //   );
      //   matchStage.publisher = { $in: publisherIds };
      // }

      // // Filter by Rating IDs
      // if (rating && Array.isArray(rating) && rating.length > 0) {
      //   const ratingIds = rating.map((ratingId) => parseInt(ratingId)); // Assuming ratings are numbers
      //   matchStage.rating = { $in: ratingIds };
      // }

      // // Filter by Author IDs
      // if (author && Array.isArray(author) && author.length > 0) {
      //   const authorIds = author.map((authorId) =>
      //     mongoose.Types.ObjectId(authorId)
      //   );
      //   matchStage["authorInfo._id"] = { $in: authorIds };
      // }

      // // Stock filter
      // if (stock && stockRange) {
      //   const stockQuery = {};
      //   if (stockRange === "gte") {
      //     stockQuery.$gte = parseFloat(stock);
      //   } else if (stockRange === "lte") {
      //     stockQuery.$lte = parseFloat(stock);
      //   }
      //   matchStage.stock = stockQuery;
      // }

      // if (Object.keys(matchStage).length > 0) {
      //   aggregatePipeline.push({ $match: matchStage });
      // }

      // // Add sorting stages if required
      // if (priceSort) {
      //   const priceSortDirection =
      //     priceSort === "asc" ? 1 : priceSort === "dsc" ? -1 : 0;
      //   if (priceSortDirection !== 0) {
      //     aggregatePipeline.push({ $sort: { price: priceSortDirection } });
      //   }
      // }

      // if (ratingSort) {
      //   const ratingSortDirection =
      //     ratingSort === "asc" ? 1 : ratingSort === "dsc" ? -1 : 0;
      //   if (ratingSortDirection !== 0) {
      //     aggregatePipeline.push({ $sort: { price: ratingSortDirection } });
      //   }
      // }

      // if (stockSort) {
      //   const stockSortDirection =
      //     stockSort === "asc" ? 1 : stockSort === "dsc" ? -1 : 0;
      //   if (stockSortDirection !== 0) {
      //     aggregatePipeline.push({ $sort: { stock: stockSortDirection } });
      //   }
      // }

      // // Add sorting by discount
      // if (discountSort) {
      //   const discountSortDirection =
      //     discountSort === "asc" ? 1 : discountSort === "dsc" ? -1 : 0;
      //   if (discountSortDirection !== 0) {
      //     aggregatePipeline.push({
      //       $sort: {
      //         "genericDiscount.percentage": discountSortDirection,
      //         "premiumDiscount.percentage": discountSortDirection,
      //         // Add more fields if needed for other discount types
      //       },
      //     });
      //   }
      // }

      // Pagination
      const pageInt = parseInt(page) || 1;
      const pageSizeInt = parseInt(page_size) || 30;
      const skipCount = (pageInt - 1) * pageSizeInt;

      // Add a $project stage to calculate and show discounted prices
      aggregatePipeline.push({
        $project: {
          name: 1,
          price: 1,
          stock: 1,
          image: 1,
          pic: 1,
          description: 1,
          edition: 1,
          number_of_pages: 1,
          rating: 1,
          num_of_people: 1,
          authorInfo: {
            $map: {
              input: "$authorInfo",
              as: "authorData",
              in: {
                firstName: "$$authorData.firstName",
                lastName: "$$authorData.lastName",
                biography: "$$authorData.biography",
                birthDate: "$$authorData.birthDate",
              },
            },
          },
          categoryInfo: {
            $map: {
              input: "$categoryInfo",
              as: "categoryData",
              in: {
                name: "$$categoryData.name",
                description: "$$categoryData.description",
              },
            },
          },
          publisherInfo: {
            $map: {
              input: "$publisherInfo",
              as: "publisherData",
              in: {
                name: "$$publisherData.name",
                location: "$$publisherData.location",
                foundingYear: "$$publisherData.foundingYear",
              },
            },
          },
          genericDiscount: 1,
          premiumDiscount: 1,
          isValidDiscount: 1,
        },
      });

      // Add a $facet stage to retrieve paginated results and total count
      aggregatePipeline.push({
        $facet: {
          paginatedResult: [{ $skip: skipCount }, { $limit: pageSizeInt }],
          totalCount: [{ $count: "count" }],
        },
      });

      console.log("aggregation pipeline: ", aggregatePipeline);

      // Perform the aggregation
      const results = await Product.aggregate(aggregatePipeline);

      // Extract the paginated results and total count
      const paginatedResults = results[0].paginatedResult;
      const totalCount = results[0].totalCount[0]?.count || 0;
      const starRatingFilter = [
        { _id: 1, name: 1 },
        { _id: 2, name: 2 },
        { _id: 3, name: 3 },
        { _id: 4, name: 4 },
        { _id: 5, name: 5 },
      ];

      const allCategories = await Category.find({}).select("name _id").exec();
      const allPublishers = await Publisher.find({}).select("name").exec();
      const allAuthors = await Author.aggregate([
        {
          $project: {
            name: {
              $concat: ["$firstName", " ", "$lastName"], // Concatenate firstName and lastName into name
            },
          },
        },
      ]);

      const response = {
        totalProducts: totalCount,
        currentPage: pageInt,
        totalPages: Math.ceil(totalCount / pageSizeInt),
        pageSize: pageSizeInt,
        currentPageCount: paginatedResults.length,
        products: paginatedResults,
        filter_data: {
          category: allCategories,
          author: allAuthors,
          publisher: allPublishers,
          rating: starRatingFilter,
        },
      };

      if (paginatedResults.length > 0) {
        return sendResponse(res, HTTP_STATUS.OK, "Data Has Found", response);
      } else {
        return sendResponse(
          res,
          HTTP_STATUS.NOT_FOUND,
          "Data Does not found",
          true
        );
      }
    } catch (error) {
      console.log(error);
      return sendResponse(
        res,
        HTTP_STATUS.INTERNAL_SERVER_ERROR,
        "Internal Server Error",
        true
      );
    }
  }

  async show(req, res) {
    try {
      const { id } = req.params;

      const aggregatePipeline = [];

      aggregatePipeline.push({
        $match: {
          _id: mongoose.Types.ObjectId(id),
        },
      });

      aggregatePipeline.push({
        $lookup: {
          from: "authors",
          localField: "author",
          foreignField: "_id",
          as: "authorInfo",
        },
      });

      // Add a $lookup stage to join the 'Category' collection
      aggregatePipeline.push({
        $lookup: {
          from: "categories",
          localField: "category",
          foreignField: "_id",
          as: "categoryInfo",
        },
      });

      // Add a $lookup stage to join the 'Publication' collection
      aggregatePipeline.push({
        $lookup: {
          from: "publishers",
          localField: "publisher",
          foreignField: "_id",
          as: "publisherInfo",
        },
      });

      // Add a $lookup stage to join the 'Discount' collection
      aggregatePipeline.push({
        $lookup: {
          from: "discounts",
          localField: "_id",
          foreignField: "product",
          as: "discounts",
        },
      });

      aggregatePipeline.push({
        $lookup: {
          from: "reviews",
          localField: "_id",
          foreignField: "product",
          as: "reviews",
        },
      });

      aggregatePipeline.push({
        $unwind: {
          path: "$discounts",
          preserveNullAndEmptyArrays: true,
        },
      });

      aggregatePipeline.push({
        $lookup: {
          from: "discounts",
          localField: "_id",
          foreignField: "product",
          as: "discount",
        },
      });

      aggregatePipeline.push({
        $addFields: {
          discount: {
            $arrayElemAt: ["$discount", 0],
          },
        },
      });

      aggregatePipeline.push({
        $addFields: {
          currentDateTime: new Date(),
        },
      });

      aggregatePipeline.push({
        $addFields: {
          isValidDiscount: {
            $and: [
              {
                $gte: [
                  "$currentDateTime",
                  {
                    $ifNull: ["$discount.discountStartDateTime", new Date(0)],
                  },
                ],
              },
              {
                $lte: [
                  "$currentDateTime",
                  {
                    $add: [
                      {
                        $ifNull: [
                          "$discount.discountStartDateTime",
                          new Date(0),
                        ],
                      },
                      {
                        $multiply: [
                          {
                            $ifNull: ["$discount.discountDurationInMinutes", 0],
                          },
                          60000, // Convert duration to milliseconds
                        ],
                      },
                    ],
                  },
                ],
              },
            ],
          },
        },
      });

      aggregatePipeline.push({
        $addFields: {
          genericDiscount: {
            $cond: [
              "$isValidDiscount",
              {
                percentage: { $ifNull: ["$discount.generic", 0] },
                discountedPrice: {
                  $multiply: [
                    "$price",
                    { $ifNull: ["$discount.generic", 0] },
                    0.01,
                  ],
                },
              },
              {
                percentage: 0,
                discountedPrice: 0,
              },
            ],
          },
        },
      });

      aggregatePipeline.push({
        $addFields: {
          premiumDiscount: {
            $cond: [
              "$isValidDiscount",
              {
                percentage: { $ifNull: ["$discount.premium", 0] },
                discountedPrice: {
                  $multiply: [
                    "$price",
                    { $ifNull: ["$discount.premium", 0] },
                    0.01,
                  ],
                },
              },
              {
                percentage: 0,
                discountedPrice: 0,
              },
            ],
          },
        },
      });

      aggregatePipeline.push({
        $project: {
          name: 1,
          price: 1,
          stock: 1,
          image: 1,
          pic: 1,
          description: 1,
          edition: 1,
          number_of_pages: 1,
          num_of_people: 1,
          rating: 1,
          authorInfo: {
            $map: {
              input: "$authorInfo",
              as: "authorData",
              in: {
                _id: "$$authorData._id",
                firstName: "$$authorData.firstName",
                lastName: "$$authorData.lastName",
                biography: "$$authorData.biography",
                birthDate: "$$authorData.birthDate",
              },
            },
          },
          categoryInfo: {
            $map: {
              input: "$categoryInfo",
              as: "categoryData",
              in: {
                _id: "$$categoryData._id",
                name: "$$categoryData.name",
                description: "$$categoryData.description",
              },
            },
          },
          publisherInfo: {
            $map: {
              input: "$publisherInfo",
              as: "publisherData",
              in: {
                _id: "$$publisherData._id",
                name: "$$publisherData.name",
                location: "$$publisherData.location",
                foundingYear: "$$publisherData.foundingYear",
              },
            },
          },
          reviews: {
            $map: {
              input: "$reviews",
              as: "reviewData",
              in: {
                review: "$$reviewData.review",
                updatedAt: "$$reviewData.updatedAt",
                email: "$$reviewData.email",
              },
            },
          },
          genericDiscount: 1,
          premiumDiscount: 1,
          isValidDiscount: 1,
        },
      });

      const data = await Product.aggregate(aggregatePipeline);

      const allCategories = await Category.find({}).select("name _id").exec();
      const allPublishers = await Publisher.find({}).select("name").exec();
      const allAuthors = await Author.aggregate([
        {
          $project: {
            name: {
              $concat: ["$firstName", " ", "$lastName"], // Concatenate firstName and lastName into name
            },
          },
        },
      ]);

      if (data.length > 0) {
        data[0].filter_data = {
          category: allCategories,
          author: allAuthors,
          publisher: allPublishers,
        };
        return sendResponse(res, HTTP_STATUS.OK, "Data Has Found", data[0]);
      } else {
        return sendResponse(
          res,
          HTTP_STATUS.NOT_FOUND,
          "Data Does not found",
          true
        );
      }
    } catch (error) {
      console.log(error);
      return sendResponse(
        res,
        HTTP_STATUS.INTERNAL_SERVER_ERROR,
        "Internal Server Error",
        true
      );
    }
  }

  async store(req, res) {
    try {
      const {
        name,
        price,
        stock,
        description,
        edition,
        number_of_pages,
        category,
        author,
        publisher,
      } = req.body;

      // Check if the provided category, author, and publication IDs exist
      const categoryExists = await Category.find({ _id: { $in: category } });
      const authorExists = await Author.find({ _id: { $in: author } });
      const publisherExists = await Publisher.find({ _id: { $in: publisher } });

      if (categoryExists.length !== category.length) {
        return sendResponse(
          res,
          HTTP_STATUS.NOT_FOUND,
          "Category does not exist",
          true
        );
      }

      if (authorExists.length !== author.length) {
        return sendResponse(
          res,
          HTTP_STATUS.NOT_FOUND,
          "Author does not exist",
          true
        );
      }

      if (publisherExists.length !== publisher.length) {
        return sendResponse(
          res,
          HTTP_STATUS.NOT_FOUND,
          "Publication does not exist",
          true
        );
      }

      let pic = "";
      if (req.file) {
        let msg = "";
        let errFlag = false;

        if (req.file.fieldname !== "pic") {
          msg = "Incorrect Image Field";
          errFlag = true;
        }
        if (
          req.file.mimetype !== "image/png" &&
          req.file.mimetype !== "image/jpg" &&
          req.file.mimetype !== "image/jpeg"
        ) {
          console.log(req.file.mimetype);
          msg = "Incorrect file type";
          errFlag = true;
        }
        // console.log(req.file.size);
        if (req.file.size > 200) {
          msg = "Size greater than 2MB";
          errFlag = true;
        }
        if (errFlag) {
          return sendResponse(res, HTTP_STATUS.UNPROCESSABLE_ENTITY, msg, true);
        } else {
          pic = req.file.path.replace(/\\/g, "/");
        }
      }

      console.log(req.files);

      const product = new Product({
        name,
        price,
        stock,
        description,
        edition,
        number_of_pages,
        category,
        author,
        publisher,
        pic,
      });

      // if (req.file) {
      //   let msg = "";
      //   let errFlag = false;

      //   if (req.file.fieldname !== "pic") {
      //     msg = "Incorrect Image Field";
      //     errFlag = true;
      //   }
      //   if (
      //     req.file.mimetype !== "image/png" &&
      //     req.file.mimetype !== "image/jpg" &&
      //     req.file.mimetype !== "image/jpeg"
      //   ) {
      //     console.log(req.file.mimetype);
      //     msg = "Incorrect file type ..";
      //     errFlag = true;
      //   }
      //   console.log(req.file.size);
      //   if (req.file.size > 2000000) {
      //     msg = "Size greater than 2MB";
      //     errFlag = true;

      //   }
      //   if(errFlag){
      //     return sendResponse(
      //       res,
      //       HTTP_STATUS.UNPROCESSABLE_ENTITY,
      //       msg,
      //       true
      //     );
      //   }
      //    else {
      //     product.pic = req.file.path.replace(/\\/g, "/");
      //   }
      // }

      // console.log("hit before save")
      const savedProduct = await product.save();
      // console.log(savedProduct);
      return sendResponse(
        res,
        HTTP_STATUS.OK,
        "product added successfully",
        true
      );
    } catch (err) {
      console.log(err);
      return sendResponse(
        res,
        HTTP_STATUS.INTERNAL_SERVER_ERROR,
        "Internal server error",
        true
      );
    }
  }

  async update(req, res) {
    try {
      const { id } = req.params;
      const {
        name,
        price,
        stock,
        description,
        edition,
        number_of_pages,
        category,
        author,
        publisher,
      } = req.body;

      const data = await Product.findOne({ _id: id });

      if (!data) {
        return sendResponse(
          res,
          HTTP_STATUS.NOT_FOUND,
          "Data Has Not Found",
          true
        );
      }

      if (name !== undefined) {
        data.name = name;
      }

      if (price !== undefined) {
        data.price = price;
      }

      if (stock !== undefined) {
        data.stock = stock;
      }

      if (description !== undefined) {
        data.description = description;
      }

      if (edition !== undefined) {
        data.edition = edition;
      }

      if (number_of_pages !== undefined) {
        data.number_of_pages = number_of_pages;
      }

      if (category !== undefined) {
        const categoryExists = await Category.exists({ _id: category });
        if (!categoryExists) {
          return sendResponse(
            res,
            HTTP_STATUS.NOT_FOUND,
            "Category does not exist",
            true
          );
        }
        data.category = category;
      }

      if (author !== undefined) {
        const authorExists = await Author.exists({ _id: author });
        if (!authorExists) {
          return sendResponse(
            res,
            HTTP_STATUS.NOT_FOUND,
            "Author does not exist",
            true
          );
        }

        data.author = author;
      }

      if (publisher !== undefined) {
        const publisherExists = await Publisher.exists({ _id: publisher });
        if (!publisherExists) {
          return sendResponse(
            res,
            HTTP_STATUS.NOT_FOUND,
            "Publication does not exist",
            true
          );
        }
        data.publisher = publisher;
      }

      if (req.file) {
        /////////////////////////////////////////////// image check

        if (req.file.fieldname !== "pic") {
          return sendResponse(
            res,
            HTTP_STATUS.UNPROCESSABLE_ENTITY,
            "Incorrect Image Field",
            true
          );
        }

       else {
          /////////////////////////////////////////////// unlink image from directory

          if (data.pic) {
            const filePath = data.pic.replace(/\//g, "\\");
            const directory = path.join(__dirname, "..", filePath);

            fs.access(directory, fs.constants.F_OK)
              .then(async () => await fs.unlink(directory))
              .catch(() => false);
          }

          let picPath = req.file.path.replace(/\\/g, "/");
          data.pic = picPath;
        }
      }

      const update = await data.save();

      if (update) {
        return sendResponse(
          res,
          HTTP_STATUS.OK,
          "Data Has been Updated successfully",
          data
        );
      } else {
        return sendResponse(
          res,
          HTTP_STATUS.NOT_FOUND,
          "Data Has Not Found",
          true
        );
      }
    } catch (err) {
      console.log(err);
      return sendResponse(
        res,
        HTTP_STATUS.INTERNAL_SERVER_ERROR,
        "Internal Server Error",
        true
      );
    }
  }

  async destroy(req, res) {
    try {
      const { id } = req.params;

      const data = await Product.findOneAndDelete({ _id: id });

      if (data) {
        return sendResponse(
          res,
          HTTP_STATUS.OK,
          "Data Has been deleted successfully",
          true
        );
      } else {
        return sendResponse(
          res,
          HTTP_STATUS.NOT_FOUND,
          "No data found to delete",
          true
        );
      }
    } catch (err) {
      return sendResponse(
        res,
        HTTP_STATUS.INTERNAL_SERVER_ERROR,
        "Internal Server Error",
        true
      );
    }
  }
}

module.exports = new ProductController();
