import EventEmitter from "node:events";
import {
  Chat,
  Challenge,
  Pages,
  RaceSession,
  Race,
  chatSchema,
  challengeSchema,
  pageSchema,
  raceSessionSchema,
  raceSchema,
} from "../../models/Models.ts";
import { TrainingEvent } from "../../models/TrainingEvent.ts";
import dotenv from "dotenv";
import {
  Document,
  InferSchemaType,
  Query,
  QueryOptions,
  SortOrder,
  SortValues,
  UpdateWriteOpResult,
} from "mongoose";
import { GymVPS, gymVPSSchema } from "../../models/GymVPS.ts";

export type ChallengeDocument = InferSchemaType<typeof challengeSchema>;
export type ChatDocument = InferSchemaType<typeof chatSchema>;
export type PageDocument = InferSchemaType<typeof pageSchema>;
export type RaceSessionDocument = InferSchemaType<typeof raceSessionSchema>;
export type RaceDocument = InferSchemaType<typeof raceSchema>;
export type GymVPSDocument = InferSchemaType<typeof gymVPSSchema>;

dotenv.config();

class DataBaseService extends EventEmitter {
  constructor() {
    // Constructor remains empty as we don't need initialization logic
    super();
  }

  // Challenge-related methods
  async getAllChallenges(): Promise<
    InferSchemaType<typeof challengeSchema>[] | false
  > {
    try {
      return (
        (await Challenge.find(
          {},
          {
            _id: 1,
            title: 1,
            label: 1,
            task: 1,
            level: 1,
            model: 1,
            image: 1,
            pfp: 1,
            status: 1,
            name: 1,
            deployed: 1,
            idl: 1,
            tournamentPDA: 1,
            entryFee: 1,
            characterLimit: 1,
            contextLimit: 1,
            chatLimit: 1,
            initial_pool_size: 1,
            expiry: 1,
            developer_fee: 1,
          }
        )) || false
      );
    } catch (error) {
      console.error("Database Service Error:", error);
      return false;
    }
  }

  async getChallengeById(
    id: string,
    projection = {}
  ): Promise<ChallengeDocument | null> {
    try {
      return await Challenge.findOne({ _id: id }, projection);
    } catch (error) {
      console.error("Database Service Error:", error);
      return null;
    }
  }

  async getChallengeByName(
    name: string,
    projection = {}
  ): Promise<ChallengeDocument | false> {
    const nameReg = { $regex: name, $options: "i" };
    try {
      return (await Challenge.findOne({ name: nameReg }, projection)) || false;
    } catch (error) {
      console.error("Database Service Error:", error);
      return false;
    }
  }

  async updateChallenge(
    id: string,
    updateData: object
  ): Promise<UpdateWriteOpResult | false> {
    try {
      return await Challenge.updateOne({ _id: id }, { $set: updateData });
    } catch (error) {
      console.error("Database Service Error:", error);
      return false;
    }
  }

  // Chat-related methods
  async createChat(chatData: ChatDocument): Promise<ChatDocument | false> {
    try {
      this.emit("new-chat", chatData);
      return await Chat.create(chatData);
    } catch (error) {
      console.error("Database Service Error:", error);
      return false;
    }
  }

  async getChatHistory(
    query: QueryOptions,
    sort: { [key: string]: SortOrder } = { date: -1 },
    limit = 0
  ): Promise<ChatDocument[] | false> {
    try {
      return await Chat.find(query)
        .sort(sort)
        .limit(limit)
        .select("role content screenshot date address -_id");
    } catch (error) {
      console.error("Database Service Error:", error);
      return false;
    }
  }

  async getFullChatHistory(
    query: QueryOptions,
    projection: object,
    sort: { [key: string]: SortOrder } = { date: -1 },
    limit = 0
  ): Promise<InferSchemaType<typeof chatSchema>[] | false> {
    try {
      return await Chat.find(query, projection).sort(sort).limit(limit);
    } catch (error) {
      console.error("Database Service Error:", error);
      return false;
    }
  }

  async getChatCount(query: QueryOptions): Promise<number | false> {
    try {
      return await Chat.countDocuments(query);
    } catch (error) {
      console.error("Database Service Error:", error);
      return false;
    }
  }

