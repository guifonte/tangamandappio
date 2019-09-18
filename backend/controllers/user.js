const bcrypt = require('bcryptjs');
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
          nickname: req.body.nickname,
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

exports.updatePassword = (req, res, next) => {
  console.log(req.body)
  console.log(req.params.id)
  let fetchedUser;
  User.findOne({_id: req.params.id})
    .then(user => {
      if(!user) {
        return res.status(401).json({
          message: "Não existe usuário cadastrado nesse e-mail"
        });
      }
      fetchedUser = user;
      return bcrypt.compare(req.body.oldPassword, user.password);
    })
    .then(result => {
      if (!result) {
        return res.status(401).json({
          message: "A senha está incorreta"
        });
      }
      bcrypt.hash(req.body.newPassword, 10)
      .then(hash => {
        User.updateOne({_id: req.params.id},{$set:{password:hash}})
        .then(() => {
          const token = jwt.sign(
            { email: fetchedUser.email,
              userId: fetchedUser._id,
              firstName: fetchedUser.firstName,
              lastName: fetchedUser.lastName,
              nickname: fetchedUser.nickname,
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
            nickname: fetchedUser.nickname,
            email: fetchedUser.email,
            admin: fetchedUser.admin,
            authorized: fetchedUser.authorized
          })
        }).catch(err => {
          res.status(500).json({message: 'Error'})
        })
      })
    })
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
            nickname: fetchedUser.nickname,
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
          nickname: fetchedUser.nickname,
          email: fetchedUser.email,
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
          nickname: user.nickname,
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
  User.find({},'_id firstName lastName nickname email authorized admin').then(users => {
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

exports.getUserData = (req, res, next) => {
  User.findOne({_id: req.params.id},'_id email firstName lastName nickname').then(user => {
    if(user) {
      res.status(200).json({
        message: "Usuários obtidos com sucesso",
        user: user
      });
    } else {
      res.status(404).json({message: 'Nenhum usuário foi encontrado'});
    } 
  });
}

exports.getAuthorizedUsers = (req, res, next) => {
  User.find({authorized: true},'_id firstName lastName nickname').then(users => {
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

exports.updateUser = (req, res, next) => {
  const user = req.body
  if(user.userId == req.userData.userId) {
    User.updateOne({_id: req.params.id},
      { $set:{firstName:user.firstName,
              lastName: user.lastName,
              nickname: user.nickname,
              email: user.email}})
              .then(() => {
                User.findOne({_id: user.userId})
                .then(user => {
                  if (!user) {
                    return res.status(401).json({
                      message: "Não existe usuário cadastrado nesse e-mail"
                    });
                  }
                  const token = jwt.sign(
                    { email: user.email,
                      userId: user._id,
                      firstName: user.firstName,
                      lastName: user.lastName,
                      nickname: user.nickname,
                      admin: user.admin,
                      authorized: user.authorized
                    },
                    process.env.JWT_KEY,
                    { expiresIn: "1h" }
                  );
                  res.status(200).json({
                    token: token,
                    expiresIn: 3600,
                    userId: user._id,
                    firstName: user.firstName,
                    lastName: user.lastName,
                    nickname: user.nickname,
                    email: user.email,
                    admin: user.admin,
                    authorized: user.authorized
                  });
                })
              }).catch(err => {
                res.status(500).json({message: 'Error'});
              })
  } else {
    return res.status(401).json({
      message: "Auth failed"
      });
  }
}