const express = require("express");

const checkAuth = require("../middleware/check-auth");
const checkAdminAuth = require("../middleware/check-admin-auth");
const TasksController = require("../controllers/tasks");

const router = express.Router();

router.post("", checkAdminAuth, TasksController.createTask);

router.post("/make", checkAuth, TasksController.makeTask);

router.post("/makeinadvance", checkAuth, TasksController.makeTaskinAdvance);

router.post("/unmake", checkAuth, TasksController.unmakeTask);

router.post("/unmakeinadvance", checkAuth, TasksController.unmakeTaskinAdvance);

router.put("/:id", checkAdminAuth, TasksController.updateTask);

router.get('', checkAuth, TasksController.getTasks);

router.get('/:id', checkAuth, TasksController.getTask);

router.delete("/:id", checkAdminAuth, TasksController.deleteTask);

module.exports = router;