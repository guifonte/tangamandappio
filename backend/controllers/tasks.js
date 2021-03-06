const Task = require("../models/task");
const User = require("../models/user");

exports.createTask = (req, res, next) => {
    let membersId = req.body.members.map(member => {
        return member.id
    })
    console.log(membersId)

    let pos = -1
    let members = req.body.members.map(member => {
        pos = pos+1
        return {
            userId: member.id,
            position: pos
        }
    })
    let inCharge = members[Math.floor(Math.random()*members.length)].userId

    const task = new Task({
        name: req.body.name,
        description: req.body.description,
        inCharge: inCharge,
        members: members
    });

    task.save().then(createdTask => {
        User.find({_id: membersId}).then(result => {
            membersData = result.map(user => {
                return {
                    userId: user._id,
                    firstName: user.firstName,
                    lastName: user.lastName,
                    position: members.find(member => { return member.userId == user._id }).position
                }
            })
            res.status(201).json({
                taskId: createdTask._id,
                inCharge: createdTask.inCharge,
                members: membersData,
                message: 'Tarefa criada com sucesso!'
            });
        })
    })
    .catch(error => {
        res.status(500).json({
            message: 'Não foi possível criar uma nova tarefa!'
        });
    });
}

exports.updateTask = (req, res, next) => {
    const task = new Task({
        _id: req.body.id,
        name: req.body.name,
        description: req.body.description
    });
    Task.updateOne({ _id: req.params.id }, task)
        .then(result => {
            console.log(result);
            res.status(200).json( { message: "Tarefa atualizada com sucesso"});
        })
        .catch(error => {
            res.status(500).json({
                message: 'Não foi possível atualizar as configurações da tarefa!'
            });
        });
}

exports.getTasks = (req, res, next) => {
    Task.find()
        .then(documents => {
            return Promise.all(documents.map(async function(task) {
                //console.log('TASK')
                //console.log(task)
                let membersId = task.members.map(member => {
                    return member.userId
                })
                return await User.find({_id: membersId}).then(result => {
                    //console.log('MEMBERS')
                    //console.log(result)
                    members = result.map(user => {
                        foundMember = task.members.find(function(member) {
                            id1 = String(member.userId)
                            id2 = String(user._id)                       
                            return id1 == id2
                        })
                        return {
                            userId: user._id,
                            firstName: user.firstName,
                            lastName: user.lastName,
                            position: foundMember.position
                        }
                    })
                    return {
                        _id: task._id,
                        name: task.name,
                        description: task.description,
                        inCharge: task.inCharge,
                        members: members
                    }
                }).catch( error => {
                    res.status(500).json({
                        message: 'Problemas para obter os dados dos membros do grupo!'
                    })
                })
            })
        ).then(tasks => {
            res.status(201).json({
                tasks: tasks,
                message: 'Tarefas obtidas com sucesso!'
            });
        })})
        .catch( error => {      
            res.status(500).json({
                message: 'Não foi possível retornar a lista de tarefas!'
            })
        });
}

exports.getTask = (req, res, next) => {
    Task.findById(req.params.id).then(task => {
        if (task) {
            res.status(200).json(task);
        } else {
            res.status(404).json({message: 'Tarefa não encontrada'});
        }
    })
    .catch( error => {      
        res.status(500).json({
            message: 'Não foi possível retornar a tarefa!'
        })
    });
}

exports.deleteTask = (req, res, next) => {
    console.log(req.params)
    Task.deleteOne({ _id: req.params.id })
        .then(result => {
            console.log(result);
            res.status(200).json({ message: 'Tarefa apagada!' });
        })
        .catch( error => {      
            res.status(500).json({
                message: 'Não foi possível apagar a tarefa!'
            })
        });  
}

exports.makeTask = (req, res, next) => {
    Task.find({ _id: req.body.id, inCharge: req.userData.userId })
        .then(result => {
            let foundTask = new Task(result[0])
            member = foundTask.members.find(member => {return member.userId == req.userData.userId})
            
            position = member.position
            newInChargePos = position+1
            newInChargeMember = foundTask.members.find(member => {return member.position == newInChargePos})
            if (newInChargeMember == undefined) {
                newInChargeMember = foundTask.members.find(member => {return member.position == 0})
            }
            newInChargeId = newInChargeMember.userId
            foundTask.inCharge = newInChargeId
            return foundTask
        }).then(task => {
            Task.updateOne({_id: task._id}, task).then(result => {
                res.status(200).json({ message: 'Tarefa atualizada', inCharge: task.inCharge })
            }).catch( error => {      
                res.status(500).json({
                    message: 'Não foi possível atualizada a tarefa!'
                })
            });
        })
        .catch( error => {      
            res.status(500).json({
                message: 'Não foi possível atualizada a tarefa!'
            })
        });  
}