const Author = require("../models/author");
const Book = require("../models/book");
const {body,validationResult} = require("express-validator");

//express-async-handler封装try和catch,捕获路由处理函数中抛出的异常
const asyncHandler = require("express-async-handler");

//显示完整的作者列表
exports.author_list = asyncHandler(async (req,res,next) => {
  const list_authors = await  Author.find()
    .sort([["family_name","ascending"]])
    .exec();
      //succussful,so render
      res.render("author_list",{
	title:"作者列表",
	author_list:list_authors,
      });
});

exports.author_detail = asyncHandler(async (req,res,next) => {
  //获取作者的详细信息及其所有作品
  const [author,allBooksByAuthor] = await Promise.all([
    Author.findById(req.params.id).exec(),
    Book.find({author:req.params.id},"title summary").exec(),
  ]);

  if(author === null){
    //没有结果
    const err = new Error("Author not found");
    err.status = 404;
    return next(err);
  }
  
  res.render("author_detail",{
    title:"作者信息",
    author:author,
    author_books:allBooksByAuthor,
  });
});

exports.author_create_get =  (req,res,next) => {
  res.render("author_form",{title:"创建作者"});
};

exports.author_create_post  = [
  //验证并且清理字段
  body("first_name")
    .trim()
    .isLength({min:1})
    .escape()
    .withMessage("First name must be specified")
    // .isAlphanumeric()
    .withMessage("First name has non-alphanumeric characters."),
  body("family_name")
    .trim()
    .isLength({min:1})
    .escape()
    .withMessage("Family name must be specified")
    // .isAlphanumeric()
    .withMessage("Family name has non-alphanumeric characters"),
  body("date_of_birth","Invalid date of birth")
    .optional({values:"falsy"})
    .isISO8601()
    .toDate(),
  body("date_of_death","Invalid date of death")
    .optional({values:"falsy"})
    .isISO8601()
    .toDate(),
  //在验证和修整完字段后处f理请求
  asyncHandler(async (req,res,next) => {
    //在请求中提取验证错误
    const errors = validationResult(req);

    //使用转义和去除空白字符处理的数据创建作者对象
    const author = new Author({
      first_name: req.body.first_name,
      family_name: req.body.family_name,
      date_of_death:req.body.date_of_death,
      date_of_birth:req.body.date_of_birth,
    });
    if(!errors.isEmpty()){
      //出现错误，使用清理后的值/错误信息重新渲染表单
      res.render("author_form",{
	title:"创建作者",
	author:author,
	errors:errors.array(),
      });
      return;
    }
    //保存作者信息
    await author.save();
    res.redirect(author.url);
}),
];

exports.author_delete_get = asyncHandler(async (req,res,next) =>  {
  const [author,author_books] = await Promise.all([
    Author.findById(req.params.id).exec(),
    Book.find({author:req.params.id}).exec(),
  ]);
  if(author === null){
    res.redirect("/catalog/authors");
  }
 
  res.render("author_delete",{
    title:"删除作者",
    author:author,
    author_books:author_books,
  });
});


exports.author_delete_post = asyncHandler(async (req,res,next) => {
  const [author,author_books] = await Promise.all([
    Author.findById(req.body.authorid).exec(),
    Book.find({author:req.body.authorid}).exec(),
  ]);
  if(author_books.length > 0){
    //Author has books.Render in same way as for GET route.
    res.render("author_delete",{
      title:"删除作者",
      author:author,
      author_books:author_books,
    });
    return;
  }
  //Author has no books.Delete object and rediret to the list of authors.
  await  Author.findByIdAndDelete(req.body.authorid);
  res.redirect("/catalog/authors");
});

exports.author_update_get = asyncHandler(async (req,res,next) =>{
  const author = await Author.findById(req.params.id).exec();
  console.log(req.params.id);
  if(author === null){
    const err = new Error("找不到作者");
    err.status = 404;
    return next(err);
  }
  
  res.render("author_form",{
    title:"更新作者信息",
    author:author,
  });
});

exports.author_update_post = [
  //Validate fields
  body("first_name","first_name must not be empty.").isLength({min:1}).trim().escape(),
  body("family_name","family_name must not be empty.").isLength({min:1}).trim().escape(),
  body("date_of_birth","date_of_birth must not be empty.").toDate(),
  asyncHandler(async (req,res,next) => {
    const errors = validationResult(req);
  //Create a Author object with escaped data and old id.
  const author = new Author({
    first_name:req.body.first_name,
    family_name:req.body.family_name,
    date_of_birth:req.body.date_of_birth,
    date_of_death:req.body.date_of_death,
    _id:req.params.id,
  });

    if(!errors.isEmpty()){
      //There are errors.Render form again with sanitized values/error messages.
      res.render("author_form",{
	title:"更新作者信息",
	author:author,
	errors:errors.array(),
      });
      return ;
    }
    await Author.findByIdAndUpdate(req.params.id,author);
    res.redirect(author.url);
}),
];
