var express = require("express");
const cors=require("cors")

var app = express();
app.use(express.json());
app.use(function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, , authorization"
  );
  res.header("Access-Control-Allow-Methods", "GET,POST,DELETE,PUT,OPTIONS");
  next();
});

var port=process.env.PORT||2410
app.listen(port, () => console.log(`Node app listening on port ${port}!`));

const cookieParser = require('cookie-parser');
app.use(cookieParser());
app.use(cors({credentials:true,origin:true}))
let{employees}=require("./data.js");

app.post("/login",function(req,res){
  let {empCode,name}=req.body
  let {tracker=[]}=req.cookies
  if(!tracker){ 
    tracker.push({user:"Guest",url:"/login",date:Date.now()})
  }else{
    tracker.push({user:name,url:"/login",date:Date.now()})
  }
    res.cookie("tracker",tracker,{maxAge:300000})
  let index=employees.findIndex((a)=>a.name==name&&a.empCode==empCode)
  if(index>=0){
    let userData={empCode:empCode,name:name,designation:employees[index].designation}
    res.cookie("userData",userData,{maxAge:300000})
    res.send(userData)
  }
  else{
    res.status(400).send("Invalid EmpCode or Name")
  }
})

app.delete("/logout",function(req,res){
  res.clearCookie("userData")
  res.send("Logged Out")
})

app.get("/myDetails",function(req,res){
  let {userData,tracker=[]}=req.cookies
  if(!userData){
    res.status(403).send("Please Login First")
  }else{
    let {empCode,name}=userData
    let user=employees.find((a)=>a.name==name&&a.empCode==empCode)
    tracker.push({user:name,url:"/myDetails",date:Date.now()})
    res.cookie("tracker",tracker,{maxAge:300000})

    res.send(user)
  }
})

app.get("/company",function(req,res){
  let {tracker=[],userData}=req.cookies
  if(!tracker){ 
    tracker.push({user:"Guest",url:"/company",date:Date.now()})
  }else{
    if(!userData){
      tracker.push({user:"Guest",url:"/company",date:Date.now()})
    }
    else{
      tracker.push({user:userData.name,url:"/company",date:Date.now()})
    }
    
  }
  
  res.cookie("tracker",tracker,{maxAge:300000})
  res.send("Welcome to the Employee Portal of XYZ Company")
})

app.get("/myJuniors",function(req,res){
  let {userData,tracker=[]}=req.cookies
  if(!userData){
    res.status(403).send("Please Login First")
  }
  else{
    let {empCode,name}=userData
    let user=employees.find((a)=>a.name==name&&a.empCode==empCode)
    tracker.push({user:name,url:"/myJunior",date:Date.now()})
    res.cookie("tracker",tracker,{maxAge:300000})
    let {designation}=user
    if(designation=="VP"){
      let arr=employees.filter((a)=>a.designation!=="VP")
      res.send(arr)
    }
    if(designation=="Manager"){
      let arr=employees.filter((a)=>a.designation==="Trainee")
      res.send(arr)
    }
    else{
      res.send("There is No Junior")
    }
  }
})