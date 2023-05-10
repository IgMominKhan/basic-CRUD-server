import express from "express";
import cors from "cors";
import { MongoClient, ObjectId, ServerApiVersion } from "mongodb";
// import { connect } from "http2";

const app = express();

const port = process.env.PORT || 8080;

// middlewares
app.use(cors());
app.use(express.json());

const uri =
  "mongodb+srv://<usesrname>:<password>@cluster0.xfw1t3g.mongodb.net/?retryWrites=true&w=majority";
// create mongo client
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

// connect with database
(async () => {
  try {
    // connect with mongodb
    await client.connect(uri);
    // check is connection success
    await client.db("admin").command({ ping: 1 });
    console.log("basic-crud-server is connected with Mongodb");

    const db = client.db("ph-crud-db");
    const userCollection = db.collection("users");

    // handle get request
    app.get("/", (req, res) => {
      res.send(`basic-crud-server is running on port ${port}`);
    });

    app.get("/users", async (req, res) => {
      const cursor = userCollection.find();
      const userResult = await cursor.toArray(); //  console.log(userResult);
      res.send(userResult);
    });

    // handle post request on users route
    app.post("/users", async (req, res) => {
      const data = req.body; // console.log(data);

      // add users info to Db
      const result = await userCollection.insertOne(data);

      // send responce message to client
      res.send(result);
    });

    // send single user
    app.get("/user/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };

      const result = await userCollection.findOne(query);
      res.send(result);
    });

    // update user
    app.put("/user/:id", async (req, res) => {
      const _id = req.params.id;
      const data = req.body;
      const { name, email } = req.body;
      console.log(_id, data);

      const query = { _id: new ObjectId(_id) };

      const result = await userCollection.updateOne(query, {
        $set: {
          name: name,
          email: email,
        },
      });

      res.send(result);
    });

    // delete user
    app.delete("/user/:id", async (req, res) => {
      const id = req.params.id;
      const query = {
        _id: new ObjectId(id),
      };
      const result = await userCollection.deleteOne(query);

      res.send(result);
    });
  } finally {
    // Ensures that the client will close when you finish/error
    //await client.close();
  }
})().catch(console.dir);

//

app.listen(port, () =>
  console.log(`basic-crud-server is running on port ${port}`)
);
