const internModel = require('../models/internModels');
const collegeModel = require('../models/collegeModel');
const mongoose = require('mongoose');
const validators = require('../validations/validations')


//==============================CREATE COLLEGE=================================================

const createCollege = async function(req,res){
    try {
        let data = req.body
    if(Object.keys(data).length==0) return res.status(400).send({status:false,msg:"Enter the details"})
    if(!data.name) return res.status(400).send({status:false,msg:"Name is mandatory"})
    if(!data.fullName) return res.status(400).send({status:false,msg:"Full name is mandatory"})
    if(!data.logoLink) return res.status(400).send({status:false,msg:"Logo link is mandatory"})
    if(!validators.isValidName(data.name)) res.status(400).send({status:false,msg:"enter valid name"})
    if(!validators.isValidName(data.fullName)) res.status(400).send({status:false,msg:"enter valid fullName"})
    let findName = await collegeModel.findOne({name:data.name})
    if(findName) return res.status(400).send({status:false,msg:"name already taken"})
    if(!(validators.isValidLink(data.logoLink)&&validators.isValidFormat(data.logoLink))) return res.send("invalid logo link")
    let newData = await collegeModel.create(data)
    return res.status(201).send({status:true,Data:newData})
} 
catch (error) {
        return res.status(500).send({status:false, message:error.message})
}
}
//===========================CREATE INTERN==================================================

const createIntern = async function(req,res){
    try{
        const data = req.body;
    if(Object.keys(data).length==0) return res.status(400).send({sattus:false,message:"Please provide some Data"});
    if(!data.name) return res.status(400).send({sattus:false,message:"Please provide name"});
    if(!data.email) return res.status(400).send({sattus:false,message:"Please provide email"});
    if(!data.mobile) return res.status(400).send({sattus:false,message:"Please provide mobile"});
    if(!data.collegeName) return res.status(400).send({sattus:false,message:"Please provide collegeName"});
    data.collegeName = data.collegeName.toLowerCase()
    if(!validators.isValidEmail(data.email)) return res.status(400).send({sattus:false,message:"Invalid email"});
    if(!validators.isValidName(data.name)) return res.status(400).send({sattus:false,message:"Invalid name"})
    if(!validators.isValidMobile(data.mobile)) return res.status(400).send({sattus:false,message:"Invalid mobile"});
    let internByEmail= await internModel.findOne({email:data.email})
    if(internByEmail) return res.status(400).send({sattus:false,message:"email is already in use"});
    let internByMobile= await internModel.findOne({mobile:data.mobile}) 
    if(internByMobile) return res.status(400).send({sattus:false,message:"mobile is already in use"});
   
    let college = await collegeModel.findOne({name: data.collegeName})

    if(!college) return res.status(400).send({sattus:false,message:"No such college"});
    data.collegeId = college._id;
    const createdIntern = await internModel.create(data)
    res.status(201).send({satus:true,data:createdIntern})
} catch(error){
    res.status(500).send({status:false,message:error.message})
}   
}
//======================================GET COLLEGE DETAILS========================================================

const collegeDetails = async function (req, res) {
    try {
      let queryParams = req.query.collegeName;
      if (!queryParams) {
        return res
          .status(400)
          .send({ status: false, message: "Enter a Query params" });
      } 
      let collegeData = await collegeModel.findOne({ name: queryParams }).select({name: 1,fullName:1,logoLink:1});
      if (!collegeData){
        return res
          .status(404)
          .send({ status: false, message: "no college found" });
      }
      if(collegeData.isDeleted==true) return res.status(404).send({status:false,message:"No college found"}) 
      collegeData = collegeData.toObject();
      
      let appliedIntern = await internModel.find({ $and:[{collegeId: collegeData._id},{isDeleted:false}] });
      if (!appliedIntern) {
        return res.status(404).send({ message: "no candidate applied" });
      }
      if(appliedIntern.length==0) collegeData.interns = "No interns yet";
      if(appliedIntern.length!=0) collegeData.interns = appliedIntern;
      delete(collegeData._id)
      return res.status(200).send({ data: collegeData });
    } catch (error) {
      return res.status(500).send({ status: false, message: error.message });
    }
  };
//===================================================================================================

module.exports.createCollege = createCollege;

module.exports.createIntern = createIntern;

module.exports.collegeDetails = collegeDetails;
