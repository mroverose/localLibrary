
const BookInstance = require("../models/bookinstance");
const asyncHandler = require("express-async-handler");
const {body,validationResult} = require("express-validator");
const Book = require("../models/book");

//显示所有的BookInstance
exports.bookinstance_list = asyncHandler(async (req,res,next) => {
  const allBookInstances = await
  BookInstance.find().populate("book").exec();

  
  res.render("bookinstance_list",{
    title : "Book Instance列表",
    bookinstance_list:allBookInstances,
  });
});

//显示特定BookInstance的详情页
exports.bookintance_detail = asyncHandler(async (req,res,next) => {
  const bookInstance = await BookInstance.findById(req.params.id)
    .populate("book").exec();

  if(bookInstance === null){
    const err = new Error("Book copy not found");
    err.status = 404;
    return next(err);
  }
  
  res.render("bookinstance_detail",{
    title:"图书：",
    bookinstance:bookInstance,
  });
});

//由Get显示创建BookInstance的表单
exports.bookinstance_create_get  = asyncHandler(async (req,res,next) => {
  const books = await Book.find().exec();

  if(books === null){
    const error = new Error("没有图书");
    error.status = 404;
    return next(error);
  }
  
  res.render("bookinstance_form",{
    title:"创建图书实例",
    book_list:books,
  });
});

//由POST处理创建BookInstance
exports.bookinstance_create_post = [
  //Validate fields
  body("book","Book must be specified")
    .isLength({min:1}).trim(),
  body("imprint","Imprint must be specified")
    .isLength({min:1}).trim(),
  body("due_back","Invalid date")
    .optional({checkFalsy:true})
    .isISO8601(),
  //Sanitize fields
  body("book").trim().escape(),
  body("imprint").trim().escape(),
  body("status").trim().escape(),
  body("due_back").toDate(),

  //Process request after validation and sanitization
  asyncHandler(async (req,res,next) => {
    //Extract the validation errors from a request
    const errors = validationResult(req);

    //Create a BookInstance object with escaped and trimmed data.

    var bookinstance = new BookInstance({
      book:req.body.book,
      imprint:req.body.imprint,
      status:req.body.status,
      due_back:req.body.due_back,
    });

    if(!errors.isEmpty()){
      //There are errors.Render form again with sanitized values and error messages.
      const books = await Book.find().exec();
      if(books === null){
	const error = new Error("找不到图书信息");
	error.status = 404;
	return next(error);
      }
      res.render("bookinstance_form",{
	title:"新建图书实例",
	book_list:books,
	selected_book:bookinstance.book._id,
	errors:errors.array(),
	bookinstance:bookinstance,
      });
      return ;
    }
    //Data from form is valid.
    await bookinstance.save();
   //Successful - redirect to new record.
    res.redirect(bookinstance.url);
  }),
];

//由GET显示删除BookInstance的表单
exports.bookinstance_delete_get = asyncHandler(async (req,res,next) => {
  const bookinstance = await BookInstance.findById(req.params.id).exec();

  if(bookinstance === null || bookinstance === undefined){
    res.redirect("/catalog/bookinstances");
  }
  res.render("bookinstance_delete",{
    title:"删除图书实例",
    bookinstance:bookinstance,
  });
});

//由POST显示删除BookInstance的表单
exports.bookinstance_delete_post = asyncHandler(async (req,res,next) => {
  const bookinstance = await BookInstance.findById(req.body.bookinstanceid).exec();
  if(bookinstance === null){
    res.redirect("/catalog/bookinstances");
  }
  await BookInstance.findByIdAndDelete(req.body.bookinstanceid);
  console.log("删除图书实例成功！");
  res.redirect("/catalog/bookinstances");
});


//由GET显示更新BookInstance的表单
exports.bookinstance_update_get = asyncHandler(async (req,res,next) => {
  const [bookinstance,book_list] = await Promise.all([
    BookInstance.findById(req.params.id).populate("book").exec(),
    Book.find().exec(),
  ]);
  if(bookinstance == null){
    const err = new Error("找不到图书实例");
    err.status = 404;
    return next(err);
  }
  
  res.render("bookinstance_form",{
    title:"修改图书实例",
    bookinstance:bookinstance,
    book_list:book_list,
    selected_book:bookinstance.book._id,
  });
});

//由POST显示更机关报BookInstance的表单
exports.bookinstance_update_post =[
  body("book","Book must be specified").isLength({min:1}).trim().escape(),
  body("imprint","Imprint must be specified").isLength({min:1}).trim().escape(),
  body("due_back","Invalid date").optional({checkFalsy:true}).isISO8601().escape(),
 asyncHandler(async (req,res,next) => {
   const errors = validationResult(req);

   //Create a BookInstance object with escaped and trimmed data.
   const bookinstance = new BookInstance({
     book:req.body.book,
     imprint:req.body.imprint,
     stauts:req.body.status,
     due_back:req.body.due_back,
     _id:req.params.id,
   });

   if(!errors.isEmpty()){
     const books = await Book.find().exec();
     if(Array.isArray(books) && books.length == 0){
       const  err = new Error("找不到图书信息");
       console.log("404 found");
       err.status = 404;
       return next(err);
     }

     //Render form again with sanitize values and errors
     res.render("bookinstance_form",{
       title:"更新图书实例",
       book_list:books,
       selected_book:bookinstance.book._id,
       errors:errors.array(),
       bookinstance:bookinstance,
     });
     return;
   }
   //Data from form is valid
   await BookInstance.findByIdAndUpdate(req.params.id,bookinstance);
   console.log("图书实例修改成功");
   res.redirect(bookinstance.url);
 }),
];

