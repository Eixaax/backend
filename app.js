const express = require("express");
const app = express();
const mongoose = require ("mongoose");
app.use(express.json());
const bcrypt=require("bcryptjs");
const jwt=require('jsonwebtoken');
require('./UserDetails')
const User=mongoose.model("UserInfo");
const AudioRecordings = require('./AudioRecordings'); // Import the model

const { Buffer } = require('buffer');

const cors = require('cors');
app.use(cors());

const mongoUrl="mongodb+srv://isa:admin@cluster0.v0xnx.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0"

const JWT_SECRET = "a9f8b27c9d3e4f5b6c7d8e9f1029384756c7d8e9f1029384756a7b8c9d0e1f2";


mongoose.connect(mongoUrl).then(()=>{
    console.log("database Connected");
})
.catch((e) => {
    console.log(e);
});

app.get("/",(req,res)=>{
    res.send({status:"started"})
}) 

app.post('/register',async (req,res)=>{
    const {name,email,password} = req.body;

    const oldUser = await User.findOne ({email:email});

    if (oldUser){
        return res.send({data: "User Already Exists!"});
    }


    const encryptedPassword = await bcrypt.hash(password, 10);

    
    try{
        await User.create({
            name:name,
            email:email,
            password: encryptedPassword,
        });
        res.send({status:"ok",data:"User Created"})
    } catch (error) {
        res.send ({ status: "error", data: error});
    }
});

app.post("/login-user",async(req,res) => {
    const { email,password } = req.body;
    const oldUser = await User.findOne({ email: email});

    if(!oldUser){
        return res.send({data:"User Doesn't Exist!"})
    }

    if(await bcrypt.compare(password,oldUser.password)){
        const token = jwt.sign({email:oldUser.email},JWT_SECRET);
        if (res.status(201)){
            return res.send({ status: "ok", data: token});
        
        } else{
            return res.send ({ error: "error"});
        }
    }
});

app.post("/userdata", async(req,res)=>{
    const{token}=req.body;
    try{
        const user = jwt.verify(token,JWT_SECRET)
        const useremail = user.email;

        User.findOne({email:useremail}).then(data =>{
            return res.send({status: "ok", data: data});
        })
    } catch (error){
        return res.send({ error: error});
    }
})

app.listen(5001,()=>{
    console.log("NODE JS SERVER STARTED.");
})

app.get('/all-users', async (req, res) => {
    try {
        const users = await User.find();  // Fetch all users
        console.log(users)
        res.send({ status: "ok", data: users });
    } catch (error) {
        res.send({ status: "error", error: error.message });
    }
});


app.post('/upload-recording', async (req, res) => {
    const { audioData, fileName, userId } = req.body;
    try {
      const audioBuffer = Buffer.from(audioData, 'base64');
      const newAudioRecording = new AudioRecordings({
        userId: userId,
        fileName: fileName,
        audioData: audioBuffer
      });
  
      await newAudioRecording.save();
  
      res.json({ status: 'ok' });
    } catch (error) {
      res.status(500).json({ status: 'error', error: error.message });
    }
  });


  app.post('/recordings', async (req, res) => {
    const { userId } = req.body; // Extract userId from the request body
  
    if (!userId) {
      return res.status(400).json({ status: 'error', error: 'User ID is required' });
    }
  
    try {
      // Find recordings associated with the user
      const recordings = await AudioRecordings.find({ userId }).exec();
  
      const recordingsWithUri = recordings.map((recording) => ({
        ...recording.toObject(),
        uri: `http://192.168.1.99:5001/audio/${recording._id}`, 
      }));
  
      res.json({ recordings: recordingsWithUri });
    } catch (error) {
      res.status(500).json({ status: 'error', error: error.message });
    }
  });

  app.get('/audio/:id', async (req, res) => {
    const { id } = req.params;
  
    try {
      const recording = await AudioRecordings.findById(id).exec();
      if (!recording) {
        return res.status(404).json({ error: 'Recording not found' });
      }
  
      res.set('Content-Type', 'audio/wav'); // Adjust MIME type based on file type
      res.send(recording.audioData); // Send audio data buffer directly
    } catch (error) {
      res.status(500).json({ error: 'Error serving the audio file' });
    }
  });


