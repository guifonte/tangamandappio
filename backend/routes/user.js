const express = require('express');

const checkAdminAuth = require("../middleware/check-admin-auth");
const UserController = require("../controllers/user");

const router = express.Router();

router.post("/signup", UserController.createUser);

router.post("/login", UserController.userLogin);

//router.get('/:email', checkAdminAuth, UserController.getUserInfoByEmail);

router.get("", checkAdminAuth, UserController.getUsers);

router.get("/authorized", checkAdminAuth, UserController.getAuthorizedUsers);

router.put("", checkAdminAuth, UserController.updateUsers);

module.exports = router;
