const Task = require("../models/task");
const TaskExecution = require("../models/task-execution");
const User = require("../models/user");

exports.createTask = (req, res, next) => {
    let membersId = req.body.members.map(member => {
        return member.id
    })

    let pos = -1
    let shuffledMembers = shuffle(membersId)
 
    let members = shuffledMembers.map(memberId => {
        pos = pos+1
        return {
            userId: memberId,
            position: pos,
            madeInAdvance: false
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
                foundMember = members.find(member => { return member.userId == user._id })
                return {
                    userId: user._id,
                    nickname: user.nickname,
                    position: foundMember.position,
                    madeInAdvance: foundMember.madeInAdvance
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
    Task.findOne({_id: req.params.id })
        .then(result => {
            var inCharge
            var inChargeMember
            
            oldMembers = result.members
            oldMembersId = result.members.map(member => member.userId)
            newMembersId = req.body.members.map(element => element.id)
            oldInCharge = result.inCharge
            //remove the removed members
            filteredMembers = oldMembers.filter(member =>  newMembersId.includes(String(member.userId)))
            //make and shuffle list of members to be added
            membersIdToBeAdded = newMembersId.filter(id =>  !oldMembersId.includes(String(id)))
            var shuffledMembersIdToBeAdded
            if (membersIdToBeAdded.length != 0) {
                shuffledMembersIdToBeAdded = shuffle(membersIdToBeAdded)
            }
            //check if the member in charge still in the members list
            foundInCharge = newMembersId.find(element => { return element == oldInCharge })
            if(foundInCharge) { //member in charge still in the members list
                inCharge = oldInCharge
            } else { //member im charge isn't in the members list anymore
            //search for the position of the old member in charge
            oldInChargePos = oldMembers.find(element => { return String(element.userId) == oldInCharge}).position
            //get the next position, if it exists, otherwise, return null
            inChargeMember = getNextPosition(filteredMembers,oldInChargePos,oldMembers.length-1)
            }
            filteredMembersId = filteredMembers.map(member => member.userId)
            var newMembers

            if (!foundInCharge) { // the member in charge was removed
                if (!inChargeMember) { //all the members where changed
                    inCharge = membersIdToBeAdded[Math.floor(Math.random()*membersIdToBeAdded.length)]
                    let pos = -1        
                    newMembers = shuffledMembersIdToBeAdded.map(memberId => {
                        pos = pos+1
                        return {
                            userId: memberId,
                            position: pos,
                            madeInAdvance: false
                        }
                    })
                } else { //the member in charge was removed and the next in the queue was found
                    inCharge = inChargeMember.userId
                    if(membersIdToBeAdded.length != 0) { // there are members to be added
                        inChargeIndex = filteredMembersId.findIndex(id => String(id) == inCharge)
                        Array.prototype.splice.apply(filteredMembersId, [inChargeIndex, 0].concat(shuffledMembersIdToBeAdded))
                    }
                    let pos = -1      
                    newMembers = filteredMembersId.map(memberId => {
                        pos = pos+1
                        return {
                            userId: memberId,
                            position: pos,
                            madeInAdvance: false
                        }
                    })
                }
            } else { // the member in charge was not removed
                if(membersIdToBeAdded.length != 0) { // there are members to be added
                    inChargeIndex = filteredMembersId.findIndex(id => String(id) == inCharge)
                    Array.prototype.splice.apply(filteredMembersId, [inChargeIndex, 0].concat(shuffledMembersIdToBeAdded))
                }
                let pos = -1        
                newMembers = filteredMembersId.map(memberId => {
                    pos = pos+1
                    return {
                        userId: memberId,
                        position: pos,
                        madeInAdvance: false
                    }
                })
            }

            const task = new Task({
                _id: req.params.id,
                name: req.body.name,
                description: req.body.description,
                inCharge: inCharge,
                members: newMembers
            });
            Task.updateOne({ _id: req.params.id }, task)
                .then(() => {
                    User.find({_id: newMembersId}).then(result => {
                        membersData = result.map(user => {
                            foundMember = newMembers.find(member => { 
                                return String(member.userId) == String(user._id) })
                            return {
                                userId: user._id,
                                nickname: user.nickname,
                                position: foundMember.position,
                                madeInAdvance: foundMember.madeInAdvance
                            }
                        })
                        res.status(201).json({
                            taskId: task._id,
                            inCharge: task.inCharge,
                            members: membersData,
                            message: 'Tarefa atualizada com sucesso!'
                        });
                    })
                })
                .catch(error => {
                    res.status(500).json({
                        message: 'Não foi possível atualizar as configurações da tarefa!'
                    });
                });
        })
        .catch(error => {
            res.status(500).json({
                message: 'Não foi possível atualizar as configurações da tarefa!'
            });
        })
}

exports.getTasks = (req, res, next) => {
    Task.find().populate({path: 'members.userId', select: '_id nickname', model: User}).then(tasks => {
        let mappedTasks = tasks.map(task => {
            let members = task.members.map(member => {
                return {
                    userId: member.userId._id,
                    nickname: member.userId.nickname,
                    position: member.position,
                    madeInAdvance: member.madeInAdvance
                }
            })
            return {
                _id: task._id,
                name: task.name,
                description: task.description,
                inCharge: task.inCharge,
                members: members
            }
        })
        res.status(201).json({
            tasks: mappedTasks,
            message: 'Tarefas obtidas com sucesso!'
        });
    })
    .catch(error => {
        res.status(500).json({
            message: 'Não foi possível obter a lista de tarefas'
        });
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
    Task.deleteOne({ _id: req.params.id })
        .then(result => {
            res.status(200).json({ message: 'Tarefa apagada!' });
        })
        .catch( error => {      
            res.status(500).json({
                message: 'Não foi possível apagar a tarefa!'
            })
        });  
}

exports.makeTask = (req, res, next) => {
    if (req.body.userId != req.userData.userId && req.userData.admin != true) {
        return res.status(401).json({message: "Auth failed"}); 
    } 

    Task.findOne({ _id: req.body.taskId})
        .then(foundTask => {
            if(foundTask.inCharge == req.body.userId) { //just normal make task
                member = foundTask.members.find(member => {return String(member.userId) == req.body.userId})
                position = member.position
                newInChargeFound = false
                inAdvanceJumpedIds = [];
                while(!newInChargeFound) {
                    if(position < foundTask.members.length-1) position = position+1
                    else position = 0
                    tempInChargeIndex = foundTask.members.findIndex(member => {return member.position == position})
                    if(foundTask.members[tempInChargeIndex].madeInAdvance == true){
                        foundTask.members[tempInChargeIndex].madeInAdvance = false
                        inAdvanceJumpedIds.push(foundTask.members[tempInChargeIndex].userId)
                    } else {
                        newInChargeId = foundTask.members[tempInChargeIndex].userId
                        newInChargeFound = true
                    }
                }
                foundTask.inCharge = newInChargeId
            } else {
                res.status(500).json({message: 'Não é a vez do usuário!'})
            }
            Task.updateOne({_id: foundTask._id}, foundTask).then(result => {
                taskExec = new TaskExecution({userId: req.body.userId, 
                    taskId: req.body.taskId, 
                    executionTime: req.body.date, 
                    creator: req.userData.userId,
                    make: true,
                    inAdvance: false})
                taskExec.save().then(() => {
                    res.status(200).json({ message: 'Tarefa atualizada', inCharge: foundTask.inCharge, jumpedIds: inAdvanceJumpedIds })
                    }).catch( error => {
                        res.status(500).json({ message: 'Não foi possível atualizada a tarefa!' })
                    })
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

exports.makeTaskinAdvance = (req, res, next) => {
    if (req.body.userId != req.userData.userId && req.userData.admin != true) {
        return res.status(401).json({message: "Auth failed"}); 
    }
    Task.findOne({ _id: req.body.taskId})
        .then(foundTask => {
            if(foundTask.inCharge == req.body.userId) {
                res.status(500).json({message: 'É a vez do usuário!'})
            } else { //make task in advance
                memberIndex = foundTask.members.findIndex(member => {return String(member.userId) === String(req.body.userId)})
                if(memberIndex != undefined){
                    foundTask.members[memberIndex].madeInAdvance = true
                } else {
                    res.status(500).json({message: 'Não foi possível atualizada a tarefa!'})
                }
            }
            Task.updateOne({_id: foundTask._id}, foundTask).then(result => {
                taskExec = new TaskExecution(
                                            {userId: req.body.userId, 
                                            taskId: req.body.taskId, 
                                            executionTime: req.body.date, 
                                            creator: req.userData.userId,
                                            make: true,
                                            inAdvance: true})
                taskExec.save().then(() => {
                    res.status(200).json({ message: 'Tarefa atualizada', inAdvanceId: req.body.userId })
                }).catch( error => {
                    res.status(500).json({ message: 'Não foi possível atualizada a tarefa!' })
                })
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

exports.unmakeTask = (req, res, next) => {
    if (req.body.userId != req.userData.userId && req.userData.admin != true) {
        return res.status(401).json({message: "Auth failed"}); 
    } 
    
    Task.findOne({ _id: req.body.taskId})
        .then(foundTask => {
            if(foundTask.inCharge == req.body.userId) {
                member = foundTask.members.find(member => {return member.userId == req.body.userId})
                position = member.position
                newInChargePos = position-1
                newInChargeMember = foundTask.members.find(member => {return member.position == newInChargePos})
                if (newInChargeMember == undefined) {
                    newInChargeMember = foundTask.members.find(member => {return member.position == foundTask.members.length-1})
                }
                newInChargeId = newInChargeMember.userId
                foundTask.inCharge = newInChargeId
            } else { 
                res.status(500).json({message: 'Não é a vez do usuário!'})
            }
            return foundTask
        }).then(task=> {
            Task.updateOne({_id: task._id}, task).then(result => {
                taskExec = new TaskExecution({userId: req.body.userId, 
                                            taskId: req.body.taskId, 
                                            executionTime: req.body.date, 
                                            creator: req.userData.userId,
                                            make: false,
                                            inAdvance: false})                      
                taskExec.save().then(() => {
                    res.status(200).json({ message: 'Tarefa atualizada', inCharge: task.inCharge })
                    }).catch( error => {
                        res.status(500).json({ message: 'Não foi possível atualizada a tarefa!' })
                    })
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

exports.unmakeTaskinAdvance = (req, res, next) => {
    if (req.body.userId != req.userData.userId && req.userData.admin != true) {
        return res.status(401).json({message: "Auth failed"}); 
    }
    Task.findOne({ _id: req.body.taskId})
        .then(foundTask => {
            if(foundTask.inCharge == req.body.userId) {
                res.status(500).json({message: 'É a vez do usuário!'})
            } else { //make task in advance
                memberIndex = foundTask.members.findIndex(member => {return String(member.userId) === String(req.body.userId)})
                if(memberIndex != undefined){
                    foundTask.members[memberIndex].madeInAdvance = false
                } else {
                    res.status(500).json({message: 'Não foi possível atualizada a tarefa!'})
                }
            }
            Task.updateOne({_id: foundTask._id}, foundTask).then(result => {
                taskExec = new TaskExecution(
                                            {userId: req.body.userId, 
                                            taskId: req.body.taskId, 
                                            executionTime: req.body.date, 
                                            creator: req.userData.userId,
                                            make: true,
                                            inAdvance: true})
                taskExec.save().then(() => {
                    res.status(200).json({ message: 'Tarefa atualizada', inAdvanceId: req.body.userId })
                }).catch( error => {
                    res.status(500).json({ message: 'Não foi possível atualizada a tarefa!' })
                })
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

function shuffle(array) {
    var currentIndex = array.length, temporaryValue, randomIndex;
  
    // While there remain elements to shuffle...
    while (0 !== currentIndex) {
  
      // Pick a remaining element...
      randomIndex = Math.floor(Math.random() * currentIndex);
      currentIndex -= 1;
  
      // And swap it with the current element.
      temporaryValue = array[currentIndex];
      array[currentIndex] = array[randomIndex];
      array[randomIndex] = temporaryValue;
    }
  
    return array;
  }


function getNextPosition(arr, value, maxPosition) {
    var len = arr.length;
    var i;
    var smallest = maxPosition;
    var smallestId;
    var closest = maxPosition
    var closestId;

    existMaxPos = arr.find(element => {return element.position == maxPosition})

    for (i=0; i < len; i++) {
        if (arr[i].position < smallest) {
            smallest = arr[i].position
            smallestId = arr[i].userId
        }
        if (arr[i].position > value && arr[i].position < closest) {
            closest = arr[i].position
            closestId = arr[i].userId
        }
    }
 
    if (closest != maxPosition) {
        return {userId: closestId, position: closest}
    } else if (existMaxPos) {
        return {userId: existMaxPos.userId, position: existMaxPos.position}
    } else if (smallest != maxPosition) {
        return {userId: smallestId, position: smallest}
    } else {
        return undefined
    }
}