  async findOneChat(query: QueryOptions): Promise<ChatDocument | false> {
    try {
      return (await Chat.findOne(query)) || false;
    } catch (error) {
      console.error("Database Service Error:", error);
      return false;
    }
  }
  async getPages(query: QueryOptions): Promise<PageDocument[] | undefined> {
    try {
      return await Pages.find(query);
    } catch (error) {
      console.error("Database Service Error:", error);
    }
  }
  // Settings-related methods
  async getSettings(): Promise<ChallengeDocument[] | undefined> {
    try {
      const challenge = await Challenge.find(
        {},
        {
          _id: 0,
          id: "$_id",
          name: 1,
          title: 1,
          image: 1,
          label: 1,
          level: 1,
          status: 1,
          pfp: 1,
          entryFee: 1,
          expiry: 1,
          winning_prize: 1,
          developer_fee: 1,
          start_date: 1,
          winning_address: 1,
          winning_txn: 1,
        }
      );

      return challenge;
    } catch (error) {
      console.error("Database Service Error:", error);
    }
  }

  // Add these new methods
  async getUserConversations(
    address: string,
    skip = 0,
    limit = 20
  ): Promise<ChatDocument[] | false> {
    try {
      return await Chat.find(
        { address },
        {
          id: "$_id",
          content: 1,
          role: 1,
          address: 1,
          challenge: 1,
          date: 1,
          screenshot: 1,
        }
      )
        .skip(skip)
        .limit(limit);
    } catch (error) {
      console.error("Database Service Error:", error);
      return false;
    }
  }

  async getChallengeConversations(
    address: string,
    challenge: string,
    skip = 0,
    limit = 20
  ): Promise<ChatDocument[] | false> {
    try {
      return await Chat.find(
        { address, challenge },
        {
          _id: 0,
          content: 1,
          role: 1,
          address: 1,
          challenge: 1,
          date: 1,
          screenshot: 1,
        }
      )
        .skip(skip)
        .limit(limit);
    } catch (error) {
      console.error("Database Service Error:", error);
      return false;
    }
  }

  async getAllTournaments(): Promise<ChallengeDocument[] | false> {
    try {
      return await Challenge.find(
        {},
        {
          _id: 0,
          id: "$_id",
          title: 1,
          name: 1,
          description: 1,
          level: 1,
          status: 1,
          model: 1,
          expiry: 1,
          characterLimit: 1,
          contextLimit: 1,
          chatLimit: 1,
          initial_pool_size: 1,
          entryFee: 1,
          developer_fee: 1,
          // tools: 0,
          idl: 1,
        }
      );
    } catch (error) {
      console.error("Database Service Error:", error);
      return false;
    }
  }

  // Race session methods
  async createRaceSession(
    sessionData: RaceSessionDocument
  ): Promise<RaceSessionDocument | false> {
    try {
      return await RaceSession.create(sessionData);
    } catch (error) {
      console.error("Database Service Error:", error);
      return false;
    }
  }

  async getRaceSession(id: string): Promise<RaceSessionDocument | null> {
    try {
      return await RaceSession.findById(id);
    } catch (error) {
      console.error("Database Service Error:", error);
      return null;
    }
  }

  async updateRaceSession(
    id: string,
    updateData: Partial<RaceSessionDocument>
  ): Promise<RaceSessionDocument | null> {
    try {
      return await RaceSession.findByIdAndUpdate(id, updateData, { new: true });
    } catch (error) {
      console.error("Database Service Error:", error);
      return null;
    }
  }

  async getRaceById(id: string, projection = {}): Promise<RaceDocument | null> {
    try {
      return await Race.findOne({ id: id }, projection);
    } catch (error) {
      console.error("Database Service Error:", error);
      return null;
    }
  }

  async getRaces(): Promise<RaceDocument[] | false> {
    try {
      return await Race.find(
        {},
        {
          id: 1,
          title: 1,
          description: 1,
          category: 1,
          icon: 1,
          colorScheme: 1,
          prompt: 1,
          reward: 1,
          buttonText: 1,
          stakeRequired: 1,
        }
      );
    } catch (error) {
      console.error("Database Service Error:", error);
      return false;
    }
  }


  async getRaceSessions(): Promise<RaceSessionDocument[] | false> {
    try {
      return await RaceSession.find(
        { },
        {
          // id: "$_id",
          _id: 1,
          status: 1,
          challenge: 1,
          category: 1,
          video_path: 1,
          created_at: 1
        }
      )
      .sort({ created_at: -1 }); // Sort by newest first
    } catch (error) {
      console.error("Database Service Error:", error);
      return false;
    }
  }

