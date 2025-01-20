const Book = require("../models/book");
const Author = require("../models/author");
const Genre = require("../models/genre");
const BookInstance = require("../models/bookinstance");
const {body,validationResult,sanitizeBody} = require("express-validator");


const asyncHandler = require("express-async-handler");

exports.index = asyncHandler(async (req, res, next) => {
    //并行获取书的详细信息、书实例、作者和体裁的数量
    const [
        numBooks,
        numBookInstances,
        numAvailableBookInstances,
        numAuthors,
        numGenres,
    ] = await Promise.all([
        Book.countDocuments({}).exec(),
        BookInstance.countDocuments({}).exec(),
        BookInstance.countDocuments({status:"Available"}).exec(),
        Author.countDocuments({}).exec(),
        Genre.countDocuments({}).exec(),
    ]);


    res.render("index",{
        title:"Local Library Home",
        book_count:numBooks,
        book_instance_count:numBookInstances,
        book_instance_available_count:numAvailableBookInstances,
        author_count:numAuthors,
        genre_count:numGenres,
    });
});

// 显示所有的图书
exports.book_list = asyncHandler(async (req, res, next) => {
  const allBooks = await Book.find({},"title author")
    .sort({title:1})
    .populate("author")
    .exec();

  res.render("book_list",{title:"图书列表",book_list:allBooks});
});

// 显示特定图书的详情页面。
exports.book_detail = asyncHandler(async (req, res, next) => {
  const [book,bookInstances] = await Promise.all([
    Book.findById(req.params.id).populate("author").populate("genre").exec(),
    BookInstance.find({book:req.params.id}).exec(),
  ]);

  if(book == null){
    const err = new Error("Book not found");
    err.status = 404;
    return next(err);
  }
  res.render("book_detail",{
    title:book.title,
    book:book,
    book_instances:bookInstances,
  });
});

// 通过 GET 显示创建图书。
exports.book_create_get = asyncHandler(async (req, res, next) => {
  const [authors,genres] = await Promise.all([
    Author.find().exec(),
    Genre.find().exec(),
  ]);
  if(authors === null || genres === null){
    const err = new Error("找不到作者信息或流派信息");
    err.status = 404;
    return next(err);
  }
  
  res.render("book_form",{
    title:"创建图书",
    authors:authors,
    genres:genres,
  });
});

// 以 POST 方式处理创建图书。
exports.book_create_post = [
  //Convert the genre to an array
  asyncHandler(async (req,res,next) => {
    if(!(req.body.genre instanceof Array)){
      if(typeof req.body.genre === "undefined"){
	req.body.genre = [];
      }else{
	req.body.genre = new Array(req.body.genre);
      }
    }
    next();
  }),
  //validate fields
  body("title","Title must not be empty.")
    .isLength({min:1})
    .trim(),
  body("author","Author must not be empty.")
    .isLength({min:1})
    .trim(),
  body("summary","Summary must not be empty.")
    .isLength({min:1})
    .trim(),
  body("summary","Summary must not be empty.")
    .isLength({min:1})
    .trim(),
  body("isbn","ISBN must not be empty")
    .isLength({min:1})
    .trim(),
  //Sanitize fields (using wildcard).
  //  sanitizeBody('*').trim().escape(),
  // sanitizeBody('genre.*).escape(),
  //Process request after validation and sanitization.
asyncHandler(async (req, res, next) => {
  const errors = validationResult(req);
  //Create a Book object with escaped and trimmed data.
  var book = new Book({
    title:req.body.title,
    author:req.body.author,
    summary:req.body.summary,
    isbn:req.body.isbn,
    genre:req.body.genre,
  });
  if(!errors.isEmpty()){
    //There are errors.Render form again with sanitized values/error messages.

    //Get all authors and genres for form.
    const [authors,genres] = await Promise.all([
      Author.find().exec(),
      Genre.find().exec(),
    ]);

    if(authors === null || genres === null){
      const err = new Error("找不到作者信息或流派信息");
      err.status = 404;
       return next(err);
    }
    //Mark out selected genres as checked
    for(let i = 0;i < genres.length;i++){
      if(book.genre.indexOf(genres[i]._id) > -1){
	genres[i].checked = "true";
      }
    }
    res.render("book_form",{
      title:"Create Book",
      authors:authors,
      genres:genres,
      book:book,
      errors:errors.array(),
    });
    return;
  }
  //表格中的数据有效
  await book.save();
  res.redirect(book.url);
  }),
];

