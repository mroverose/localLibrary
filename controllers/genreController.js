const Genre = require("../models/genre");
const Book = require("../models/book");
const asyncHandler = require("express-async-handler");
const { body,validationResult } = require("express-validator");

// 显示所有的流派。
exports.genre_list = asyncHandler(async (req, res, next) => {
  const list_genres = await Genre.find()
    .sort([["name","ascending"]])
    .exec();
  
  res.render("genre_list",{
    title:"流派列表",
    genre_list:list_genres,
  });
});

// 显示特定流派的详情页。
exports.genre_detail = asyncHandler(async (req, res, next) => {
  const genre = await Genre.findById(req.params.id).exec();
  const genre_books = await Book.find({genre:req.params.id}).exec();
      res.render("genre_detail",{
	title:"流派详情",
	genre:genre,
	genre_books:genre_books,
      });
});

// 通过 GET 显示创建流派。
exports.genre_create_get = (req, res, next) => {
  //呈现GET方法获取的Genre表单
  res.render("genre_form",{title:"Create Genre"});
};

// 以 POST 方式处理创建流派。
exports.genre_create_post = [
  //验证及清理名称字段
  body("name","Genre name must contain at least 3 characters")
    .trim()
    .isLength({min:3})
    .escape(),
  //处理验证及清理过后的请求
   asyncHandler(async (req, res, next) => {
     //从请求中提取验证时产生的错误信息
     const errors = validationResult(req);
     //使用经去除空白字符和转义处理的数据创建一个类型对象
     const genre = new Genre({name:req.body.name});
     if(!errors.isEmpty()){
       //出现错误。使用清理后的值/错误信息重新渲染表单
       res.render("genre_form",{
	 title:"Create Genre",
	 genre:genre,
	 errors:errors.array(),
       });
       return;
     }
     //表格中的数据有效
       //检查是否存在同名的Genre
       const genreExists = await Genre.findOne({name:req.body.name})
         .collation({locale:"zh",strength:2})
         .exec();
       if(genreExists){
	 //存在同名的Genre,则重定向到详情页面
	 res.redirect(genreExists.url);
       }else{
	 await genre.save();
	 //保存新建的Genre,然后重定向到类型的详情页面
	 res.redirect(genre.url);
       }
   }),
];

// 通过 GET 显示流派删除表单。
exports.genre_delete_get = asyncHandler(async (req, res, next) => {
  const [genre,genre_books] = await Promise.all([
    Genre.findById(req.params.id).exec(),
    Book.find({genre:req.params.id}).exec(),
  ]);
   
  if(genre == null){
    res.redirect("/catalog/genres");
  }
  
  res.render("genre_delete",{
    title:"删除流派",
    genre:genre,
    genre_books:genre_books,
  });
});

// 处理 POST 时的流派删除。
exports.genre_delete_post = asyncHandler(async (req, res, next) => {
  const [genre,genre_books] = await Promise.all([
    Genre.findById(req.body.genreid).exec(),
    Book.find({genre:req.body.genreid}).exec(),
  ]);
  
   if(genre == null){
    res.redirect("/catalog/genres");
  }
  if(genre_books.length > 0){
    //Genre has books,Render in same way as for GET route.
     res.render("genre_delete",{
     title:"删除流派",
     genre:genre,
     genre_books:genre_books,
   });
    return;
  }
  //Genre has no books.Delete object and redirect to the list of Genres.
  await Genre.findByIdAndDelete(req.body.genreid);
  console.log("流派删除成功");
   res.redirect("/catalog/genres");
});

// 通过 GET 显示流派更新表单。
exports.genre_update_get = asyncHandler(async (req, res, next) => {
  const genre = await Genre.findById(req.params.id).exec();
  if(genre == null){
    const err = new Error("找不到该流派信息");
    err.status = 404;
    return next(err);
  }
  res.render("genre_form",{
    title:"更新流派信息",
    genre:genre,
  });
});

// 处理 POST 上的流派更新。
exports.genre_update_post = [
  body("name","name must not be empty.").isLength({min:1}).trim().escape(),
  asyncHandler(async (req, res, next) => {
    const errors = validationResult(req);

    //Create a Genre object with escaped/trimmed data and old id.
   
    const genre = new Genre({
       name:req.body.name,
      _id:req.params.id,
    });
    if(!errors.isEmpty()){
      //There are errors.
      res.render("genre_form",{
	genre:genre,
	errors:errors.array(),
      });
      return;
    }
  await  Genre.findByIdAndUpdate(req.params.id,genre);
    res.redirect(genre.url);
  }),
];
