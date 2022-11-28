const express = require('express');
const cors = require('cors');
const port = process.env.PORT || 5000;
const jwt = require('jsonwebtoken');

const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
require('dotenv').config();
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');

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
   const productsCollection = client.db('recycleBasket').collection('products');
   const bookingsCollection = client.db('recycleBasket').collection('bookings');

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
     });
     ///-----------------------------//
//--------------Products-----------------//
     app.get('/products',async(req,res)=>{
      const query={};
      const allProducts = await productsCollection.find(query).toArray();
      res.send(allProducts);
     })

     app.get('/products/:category',async(req,res)=>{
      const category = req.params.category;
      
      const query= {category:category}
      const result= await productsCollection.find(query).toArray();
      res.send(result);
     })


  app.get('/product/:id',async(req,res)=>{
      const id = req.params.id;
      console.log(id)
      const query = {_id:ObjectId(id)}
      const result= await productsCollection.find(query).toArray();
      res.send(result);
  })

  app.get('/product',async(req,res)=>{
    const email = req.query.email;
    const query= {email:email};
    const prod = await productsCollection.find(query).toArray();
    
    res.send(prod);
})
  app.post('/products',async(req,res)=>{
      const addProduct = req.body;
      const result= await productsCollection.insertOne(addProduct);
      res.send(result);
  })

  app.delete('/product/:id', async(req,res)=>{
    const id = req.params.id;
    const filter = { _id : ObjectId(id)};
    const result = await productsCollection.deleteOne(filter);
    res.send(result);
  })

  //------------------------------------//
  //----------users eamil-------------------//
  app.get('/users/:email',async(req,res)=>{
      const email = req.params.email;
      const query= {email:email};
      const user = await usersCollection.findOne(query);
      
      res.send(user);
  })
  app.get('/user/:role',async(req,res)=>{
      const role = req.params.role;
      const query= {role:role};
      const user = await usersCollection.find(query).toArray();
      
      res.send(user);
  })

  app.delete('/user/:id', async(req,res)=>{
    const id = req.params.id;
    const filter = { _id : ObjectId(id)};
    const result = await usersCollection.deleteOne(filter);
    res.send(result);
  })
///-----------------------------------------//
  //--------------Bookings------------------//
  app.get('/bookings',async(req,res)=>{
      const query ={};
      const allBookings = await bookingsCollection.find(query).toArray();
      res.send(allBookings);
  })

  app.post('/bookings',async(req,res)=>{
      const booking = req.body;
      console.log(booking);
      const result = await bookingsCollection.insertOne(booking);
      res.send(result);
  })
  app.get('/booking',async(req,res)=>{
    const email = req.query.email;
    const query= {email:email};
    const result = await bookingsCollection.find(query).toArray();
    
    res.send(result);
  })
  app.get('/bookings/:id',async (req,res)=>{
    const id = req.params.id;
    const query ={_id: ObjectId(id)};
    const booking = await bookingsCollection.findOne(query);
    res.send(booking);
  })

  //-------------------payment--------------//
  app.post('/create-payment-intent', async(req,res)=>{
    const booking = req.body;
    const price = booking.price;
    const amount = price * 100;

    const paymentIntent = await stripe.paymentIntents.create({
      currency:'usd',
      amount: amount,
      'payment_method_types':[
        "card"
      ]
    });
    res.send({
      clientSecret: paymentIntent.client_secret,
    })
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