// 通过 GET 显示删除图书。
exports.book_delete_get = asyncHandler(async (req, res, next) => {
  const book = await Book.findById(req.params.id).populate("author").populate("genre").exec();
  const book_instances = await BookInstance.find({book:req.params.id}).exec();
  if(book_instances === null){
    res.redirect("/catalog/books");
  }
  
  res.render("book_delete",{
    title:"删除图书",
    book:book,
    book_instances:book_instances,
  });
});

// 以 POST 方式处理删除图书。
exports.book_delete_post = asyncHandler(async (req, res, next) => {
  const book = await Book.findById(req.body.bookid).populate("author").populate("genre").exec();
  const book_instances = await BookInstance.find({book:req.body.bookid}).exec();

  if(Array.isArray(book_instances) && book_instances.length > 0) {
      res.render("book_delete",{
      title:"删除图书",
      book:book,
      book_instances:book_instances,
    });
    return;
  }
  console.log("删除图书成功");
 await  Book.findByIdAndDelete(req.body.bookid);
  res.redirect("/catalog/books");
});

// 通过 GET 显示更新图书。
exports.book_update_get = asyncHandler(async (req, res, next) => {
  const [book,authors,genres] = await Promise.all([
    Book.findById(req.params.id).populate("author").populate("genre").exec(),
    Author.find(),
    Genre.find(),
  ]);

  if(book === null){
    const err = new Error("没有图书");
    err.status = 404;
    return next(err);
  }
  //Mark our selected genres as checked.
  for(let all_g_iter = 0;all_g_iter < genres.length;all_g_iter++){
    for(let book_g_iter = 0;book_g_iter < book.genre.length;book_g_iter++){
      if(genres[all_g_iter]._id.toString() == book.genre[book_g_iter]._id.toString()){
	genres[all_g_iter].checked = "true";
      }
    }
  }
  
  res.render("book_form",{
    title:"更新图书",
    authors:authors,
    genres:genres,
    book:book,
  });
});

// 处理 POST 时的更新图书。
exports.book_update_post =[
  //Convert the genre to an array
  (req,res,next) => {
    if(!(req.body.genre instanceof Array)){
      if(typeof req.body.genre === "undefined"){
	req.body.genre = [];
      }
      else{
	req.body.genre = new Array(req.body.genre);
      }
    }
    next();
  },
  //Validate fields.
  body("title","Title must not be empty.")
    .isLength({min:1})
    .trim()
    .escape(),
  body("author","Author must not be empty.")
    .isLength({min:1})
    .trim()
    .escape(),
  body("summary","Summary must not be empty.")
    .isLength({min:1})
    .trim()
    .escape(),
  body("isbn","ISBN must not be empty.")
    .isLength({min:1})
    .trim()
    .escape(),
  //Process request after validation and sanitization
  asyncHandler(async (req, res, next) => {
    //Extract the validation errors from a request.
    const errors = validationResult(req);

    //Create a Book object with escape/trimmed data and old id.
    const book = new Book({
      title:req.body.title,
      author:req.body.author,
      summary:req.body.summary,
      isbn:req.body.isbn,
      genre:typeof req.body.genre === "undefined" ? [] : req.body.genre,
      _id:req.params.id,    //This is required,or a new ID will be assigned!
    });
    if(!errors.isEmpty()){
      //Get all authors and genres for form.
      const [authors,genres] = await Promise.all([
	Author.find().exec(),
	Genre.find().exec(),
      ]);

      //Mark our selected genres as checked
      for(let i = 0;i < genres.length;i++){
	if(book.genre.indexOf(genres[i]._id) > -1){
	  genres[i].checked = "true";
	}
      }

      res.render("book_form",{
	title:"更新图书",
	authors:authors,
	genres:genres,
	book:book,
	errors:errors.array(),
      });
      return;
    }
    await Book.findByIdAndUpdate(req.params.id,book);
    res.redirect(book.url);
  }),
];
