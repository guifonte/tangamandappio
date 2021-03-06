const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const User = require('../models/user');
const async = require('async');

exports.createUser = (req, res, next) => {
    bcrypt.hash(req.body.password, 10)
      .then(hash => {
        const user = new User({
          email: req.body.email,
          password: hash,
          firstName: req.body.firstName,
          lastName: req.body.lastName,
          admin: false,
          authorized: false
        });
        user.save()
          .then(result => {
            res.status(201).json({
              message: 'Usuário criado com sucesso',
              result: result
            });
          })
          .catch(err => {
            res.status(500).json({
              message: "Já existe um usuário cadastrado nesse e-mail",
              error: err
            });
          });
      });
  }

exports.userLogin = (req, res, next) => {
    let fetchedUser;
    User.findOne({ email: req.body.email })
      .then(user => {
        if (!user) {
          return res.status(401).json({
            message: "Não existe usuário cadastrado nesse e-mail"
          });
        }
        fetchedUser = user;
        return bcrypt.compare(req.body.password, user.password);
      })
      .then(result => {
        if (!result) {
          return res.status(401).json({
            message: "A senha está incorreta"
          });
        }
        const token = jwt.sign(
          { email: fetchedUser.email,
            userId: fetchedUser._id,
            firstName: fetchedUser.firstName,
            lastName: fetchedUser.lastName,
            admin: fetchedUser.admin,
            authorized: fetchedUser.authorized
          },
          process.env.JWT_KEY,
          { expiresIn: "1h" }
        );
        res.status(200).json({
          token: token,
          expiresIn: 3600,
          userId: fetchedUser._id,
          firstName: fetchedUser.firstName,
          lastName: fetchedUser.lastName,
          admin: fetchedUser.admin,
          authorized: fetchedUser.authorized
        });
    })
    .catch(err => {
        return res.status(401).json({
        message: "Auth failed"
        });
    });
}

exports.getUserInfoByEmail = (req, res, next) => {
    User.findOne({email: req.params.email}).then(user => {
      if(!user) {
        res.status(200).json({
          userId: user._id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          admin: user.admin,
          authorized: user.authorized
        });
      } else {
        res.status(404).json({message: 'Nenhum usuário foi encontrado para esse E-mail'});
      }
    });
  }

exports.getUsers = (req, res, next) => {
  User.find({},'_id firstName lastName email authorized admin').then(users => {
    if(users) {
      res.status(200).json({
        message: "Usuários obtidos com sucesso",
        users: users
      });
    } else {
      res.status(404).json({message: 'Nenhum usuário foi encontrado'});
    } 
  });
}

exports.getAuthorizedUsers = (req, res, next) => {
  User.find({authorized: true},'_id firstName lastName').then(users => {
    if(users) {
      res.status(200).json({
        message: "Usuários obtidos com sucesso",
        users: users
      });
    } else {
      res.status(404).json({message: 'Nenhum usuário foi encontrado'});
    } 
  });
}


exports.updateUsers = (req, res, next) => {
  async.eachSeries(req.body, function updateUser(user, done) {
    User.update(
      { _id: user.id },
      { $set:{admin: user.admin, authorized: user.authorized }},
      { upsert: true},
      done
    );
    }, function allDone(err) {
      if (err) {
        console.log(err);
        res.status(500).json({message: 'Error'});
      }
    });
    res.status(200).json( { message: "Usuário atualizado com sucesso"});
  }