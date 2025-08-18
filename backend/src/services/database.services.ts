import { Collection, Db, MongoClient } from 'mongodb'
import { config } from 'dotenv'
import User from '~/models/schemas/User.schema'
import RefreshToken from '~/models/schemas/RefreshToken.schema'

config()
const uri = `mongodb+srv://${process.env.DB_USERNAME}:${process.env.DB_PASSWORD}@cluster0.w4ms8ju.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`

class DatabaseService {
  private client: MongoClient
  private db: Db

  constructor() {
    this.client = new MongoClient(uri)
    this.db = this.client.db(`${process.env.DB_NAME}`)
  }

  async connect() {
    try {
      await this.db.command({ ping: 1 })
      console.log('Pinged your deployment. You successfully connected to MongoDB!')
    } catch (error) {
      console.error('Unable to ping your mongoDB. Check your connection and try again.')
      console.error('Error details:', error instanceof Error ? error.message : JSON.stringify(error))
    }
  }
  get users(): Collection<User> {
    return this.db.collection(process.env.USERS_COLLECTION as string)
  }
  get products(): Collection<any> {
    return this.db.collection(process.env.PRODUCTS_COLLECTION as string)
  }
  get orders(): Collection<any> {
    return this.db.collection('orders')
  }
  get refreshToken(): Collection<RefreshToken> {
    return this.db.collection(process.env.REFRESH_TOKEN_COLLECTION as string)
  }
}

// Create a new instance of the DatabaseService class
const databaseService = new DatabaseService()
export default databaseService
