const express = require('express');
const cors = require('cors');
const port = process.env.PORT || 5000;
const jwt = require('jsonwebtoken');
require('dotenv').config();
const { MongoClient, ServerApiVersion } = require('mongodb');

const app = express();

//middleware
app.use(cors());
app.use(express.json());






const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.iykcv1w.mongodb.net/?retryWrites=true&w=majority`;
console.log(uri)
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

async function run(){
    try{
   const usersCollection = client.db('recycleBasket').collection('users');
   const collectionsCollection = client.db('recycleBasket').collection('collections');

   app.get('/users',async(req,res)=>{
      const query ={};
      const users = await usersCollection.find(query).toArray();
      res.send(users);
     })

   app.post('/users', async(req,res)=>{
      const user = req.body;
      console.log(user);
      const result = await usersCollection.insertOne(user);
      res.send(result);
   })

//------jwt-----
 app.get('/jwt',async(req,res)=>{
      const email = req.query.email;
      const query= {email:email};
      const user = await usersCollection.findOne(query);
      if(user){
            const token = jwt.sign({email}, process.env.ACCESS_TOKEN,{expiresIn:'24hr'});
            return res.send({accessToken:token});
      }
      console.log(user);
      res.status(403).send('Unauthorized Access');
 })

 //---- --Collections------
 
 app.get('/collections',async(req,res)=>{
      const query ={};
      const allCollection = await collectionsCollection.find(query).toArray();
      res.send(allCollection);
     })


    }
    finally{

    }
}
run().catch(console.log)




app.get('/',async(req,res)=>{
      res.send('Recycle Basket is running')
});

app.listen(port,()=> console.log(`Recycle Basket is running on ${port}`))