  async getRaceSessionsByIds(ids: string[]): Promise<RaceSessionDocument[] | false> {
    try {

      
      console.log('Getting race sessions for IDs:', ids);
      const mongoose = await import('mongoose');
      const objectIds = ids.map(id => new mongoose.Types.ObjectId(id));
      console.log('Converted to ObjectIds:', objectIds);
      return await RaceSession.find(
        { _id: { $in: objectIds } },
        {
          _id: 1,
          status: 1,
          challenge: 1,
          category: 1,
          video_path: 1,
          created_at: 1
        }
      ).sort({ created_at: -1 });

      // console.log('Getting race sessions for IDs:', ids);
      // const allSessions = await this.getRaceSessions();
      // if (!allSessions) return false;

      // // Filter sessions by ID
      // const filteredSessions = allSessions.filter(session => {
      //   const sessionDoc = session as any;
      //   return ids.includes(sessionDoc._id?.toString());
      // });

      // console.log(`Found ${filteredSessions.length} matching sessions`);
      // return filteredSessions;
    } catch (error) {
      console.error("Database Service Error:", error);
      return false;
    }
  }

  // Training event methods
  async createTrainingEvent(eventData: any): Promise<any> {
    try {
      return await TrainingEvent.create(eventData);
    } catch (error) {
      console.error("Database Service Error:", error);
      return false;
    }
  }

  async getTrainingEvents(sessionId: string): Promise<any[]> {
    try {
      return await TrainingEvent.find({ session: sessionId }).sort({
        timestamp: 1,
      });
    } catch (error) {
      console.error("Database Service Error:", error);
      return [];
    }
  }

  async getTournamentById(id: string): Promise<ChallengeDocument | false> {
    try {
      return (
        (await Challenge.findOne(
          { _id: id },
          {
            _id: 0,
            id: "$_id",
            title: 1,
            name: 1,
            description: 1,
            level: 1,
            status: 1,
            model: 1,
            expiry: 1,
            characterLimit: 1,
            contextLimit: 1,
            chatLimit: 1,
            initial_pool_size: 1,
            entryFee: 1,
            developer_fee: 1,
            // tools: 0,
            idl: 1,
          }
        )) || false
      );
    } catch (error) {
      console.error("Database Service Error:", error);
      return false;
    }
  }

  async createTournament(
    tournamentData: ChallengeDocument
  ): Promise<ChallengeDocument | false> {
    try {
      const savedChallenge = new Challenge(tournamentData);
      await savedChallenge.save();
      return savedChallenge;
    } catch (error) {
      console.error("Database Service Error:", error);
      return false;
    }
  }

  async getHighestAndLatestScore(
    challengeName: string
  ): Promise<ChallengeDocument["scores"] | null> {
    try {
      const challenge = await Challenge.findOne({
        name: { $regex: challengeName, $options: "i" },
      });

      if (!challenge || !challenge.scores || challenge.scores.length === 0) {
        return null;
      }

      // Sort by score (descending) and timestamp (descending) to get highest score and most recent
      const sortedScores = challenge.scores.sort((a, b) => {
        if (b.score !== a.score) {
          return (b.score || 0) - (a.score || 0); // Sort by score first
        }
        return b.timestamp.getTime() - a.timestamp.getTime(); // If scores are equal, sort by timestamp
      });

      return sortedScores;
    } catch (error) {
      console.error("Database Service Error:", error);
      return null;
    }
  }

  // gym VPS stuff

  async saveGymVPS(data: GymVPSDocument): Promise<GymVPSDocument | void> {
    try {
      const res = await GymVPS.create(data);
      return res;
    } catch (error) {
      console.error("Database Service ERror:", error);
    }
  }

  async getOpenGymVPS(): Promise<GymVPSDocument | null> {
    try {
      const vps = await GymVPS.findOne({ status: "open" });
      return vps;
    } catch (error) {
      console.error("Database Service Error:", error);
      return null;
    }
  }

  async assignGymVPS(id: string, address: string): Promise<void> {
    try {
      await GymVPS.updateOne(
        { id: id },
        { $set: { address, status: "assigned" } }
      );
    } catch (error) {
      console.error("Database Service Error:", error);
    }
  }
}

export default new DataBaseService();
