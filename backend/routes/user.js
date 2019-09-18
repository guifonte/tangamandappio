const express = require('express');

const checkAuth = require("../middleware/check-auth");
const checkAdminAuth = require("../middleware/check-admin-auth");
const UserController = require("../controllers/user");

const router = express.Router();

router.post("/signup", UserController.createUser);

router.post("/login", UserController.userLogin);

//router.get('/:email', checkAdminAuth, UserController.getUserInfoByEmail);

router.get("", checkAdminAuth, UserController.getUsers);

router.get('/:id', checkAuth, UserController.getUserData);

router.get("/authorized", checkAdminAuth, UserController.getAuthorizedUsers);

router.put("", checkAdminAuth, UserController.updateUsers);

router.put("/:id", checkAuth, UserController.updateUser);

router.put("/password/:id", checkAuth, UserController.updatePassword);

module.exports = router;
