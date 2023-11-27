const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
require('dotenv').config();
const { MongoClient, ServerApiVersion } = require('mongodb');
const app = express();
const port = process.env.PORT || 3000;


// Middleware
app.use(express.json());
app.use(cors());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@learning.axf2sgn.mongodb.net/?retryWrites=true&w=majority`;

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    // await client.connect();

    
    const database = client.db("medicamp")
    const usersCollection = database.collection("users");
    const campsCollection = database.collection("camps");


    app.post('/jwt', async(req, res)=>{
      const user = req.body;
      const token = jwt.sign(user, process.env.ACCESS_TOKEN, {expiresIn: 3600000})
      res.send({token});
    });

    const verifyToken = (req, res, next) => {
      if(!req.headers.authorization){
        return res.status(401).send({message: "unauthorized access"});
      }
      const token = req.headers.authorization.split(' ')[1];
      jwt.verify(token, process.env.ACCESS_TOKEN, (err, decoded) => {
        if(err){
          return res.status(401).send({message: "unauthorized access"})
        }
        req.decoded = decoded;
        next();
      });
    }

    app.post('/users', async(req, res)=>{
      const user = req.body;
      const result = await usersCollection.insertOne(user);
      res.send(result);
    })

    app.get('/users', async(req, res) => {
      const result = await usersCollection.find().toArray();
      res.send(result)
    });
    app.get('/users/:email', async(req, res) => {
      const email = req.params.email;
      const query = {email: email};
      const result = await usersCollection.findOne(query);
      res.send(result)
    });

    app.patch('/users/:email', verifyToken, async(req, res) => {
      const data = req.body;
      const email = req.params.email;
      const filter = {email: email};
      const updateDoc = {
        $set: {
          address: data.address,
          contact_email: data.contact_email,
          organization_name: data.organization_name,
          phone: data.phone,         
        }
      }
      const result = await usersCollection.updateOne(filter, updateDoc);
      res.send(result);
    });

    app.post('/camps', async(req, res) => {
      const user = req.body;
      const result = await campsCollection.insertOne(user);
      res.send(result);
    });

    app.get('/camps', async(req, res) => {
      const result = await campsCollection.find().toArray();
      res.send(result)
    });


    // await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // await client.close();
  }
}
run().catch(console.dir);



app.get('/', (req, res) => {
  res.send("Welcome to MediCamp Server");
})

app.listen(port, (req, res) => {
  console.log(`The server is listening ${port}`);
});