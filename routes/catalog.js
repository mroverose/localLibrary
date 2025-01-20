const express = require("express");
const router = express.Router();

//导入控制器模块
const book_controller = require("../controllers/bookController");
const book_instance_controller = require("../controllers/bookinstanceController");
const author_controller = require("../controllers/authorController");
const genre_controller = require("../controllers/genreController");

//图书路由

//GET获取图书编目主页
router.get("/",book_controller.index);

//GET请求添加新的图书。注意此项必须位于显示图书的路由(使用了id)之前
router.get("/book/create",book_controller.book_create_get);

//POST请求添加新的图书
router.post("/book/create",book_controller.book_create_post);

//GET请求删除图书
router.get("/book/:id/delete",book_controller.book_delete_get);

//POST请求删除图书
router.post("/book/:id/delete",book_controller.book_delete_post);

//GET请求更新图书
router.get("/book/:id/update",book_controller.book_update_get);

//POST请求更新图书
router.post("/book/:id/update",book_controller.book_update_post);

//GET请求图书
router.get("/book/:id",book_controller.book_detail);

//GET请求完整图书列表
router.get("/books",book_controller.book_list);

//作者路由

//用于创建作者的GET请求。注意这必须在id的路由之前(比如说显示作者)
router.get("/author/create",author_controller.author_create_get);

//创建作者的POST请求
router.post("/author/create",author_controller.author_create_post);

//删除作者的GET请求
router.get("/author/:id/delete",author_controller.author_delete_get);

//删除作者的POST请求
router.post("/author/:id/delete",author_controller.author_delete_post);

//GET请求更新作者
router.get("/author/:id/update",author_controller.author_update_get);

//POST请求更新作者
router.post("/author/:id/update",author_controller.author_update_post);

//获取一个作者的GET请求
router.get("/author/:id",author_controller.author_detail);

//获取所有作者列表的GET请求
router.get("/authors",author_controller.author_list);

//流派路由

//用于创建流派的GET请求。注意：这必须在显示流派的路由之前(使用id的路由).
router.get("/genre/create",genre_controller.genre_create_get);

//POST创建Genre
router.post("/genre/create",genre_controller.genre_create_post);

//删除流派的GET请求
router.get("/genre/:id/delete",genre_controller.genre_delete_get);

//删除流派的POST请求
router.post("/genre/:id/delete",genre_controller.genre_delete_post);

//更新流派的GET请求
router.get("/genre/:id/update",genre_controller.genre_update_get);

//更新流派的POST请求
router.post("/genre/:id/update",genre_controller.genre_update_post);

//获取一个流派的GET请求
router.get("/genre/:id",genre_controller.genre_detail);

//获取所有流派的GET请求
router.get("/genres",genre_controller.genre_list);

//BOOKINSTANCE路由

//用于创建BookInstance的GET请求。注意：这必须在显示BookInstance的路由之前(使用id的路由)
router.get("/bookinstance/create",book_instance_controller.bookinstance_create_get);

//创建BookInstance的POST请求
router.post(
    "/bookinstance/create",
    book_instance_controller.bookinstance_create_post,
);

//删除BookInstancer的GET请求
router.get(
    "/bookinstance/:id/delete",
    book_instance_controller.bookinstance_delete_get,
);

//删除BookInstance的POST请求
router.post(
    "/bookinstance/:id/delete",
    book_instance_controller.bookinstance_delete_post,
);

//更新BookInstance的GET请求
router.get(
    "/bookinstance/:id/update",
    book_instance_controller.bookinstance_update_get,
);

//更新BookInstance的POST请求
router.post(
    "/bookinstance/:id/update",
    book_instance_controller.bookinstance_update_post,
);

//一个BookInstancer的GET请求
router.get(
    "/bookinstance/:id",
    book_instance_controller.bookintance_detail,
);

//GET请求获取所有BookInstance的列表
router.get(
    "/bookinstances",
    book_instance_controller.bookinstance_list,
);

module.exports = router;
