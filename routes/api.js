const express = require('express');
const Auth = require("../middlewares/Auth");

const AuthController = require("../api/AuthController");


const { registerValidation, validate, loginValidation } = require('../helpers/validators')

const router = express.Router();

router.post("/signup", registerValidation(), validate, AuthController.registerUser);

router.post("/signin", loginValidation(), validate, AuthController.login);

router.get("/user", Auth, AuthController.checkAuth)

module.exports = router;